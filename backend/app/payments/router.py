# backend/app/payments/router.py
"""
Payments Router — Culqi Integration
Endpoints:
  POST /payments/charge   → Crea cargo con token del Checkout V4
  POST /payments/order    → Crea Order ID para Yape / billeteras / PagoEfectivo
  POST /payments/refund   → Devuelve un cargo (parcial o total)
  POST /payments/cancel   → Cancela/revierte un cargo (alias de refund, usado por purchases.py)
  GET  /payments/config   → Configuración pública para el SDK frontend
  GET  /payments/gateways → Lista gateways disponibles
"""

import logging
from fastapi import APIRouter, HTTPException, status

from . import schemas, service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# ================================================================
# POST /payments/charge — Crear cargo con token Checkout V4
# ================================================================

@router.post("/charge", response_model=schemas.PaymentChargeResponse)
async def create_charge(payload: schemas.PaymentChargeRequest):
    """
    Crea un cargo en Culqi usando el token generado por el Checkout V4.

    Flujo:
      1. Frontend abre Culqi Checkout V4 → usuario ingresa tarjeta
      2. Culqi SDK genera token (tkn_live_XXX) y lo envía al frontend
      3. Frontend llama este endpoint con el token_id
      4. Backend crea el cargo real en Culqi
      5. Retorna charge_id para guardar en la compra
    """
    logger.info(
        f"💳 Charge request: token={payload.token_id[:20]}..., "
        f"amount={payload.amount} {payload.currency_code}, "
        f"email={payload.email}"
    )

    charge_data = {
        "token_id":     payload.token_id,
        "amount":       payload.amount,
        "currency_code": payload.currency_code,
        "email":        payload.email,
        "description":  payload.description,
        "order_number": payload.order_number,
        "installments": payload.installments,
        "capture":      payload.capture,

    }

    result = await service.create_charge(charge_data)

    return schemas.PaymentChargeResponse(
        success=result["success"],
        charge_id=result.get("charge_id"),
        outcome_type=result.get("outcome_type"),
        amount=result.get("amount"),
        currency_code=result.get("currency_code"),
        message=result.get("message"),
        raw_response=result.get("raw_response"),
    )


# ================================================================
# POST /payments/order — Crear Order para Yape / billeteras
# ================================================================

@router.post("/order", response_model=schemas.PaymentOrderResponse)
async def create_order(payload: schemas.PaymentOrderRequest):
    """
    Crea una orden de pago en Culqi.

    Necesaria para habilitar Yape, billeteras digitales y PagoEfectivo
    en el Checkout V4. El order_id retornado (ord_live_XXX) debe pasarse
    al frontend en settings.order del CulqiCheckout.

    Flujo:
      1. Frontend llama este endpoint ANTES de abrir el Checkout V4
      2. Backend crea la orden en Culqi → retorna order_id
      3. Frontend pasa order_id al settings.order del Checkout V4
      4. El Checkout habilita Yape / billeteras / PagoEfectivo
    """
    logger.info(
        f"📋 Order request: amount={payload.amount} {payload.currency_code}, "
        f"order_number={payload.order_number}"
    )

    order_data = {
        "amount":          payload.amount,
        "currency_code":   payload.currency_code,
        "order_number":    payload.order_number,
        "description":     payload.description,
        "expiration_date": payload.expiration_date,
        "first_name":      payload.first_name,
        "last_name":       payload.last_name,
        "email":           payload.email,
        "phone_number":    payload.phone_number,
    }

    result = await service.create_order(order_data)

    return schemas.PaymentOrderResponse(
        success=result["success"],
        order_id=result.get("order_id"),
        order_number=result.get("order_number"),
        message=result.get("message"),
        raw_response=result.get("raw_response"),
    )


# ================================================================
# POST /payments/refund — Devolver un cargo
# ================================================================

@router.post("/refund", response_model=schemas.PaymentRefundResponse)
async def create_refund(payload: schemas.PaymentRefundRequest):
    """
    Crea una devolución (parcial o total) de un cargo en Culqi.
    """
    logger.info(
        f"↩ Refund request: charge_id={payload.charge_id}, "
        f"amount={payload.amount}, reason={payload.reason}"
    )

    refund_data = {
        "charge_id": payload.charge_id,
        "amount":    payload.amount,
        "reason":    payload.reason,
    }

    result = await service.create_refund(refund_data)

    return schemas.PaymentRefundResponse(
        success=result["success"],
        refund_id=result.get("refund_id"),
        amount=result.get("amount"),
        message=result.get("message"),
        raw_response=result.get("raw_response"),
    )


# ================================================================
# POST /payments/cancel — Cancelar cargo (usado por purchases.py)
# ================================================================

@router.post("/cancel", response_model=schemas.PaymentCancelResponse)
async def cancel_payment(payload: schemas.PaymentCancelRequest):
    """
    Cancela/revierte un cargo de pago.
    En Culqi una cancelación es un refund total.
    Usado internamente por purchases.py para reversión automática
    cuando la provisión del servicio falla.
    """
    logger.info(
        f"🔄 Cancel request: gateway={payload.gateway}, "
        f"charge_id={payload.charge_id}, amount={payload.amount}"
    )

    cancel_data = {
        "gateway":    payload.gateway,
        "charge_id":  payload.charge_id,
        "amount":     payload.amount,
        "currency":   payload.currency,
        "reason":     payload.reason,
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
# GET /payments/config — Configuración pública para el frontend
# ================================================================

@router.get("/config")
async def get_payment_config():
    """
    Retorna la configuración pública necesaria para el SDK del frontend.
    NO expone claves secretas (CULQI_SECRET_KEY nunca sale del backend).

    El frontend usa esta respuesta para:
      - Inicializar CulqiCheckout con la public_key
      - Saber qué métodos de pago están disponibles
      - Determinar si activar Yape/billeteras (requiere llamar a /payments/order primero)
    """
    # Obtener configuración del país activo desde la tabla maestra
    from app.payments.gateway import COUNTRY_PAYMENT_CONFIG
    country_cfg = COUNTRY_PAYMENT_CONFIG.get(settings.DEPLOYMENT_COUNTRY, {})

    return {
        # País e instalación
        "deployment_country":  settings.DEPLOYMENT_COUNTRY,

        # Procesadores activos para este país
        "gateway":             settings.PAYMENT_GATEWAY,
        "card_gateway":        country_cfg.get("card_gateway", settings.PAYMENT_GATEWAY),
        "barcode_gateway":     country_cfg.get("barcode_gateway"),

        # Disponibilidad de métodos (controlada por .env)
        "card_available":      settings.CARD_AVAILABLE,
        "barcode_available":   settings.BARCODE_AVAILABLE,

        # Claves públicas del gateway de tarjeta activo
        # Al agregar nuevos gateways, agregar sus public_keys aquí
        "public_key":          settings.CULQI_PUBLIC_KEY if settings.PAYMENT_GATEWAY == "culqi" else None,
        "rsa_id":              settings.CULQI_RSA_ID or None if settings.PAYMENT_GATEWAY == "culqi" else None,
        "rsa_public_key":      settings.CULQI_RSA_PUBLIC_KEY or None if settings.PAYMENT_GATEWAY == "culqi" else None,

        # Capacidades adicionales del gateway
        "yape_available":      settings.PAYMENT_GATEWAY == "culqi",   # Solo Culqi tiene Yape
        "wallet_available":    settings.PAYMENT_GATEWAY == "culqi",   # Solo Culqi tiene billeteras

        # Modo de operación (F1/F2 — controlado por OperationsPanel)
        "card":                {"mode": "fase2"},
        "barcode":             {"mode": "fase2"},
    }


# ================================================================
# GET /payments/gateways — Lista gateways disponibles
# ================================================================

@router.get("/gateways")
async def list_gateways():
    """Lista los gateways de pago disponibles en el sistema."""
    from app.payments.gateway import payment_gateway_service

    return {
        "gateways": payment_gateway_service.list_gateways(),
        "default":  settings.PAYMENT_GATEWAY,
    }
