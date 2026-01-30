# backend/app/payments/router.py
"""
Payments Router - IZIPAY Integration
Endpoints para manejo de pagos con tarjeta usando IZIPAY
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.database import get_db
from app.models.purchase import Purchase
from . import schemas, service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/create")
def create_payment(payload: schemas.PaymentCreateRequest):
    """
    Crea una orden de pago en modo sandbox.
    No persiste en base de datos.
    Retorna datos mínimos necesarios para iniciar Izipay Web Core.
    
    Returns:
        {
            "order_code": "abc-123-xyz",
            "amount": 50.00,
            "currency": "PEN",
            "formToken": "SANDBOX_FORM_TOKEN_TEMPORAL"
        }
    """
    return service.create_payment_order(payload.amount)


@router.post("/confirm")
async def confirm_payment(
    payload: schemas.PaymentConfirmRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Confirma el resultado del pago IZIPAY y actualiza el purchase
    
    Este endpoint es llamado por el FRONTEND después de que:
    1. Usuario completa el formulario IZIPAY
    2. IZIPAY procesa el pago (aprobado/rechazado)
    3. Frontend recibe el resultado
    
    Args:
        payload: {
            "order_code": "ORD-abc123",
            "success": true/false
        }
    
    Process:
        1. Buscar purchase por izipay_order_code
        2. Actualizar estados según resultado
        3. Si success=true: Ejecutar provisión
        4. Retornar resultado actualizado
    
    Returns:
        {
            "purchase_id": 123,
            "purchase_status": "Success" | "Failed",
            "payment_status": "Success" | "Failed",
            "message": "Payment confirmed successfully"
        }
    """
    logger.info(f"💳 Payment confirmation received: order={payload.order_code}, success={payload.success}")
    
    try:
        # ==================== BUSCAR PURCHASE ====================
        
        # Buscar purchase que tiene este izipay_order_code
        # NOTA: Como izipay_order_code aún no está en el modelo de BD,
        # temporalmente buscamos por purchase_reference o purchase_payment_ref
        
        # Por ahora, buscamos el purchase más reciente con payment_method='card' y status='Pending'
        # En producción, esto debería buscar por izipay_order_code cuando esté en el modelo
        
        stmt = select(Purchase).where(
            Purchase.purchase_payment_method == 'card',
            Purchase.purchase_status == 'Pending'
        ).order_by(Purchase.purchase_id.desc())
        
        result = await db.execute(stmt)
        purchase = result.scalar_one_or_none()
        
        if not purchase:
            logger.error(f"❌ Purchase not found for order_code: {payload.order_code}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Purchase not found for order: {payload.order_code}"
            )
        
        logger.info(f"📋 Purchase found: ID={purchase.purchase_id}, REF={purchase.purchase_reference}")
        
        # ==================== ACTUALIZAR ESTADOS ====================
        
        if payload.success:
            # ✅ PAGO EXITOSO
            purchase.purchase_payment_status = 'Success'
            purchase.purchase_status = 'Success'
            purchase.purchase_payment_ref = f"IZIPAY-{payload.order_code}"
            
            logger.info(f"✅ Payment APPROVED for purchase {purchase.purchase_id}")
            
            # TODO: EJECUTAR PROVISIÓN AL VENDOR
            # Aquí debería llamarse al universal_vendor_service para provisionar
            # Por ahora lo dejamos pendiente porque requiere integración completa
            
            # from app.services.universal_vendor_service import UniversalVendorService
            # vendor_service = UniversalVendorService(db)
            # provision_result = await vendor_service.provision(...)
            
        else:
            # ❌ PAGO RECHAZADO
            purchase.purchase_payment_status = 'Failed'
            purchase.purchase_status = 'Failed'
            
            logger.warning(f"❌ Payment REJECTED for purchase {purchase.purchase_id}")
        
        # Guardar cambios
        await db.commit()
        await db.refresh(purchase)
        
        logger.info(f"💾 Purchase updated: status={purchase.purchase_status}")
        
        # ==================== RETORNAR RESPONSE ====================
        
        return {
            "success": True,
            "purchase_id": purchase.purchase_id,
            "purchase_reference": purchase.purchase_reference,
            "purchase_status": purchase.purchase_status,
            "payment_status": purchase.purchase_payment_status,
            "payment_ref": purchase.purchase_payment_ref,
            "message": "Payment confirmed successfully" if payload.success else "Payment rejected"
        }
        
    except HTTPException:
        raise
    
    except Exception as e:
        logger.error(f"❌ Error confirming payment: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error confirming payment: {str(e)}"
        )


@router.get("/status/{order_code}")
async def get_payment_status(
    order_code: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Consulta el estado de un pago por order_code
    
    Útil para que el frontend verifique el estado después de abrir el formulario IZIPAY
    
    Returns:
        {
            "order_code": "ORD-abc123",
            "purchase_id": 123,
            "payment_status": "Pending" | "Success" | "Failed",
            "purchase_status": "Pending" | "Success" | "Failed"
        }
    """
    # Similar lógica de búsqueda que en confirm
    # Por ahora retornamos estructura básica
    
    return {
        "order_code": order_code,
        "payment_status": "Pending",
        "message": "Endpoint en desarrollo"
    }