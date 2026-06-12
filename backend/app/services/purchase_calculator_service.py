"""
Purchase Calculator Service
Calcula todos los montos de una compra según las reglas de negocio de Latconecta

CASOS SOPORTADOS:
1. Precio Fijo (F): TopUps fijos, Paquetes, Smartphones
2. Monto en Rango (R): Transfers, TopUps variables
3. Monto Variable (V): Bill Payment con validación previa

NOTA — Vendor products con vp_amount_type='range' y vp_amount=NULL:
  Algunos vendors (ej: MEGAPUNTO/TISI) exponen una única API de rango en lugar
  de SKUs por monto. En ese caso vendor_product.vp_amount es NULL porque el
  monto exacto a enviar lo define el producto de Latconecta (product_base_price).
  _calculate_fixed_price maneja este caso usando product_base_price como
  vendor_amount cuando vp_amount es NULL.
"""

import logging
from typing import Optional, Dict, Any
from decimal import Decimal
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.vendor_product import VendorProduct
from app.models.vendor import Vendor
from app.services.exchange_rate_service import exchange_rate_service
from app.config import settings

logger = logging.getLogger(__name__)


def _calculate_tax(total: Decimal) -> tuple:
    """
    Calcula IGV/IVA desde el total (precio ya incluye impuesto).
    Regla SUNAT: total es fijo → igv redondeado → base absorbe residuo.
    Returns: (base_imponible, tax_amount)
    """
    rate = Decimal(str(settings.TAX_RATE))
    tax_amount = round(total / (1 + rate) * rate, 2)
    base_imponible = total - tax_amount
    return float(base_imponible), float(tax_amount)


@dataclass
class PurchaseCalculation:
    """Resultado de cálculo de compra"""

    # Montos del cliente (lo que paga)
    purchase_base_price: Decimal
    purchase_discount: Decimal
    purchase_fee: Decimal
    purchase_total_amount: Decimal
    purchase_currency: str

    # Montos del vendor (lo que se provisiona)
    purchase_vendor_amount: Decimal
    purchase_vendor_currency: str

    # Conversión
    purchase_exch_rate: Decimal
    conversion_applied: bool
    margin_type: str  # 'normal', 'inverse', 'none'

    # Impuesto a las ventas (IGV/IVA) — desglosado desde el total
    # Regla: total es fijo → igv = ROUND(total/1+rate * rate, 2) → base = total - igv
    purchase_tax_label: str = "IGV"
    purchase_tax_rate: float = 0.18
    purchase_tax_amount: float = 0.0
    purchase_base_imponible: float = 0.0

    # Mensajes informativos para el usuario
    info_message: Optional[str] = None
    amount_breakdown: Optional[Dict[str, Any]] = None


class PurchaseCalculatorService:
    """Servicio para calcular montos de compras"""

    @staticmethod
    async def calculate(
        product: Product,
        vendor_product: VendorProduct,
        vendor: Vendor,
        user_data: Dict[str, Any],
        exchange_rate_override: Optional[Decimal] = None,
        db: AsyncSession = None
    ) -> PurchaseCalculation:
        """
        Calcula todos los montos de una compra

        Args:
            product: Producto de Latconecta
            vendor_product: Producto del vendor
            vendor: Vendor
            user_data: Datos del usuario
                - product_type: 'topup', 'smartphone', 'transfer', 'bill_payment'
                - user_selected_amount: (opcional) Monto seleccionado por usuario
                - bill_total_debt: (opcional) Deuda total del recibo
                - bill_currency: (opcional) Moneda de la deuda
                - payment_type: (opcional) 'full' o 'partial' para bill payment
            exchange_rate_override: (opcional) TC fijo del frontend
            db: Sesión de base de datos

        Returns:
            PurchaseCalculation: Objeto con todos los montos calculados
        """

        # Detectar caso según product_amount_type (no product_type)
        amount_type = product.product_amount_type
        product_type = user_data.get('product_type', '').lower()

        logger.info(f"Calculating for amount_type={amount_type}, product_type={product_type}")

        if amount_type == 'F':
            # CASO 1: Precio Fijo
            return await PurchaseCalculatorService._calculate_fixed_price(
                product, vendor_product, exchange_rate_override, db
            )

        elif amount_type == 'R':
            # CASO 2: Monto en Rango (Transfer, TopUp variable)
            return await PurchaseCalculatorService._calculate_range_amount(
                product, vendor_product, user_data, exchange_rate_override, db
            )

        elif amount_type == 'V':
            # CASO 3: Monto Variable (Bill Payment)
            return await PurchaseCalculatorService._calculate_bill_payment(
                product, vendor_product, user_data, exchange_rate_override, db
            )

        else:
            logger.error(f"Unknown product amount_type: {amount_type}")
            raise ValueError(f"Unsupported product amount_type: {amount_type}")

    @staticmethod
    async def _calculate_fixed_price(
        product: Product,
        vendor_product: VendorProduct,
        exchange_rate_override: Optional[Decimal],
        db: AsyncSession
    ) -> PurchaseCalculation:
        """
        CASO 1: Precio Fijo (F)

        Regla:
        - Cliente paga según PRODUCTS (product_base_price + fee - discount)
        - Vendor recibe según VENDOR_PRODUCTS (vp_amount)
        - Conversión solo si monedas diferentes (sin margen en monto)

        Caso especial — vendor_product con vp_amount_type='range' y vp_amount=NULL:
          Algunos vendors (ej: MEGAPUNTO/TISI) tienen una API de rango donde el
          monto se define por llamada, no por SKU. En ese caso vp_amount es NULL
          y el monto a enviar al vendor es el product_base_price del producto de
          Latconecta (que ya está dentro del rango vp_minimum_amount/vp_maximum_amount).
          Ejemplo: Bitel S/10 → product_base_price=10.00, vp_amount=NULL → vendor recibe 10.00
        """

        # Cliente paga
        base_price = Decimal(str(product.product_base_price))
        fee = Decimal(str(product.product_fee or 0))
        discount_pct = Decimal(str(product.product_discount_percentage or 0))

        discount_amount = base_price * (discount_pct / 100)
        total_amount = base_price - discount_amount + fee

        # ─── CORRECCIÓN: vendor_amount cuando vp_amount es NULL ──────────────
        # Si el vendor_product es de tipo rango (vp_amount_type='range') y no
        # tiene un monto fijo (vp_amount=NULL), el monto a enviar al vendor es
        # el product_base_price del producto de Latconecta.
        # Esto soporta vendors como MEGAPUNTO/TISI que tienen una única API de
        # rango en lugar de SKUs individuales por monto.
        if vendor_product.vp_amount is not None:
            vendor_amount = Decimal(str(vendor_product.vp_amount))
            logger.info(f"Using vendor_product.vp_amount: {vendor_amount}")
        else:
            # vp_amount NULL → usar product_base_price como monto al vendor
            vendor_amount = base_price
            logger.info(
                f"vendor_product.vp_amount is NULL (vp_amount_type={vendor_product.vp_amount_type}), "
                f"using product_base_price as vendor_amount: {vendor_amount}"
            )
        # ─────────────────────────────────────────────────────────────────────

        vendor_currency = vendor_product.vp_currency

        # Conversión
        product_currency = product.product_currency

        if product_currency == vendor_currency:
            # Sin conversión
            exch_rate = Decimal('1.0')
            conversion_applied = False
            margin_type = 'none'
            info_message = None

        else:
            # Usar TC override si existe
            if exchange_rate_override:
                exch_rate = exchange_rate_override
                logger.info(f"Using exchange rate override: {exch_rate}")
            else:
                # Calcular TC
                rate = await exchange_rate_service.get_exchange_rate(
                    product_currency,
                    vendor_currency,
                    margin_type='none',
                    db=db
                )
                exch_rate = Decimal(str(rate))
                logger.info(f"Calculated exchange rate: {exch_rate}")

            conversion_applied = True
            margin_type = 'none'
            info_message = None

        logger.info(
            f"Fixed price calculation: "
            f"Client pays {total_amount} {product_currency}, "
            f"Vendor receives {vendor_amount} {vendor_currency}"
        )

        base_imponible, tax_amount = _calculate_tax(total_amount)

        return PurchaseCalculation(
            purchase_base_price=base_price,
            purchase_discount=discount_amount,
            purchase_fee=fee,
            purchase_total_amount=total_amount,
            purchase_currency=product_currency,
            purchase_vendor_amount=vendor_amount,
            purchase_vendor_currency=vendor_currency,
            purchase_exch_rate=exch_rate,
            conversion_applied=conversion_applied,
            margin_type=margin_type,
            purchase_tax_label=settings.TAX_LABEL,
            purchase_tax_rate=settings.TAX_RATE,
            purchase_tax_amount=tax_amount,
            purchase_base_imponible=base_imponible,
            info_message=info_message,
            amount_breakdown={
                'base': float(base_price),
                'discount': float(discount_amount),
                'fee': float(fee),
                'total': float(total_amount),
                'discount_percentage': float(product.product_discount_percentage or 0)
            }
        )

    @staticmethod
    async def _calculate_range_amount(
        product: Product,
        vendor_product: VendorProduct,
        user_data: Dict[str, Any],
        exchange_rate_override: Optional[Decimal],
        db: AsyncSession
    ) -> PurchaseCalculation:
        """
        CASO 2: Monto en Rango (R)

        Usado para:
        - Transfers
        - TopUps variables

        Regla:
        - Usuario selecciona monto en product_currency (dentro del rango)
        - Conversión con margen -5% (menos favorable para Latconecta)
        - Mensaje informativo: "Usted está enviando X MXN"
        """

        # Monto seleccionado por usuario
        user_amount = user_data.get('user_selected_amount')
        if not user_amount:
            raise ValueError("user_selected_amount is required for range amount products")

        user_amount = Decimal(str(user_amount))

        # Validar rango con campos correctos
        min_amount = Decimal(str(product.product_base_price or 0))
        max_amount = Decimal(str(product.product_base_price_max or 999999))

        logger.info(f"Validating range: {min_amount} <= {user_amount} <= {max_amount}")

        if user_amount < min_amount:
            raise ValueError(f"Amount below minimum: {min_amount} {product.product_currency}")
        if user_amount > max_amount:
            raise ValueError(f"Amount exceeds maximum: {max_amount} {product.product_currency}")

        # Cliente paga
        base_price = user_amount
        fee = Decimal(str(product.product_fee or 0))
        discount_pct = Decimal(str(product.product_discount_percentage or 0))

        discount_amount = base_price * (discount_pct / 100)
        total_amount = base_price - discount_amount + fee

        # Vendor recibe (con conversión si aplica)
        product_currency = product.product_currency
        vendor_currency = vendor_product.vp_currency

        if product_currency == vendor_currency:
            # Sin conversión
            vendor_amount = user_amount
            exch_rate = Decimal('1.0')
            conversion_applied = False
            margin_type = 'none'
            info_message = None

        else:
            # Usar TC override si existe
            if exchange_rate_override:
                exch_rate = exchange_rate_override
                logger.info(f"Using exchange rate override: {exch_rate}")
            else:
                # Calcular con margen -5%
                rate = await exchange_rate_service.get_exchange_rate(
                    product_currency,
                    vendor_currency,
                    margin_type='pricing',
                    db=db
                )
                exch_rate = Decimal(str(rate))
                logger.info(f"Calculated exchange rate with pricing margin: {exch_rate}")

            vendor_amount = user_amount * exch_rate
            conversion_applied = True
            margin_type = 'pricing'

            # Mensaje informativo
            info_message = (
                f"Usted está enviando {vendor_amount:.2f} {vendor_currency} "
                f"(tipo de cambio: {exch_rate:.4f} {vendor_currency}/{product_currency})"
            )

        logger.info(
            f"Range amount calculation: "
            f"User selected {user_amount} {product_currency}, "
            f"Client pays {total_amount} {product_currency}, "
            f"Vendor receives {vendor_amount} {vendor_currency}, "
            f"Margin: {margin_type}"
        )

        base_imponible, tax_amount = _calculate_tax(total_amount)

        return PurchaseCalculation(
            purchase_base_price=base_price,
            purchase_discount=discount_amount,
            purchase_fee=fee,
            purchase_total_amount=total_amount,
            purchase_currency=product_currency,
            purchase_vendor_amount=vendor_amount,
            purchase_vendor_currency=vendor_currency,
            purchase_exch_rate=exch_rate,
            conversion_applied=conversion_applied,
            margin_type=margin_type,
            purchase_tax_label=settings.TAX_LABEL,
            purchase_tax_rate=settings.TAX_RATE,
            purchase_tax_amount=tax_amount,
            purchase_base_imponible=base_imponible,
            info_message=info_message,
            amount_breakdown={
                'base': float(base_price),
                'discount': float(discount_amount),
                'fee': float(fee),
                'total': float(total_amount),
                'discount_percentage': float(product.product_discount_percentage or 0),
                'vendor_amount': float(vendor_amount),
                'vendor_currency': vendor_currency
            }
        )

    @staticmethod
    async def _calculate_bill_payment(
        product: Product,
        vendor_product: VendorProduct,
        user_data: Dict[str, Any],
        exchange_rate_override: Optional[Decimal],
        db: AsyncSession
    ) -> PurchaseCalculation:
        """
        CASO 3: Bill Payment (V)

        Reglas:
        - Deuda total viene de validación en bill_currency
        - Conversión a product_currency con margen -5% (solo para mostrar)
        - Pago total: Enviar monto EXACTO original (sin reconvertir)
        - Pago parcial: Convertir monto seleccionado con -5%
        """

        bill_total_debt = user_data.get('bill_total_debt')
        bill_currency = user_data.get('bill_currency')
        payment_type = user_data.get('payment_type', 'full')  # 'full' o 'partial'

        if not bill_total_debt or not bill_currency:
            raise ValueError("bill_total_debt and bill_currency required for bill payment")

        bill_total_debt = Decimal(str(bill_total_debt))
        product_currency = product.product_currency

        if payment_type == 'full':
            # PAGO TOTAL

            # Convertir deuda a product_currency (solo para mostrar al usuario)
            if product_currency == bill_currency:
                # Sin conversión
                amount_in_product_currency = bill_total_debt
                exch_rate = Decimal('1.0')
                conversion_applied = False
                margin_type = 'none'

            else:
                # Usar TC override si existe
                if exchange_rate_override:
                    exch_rate = exchange_rate_override
                    logger.info(f"Using exchange rate override: {exch_rate}")
                else:
                    # Calcular con margen -5%
                    rate = await exchange_rate_service.get_exchange_rate(
                        bill_currency,
                        product_currency,
                        margin_type='pricing',
                        db=db
                    )
                    exch_rate = Decimal(str(rate))
                    logger.info(f"Calculated exchange rate with pricing margin: {exch_rate}")

                amount_in_product_currency = bill_total_debt / exch_rate
                conversion_applied = True
                margin_type = 'pricing'

            # Cliente paga (en product_currency)
            base_price = amount_in_product_currency
            fee = Decimal(str(product.product_fee or 0))
            discount_pct = Decimal(str(product.product_discount_percentage or 0))

            discount_amount = base_price * (discount_pct / 100)
            total_amount = base_price - discount_amount + fee

            # CRÍTICO: Vendor recibe MONTO EXACTO ORIGINAL
            vendor_amount = bill_total_debt  # SIN RECONVERTIR
            vendor_currency = bill_currency

            info_message = (
                f"Deuda total: {bill_total_debt:.2f} {bill_currency}"
            )
            if conversion_applied:
                info_message += (
                    f" (equivalente aproximado: {amount_in_product_currency:.2f} {product_currency}, "
                    f"tipo de cambio: {exch_rate:.4f} {product_currency}/{bill_currency})"
                )

            logger.info(
                f"Bill payment (FULL): "
                f"Debt {bill_total_debt} {bill_currency}, "
                f"Client pays {total_amount} {product_currency}, "
                f"Vendor receives EXACT {vendor_amount} {vendor_currency}"
            )

        else:
            # PAGO PARCIAL

            user_amount = user_data.get('user_selected_amount')
            if not user_amount:
                raise ValueError("user_selected_amount required for partial bill payment")

            user_amount = Decimal(str(user_amount))

            # Cliente paga (en product_currency)
            base_price = user_amount
            fee = Decimal(str(product.product_fee or 0))
            discount_pct = Decimal(str(product.product_discount_percentage or 0))

            discount_amount = base_price * (discount_pct / 100)
            total_amount = base_price - discount_amount + fee

            # Vendor recibe (convertir con margen -5%)
            if product_currency == bill_currency:
                vendor_amount = user_amount
                vendor_currency = bill_currency
                exch_rate = Decimal('1.0')
                conversion_applied = False
                margin_type = 'none'

            else:
                # Usar TC override si existe
                if exchange_rate_override:
                    exch_rate = exchange_rate_override
                    logger.info(f"Using exchange rate override: {exch_rate}")
                else:
                    # Calcular con margen -5%
                    rate = await exchange_rate_service.get_exchange_rate(
                        product_currency,
                        bill_currency,
                        margin_type='pricing',
                        db=db
                    )
                    exch_rate = Decimal(str(rate))
                    logger.info(f"Calculated exchange rate with pricing margin: {exch_rate}")

                vendor_amount = user_amount * exch_rate
                vendor_currency = bill_currency
                conversion_applied = True
                margin_type = 'pricing'

            # Calcular deuda restante
            remaining_debt = bill_total_debt - vendor_amount

            info_message = (
                f"Usted está pagando {user_amount:.2f} {product_currency}, "
                f"esto cubre {vendor_amount:.2f} {bill_currency} de su deuda. "
                f"Deuda restante: {remaining_debt:.2f} {bill_currency}"
            )

            logger.info(
                f"Bill payment (PARTIAL): "
                f"User pays {user_amount} {product_currency}, "
                f"Client pays {total_amount} {product_currency}, "
                f"Vendor receives {vendor_amount} {bill_currency}, "
                f"Remaining debt: {remaining_debt} {bill_currency}"
            )

        base_imponible, tax_amount = _calculate_tax(total_amount)

        return PurchaseCalculation(
            purchase_base_price=base_price,
            purchase_discount=discount_amount,
            purchase_fee=fee,
            purchase_total_amount=total_amount,
            purchase_currency=product_currency,
            purchase_vendor_amount=vendor_amount,
            purchase_vendor_currency=vendor_currency,
            purchase_exch_rate=exch_rate,
            conversion_applied=conversion_applied,
            margin_type=margin_type,
            purchase_tax_label=settings.TAX_LABEL,
            purchase_tax_rate=settings.TAX_RATE,
            purchase_tax_amount=tax_amount,
            purchase_base_imponible=base_imponible,
            info_message=info_message,
            amount_breakdown={
                'base': float(base_price),
                'discount': float(discount_amount),
                'fee': float(fee),
                'total': float(total_amount),
                'discount_percentage': float(product.product_discount_percentage or 0),
                'vendor_amount': float(vendor_amount),
                'vendor_currency': vendor_currency,
                'bill_total_debt': float(bill_total_debt),
                'bill_currency': bill_currency
            }
        )


# Instancia global
purchase_calculator_service = PurchaseCalculatorService()
