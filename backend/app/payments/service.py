# backend/app/payments/service.py
import uuid

def create_payment_order(amount: float):
    order_code = str(uuid.uuid4())

    # 🔧 Sandbox: luego aquí va la llamada real a Izipay
    form_token = "SANDBOX_FORM_TOKEN_TEMPORAL"

    return {
        "order_id": None,
        "order_code": order_code,
        "amount": amount,
        "currency": "PEN",
        "formToken": form_token
    }
