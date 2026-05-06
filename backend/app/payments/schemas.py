# backend/app/payments/schemas.py
"""
Schemas para Culqi Payment Integration
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any


# ================================================================
# CHARGE - Crear cargo con token del Checkout V4
# ================================================================

class PaymentChargeRequest(BaseModel):
    """Request para crear un cargo usando token del Checkout V4"""
    token_id: str                       # tkn_live_XXX — del Checkout V4
    amount: int                         # en céntimos: S/15.00 = 1500
    currency_code: str = "PEN"
    email: str
    description: str = "Latconecta"
    order_number: str = ""
    installments: int = 0               # 0 = sin cuotas
    capture: bool = True                # True = cobro inmediato


class PaymentChargeResponse(BaseModel):
    """Response del cargo creado"""
    success: bool
    charge_id: Optional[str] = None     # chr_live_XXX
    outcome_type: Optional[str] = None  # 'venta' = aprobado
    amount: Optional[int] = None
    currency_code: Optional[str] = None
    message: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None


# ================================================================
# ORDER - Crear orden para Yape / billeteras / PagoEfectivo
# ================================================================

class PaymentOrderRequest(BaseModel):
    """Request para crear una orden de pago Culqi"""
    amount: int                         # en céntimos
    currency_code: str = "PEN"
    order_number: str                   # referencia única
    description: str = "Latconecta"
    expiration_date: Optional[int] = None  # Unix timestamp (default: +1 hora)
    # Datos del cliente
    first_name: str = "Cliente"
    last_name: str = "Latconecta"
    email: str = "cliente@latconecta.com"
    phone_number: str = "999999999"


class PaymentOrderResponse(BaseModel):
    """Response con el Order ID para el Checkout V4"""
    success: bool
    order_id: Optional[str] = None      # ord_live_XXX — va a settings.order del frontend
    order_number: Optional[str] = None
    message: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None


# ================================================================
# REFUND - Devolución de un cargo
# ================================================================

class PaymentRefundRequest(BaseModel):
    """Request para devolver un cargo"""
    charge_id: str                      # chr_live_XXX
    amount: int                         # en céntimos (puede ser parcial)
    reason: str = "solicitud_comprador" # solicitud_comprador | duplicado | fraude


class PaymentRefundResponse(BaseModel):
    """Response de la devolución"""
    success: bool
    refund_id: Optional[str] = None
    amount: Optional[int] = None
    message: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None


# ================================================================
# CANCEL - Wrapper para compatibilidad con purchases.py
# ================================================================

class PaymentCancelRequest(BaseModel):
    """Request para cancelar/revertir un cargo (wrapper de refund)"""
    gateway: str = "culqi"
    charge_id: str                      # chr_live_XXX
    amount: int                         # en céntimos
    currency: str = "PEN"
    reason: str = "solicitud_comprador"
    # Campos legacy opcionales (ignorados en Culqi, reservados para compatibilidad)
    transaction_id: Optional[str] = None
    order_number: Optional[str] = None


class PaymentCancelResponse(BaseModel):
    """Response de cancelación"""
    success: bool
    gateway: str
    order_number: Optional[str] = None
    cancel_id: Optional[str] = None
    authorization_code_cancel: Optional[str] = None
    message: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None
