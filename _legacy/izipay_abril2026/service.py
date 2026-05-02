# backend/app/payments/service.py
"""
Payment Service
✅ Genera Token de Sesión (IZIPAY)
✅ NUEVO: Cancela/anula transacciones via PaymentGatewayService
✅ NUEVO: Extrae datos de anulación del payloadHttp
✅ CORREGIDO: Campos reales del payloadHttp de IZIPAY (codeAuth, dateTransaction, timeTransaction)
"""
import httpx
import time
import json
import logging

logger = logging.getLogger(__name__)

from app.config import settings

IZIPAY_API_URL = settings.IZIPAY_API_URL
IZIPAY_TOKEN_ENDPOINT = settings.IZIPAY_TOKEN_ENDPOINT
IZIPAY_MERCHANT_CODE = settings.IZIPAY_MERCHANT_CODE
IZIPAY_API_KEY = settings.IZIPAY_API_KEY


async def generate_session_token(order_number: str, amount: str) -> dict:
    """
    Llama a POST sandbox-api-pw.izipay.pe/security/v1/Token/Generate
    para obtener un JWT (token de sesión) válido por 15 minutos.

    Args:
        order_number: Número de pedido (5-15 chars)
        amount: Monto con 2 decimales como string, ej: "15.00"

    Returns:
        dict con token JWT o error
    """
    transaction_id = f"{int(time.time() * 1000)}"

    url = f"{IZIPAY_API_URL}{IZIPAY_TOKEN_ENDPOINT}"

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "transactionId": transaction_id,
    }

    body = {
        "requestSource": "ECOMMERCE",
        "merchantCode": IZIPAY_MERCHANT_CODE,
        "orderNumber": order_number,
        "publicKey": IZIPAY_API_KEY,
        "amount": amount,
    }

    logger.info(f"🔑 Requesting Izipay session token: order={order_number}, amount={amount}")
    logger.debug(f"   URL: {url}")
    logger.debug(f"   transactionId: {transaction_id}")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=body, headers=headers)

        data = response.json()

        logger.info(f"📨 Izipay response: code={data.get('code')}, message={data.get('message')}")

        if response.status_code == 200 and data.get("code") == "00":
            token = data["response"]["token"]
            logger.info(f"✅ Session token obtained (length={len(token)})")

            return {
                "success": True,
                "token": token,
                "transactionId": transaction_id,
            }
        else:
            logger.error(f"❌ Izipay token error: {data}")
            return {
                "success": False,
                "error": data.get("message", "Unknown error"),
                "code": data.get("code", "XX"),
            }

    except httpx.TimeoutException:
        logger.error("❌ Izipay timeout")
        return {"success": False, "error": "Timeout connecting to Izipay"}

    except Exception as e:
        logger.error(f"❌ Izipay exception: {str(e)}")
        return {"success": False, "error": str(e)}


def extract_cancel_data_from_payload(payload_http: str) -> dict:
    """
    Extrae datos necesarios para anulación del payloadHttp
    que retorna el SDK de IZIPAY después de un pago exitoso.

    ✅ CORREGIDO: Usa los campos reales del payloadHttp de IZIPAY:
    - codeAuth (no authorizationCode)
    - dateTransaction + timeTransaction (no transactionDatetime)

    Estructura real del payloadHttp:
    {
      "code": "00",
      "response": {
        "payMethod": "CARD",
        "order": [
          {
            "payMethodAuthorization": "CARD",
            "codeAuth": "S50646",
            "currency": "PEN",
            "amount": "15.00",
            "orderNumber": "ORD1194031527",
            "stateMessage": "Autorizado",
            "dateTransaction": "20260215",
            "timeTransaction": "172056",
            "uniqueId": "450156100",
            "referenceNumber": "5000000"
          }
        ]
      }
    }

    Args:
        payload_http: JSON string del resultado del pago

    Returns:
        dict con datos extraídos para anulación
    """
    result = {
        "unique_id": None,
        "authorization_code": None,
        "transaction_datetime": None,
        "pay_method": None,
        "channel": None,
        "amount": None,
        "currency": None,
        "order_number": None,
        "reference_number": None,
    }

    try:
        data = json.loads(payload_http)

        orders = data.get("response", {}).get("order", [])
        if orders and len(orders) > 0:
            order = orders[0]

            # uniqueId - viene directo
            result["unique_id"] = order.get("uniqueId")

            # ✅ CORREGIDO: El campo real es "codeAuth", no "authorizationCode"
            # Intentamos ambos por si IZIPAY cambia en producción
            result["authorization_code"] = (
                order.get("codeAuth")
                or order.get("authorizationCode")
            )

            # ✅ CORREGIDO: transactionDatetime no existe en el payload real
            # Hay dateTransaction ("20260215") + timeTransaction ("172056")
            # Construimos el formato que IZIPAY espera para anulación:
            # "2026-02-15 17:20:56.000"
            date_txn = order.get("dateTransaction", "")  # "20260215"
            time_txn = order.get("timeTransaction", "")  # "172056"

            if date_txn and time_txn and len(date_txn) == 8 and len(time_txn) == 6:
                result["transaction_datetime"] = (
                    f"{date_txn[:4]}-{date_txn[4:6]}-{date_txn[6:8]} "
                    f"{time_txn[:2]}:{time_txn[2:4]}:{time_txn[4:6]}.000"
                )
            else:
                # Fallback: intentar campo directo (por si producción lo tiene)
                result["transaction_datetime"] = order.get("transactionDatetime")

            # payMethod - viene del nivel superior del response
            result["pay_method"] = (
                order.get("payMethodAuthorization")
                or data.get("response", {}).get("payMethod")
            )

            # channel - siempre "ecommerce" para Web Core
            result["channel"] = "ecommerce"

            # Monto y moneda
            result["amount"] = order.get("amount")
            result["currency"] = order.get("currency")

            # Número de orden
            result["order_number"] = order.get("orderNumber")

            # Número de referencia del adquirente
            result["reference_number"] = order.get("referenceNumber")

            logger.info(
                f"📋 Cancel data extracted: "
                f"uniqueId={result['unique_id']}, "
                f"codeAuth={result['authorization_code']}, "
                f"datetime={result['transaction_datetime']}, "
                f"payMethod={result['pay_method']}"
            )

    except (json.JSONDecodeError, KeyError, IndexError) as e:
        logger.warning(f"⚠️ Could not extract cancel data from payload: {e}")

    return result


async def cancel_transaction(cancel_data: dict) -> dict:
    """
    Anula una transacción de pago usando el PaymentGatewayService

    Args:
        cancel_data: dict con datos de la transacción a anular
            - gateway: str ('izipay', 'conekta', 'stripe')
            - transaction_id, order_number, amount, currency
            - unique_id, authorization_code, transaction_datetime (para IZIPAY)

    Returns:
        dict con resultado normalizado del gateway
    """
    from app.payments.gateway import payment_gateway_service

    gateway_name = cancel_data.get('gateway', 'izipay')

    logger.info(
        f"🔄 Cancelling transaction: gateway={gateway_name}, "
        f"order={cancel_data.get('order_number')}, "
        f"amount={cancel_data.get('amount')} {cancel_data.get('currency')}"
    )

    result = await payment_gateway_service.cancel_transaction(
        gateway_name=gateway_name,
        cancel_data=cancel_data
    )

    return result