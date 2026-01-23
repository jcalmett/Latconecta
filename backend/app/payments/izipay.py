# backend/app/payments/izipay.py

#def parse_izipay_response(payload: dict):
#    """
#    Normaliza la respuesta de Izipay
#    """
#    return {
#        "order_code": payload.get("orderCode"),
#        "success": payload.get("status") == "SUCCESS"
#    }

# backend/app/payments/izipay.py
import requests
import os

IZIPAY_URL = os.getenv("IZIPAY_API_URL")
IZIPAY_USERNAME = os.getenv("IZIPAY_USERNAME")
IZIPAY_PASSWORD = os.getenv("IZIPAY_PASSWORD")

def create_form_token(order_code: str, amount: float):
    payload = {
        "amount": int(amount * 100),  # céntimos
        "currency": "PEN",
        "orderId": order_code,
        "customer": {
            "language": "es"
        },
        "paymentMethods": {
            "order": ["YAPE", "PLIN", "CARD"]
        }
    }

    response = requests.post(
        f"{IZIPAY_URL}/api-payment/V4/Charge/CreatePayment",
        json=payload,
        auth=(IZIPAY_USERNAME, IZIPAY_PASSWORD),
        timeout=10
    )

    response.raise_for_status()
    return response.json()["answer"]["formToken"]
