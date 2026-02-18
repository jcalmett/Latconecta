# backend/app/payments/schemas.py
"""
Schemas para Payment Integration
✅ ACTUALIZADO: Soporte multi-gateway (IZIPAY, Conekta, Stripe futuro)
✅ ACTUALIZADO: Schemas de anulación/cancelación
✅ ACTUALIZADO: Validate response retorna datos para anulación
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any


# ================================================================
# TOKEN - Generación de token de sesión
# ================================================================

class PaymentCreateRequest(BaseModel):
    """Request para generar token de sesión"""
    amount: str          # "15.00" - string con 2 decimales
    currency: str = "PEN"
    order_number: str    # Número de pedido único (5-15 chars)


class PaymentCreateResponse(BaseModel):
    """Response con token de sesión para el frontend"""
    success: bool
    order_number: str
    amount: str
    currency: str
    token: Optional[str] = None           # JWT para authorization en LoadForm
    transaction_id: Optional[str] = None
    merchant_code: Optional[str] = None
    error: Optional[str] = None


# ================================================================
# VALIDATE - Validación de firma después del pago
# ================================================================

class PaymentValidateRequest(BaseModel):
    """
    Request para validar firma después del pago.
    El SDK devuelve payloadHttp y signature en el callbackResponse.
    """
    order_number: str
    payload_http: str    # JSON string del resultado
    signature: str       # Firma HMAC-SHA256 en base64
    transaction_id: str


class PaymentValidateResponse(BaseModel):
    """
    Response de la validación de firma
    ✅ ACTUALIZADO: Incluye datos necesarios para anulación futura
    """
    success: bool
    valid_signature: bool
    order_number: Optional[str] = None
    payment_status: Optional[str] = None  # "Autorizado" / "Denegado"
    message: Optional[str] = None

    # ✅ NUEVO: Datos extraídos del pago para posible anulación
    # Estos datos deben ser guardados por el frontend y enviados
    # en PurchaseCreateRequest para que el backend pueda anular si la provisión falla
    unique_id: Optional[str] = None               # IZIPAY uniqueId
    authorization_code: Optional[str] = None       # Código de autorización del emisor
    transaction_datetime: Optional[str] = None     # Fecha/hora de la transacción
    pay_method: Optional[str] = None               # CARD, YAPE_CODE, PAGO_PUSH
    channel: Optional[str] = None                  # ecommerce, web, etc.
    amount: Optional[str] = None                   # Monto cobrado
    currency: Optional[str] = None                 # Moneda del cobro


# ================================================================
# CANCEL - Anulación de transacción
# ================================================================

class PaymentCancelRequest(BaseModel):
    """
    Request para anular una transacción de pago.
    Soporta múltiples gateways (IZIPAY, Conekta, Stripe).
    """
    # Gateway que procesó el pago original
    gateway: str = "izipay"              # 'izipay', 'conekta', 'stripe'

    # Datos de la transacción original (comunes a todos los gateways)
    transaction_id: str                  # ID de la transacción
    order_number: str                    # Número de orden
    amount: str                          # Monto (ej: "15.00")
    currency: str = "PEN"               # Moneda

    # Datos específicos de IZIPAY (requeridos para gateway='izipay')
    unique_id: Optional[str] = None              # uniqueId del response original
    authorization_code: Optional[str] = None     # Código de autorización
    transaction_datetime: Optional[str] = None   # Fecha/hora de la transacción
    pay_method: Optional[str] = "CARD"           # CARD, YAPE_CODE, PAGO_PUSH
    channel: Optional[str] = "ecommerce"         # Canal

    # Datos específicos de otros gateways (futuro)
    # conekta_charge_id: Optional[str] = None
    # stripe_payment_intent_id: Optional[str] = None


class PaymentCancelResponse(BaseModel):
    """Response de anulación de transacción"""
    success: bool
    gateway: str                                          # Gateway utilizado
    order_number: str
    cancel_id: Optional[str] = None                       # ID de la anulación
    authorization_code_cancel: Optional[str] = None       # Código auth de anulación
    message: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None         # Response crudo del gateway