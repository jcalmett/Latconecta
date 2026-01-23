# backend/app/payments/schemas.py
from pydantic import BaseModel
from decimal import Decimal

class PaymentCreateRequest(BaseModel):
    amount: Decimal
    description: str

class PaymentCreateResponse(BaseModel):
    order_id: int
    order_code: str
    amount: Decimal
    currency: str

class PaymentConfirmRequest(BaseModel):
    order_code: str
    success: bool
