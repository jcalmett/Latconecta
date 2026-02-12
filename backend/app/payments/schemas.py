# backend/app/payments/schemas.py
"""
Schemas para Izipay Payment Integration (Nuevo SDK)
"""
from pydantic import BaseModel
from typing import Optional


class PaymentCreateRequest(BaseModel):
    """Request para generar token de sesión Izipay"""
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
    """Response de la validación de firma"""
    success: bool
    valid_signature: bool
    order_number: Optional[str] = None
    payment_status: Optional[str] = None  # "Autorizado" / "Denegado"
    message: Optional[str] = None
