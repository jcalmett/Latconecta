"""
Router de Vendors - Gestión de vendors y vendor_products (Versión 3 - Balance Dual)
Endpoints para CRUD de vendors y gestión de balance USD + Local (solo Admin/Superadmin)
Actualizado: 2026-01-10 - Agregado endpoint de verificación de consistencia de monedas
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Vendor, VendorProduct, Product, User
from app.schemas import (
    VendorPublic, VendorCreate, VendorUpdate,
    VendorBalanceUpdate, VendorWithBalance, LowBalanceAlert
)
from app.utils.dependencies import get_current_active_user

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_active_user)):
    """
    Middleware: Requiere que el usuario sea admin o superadmin
    """
    if current_user.user_role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador"
        )
    return current_user


@router.get("/", response_model=List[VendorPublic])
async def list_vendors(
    skip: int = 0,
    limit: int = 100,
    vendor_status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Listar vendors

    **Requiere:** Admin o Superadmin
    """
    query = select(Vendor)

    if vendor_status:
        query = query.where(Vendor.vendor_status == vendor_status)

    query = query.offset(skip).limit(limit).order_by(Vendor.vendor_code)

    result = await db.execute(query)
    vendors = result.scalars().all()

    return vendors


@router.get("/{vendor_code}", response_model=VendorPublic)
async def get_vendor(
    vendor_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obtener detalle de un vendor

    **Requiere:** Admin o Superadmin
    """
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_code)
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor {vendor_code} no encontrado"
        )

    return vendor


@router.post("/", response_model=VendorPublic, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    vendor_data: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Crear nuevo vendor

    **Requiere:** Admin o Superadmin
    """
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_data.vendor_code)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor {vendor_data.vendor_code} ya existe"
        )

    vendor = Vendor(
        **vendor_data.dict(),
        created_by=current_user.user_email
    )

    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)

    return vendor


@router.put("/{vendor_code}", response_model=VendorPublic)
async def update_vendor(
    vendor_code: str,
    vendor_data: VendorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Actualizar vendor

    **Requiere:** Admin o Superadmin
    """
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_code)
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor {vendor_code} no encontrado"
        )

    update_data = vendor_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vendor, field, value)

    vendor.updated_by = current_user.user_email

    await db.commit()
    await db.refresh(vendor)

    return vendor


@router.delete("/{vendor_code}")
async def delete_vendor(
    vendor_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Eliminar vendor

    **Requiere:** Superadmin
    **CUIDADO:** Eliminará también todos los vendor_products asociados
    """
    if current_user.user_role != 'superadmin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo superadmin puede eliminar vendors"
        )

    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_code)
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor {vendor_code} no encontrado"
        )

    await db.delete(vendor)
    await db.commit()

    return {"message": f"Vendor {vendor_code} eliminado exitosamente"}


@router.get("/{vendor_code}/products", response_model=List[dict])
async def list_vendor_products(
    vendor_code: str,
    skip: int = 0,
    limit: int = 100,
    vp_status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Listar productos de un vendor

    **Requiere:** Admin o Superadmin
    """
    query = select(VendorProduct).where(VendorProduct.vendor_code == vendor_code)

    if vp_status:
        query = query.where(VendorProduct.vp_status == vp_status)

    query = query.offset(skip).limit(limit).order_by(VendorProduct.vp_code)

    result = await db.execute(query)
    vendor_products = result.scalars().all()

    return [vp.to_dict() for vp in vendor_products]


# =============================================================================
# ENDPOINT DE VERIFICACIÓN DE CONSISTENCIA DE MONEDAS
# =============================================================================

@router.get("/{vendor_code}/verify-currency-consistency")
async def verify_currency_consistency(
    vendor_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Verificar consistencia de monedas entre vendor_products y products
    
    **Regla de validación:**
    - product.product_currency DEBE SER 'USD' o vendor.vendor_local_currency
    - Si es otra moneda → ERROR
    
    **Requiere:** Admin o Superadmin
    
    **Retorna:** Lista de verificaciones con:
    - product_id, product_name, product_currency
    - vp_code, vp_currency
    - is_valid (bool)
    - observation (string)
    """
    # Obtener vendor
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_code)
    )
    vendor = result.scalar_one_or_none()
    
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor {vendor_code} no encontrado"
        )
    
    # Obtener vendor_products con sus products asociados
    # Relación: products.product_vendor_code + product_vendpro_code → vendor_products.vendor_code + vp_code
    query = text("""
        SELECT 
            vp.vp_id,
            vp.vp_code,
            vp.vp_currency,
            vp.api_group_code,
            p.product_id,
            p.product_name,
            p.product_currency
        FROM vendor_products vp
        LEFT JOIN products p ON (
            p.product_vendor_code = vp.vendor_code 
            AND p.product_vendpro_code = vp.vp_code
        )
        WHERE vp.vendor_code = :vendor_code
        ORDER BY vp.vp_code
    """)
    
    result = await db.execute(query, {"vendor_code": vendor_code})
    rows = result.fetchall()
    
    verification_results = []
    
    for row in rows:
        vp_id = row[0]
        vp_code = row[1]
        vp_currency = row[2]
        api_group_code = row[3]
        product_id = row[4]
        product_name = row[5]
        product_currency = row[6]
        
        # Si no tiene product asociado
        if not product_id:
            verification_results.append({
                "vp_id": vp_id,
                "vp_code": vp_code,
                "vp_currency": vp_currency or "N/A",
                "api_group_code": api_group_code or "N/A",
                "product_id": None,
                "product_name": "Sin producto asociado",
                "product_currency": "N/A",
                "is_valid": False,
                "observation": "Vendor Product no tiene Product de Latconecta asociado"
            })
            continue
        
        # Validar consistencia de moneda
        is_valid = False
        observation = ""
        
        # Monedas válidas para este vendor
        valid_currencies = ['USD']
        if vendor.vendor_local_currency:
            valid_currencies.append(vendor.vendor_local_currency)
        
        if product_currency in valid_currencies:
            is_valid = True
            if product_currency == 'USD':
                observation = f"✅ Correcto - Producto en USD, se descontará de vendor_usd_balance"
            else:
                observation = f"✅ Correcto - Producto en {product_currency} (moneda local), se descontará de vendor_local_balance"
        else:
            is_valid = False
            observation = f"❌ ERROR - Producto en {product_currency}, pero vendor solo soporta {', '.join(valid_currencies)}"
        
        verification_results.append({
            "vp_id": vp_id,
            "vp_code": vp_code,
            "vp_currency": vp_currency or "N/A",
            "api_group_code": api_group_code,
            "product_id": product_id,
            "product_name": product_name,
            "product_currency": product_currency,
            "is_valid": is_valid,
            "observation": observation
        })
    
    return verification_results


# =============================================================================
# ENDPOINTS DE BALANCE
# =============================================================================

@router.put("/{vendor_code}/balance", response_model=VendorPublic)
async def update_vendor_balance(
    vendor_code: str,
    balance_data: VendorBalanceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Actualizar balance de un vendor (USD y/o Local)

    **Requiere:** Admin o Superadmin
    """
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_code)
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor {vendor_code} no encontrado"
        )

    if balance_data.vendor_usd_balance is not None:
        vendor.update_usd_balance(amount=float(balance_data.vendor_usd_balance))

    if balance_data.vendor_local_balance is not None:
        vendor.update_local_balance(
            amount=float(balance_data.vendor_local_balance),
            currency=balance_data.vendor_local_currency
        )

    vendor.updated_by = current_user.user_email

    await db.commit()
    await db.refresh(vendor)

    return vendor


@router.post("/{vendor_code}/sync-balance")
async def sync_vendor_balance(
    vendor_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Sincronizar balance con el vendor (llamada real a API)

    **Requiere:** Admin o Superadmin
    """
    from app.services.vendor_manager import VendorManager

    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_code)
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor {vendor_code} no encontrado"
        )

    try:
        vendor_manager = VendorManager()
        vendor_service = await vendor_manager._get_vendor_service(vendor_code, db)

        balance_response = await vendor_service.get_balance()

        if 'balance_usd' in balance_response:
            vendor.update_usd_balance(amount=float(balance_response['balance_usd']))

        if 'balance_local' in balance_response:
            vendor.update_local_balance(
                amount=float(balance_response['balance_local']),
                currency=balance_response.get('currency', vendor.vendor_local_currency)
            )

        vendor.updated_by = current_user.user_email

        await db.commit()
        await db.refresh(vendor)

        return {
            "success": True,
            "message": "Balance sincronizado exitosamente",
            "usd_balance": vendor.formatted_usd_balance,
            "local_balance": vendor.formatted_local_balance,
            "usd_last_update": vendor.vendor_usd_date_balance,
            "local_last_update": vendor.vendor_local_date_balance
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Error sincronizando balance",
            "error": str(e)
        }


@router.get("/balance/low-alerts", response_model=List[LowBalanceAlert])
async def get_low_balance_alerts(
    usd_threshold: float = 100.0,
    local_threshold: float = 1000.0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obtener vendors con saldo bajo o desactualizado

    **Parámetros:**
    - usd_threshold: Umbral mínimo de balance USD (default: 100.0)
    - local_threshold: Umbral mínimo de balance local (default: 1000.0)

    **Requiere:** Admin o Superadmin
    """
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_status == 'active')
    )
    vendors = result.scalars().all()

    alerts = []
    for vendor in vendors:
        if vendor.has_usd_balance_info:
            if vendor.is_low_usd_balance(usd_threshold):
                days = (datetime.now() - vendor.vendor_usd_date_balance).days if vendor.vendor_usd_date_balance else None
                alerts.append(LowBalanceAlert(
                    vendor_code=vendor.vendor_code,
                    vendor_name=vendor.vendor_name,
                    usd_balance=vendor.vendor_usd_balance,
                    usd_balance_last_update=vendor.vendor_usd_date_balance,
                    usd_days_since_update=days,
                    local_currency=vendor.vendor_local_currency,
                    local_balance=vendor.vendor_local_balance,
                    local_balance_last_update=vendor.vendor_local_date_balance,
                    local_days_since_update=None,
                    alert_type="low_usd_balance"
                ))

        if vendor.has_local_balance_info:
            if vendor.is_low_local_balance(local_threshold):
                days = (datetime.now() - vendor.vendor_local_date_balance).days if vendor.vendor_local_date_balance else None
                alerts.append(LowBalanceAlert(
                    vendor_code=vendor.vendor_code,
                    vendor_name=vendor.vendor_name,
                    usd_balance=vendor.vendor_usd_balance,
                    usd_balance_last_update=vendor.vendor_usd_date_balance,
                    usd_days_since_update=None,
                    local_currency=vendor.vendor_local_currency,
                    local_balance=vendor.vendor_local_balance,
                    local_balance_last_update=vendor.vendor_local_date_balance,
                    local_days_since_update=days,
                    alert_type="low_local_balance"
                ))

        if not vendor.has_usd_balance_info and not vendor.has_local_balance_info:
            alerts.append(LowBalanceAlert(
                vendor_code=vendor.vendor_code,
                vendor_name=vendor.vendor_name,
                usd_balance=None,
                usd_balance_last_update=None,
                usd_days_since_update=None,
                local_currency=None,
                local_balance=None,
                local_balance_last_update=None,
                local_days_since_update=None,
                alert_type="no_balance"
            ))

    return alerts


@router.get("/balance/summary")
async def get_balance_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obtener resumen de balance de todos los vendors activos

    **Requiere:** Admin o Superadmin
    """
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_status == 'active')
    )
    vendors = result.scalars().all()

    summary = {
        "total_vendors": len(vendors),
        "vendors_with_usd_balance": 0,
        "vendors_with_local_balance": 0,
        "vendors_low_usd_balance": 0,
        "vendors_low_local_balance": 0,
        "total_usd_balance": 0.0,
        "total_local_balance_by_currency": {},
        "vendors": []
    }

    for vendor in vendors:
        vendor_info = {
            "vendor_code": vendor.vendor_code,
            "vendor_name": vendor.vendor_name,
            "usd_balance": vendor.formatted_usd_balance,
            "usd_balance_status": vendor.usd_balance_status,
            "local_balance": vendor.formatted_local_balance,
            "local_balance_status": vendor.local_balance_status,
            "is_low_usd": vendor.is_low_usd_balance(100.0),
            "is_low_local": vendor.is_low_local_balance(1000.0)
        }

        summary["vendors"].append(vendor_info)

        if vendor.has_usd_balance_info:
            summary["vendors_with_usd_balance"] += 1
            summary["total_usd_balance"] += float(vendor.vendor_usd_balance)
            if vendor.is_low_usd_balance(100.0):
                summary["vendors_low_usd_balance"] += 1

        if vendor.has_local_balance_info:
            summary["vendors_with_local_balance"] += 1
            currency = vendor.vendor_local_currency
            if currency not in summary["total_local_balance_by_currency"]:
                summary["total_local_balance_by_currency"][currency] = 0
            summary["total_local_balance_by_currency"][currency] += float(vendor.vendor_local_balance)
            if vendor.is_low_local_balance(1000.0):
                summary["vendors_low_local_balance"] += 1

    return summary


# =============================================================================
# ENDPOINT DE TEST
# =============================================================================

@router.post("/{vendor_code}/test-connection")
async def test_vendor_connection(
    vendor_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Probar conexión con vendor

    Intenta hacer login y obtener saldo

    **Requiere:** Admin o Superadmin
    """
    from app.services.vendor_manager import VendorManager

    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_code)
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor {vendor_code} no encontrado"
        )

    try:
        vendor_manager = VendorManager()
        vendor_service = await vendor_manager._get_vendor_service(vendor_code, db)

        token = await vendor_service.login()
        balance = await vendor_service.get_balance()

        return {
            "success": True,
            "message": "Conexión exitosa con vendor",
            "token_obtained": bool(token),
            "balance": balance
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Error conectando con vendor",
            "error": str(e)
        }