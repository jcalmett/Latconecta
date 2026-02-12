# backend/app/payments/router.py
"""
Payments Router - IZIPAY New SDK Integration
Endpoints:
  POST /payments/token    -> Genera token de sesión (backend -> Izipay API)
  POST /payments/validate -> Valida firma HMAC del resultado (frontend -> backend)
"""

from fastapi import APIRouter, HTTPException, status
import hashlib
import hmac
import base64
import os
import json
import logging

from . import schemas, service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

IZIPAY_MERCHANT_CODE = settings.IZIPAY_MERCHANT_CODE
IZIPAY_HMAC_SHA256 = settings.IZIPAY_HMAC_SHA256
IZIPAY_RSA_PUBLIC_KEY = settings.IZIPAY_RSA_PUBLIC_KEY.replace("\\n", "\n")


@router.post("/token", response_model=schemas.PaymentCreateResponse)
async def create_token(payload: schemas.PaymentCreateRequest):
    """
    Genera un token de sesión llamando a Izipay API.
    El frontend usa este token como 'authorization' en checkout.LoadForm().
    
    También retorna merchantCode y la RSA public key para el SDK.
    """
    logger.info(f"💳 Token request: order={payload.order_number}, amount={payload.amount}")
    
    result = await service.generate_session_token(
        order_number=payload.order_number,
        amount=payload.amount,
    )
    
    if result["success"]:
        return schemas.PaymentCreateResponse(
            success=True,
            order_number=payload.order_number,
            amount=payload.amount,
            currency=payload.currency,
            token=result["token"],
            transaction_id=result["transactionId"],
            merchant_code=IZIPAY_MERCHANT_CODE,
        )
    else:
        # Retornamos el error sin lanzar excepción para que el frontend lo maneje
        return schemas.PaymentCreateResponse(
            success=False,
            order_number=payload.order_number,
            amount=payload.amount,
            currency=payload.currency,
            error=result.get("error", "Unknown error"),
        )


@router.post("/validate", response_model=schemas.PaymentValidateResponse)
async def validate_payment(payload: schemas.PaymentValidateRequest):
    """
    Valida la firma HMAC-SHA256 del resultado de pago.
    
    El SDK Izipay devuelve en callbackResponse:
    - payloadHttp: JSON string con los datos del pago
    - signature: hash HMAC-SHA256 en base64
    
    Este endpoint verifica que la firma sea válida usando la Clave HASH.
    """
    logger.info(f"🔐 Validate request: order={payload.order_number}, txn={payload.transaction_id}")
    
    try:
        # Calcular HMAC-SHA256 del payloadHttp con la clave HASH
        calculated_hash = hmac.new(
            IZIPAY_HMAC_SHA256.encode("utf-8"),
            payload.payload_http.encode("utf-8"),
            hashlib.sha256
        ).digest()
        
        calculated_signature = base64.b64encode(calculated_hash).decode("utf-8")
        
        is_valid = hmac.compare_digest(calculated_signature, payload.signature)
        
        if is_valid:
            logger.info(f"✅ Valid signature for order {payload.order_number}")
            
            # Parsear el payload para extraer estado
            try:
                payment_data = json.loads(payload.payload_http)
                payment_code = payment_data.get("code", "")
                payment_message = payment_data.get("message", "")
                
                # Extraer estado de la orden
                orders = payment_data.get("response", {}).get("order", [])
                state_message = orders[0].get("stateMessage", "") if orders else ""
                
            except (json.JSONDecodeError, IndexError, KeyError):
                payment_code = ""
                state_message = ""
                payment_message = ""
            
            return schemas.PaymentValidateResponse(
                success=True,
                valid_signature=True,
                order_number=payload.order_number,
                payment_status=state_message or ("Autorizado" if payment_code == "00" else "Denegado"),
                message=payment_message,
            )
        else:
            logger.warning(f"⚠️ Invalid signature for order {payload.order_number}")
            return schemas.PaymentValidateResponse(
                success=False,
                valid_signature=False,
                order_number=payload.order_number,
                message="Firma inválida - datos posiblemente alterados",
            )
            
    except Exception as e:
        logger.error(f"❌ Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating payment: {str(e)}"
        )


@router.get("/config")
async def get_payment_config():
    """
    Retorna la configuración pública necesaria para el SDK del frontend.
    NO expone claves secretas.
    """
    return {
        "merchantCode": IZIPAY_MERCHANT_CODE,
        "keyRSA": IZIPAY_RSA_PUBLIC_KEY,
        "environment": "sandbox",  # cambiar a "production" en prod
        "sdkUrl": "https://sandbox-checkout.izipay.pe/payments/v1/js/index.js",
    }
