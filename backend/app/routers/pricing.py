"""
Pricing Router — Reporte diario de márgenes y ajuste de precio de venta
=======================================================================

Uso: pestaña "Márgenes" del admin. Solo admin / superadmin.

  GET  /api/v1/pricing/margin-report
       Por cada producto comercial con vendor asociado muestra el costo del
       vendor convertido a la moneda de venta (tipo de cambio del día, SIN
       margen), el precio de venta actual y el margen resultante. Marca los
       productos bajo el margen mínimo configurado.

  PUT  /api/v1/pricing/products/{product_id}/base-price
       Ajusta solo el precio base de un producto de precio fijo (F) y
       recalcula descuento y total con el % de descuento y el fee existentes.

Reglas:
  - Margen = (precio total de venta − costo convertido) / precio total de venta
  - Costo del vendor, en este orden:
      1. vendor_products.vp_cost si es > 0
      2. vendor_products.vp_amount
      3. products.product_base_price (vendor de rango sin monto fijo, ej.
         MEGAPUNTO Perú: el vendor recibe el monto del producto)
  - Margen mínimo: settings.MARGIN_MIN_BY_VENDOR[vendor] o, si no existe,
    settings.MARGIN_MIN_DEFAULT_PCT.
  - El precio de venta nunca lo cambia el catalog_sync: solo este endpoint
    (o la edición normal de productos).
"""

import logging
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List, Dict, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.config import settings
from app.database import get_db
from app.models.product import Product
from app.models.vendor_product import VendorProduct
from app.models.user import User
from app.services.exchange_rate_service import exchange_rate_service
from app.utils.dependencies import get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Pricing"])

_CENT = Decimal("0.01")


def _q(value: Decimal) -> Decimal:
    """Redondeo a 2 decimales (HALF_UP)."""
    return value.quantize(_CENT, rounding=ROUND_HALF_UP)


def _min_margin_for(vendor_code: Optional[str]) -> float:
    by_vendor = settings.MARGIN_MIN_BY_VENDOR or {}
    if vendor_code and vendor_code in by_vendor:
        return float(by_vendor[vendor_code])
    return float(settings.MARGIN_MIN_DEFAULT_PCT)


# =============================================================================
# SCHEMAS
# =============================================================================

class MarginRow(BaseModel):
    product_id: int
    product_code: str
    product_name: str
    product_status: str
    product_amount_type: Optional[str] = None
    country_id: int
    country_code: Optional[str] = None
    service_id: int
    service_name: Optional[str] = None
    company_name: Optional[str] = None
    vendor_code: Optional[str] = None
    vp_code: Optional[str] = None
    vp_name: Optional[str] = None

    product_currency: str
    product_base_price: float
    product_discount_percentage: float
    product_fee: float
    product_total_price: float

    cost_amount: Optional[float] = None
    cost_currency: Optional[str] = None
    cost_source: str                       # vp_cost | vp_amount | monto_producto | sin_vendor_product
    exchange_rate: Optional[float] = None  # unidades de moneda de venta por 1 unidad de moneda de costo
    cost_converted: Optional[float] = None
    margin_amount: Optional[float] = None
    margin_pct: Optional[float] = None
    min_margin_pct: float
    below_min: bool
    editable: bool                         # solo productos de precio fijo (F)
    warning: Optional[str] = None


class MarginReportResponse(BaseModel):
    generated_at: str
    min_margin_default_pct: float
    min_margin_by_vendor: Dict[str, float]
    total: int
    below_min_count: int
    rows: List[MarginRow]


class BasePriceUpdate(BaseModel):
    product_base_price: Decimal = Field(..., gt=0, description="Nuevo precio base (moneda del producto)")


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/margin-report", response_model=MarginReportResponse)
async def margin_report(
    vendor_code: Optional[str] = Query(None, description="Filtrar por vendor"),
    country_id: Optional[int] = Query(None, description="Filtrar por país"),
    service_id: Optional[int] = Query(None, description="Filtrar por servicio"),
    only_below: bool = Query(False, description="Solo productos bajo el margen mínimo"),
    include_inactive: bool = Query(False, description="Incluir productos inactivos"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    from datetime import datetime

    query = (
        select(Product, VendorProduct)
        .options(
            joinedload(Product.country),
            joinedload(Product.service),
            joinedload(Product.company),
        )
        .outerjoin(
            VendorProduct,
            and_(
                VendorProduct.vendor_code == Product.product_vendor_code,
                VendorProduct.vp_code == Product.product_vendpro_code,
                VendorProduct.vp_skuid == Product.product_vendpro_skuid,
            ),
        )
        .where(Product.product_vendor_code.isnot(None))
    )
    if vendor_code:
        query = query.where(Product.product_vendor_code == vendor_code)
    if country_id:
        query = query.where(Product.country_id == country_id)
    if service_id:
        query = query.where(Product.service_id == service_id)
    if not include_inactive:
        query = query.where(Product.product_status == "active")

    result = await db.execute(query)
    pairs = result.unique().all()

    rate_cache: Dict[Tuple[str, str], Optional[float]] = {}

    async def get_rate(from_cur: str, to_cur: str) -> Optional[float]:
        if from_cur == to_cur:
            return 1.0
        key = (from_cur, to_cur)
        if key not in rate_cache:
            try:
                rate_cache[key] = float(
                    await exchange_rate_service.get_exchange_rate(
                        from_cur, to_cur, margin_type="none", db=db
                    )
                )
            except Exception as e:
                logger.error(f"Tipo de cambio {from_cur}/{to_cur} no disponible: {e}")
                rate_cache[key] = None
            # ExchangeRateService devuelve 1.0 como último recurso cuando no
            # tiene la tasa (ni APIs, ni BD, ni default). Entre monedas
            # distintas eso no es una tasa real: se trata como no disponible.
            if rate_cache[key] == 1.0:
                logger.error(f"Tipo de cambio {from_cur}/{to_cur} no disponible (fallback 1.0)")
                rate_cache[key] = None
        return rate_cache[key]

    rows: List[MarginRow] = []
    for product, vp in pairs:
        base = Decimal(str(product.product_base_price or 0))
        total = Decimal(str(product.product_total_price or 0))
        min_margin = _min_margin_for(product.product_vendor_code)
        warning = None

        cost_amount = None
        cost_currency = None
        if vp is None:
            cost_source = "sin_vendor_product"
            warning = "El producto no tiene vendor_product asociado"
        elif vp.vp_cost is not None and Decimal(str(vp.vp_cost)) > 0:
            cost_source, cost_amount, cost_currency = "vp_cost", Decimal(str(vp.vp_cost)), vp.vp_currency
        elif vp.vp_amount is not None:
            cost_source, cost_amount, cost_currency = "vp_amount", Decimal(str(vp.vp_amount)), vp.vp_currency
        else:
            cost_source, cost_amount, cost_currency = "monto_producto", base, vp.vp_currency or product.product_currency

        rate = cost_converted = margin_amount = margin_pct = None
        if cost_amount is not None and cost_currency:
            rate = await get_rate(cost_currency, product.product_currency)
            if rate is None:
                warning = f"Sin tipo de cambio {cost_currency}/{product.product_currency}"
            else:
                cost_converted = _q(cost_amount * Decimal(str(rate)))
                margin_amount = _q(total - cost_converted)
                if total > 0:
                    margin_pct = float(
                        (margin_amount / total * 100).quantize(_CENT, rounding=ROUND_HALF_UP)
                    )

        if product.product_amount_type == "R" and warning is None:
            warning = "Producto de rango: margen calculado sobre el monto mínimo"

        rows.append(MarginRow(
            product_id=product.product_id,
            product_code=product.product_code,
            product_name=product.product_name,
            product_status=product.product_status,
            product_amount_type=product.product_amount_type,
            country_id=product.country_id,
            country_code=product.country.country_code if product.country else None,
            service_id=product.service_id,
            service_name=product.service.service_name if product.service else None,
            company_name=product.company.company_name if product.company else None,
            vendor_code=product.product_vendor_code,
            vp_code=vp.vp_code if vp else product.product_vendpro_code,
            vp_name=vp.vp_name if vp else None,
            product_currency=product.product_currency,
            product_base_price=float(base),
            product_discount_percentage=float(product.product_discount_percentage or 0),
            product_fee=float(product.product_fee or 0),
            product_total_price=float(total),
            cost_amount=float(cost_amount) if cost_amount is not None else None,
            cost_currency=cost_currency,
            cost_source=cost_source,
            exchange_rate=rate,
            cost_converted=float(cost_converted) if cost_converted is not None else None,
            margin_amount=float(margin_amount) if margin_amount is not None else None,
            margin_pct=margin_pct,
            min_margin_pct=min_margin,
            below_min=(margin_pct is None) or (margin_pct < min_margin),
            editable=(product.product_amount_type or "F") == "F",
            warning=warning,
        ))

    if only_below:
        rows = [r for r in rows if r.below_min]

    rows.sort(key=lambda r: (
        r.vendor_code or "", r.country_code or "", r.company_name or "", r.product_total_price
    ))

    return MarginReportResponse(
        generated_at=datetime.now().isoformat(timespec="seconds"),
        min_margin_default_pct=float(settings.MARGIN_MIN_DEFAULT_PCT),
        min_margin_by_vendor={k: float(v) for k, v in (settings.MARGIN_MIN_BY_VENDOR or {}).items()},
        total=len(rows),
        below_min_count=sum(1 for r in rows if r.below_min),
        rows=rows,
    )


@router.put("/products/{product_id}/base-price")
async def update_base_price(
    product_id: int,
    payload: BasePriceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    product = (await db.execute(
        select(Product).where(Product.product_id == product_id)
    )).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    if (product.product_amount_type or "F") != "F":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se puede ajustar desde el reporte el precio de productos de precio fijo (F)"
        )

    old_base = Decimal(str(product.product_base_price or 0))
    old_total = Decimal(str(product.product_total_price or 0))

    base = _q(Decimal(str(payload.product_base_price)))
    pct = Decimal(str(product.product_discount_percentage or 0))
    fee = Decimal(str(product.product_fee or 0))
    discount = _q(base * pct / 100)
    total = _q(base - discount + fee)

    if total <= 0:
        raise HTTPException(status_code=400, detail="El precio total resultante debe ser mayor que cero")

    product.product_base_price = base
    product.product_discount_amount = discount
    product.product_total_price = total
    product.updated_by = current_user.user_email

    await db.commit()

    logger.info(
        f"💲 Precio ajustado desde reporte de márgenes: product_id={product_id} "
        f"({product.product_code}) base {old_base} → {base} {product.product_currency}, "
        f"total {old_total} → {total} — por {current_user.user_email}"
    )

    return {
        "success": True,
        "product_id": product_id,
        "product_currency": product.product_currency,
        "product_base_price": float(base),
        "product_discount_amount": float(discount),
        "product_fee": float(fee),
        "product_total_price": float(total),
    }
