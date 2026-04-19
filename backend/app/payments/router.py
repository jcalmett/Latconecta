# backend/app/payments/router.py
"""
Payments Router - Multi-Gateway Integration
Endpoints:
  POST /payments/token    -> Genera token de sesión (backend -> Izipay API)
  POST /payments/validate -> Valida firma HMAC del resultado (frontend -> backend)
  POST /payments/cancel   -> Anula transacción (multi-gateway)
  GET  /payments/config   -> Configuración pública para el SDK frontend
  GET  /payments/gateways -> Lista gateways disponibles
"""

from fastapi import APIRouter, HTTPException, status
import hashlib
import hmac
import base64
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


# ================================================================
# POST /payments/token - Generar token de sesión
# ================================================================

@router.post("/token", response_model=schemas.PaymentCreateResponse)
async def create_token(payload: schemas.PaymentCreateRequest):
    """
    Genera un token de sesión llamando a Izipay API.
    El frontend usa este token como 'authorization' en checkout.LoadForm().
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
        return schemas.PaymentCreateResponse(
            success=False,
            order_number=payload.order_number,
            amount=payload.amount,
            currency=payload.currency,
            error=result.get("error", "Unknown error"),
        )


# ================================================================
# POST /payments/validate - Validar firma HMAC del pago
# ================================================================

@router.post("/validate", response_model=schemas.PaymentValidateResponse)
async def validate_payment(payload: schemas.PaymentValidateRequest):
    """
    Valida la firma HMAC-SHA256 del resultado de pago.
    También extrae y retorna uniqueId, authorizationCode y
    transactionDatetime necesarios para una eventual anulación.
    """
    logger.info(f"🔍 Validate request: order={payload.order_number}, txn={payload.transaction_id}")

    try:
        calculated_hash = hmac.new(
            IZIPAY_HMAC_SHA256.encode("utf-8"),
            payload.payload_http.encode("utf-8"),
            hashlib.sha256
        ).digest()

        calculated_signature = base64.b64encode(calculated_hash).decode("utf-8")
        is_valid = hmac.compare_digest(calculated_signature, payload.signature)

        if is_valid:
            logger.info(f"✅ Valid signature for order {payload.order_number}")

            payment_code = ""
            state_message = ""
            payment_message = ""

            try:
                payment_data = json.loads(payload.payload_http)
                payment_code = payment_data.get("code", "")
                payment_message = payment_data.get("message", "")
                orders = payment_data.get("response", {}).get("order", [])
                state_message = orders[0].get("stateMessage", "") if orders else ""
            except (json.JSONDecodeError, IndexError, KeyError):
                pass

            cancel_data = service.extract_cancel_data_from_payload(payload.payload_http)

            return schemas.PaymentValidateResponse(
                success=True,
                valid_signature=True,
                order_number=payload.order_number,
                payment_status=state_message or ("Autorizado" if payment_code == "00" else "Denegado"),
                message=payment_message,
                unique_id=cancel_data.get("unique_id"),
                authorization_code=cancel_data.get("authorization_code"),
                transaction_datetime=cancel_data.get("transaction_datetime"),
                pay_method=cancel_data.get("pay_method"),
                channel=cancel_data.get("channel"),
                amount=cancel_data.get("amount"),
                currency=cancel_data.get("currency"),
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


# ================================================================
# POST /payments/cancel - Anular transacción
# ================================================================

@router.post("/cancel", response_model=schemas.PaymentCancelResponse)
async def cancel_payment(payload: schemas.PaymentCancelRequest):
    """
    Anula/cancela una transacción de pago procesada por un gateway.
    Soporta múltiples gateways: izipay, conekta (futuro), stripe (futuro).
    """
    logger.info(
        f"🔄 Cancel request: gateway={payload.gateway}, "
        f"order={payload.order_number}, amount={payload.amount} {payload.currency}"
    )

    cancel_data = {
        "gateway": payload.gateway,
        "transaction_id": payload.transaction_id,
        "order_number": payload.order_number,
        "amount": payload.amount,
        "currency": payload.currency,
        "unique_id": payload.unique_id,
        "authorization_code": payload.authorization_code,
        "transaction_datetime": payload.transaction_datetime,
        "pay_method": payload.pay_method,
        "channel": payload.channel,
    }

    result = await service.cancel_transaction(cancel_data)

    return schemas.PaymentCancelResponse(
        success=result["success"],
        gateway=result["gateway"],
        order_number=payload.order_number,
        cancel_id=result.get("cancel_id"),
        authorization_code_cancel=result.get("authorization_code_cancel"),
        message=result.get("message"),
        raw_response=result.get("raw_response"),
    )


# ================================================================
# GET /payments/config - Configuración pública del SDK
# ================================================================

@router.get("/config")
async def get_payment_config():
    """
    Retorna la configuración pública necesaria para el SDK del frontend.
    NO expone claves secretas.

    Incluye:
    - Datos del gateway de tarjeta (merchantCode, keyRSA, sdkUrl)
    - gateway: nombre del gateway activo según DEPLOYMENT_COUNTRY
    - card_available: si el pago con tarjeta está disponible en esta instalación
    - barcode_available: si el pago con barcode está disponible en esta instalación
      (el control granular por operadora se mantiene en company_barcode_available)
    """
    # Determinar sdkUrl y environment según el endpoint configurado
    is_sandbox = "sandbox" in settings.IZIPAY_API_URL
    sdk_url = (
        "https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"
        if is_sandbox
        else "https://checkout.izipay.pe/payments/v1/js/index.js"
    )
    environment = "sandbox" if is_sandbox else "production"

    return {
        # Gateway de tarjeta
        "gateway": settings.PAYMENT_GATEWAY,
        "merchantCode": IZIPAY_MERCHANT_CODE,
        "keyRSA": IZIPAY_RSA_PUBLIC_KEY,
        "environment": environment,
        "sdkUrl": sdk_url,
        # Disponibilidad de métodos de pago por instalación/país
        "card_available": settings.CARD_AVAILABLE,
        "barcode_available": settings.BARCODE_AVAILABLE,
    }


# ================================================================
# GET /payments/gateways - Lista gateways disponibles
# ================================================================

@router.get("/gateways")
async def list_gateways():
    """
    Lista los gateways de pago disponibles en el sistema.
    """
    from app.payments.gateway import payment_gateway_service

    return {
        "gateways": payment_gateway_service.list_gateways(),
        "default": settings.PAYMENT_GATEWAY,
    }
