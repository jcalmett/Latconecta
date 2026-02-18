# backend/app/payments/izipay_adapter.py
"""
Izipay Adapter - Implementación específica para IZIPAY (Perú)

API de Anulación:
  POST {IZIPAY_API_URL}/cancel/api/Transaction/Cancel
  Headers: Authorization (API Key), transactionId
  Body: merchantCode, order{...}, language

Documentación: https://developers.izipay.pe/api/#/operations/cancel_transaction
"""

import httpx
import logging
from typing import Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class IzipayAdapter:
    """
    Adaptador de pagos para IZIPAY (Perú)
    Implementa operaciones: cancel_transaction
    Futuro: refund_transaction, query_transaction
    """

    def __init__(self):
        self.api_url = settings.IZIPAY_API_URL
        self.merchant_code = settings.IZIPAY_MERCHANT_CODE
        self.api_key = settings.IZIPAY_API_KEY
        self.cancel_path = getattr(settings, 'IZIPAY_CANCEL_PATH', '/cancel/api/Transaction/Cancel')
        self.timeout = 15.0

    async def cancel_transaction(self, cancel_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anula una transacción en IZIPAY

        Args:
            cancel_data: dict con:
                - transaction_id: str (requerido) - ID original de la transacción
                - order_number: str (requerido) - Número de orden original
                - amount: str (requerido) - Monto a anular (ej: "15.00")
                - currency: str (requerido) - PEN o USD
                - unique_id: str (requerido) - uniqueId del response original
                - authorization_code: str (requerido) - Código de autorización original
                - transaction_datetime: str (requerido) - Fecha/hora de la transacción original
                - pay_method: str (default: "CARD")
                - channel: str (default: "ecommerce")

        Returns:
            dict normalizado:
            {
                "success": bool,
                "cancel_id": str | None,
                "authorization_code_cancel": str | None,
                "message": str,
                "raw_response": dict
            }
        """
        # Validar campos requeridos
        required_fields = [
            'transaction_id', 'order_number', 'amount',
            'currency', 'unique_id', 'authorization_code',
            'transaction_datetime'
        ]
        missing = [f for f in required_fields if not cancel_data.get(f)]
        if missing:
            return {
                "success": False,
                "cancel_id": None,
                "authorization_code_cancel": None,
                "message": f"Campos requeridos faltantes: {', '.join(missing)}",
                "raw_response": {}
            }

        # Construir URL
        url = f"{self.api_url}{self.cancel_path}"

        # Headers según documentación IZIPAY
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": self.api_key,
            "transactionId": str(cancel_data['transaction_id']),
        }

        # Body según documentación IZIPAY
        body = {
            "merchantCode": self.merchant_code,
            "order": {
                "orderNumber": cancel_data['order_number'],
                "currency": cancel_data['currency'],
                "amount": cancel_data['amount'],
                "payMethod": cancel_data.get('pay_method', 'CARD'),
                "channel": cancel_data.get('channel', 'ecommerce'),
                "uniqueId": cancel_data['unique_id'],
                "authorizationCode": cancel_data['authorization_code'],
                "transactionDatetime": cancel_data['transaction_datetime'],
            },
            "language": "ESP"
        }

        logger.info(
            f"🔄 IZIPAY Cancel: order={cancel_data['order_number']}, "
            f"amount={cancel_data['amount']} {cancel_data['currency']}, "
            f"uniqueId={cancel_data['unique_id']}"
        )
        logger.debug(f"   URL: {url}")
        logger.debug(f"   Body: {body}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=body, headers=headers)

            data = response.json()

            logger.info(f"📨 IZIPAY Cancel response: status={response.status_code}, code={data.get('code')}")
            logger.debug(f"   Response: {data}")

            # Evaluar respuesta
            if response.status_code == 200 and data.get("code") == "00":
                # Extraer datos de la respuesta exitosa
                result_data = data.get("response", {}).get("result", {})
                order_data = data.get("response", {}).get("order", {})

                cancel_id = result_data.get("uniqueIdCancel", "")
                auth_code_cancel = result_data.get("authorizationCodeCancel", "")

                logger.info(
                    f"✅ IZIPAY Cancel exitoso: "
                    f"uniqueIdCancel={cancel_id}, "
                    f"authCodeCancel={auth_code_cancel}"
                )

                return {
                    "success": True,
                    "cancel_id": cancel_id,
                    "authorization_code_cancel": auth_code_cancel,
                    "message": data.get("message", "OK"),
                    "raw_response": data
                }
            else:
                # Error de IZIPAY
                error_msg = data.get("message", "Unknown error")
                logger.warning(
                    f"⚠️ IZIPAY Cancel rechazado: "
                    f"code={data.get('code')}, message={error_msg}"
                )

                return {
                    "success": False,
                    "cancel_id": None,
                    "authorization_code_cancel": None,
                    "message": f"IZIPAY error: {error_msg} (code: {data.get('code')})",
                    "raw_response": data
                }

        except httpx.TimeoutException:
            logger.error("❌ IZIPAY Cancel timeout")
            return {
                "success": False,
                "cancel_id": None,
                "authorization_code_cancel": None,
                "message": "Timeout al conectar con IZIPAY para anulación",
                "raw_response": {}
            }
        except Exception as e:
            logger.error(f"❌ IZIPAY Cancel exception: {str(e)}")
            return {
                "success": False,
                "cancel_id": None,
                "authorization_code_cancel": None,
                "message": f"Error de conexión con IZIPAY: {str(e)}",
                "raw_response": {}
            }