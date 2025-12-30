"""
Router de Purchases con integración al Sistema Universal de Vendors
Mantiene toda la funcionalidad original + integración con vendors
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.purchase import Purchase
from ..models.user import User
from ..schemas.purchase import (
    PurchaseCreate, 
    PurchaseUpdate, 
    PurchaseInDB, 
    PurchaseListResponse,
    PurchaseStatsResponse
)
from ..dependencies import (
    get_current_user_optional,
    get_current_user_required,
    get_current_admin_user
)

# ✅ INTEGRACIÓN CON SISTEMA UNIVERSAL DE VENDORS
from ..services.universal_vendor_service import process_vendor_topup
from ..models.product import Product
from ..models.vendor_product import VendorProduct

router = APIRouter(
    prefix="/purchases",
    tags=["purchases"]
)

# ═══════════════════════════════════════════════════════════════
# CREATE - POST /api/v1/purchases
# ═══════════════════════════════════════════════════════════════

@router.post("", response_model=PurchaseInDB, status_code=201)
async def create_purchase(
    request: Request,
    purchase: PurchaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Crear nueva compra (usuario autenticado o anónimo)
    
    ✅ NUEVA FUNCIONALIDAD: Integración automática con vendors
    - Obtiene configuración del producto
    - Calcula montos y fees
    - Procesa con vendor automáticamente
    - Actualiza estado según respuesta
    """
    
    try:
        purchase_data = purchase.dict()
        
        # ────────────────────────────────────────────────────────
        # 1. DATOS DE USUARIO Y AUDITORÍA
        # ────────────────────────────────────────────────────────
        
        # Usuario: NULL si anónimo, user_id si registrado
        purchase_data['purchase_user_id'] = current_user.user_id if current_user else None
        
        # IP automática
        purchase_data['purchase_ip_petition'] = request.client.host
        
        # Auditoría
        if current_user:
            purchase_data['created_by'] = current_user.user_email
        else:
            purchase_data['created_by'] = 'anonymous'
        
        # Nombre entrega por defecto
        if not purchase_data.get('purchase_delivery_name'):
            if current_user:
                purchase_data['purchase_delivery_name'] = current_user.user_name
            else:
                purchase_data['purchase_delivery_name'] = 'Cliente Anónimo'
        
        # ────────────────────────────────────────────────────────
        # 2. ✅ NUEVA LÓGICA: OBTENER PRODUCTO Y VENDOR
        # ────────────────────────────────────────────────────────
        
        product_id = purchase_data.get('purchase_product_id')
        
        if product_id:
            # Obtener producto
            product_query = await db.execute(
                select(Product).where(Product.product_id == product_id)
            )
            product = product_query.scalar_one_or_none()
            
            if not product:
                raise HTTPException(404, f"Producto {product_id} no encontrado")
            
            # Verificar que producto esté activo
            if product.product_status != 'active':
                raise HTTPException(400, "Producto no disponible")
            
            # ────────────────────────────────────────────────────────
            # 3. ✅ CALCULAR MONTOS
            # ────────────────────────────────────────────────────────
            
            # Determinar monto vendor según tipo de producto
            if product.product_amount_type == 'F':  # Fijo
                vendor_amount = product.product_base_price
                
            elif product.product_amount_type in ['R', 'V']:  # Rango o Variable
                # Usuario debe haber enviado user_selected_amount
                user_selected = purchase_data.get('user_selected_amount')
                
                if not user_selected:
                    raise HTTPException(
                        400, 
                        "user_selected_amount requerido para productos variables"
                    )
                
                vendor_amount = user_selected
                
                # Validar rango si es tipo R
                if product.product_amount_type == 'R':
                    min_amt = product.product_minimum_amount
                    max_amt = product.product_maximum_amount
                    
                    if min_amt and vendor_amount < min_amt:
                        raise HTTPException(
                            400, 
                            f"Monto mínimo: {min_amt}"
                        )
                    if max_amt and vendor_amount > max_amt:
                        raise HTTPException(
                            400, 
                            f"Monto máximo: {max_amt}"
                        )
            else:
                vendor_amount = product.product_base_price
            
            # Calcular fees
            fee = 0
            if product.product_fee_percentage:
                fee += (vendor_amount * product.product_fee_percentage) / 100
            if product.product_fee_fixed:
                fee += product.product_fee_fixed
            
            # Validar total
            expected_total = vendor_amount + fee
            received_total = purchase_data.get('purchase_total_amount', 0)
            
            if abs(received_total - expected_total) > 0.01:
                raise HTTPException(
                    400,
                    f"Total incorrecto. Esperado: {expected_total}, Recibido: {received_total}"
                )
            
            # ────────────────────────────────────────────────────────
            # 4. ✅ COMPLETAR DATOS DE PURCHASE CON INFO DEL PRODUCTO
            # ────────────────────────────────────────────────────────
            
            purchase_data['purchase_vendor_code'] = product.product_vendor_code
            purchase_data['purchase_vendpro_code'] = product.product_vendpro_code
            purchase_data['purchase_vendor_skuid'] = product.product_vendpro_skuid
            purchase_data['purchase_vendor_amount'] = vendor_amount  # SIN fees
            purchase_data['purchase_vendor_currency'] = 'PEN'
            purchase_data['purchase_fee'] = fee
            purchase_data['purchase_service_name'] = product.service_id  # O nombre del servicio
            purchase_data['purchase_product_name'] = product.product_name
            
            # Obtener vendor_product para datos adicionales
            if product.product_vendpro_skuid:
                vp_query = await db.execute(
                    select(VendorProduct).where(
                        and_(
                            VendorProduct.vendor_code == product.product_vendor_code,
                            VendorProduct.vp_skuid == product.product_vendpro_skuid
                        )
                    )
                )
                vendor_product = vp_query.scalar_one_or_none()
                
                if vendor_product:
                    purchase_data['purchase_vendpro_country'] = vendor_product.vp_country
                    purchase_data['purchase_vendpro_operator'] = vendor_product.vp_operator
                    purchase_data['purchase_vendpro_product_type'] = vendor_product.vp_product_type
        
        # ────────────────────────────────────────────────────────
        # 5. FIX TIMEZONE (mantener funcionalidad original)
        # ────────────────────────────────────────────────────────
        
        datetime_fields = [
            'purchase_date_sent_to_conciliation',
            'purchase_vendor_date_petition',
            'purchase_vendor_date_response'
        ]
        
        for field in datetime_fields:
            if field in purchase_data and purchase_data[field] is not None:
                if hasattr(purchase_data[field], 'tzinfo') and purchase_data[field].tzinfo:
                    purchase_data[field] = purchase_data[field].replace(tzinfo=None)
        
        # ────────────────────────────────────────────────────────
        # 6. CREAR REGISTRO EN BD
        # ────────────────────────────────────────────────────────
        
        # Generar referencia si no existe
        if not purchase_data.get('purchase_reference'):
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            purchase_data['purchase_reference'] = f"LC-{timestamp}"
        
        # Fecha de compra
        if not purchase_data.get('purchase_date'):
            purchase_data['purchase_date'] = datetime.now()
        
        # Estados iniciales
        purchase_data['purchase_payment_status'] = purchase_data.get('purchase_payment_status', 'Pending')
        purchase_data['purchase_delivery_status'] = 'Pending'
        
        # Crear purchase
        db_purchase = Purchase(**purchase_data)
        db.add(db_purchase)
        await db.commit()
        await db.refresh(db_purchase)
        
        # ────────────────────────────────────────────────────────
        # 7. ✅ PROCESAR CON VENDOR (SI HAY VENDOR CONFIGURADO)
        # ────────────────────────────────────────────────────────
        
        if product_id and product.product_vendor_code:
            try:
                # Preparar datos para vendor (todo desde purchases)
                vendor_data = {
                    "purchase_phone_number": db_purchase.purchase_phone_number,
                    "purchase_vendor_amount": db_purchase.purchase_vendor_amount,
                    "purchase_vendor_currency": db_purchase.purchase_vendor_currency,
                    "purchase_vendpro_skuid": db_purchase.purchase_vendor_skuid,
                    "purchase_reference": db_purchase.purchase_reference,
                    "purchase_vendpro_country": db_purchase.purchase_vendpro_country,
                    "purchase_vendpro_operator": db_purchase.purchase_vendpro_operator,
                }
                
                # Llamar al servicio universal
                result = await process_vendor_topup(
                    db=db,
                    vendor_code=product.product_vendor_code,
                    purchase_data=vendor_data,
                    vendor_product_data={}  # Ya no necesario, todo en purchase_data
                )
                
                # Actualizar purchase con resultado del vendor
                if result["status"] == "success":
                    db_purchase.purchase_delivery_status = "Success"
                    db_purchase.purchase_vendor_purchase_id = result.get("purchase_vendor_purchase_id")
                    db_purchase.purchase_vendor_response_code = "SUCCESS"
                    db_purchase.purchase_vendor_date_response = datetime.now()
                    db_purchase.purchase_payment_status = "Paid"
                else:
                    db_purchase.purchase_delivery_status = "Failed"
                    db_purchase.purchase_vendor_response_code = result.get("error_code", "ERROR")
                    db_purchase.purchase_vendor_response_description = result.get("error_message")
                    db_purchase.purchase_vendor_date_response = datetime.now()
                    db_purchase.purchase_payment_status = "Failed"
                
                await db.commit()
                await db.refresh(db_purchase)
                
            except Exception as vendor_error:
                # Si falla vendor, marcar purchase pero no fallar request
                db_purchase.purchase_delivery_status = "Failed"
                db_purchase.purchase_vendor_response_description = f"Error: {str(vendor_error)}"
                db_purchase.requires_manual_intervention = True
                await db.commit()
                await db.refresh(db_purchase)
        
        return db_purchase
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error al crear purchase: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# READ - GET ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.get("", response_model=List[PurchaseListResponse])
async def get_all_purchases(
    skip: int = 0,
    limit: int = 100,
    purchase_type: Optional[str] = None,
    payment_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """
    Listar todas las compras con filtros
    Requiere: Usuario autenticado
    """
    query = select(Purchase)
    
    # Filtro por tipo de compra
    if purchase_type == 'registered':
        query = query.where(Purchase.purchase_user_id.isnot(None))
    elif purchase_type == 'anonymous':
        query = query.where(Purchase.purchase_user_id.is_(None))
    
    # Filtro por estado de pago
    if payment_status:
        query = query.where(Purchase.purchase_payment_status == payment_status)
    
    # Orden y paginación
    query = query.order_by(desc(Purchase.purchase_date)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    purchases = result.scalars().all()
    
    return purchases


@router.get("/{purchase_id}", response_model=PurchaseInDB)
async def get_purchase_by_id(
    purchase_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Obtener compra por ID
    Permisos: Admin ve todo, usuario ve su propia compra
    """
    query = select(Purchase).where(Purchase.purchase_id == purchase_id)
    result = await db.execute(query)
    purchase = result.scalar_one_or_none()
    
    if not purchase:
        raise HTTPException(404, "Purchase no encontrada")
    
    # Verificar permisos
    if current_user:
        if current_user.user_role != 'admin':
            if purchase.purchase_user_id != current_user.user_id:
                raise HTTPException(403, "No autorizado para ver esta compra")
    
    return purchase


@router.get("/reference/{reference}", response_model=PurchaseInDB)
async def get_purchase_by_reference(
    reference: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Obtener compra por referencia
    Permisos: Admin ve todo, usuario ve su propia compra
    """
    query = select(Purchase).where(Purchase.purchase_reference == reference)
    result = await db.execute(query)
    purchase = result.scalar_one_or_none()
    
    if not purchase:
        raise HTTPException(404, "Purchase no encontrada")
    
    # Verificar permisos
    if current_user:
        if current_user.user_role != 'admin':
            if purchase.purchase_user_id != current_user.user_id:
                raise HTTPException(403, "No autorizado")
    
    return purchase


@router.get("/user/{user_id}", response_model=List[PurchaseListResponse])
async def get_user_purchases(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """
    Obtener compras de un usuario
    Permisos: Admin ve todo, usuario solo sus compras
    """
    # Verificar permisos
    if current_user.user_role != 'admin':
        if user_id != current_user.user_id:
            raise HTTPException(403, "No autorizado")
    
    query = select(Purchase).where(
        Purchase.purchase_user_id == user_id
    ).order_by(desc(Purchase.purchase_date))
    
    result = await db.execute(query)
    purchases = result.scalars().all()
    
    return purchases


@router.get("/my-purchases", response_model=List[PurchaseListResponse])
async def get_my_purchases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """
    Obtener mis compras (usuario actual)
    """
    query = select(Purchase).where(
        Purchase.purchase_user_id == current_user.user_id
    ).order_by(desc(Purchase.purchase_date))
    
    result = await db.execute(query)
    purchases = result.scalars().all()
    
    return purchases


@router.get("/stats/summary", response_model=PurchaseStatsResponse)
async def get_purchase_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Estadísticas generales de compras
    Solo admin
    """
    # Total purchases
    total_query = await db.execute(select(func.count(Purchase.purchase_id)))
    total_purchases = total_query.scalar()
    
    # Registered purchases
    registered_query = await db.execute(
        select(func.count(Purchase.purchase_id)).where(
            Purchase.purchase_user_id.isnot(None)
        )
    )
    registered_purchases = registered_query.scalar()
    
    # Anonymous purchases
    anonymous_purchases = total_purchases - registered_purchases
    
    # Total amounts
    amount_query = await db.execute(
        select(
            func.sum(Purchase.purchase_total_amount),
            Purchase.purchase_currency
        ).group_by(Purchase.purchase_currency)
    )
    amounts = amount_query.all()
    
    return {
        "total_purchases": total_purchases,
        "registered_purchases": registered_purchases,
        "anonymous_purchases": anonymous_purchases,
        "total_amounts": [
            {"currency": currency, "amount": float(amount)} 
            for amount, currency in amounts
        ]
    }


# ═══════════════════════════════════════════════════════════════
# UPDATE - PUT /api/v1/purchases/{id}
# ═══════════════════════════════════════════════════════════════

@router.put("/{purchase_id}", response_model=PurchaseInDB)
async def update_purchase(
    purchase_id: int,
    purchase_update: PurchaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Actualizar compra
    Solo admin
    """
    # Buscar purchase
    query = select(Purchase).where(Purchase.purchase_id == purchase_id)
    result = await db.execute(query)
    purchase = result.scalar_one_or_none()
    
    if not purchase:
        raise HTTPException(404, "Purchase no encontrada")
    
    # Actualizar campos
    update_data = purchase_update.dict(exclude_unset=True)
    
    # Auditoría
    update_data['updated_by'] = current_user.user_email
    update_data['last_update_date'] = datetime.now()
    
    for field, value in update_data.items():
        setattr(purchase, field, value)
    
    await db.commit()
    await db.refresh(purchase)
    
    return purchase


# ═══════════════════════════════════════════════════════════════
# DELETE - DELETE /api/v1/purchases/{id}
# ═══════════════════════════════════════════════════════════════

@router.delete("/{purchase_id}")
async def delete_purchase(
    purchase_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Eliminar compra
    Solo admin
    """
    query = select(Purchase).where(Purchase.purchase_id == purchase_id)
    result = await db.execute(query)
    purchase = result.scalar_one_or_none()
    
    if not purchase:
        raise HTTPException(404, "Purchase no encontrada")
    
    await db.delete(purchase)
    await db.commit()
    
    return {"message": "Purchase eliminada exitosamente"}