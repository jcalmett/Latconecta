"""
Router de Vendors - Gestión de vendors y vendor_products (Versión 2 - Con Balance)
Endpoints para CRUD de vendors y gestión de balance (solo Admin/Superadmin)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Vendor, VendorProduct, User
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
    # Verificar que no existe
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_data.vendor_code)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor {vendor_data.vendor_code} ya existe"
        )
    
    # Crear vendor
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
    
    # Actualizar campos
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
    Actualizar balance de un vendor
    
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
    
    # Actualizar balance usando el método del modelo
    vendor.update_balance(
        amount=float(balance_data.vendor_balance_amount),
        currency=balance_data.vendor_balance_currency
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
        
        # Obtener balance del vendor
        balance_response = await vendor_service.get_balance()
        
        # Actualizar en BD
        vendor.update_balance(
            amount=float(balance_response.get('balance', 0)),
            currency=balance_response.get('currency', vendor.vendor_balance_currency or 'PEN')
        )
        
        vendor.updated_by = current_user.user_email
        
        await db.commit()
        await db.refresh(vendor)
        
        return {
            "success": True,
            "message": "Balance sincronizado exitosamente",
            "balance": vendor.formatted_balance,
            "last_update": vendor.vendor_balance_last_update
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": "Error sincronizando balance",
            "error": str(e)
        }


@router.get("/balance/low-alerts", response_model=List[LowBalanceAlert])
async def get_low_balance_alerts(
    threshold: float = 1000.0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obtener vendors con saldo bajo o desactualizado
    
    **Parámetros:**
    - threshold: Umbral mínimo de balance (default: 1000.0)
    
    **Requiere:** Admin o Superadmin
    """
    # Usar función SQL para obtener vendors con problemas
    query = text("""
        SELECT * FROM check_low_balance_vendors(:threshold)
    """)
    
    result = await db.execute(query, {"threshold": threshold})
    rows = result.fetchall()
    
    alerts = []
    for row in rows:
        # Determinar tipo de alerta
        if row.balance_amount is None:
            alert_type = "no_balance"
        elif row.days_since_update and row.days_since_update > 1:
            alert_type = "stale_balance"
        else:
            alert_type = "low_balance"
        
        alerts.append(LowBalanceAlert(
            vendor_code=row.vendor_code,
            vendor_name=row.vendor_name,
            balance_currency=row.balance_currency,
            balance_amount=row.balance_amount,
            last_update=row.last_update,
            days_since_update=row.days_since_update,
            alert_type=alert_type
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
        "vendors_with_balance": 0,
        "vendors_low_balance": 0,
        "vendors_stale_balance": 0,
        "total_balance_by_currency": {},
        "vendors": []
    }
    
    for vendor in vendors:
        vendor_info = {
            "vendor_code": vendor.vendor_code,
            "vendor_name": vendor.vendor_name,
            "balance": vendor.formatted_balance,
            "balance_status": vendor.balance_status,
            "is_low": vendor.is_low_balance(1000.0)
        }
        
        summary["vendors"].append(vendor_info)
        
        if vendor.has_balance_info:
            summary["vendors_with_balance"] += 1
            
            # Acumular por moneda
            currency = vendor.vendor_balance_currency
            if currency not in summary["total_balance_by_currency"]:
                summary["total_balance_by_currency"][currency] = 0
            summary["total_balance_by_currency"][currency] += float(vendor.vendor_balance_amount)
        
        if vendor.is_low_balance(1000.0):
            summary["vendors_low_balance"] += 1
        
        if vendor.balance_status == 'stale':
            summary["vendors_stale_balance"] += 1
    
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
        
        # Intentar login
        token = await vendor_service.login()
        
        # Intentar obtener balance
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
