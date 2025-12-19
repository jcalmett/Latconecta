"""
Router de Purchases - SINCRONIZADO CON NUEVA ESTRUCTURA
✅ PERMITE COMPRAS ANÓNIMAS (sin autenticación)
✅ Compatible con purchase_vendor_cost y purchase_status
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime
from app.database import get_db


# =============================================================================
# HELPER: Remover timezone de datetime
# =============================================================================
def remove_timezone(dt):
    """Remover timezone de datetime para PostgreSQL TIMESTAMP WITHOUT TIME ZONE"""
    if dt is None:
        return None
    if hasattr(dt, 'tzinfo') and dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt
from app.models import Purchase, User, Product
from app.schemas.purchase import (
    PurchaseInDB,
    PurchaseCreate,
    PurchaseUpdate,
    PurchaseListResponse,
    PurchaseStats
)
from app.utils.dependencies import get_current_user_optional, get_current_active_user

router = APIRouter()


# =============================================================================
# HELPER: Detectar si compra es anónima
# =============================================================================
def is_anonymous_purchase(purchase_data: PurchaseCreate) -> bool:
    """Detectar si es compra anónima"""
    return purchase_data.purchase_user_id is None


# =============================================================================
# CREATE PURCHASE - PERMITE ANÓNIMAS
# =============================================================================
@router.post("/", response_model=PurchaseInDB, status_code=status.HTTP_201_CREATED)
async def create_purchase(
    purchase_data: PurchaseCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Crear nueva compra
    
    ✅ PERMITE COMPRAS ANÓNIMAS (purchase_user_id = NULL)
    ✅ PERMITE COMPRAS CON USUARIO AUTENTICADO
    
    **Campos obligatorios:**
    - purchase_reference
    - purchase_phone_number
    - purchase_product_id
    - purchase_service_name
    - purchase_product_name
    - purchase_base_price
    - purchase_total_amount
    - purchase_payment_method
    
    **Nuevos campos opcionales:**
    - purchase_vendor_cost
    - purchase_status (default: 'Pending')
    """
    
    print("═══════════════════════════════════════")
    print(f"📦 Nueva compra")
    print(f"   Usuario: {current_user.user_email if current_user else 'ANÓNIMO'}")
    print(f"   Ref: {purchase_data.purchase_reference}")
    print(f"   Teléfono: {purchase_data.purchase_phone_number}")
    print("═══════════════════════════════════════")
    
    # Validar producto existe
    if purchase_data.purchase_product_id:
        result = await db.execute(
            select(Product).where(Product.product_id == purchase_data.purchase_product_id)
        )
        product = result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto {purchase_data.purchase_product_id} no encontrado"
            )
    
    # Crear purchase desde datos
    purchase_dict = purchase_data.dict(exclude_unset=True)
    
    # Asegurar valores por defecto
    if 'purchase_status' not in purchase_dict or not purchase_dict['purchase_status']:
        purchase_dict['purchase_status'] = 'Pending'
    
    # ✅ NORMALIZAR TIMESTAMPS - Remover timezone
    datetime_fields = [
        'purchase_date',
        'purchase_vendor_date_petition',
        'purchase_vendor_date_response',
        'purchase_date_sent_to_conciliation'
    ]
    
    for field in datetime_fields:
        if field in purchase_dict and purchase_dict[field] is not None:
            purchase_dict[field] = remove_timezone(purchase_dict[field])
    
    # Establecer created_by
    if current_user:
        purchase_dict['created_by'] = current_user.user_email
    else:
        purchase_dict['created_by'] = 'anonymous'
    
    # Capturar IP si no viene en datos
    if 'purchase_ip_petition' not in purchase_dict:
        purchase_dict['purchase_ip_petition'] = request.client.host
    
    # Crear objeto Purchase
    purchase = Purchase(**purchase_dict)
    
    db.add(purchase)
    
    try:
        await db.commit()
        await db.refresh(purchase)
        
        print(f"✅ Purchase creado: ID {purchase.purchase_id}")
        print(f"   Estado: {purchase.purchase_status}")
        print(f"   Vendor Cost: {purchase.purchase_vendor_cost}")
        
        return purchase
        
    except Exception as e:
        await db.rollback()
        print(f"❌ Error al crear purchase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear compra: {str(e)}"
        )


# =============================================================================
# LIST PURCHASES - REQUIERE AUTENTICACIÓN
# =============================================================================
@router.get("/", response_model=List[PurchaseListResponse])
async def list_purchases(
    skip: int = 0,
    limit: int = 100,
    payment_status: Optional[str] = None,
    delivery_status: Optional[str] = None,
    purchase_status: Optional[str] = None,
    requires_intervention: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Listar compras con filtros
    
    **Requiere autenticación**
    
    Filtros:
    - payment_status: Paid, Pending, Reversed
    - delivery_status: Success, Failed, Ordered, etc.
    - purchase_status: Success, Failed, Pending
    - requires_intervention: true/false
    """
    
    query = select(Purchase)
    
    # Si no es admin, solo ve sus propias compras
    if current_user.user_role not in ['admin', 'superadmin']:
        query = query.where(Purchase.purchase_user_id == current_user.user_id)
    
    # Aplicar filtros
    if payment_status:
        query = query.where(Purchase.purchase_payment_status == payment_status)
    
    if delivery_status:
        query = query.where(Purchase.purchase_delivery_status == delivery_status)
    
    if purchase_status:
        query = query.where(Purchase.purchase_status == purchase_status)
    
    if requires_intervention is not None:
        query = query.where(Purchase.requires_manual_intervention == requires_intervention)
    
    query = query.offset(skip).limit(limit).order_by(Purchase.purchase_date.desc())
    
    result = await db.execute(query)
    purchases = result.scalars().all()
    
    return purchases


# =============================================================================
# GET PURCHASE BY ID - REQUIERE AUTENTICACIÓN
# =============================================================================
@router.get("/{purchase_id}", response_model=PurchaseInDB)
async def get_purchase(
    purchase_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener detalle de una compra
    
    **Requiere autenticación**
    """
    
    result = await db.execute(
        select(Purchase).where(Purchase.purchase_id == purchase_id)
    )
    purchase = result.scalar_one_or_none()
    
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compra {purchase_id} no encontrada"
        )
    
    # Verificar permisos
    if current_user.user_role not in ['admin', 'superadmin']:
        if purchase.purchase_user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver esta compra"
            )
    
    return purchase


# =============================================================================
# UPDATE PURCHASE - SOLO ADMIN
# =============================================================================
@router.put("/{purchase_id}", response_model=PurchaseInDB)
async def update_purchase(
    purchase_id: int,
    purchase_data: PurchaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Actualizar compra
    
    **Requiere:** Admin o Superadmin
    """
    
    if current_user.user_role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden actualizar compras"
        )
    
    result = await db.execute(
        select(Purchase).where(Purchase.purchase_id == purchase_id)
    )
    purchase = result.scalar_one_or_none()
    
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compra {purchase_id} no encontrada"
        )
    
    # Actualizar campos
    update_data = purchase_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(purchase, field, value)
    
    purchase.updated_by = current_user.user_email
    
    await db.commit()
    await db.refresh(purchase)
    
    return purchase


# =============================================================================
# STATS - SOLO ADMIN
# =============================================================================
@router.get("/stats/summary", response_model=PurchaseStats)
async def get_purchase_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Estadísticas de compras
    
    **Requiere:** Admin o Superadmin
    """
    
    if current_user.user_role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden ver estadísticas"
        )
    
    # Total purchases
    result = await db.execute(select(func.count(Purchase.purchase_id)))
    total_purchases = result.scalar()
    
    # Total amount
    result = await db.execute(select(func.sum(Purchase.purchase_total_amount)))
    total_amount = result.scalar() or 0
    
    # Registered vs Anonymous
    result = await db.execute(
        select(func.count(Purchase.purchase_id))
        .where(Purchase.purchase_user_id.isnot(None))
    )
    registered_purchases = result.scalar()
    
    result = await db.execute(
        select(func.count(Purchase.purchase_id))
        .where(Purchase.purchase_user_id.is_(None))
    )
    anonymous_purchases = result.scalar()
    
    # Amounts
    result = await db.execute(
        select(func.sum(Purchase.purchase_total_amount))
        .where(Purchase.purchase_user_id.isnot(None))
    )
    registered_amount = result.scalar() or 0
    
    result = await db.execute(
        select(func.sum(Purchase.purchase_total_amount))
        .where(Purchase.purchase_user_id.is_(None))
    )
    anonymous_amount = result.scalar() or 0
    
    return {
        "total_purchases": total_purchases,
        "total_amount": total_amount,
        "registered_purchases": registered_purchases,
        "anonymous_purchases": anonymous_purchases,
        "registered_amount": registered_amount,
        "anonymous_amount": anonymous_amount
    }


# =============================================================================
# ✅ CAMBIOS REALIZADOS:
# =============================================================================
# 1. create_purchase: Ahora usa get_current_user_optional (permite anónimas)
# 2. create_purchase: Maneja purchase_vendor_cost y purchase_status
# 3. create_purchase: Establece created_by = 'anonymous' si no hay usuario
# 4. list_purchases: Filtro adicional por purchase_status
# 5. Todos los schemas actualizados a la nueva estructura
# 6. Removida integración con VendorManager (no existe en el código actual)
#
# INSTALACIÓN:
# Reemplazar: backend/app/routers/purchases.py
# Reiniciar: uvicorn app.main:app --reload --port 8100
# =============================================================================