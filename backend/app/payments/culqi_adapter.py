# backend/app/payments/culqi_adapter.py
"""
Culqi Adapter - Implementación específica para Culqi (Perú)

Soporta:
  - Cargo único con token del Checkout V4
  - Creación de Order (para Yape y billeteras)
  - Devolución (refund) parcial o total

Documentación: https://apidocs.culqi.com
SDK: culqi-python-oficial (culqi2.client.Culqi)
"""

import logging
from typing import Dict, Any, Optional

from app.config import settings

logger = logging.getLogger(__name__)


class CulqiAdapter:
    """
    Adaptador de pagos para Culqi (Perú).
    Implementa: create_charge, create_order, create_refund, cancel_transaction.
    """

    def __init__(self):
        from culqi.client import Culqi
        self.public_key = settings.CULQI_PUBLIC_KEY
        self.secret_key = settings.CULQI_SECRET_KEY
        self.rsa_id = settings.CULQI_RSA_ID
        self.rsa_public_key = settings.CULQI_RSA_PUBLIC_KEY
        self.client = Culqi(self.public_key, self.secret_key)
        logger.info(f"✅ CulqiAdapter inicializado — pk={self.public_key[:20]}...")

    def _get_rsa_options(self) -> dict:
        """Retorna opciones RSA si están configuradas, dict vacío si no."""
        if self.rsa_id and self.rsa_public_key:
            return {
                "rsa_id": self.rsa_id,
                "rsa_public_key": self.rsa_public_key,
            }
        return {}

    async def create_charge(self, charge_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un cargo en Culqi usando el token generado por el Checkout V4.

        Args:
            charge_data: dict con:
                - token_id: str (requerido) — token del Checkout V4 (tkn_live_XXX)
                - amount: int (requerido) — monto en céntimos (S/15.00 = 1500)
                - currency_code: str — 'PEN' (default)
                - email: str (requerido)
                - description: str
                - order_number: str — referencia interna
                - installments: int — cuotas (0 = sin cuotas)
                - capture: bool — True = cobro inmediato

        Returns:
            dict normalizado:
            {
                "success": bool,
                "charge_id": str | None,
                "outcome_type": str | None,   # 'venta' = aprobado
                "amount": int | None,
                "currency_code": str | None,
                "message": str,
                "raw_response": dict
            }
        """
        required = ['token_id', 'amount', 'email']
        missing = [f for f in required if not charge_data.get(f)]
        if missing:
            return {
                "success": False,
                "charge_id": None,
                "outcome_type": None,
                "amount": None,
                "currency_code": None,
                "message": f"Campos requeridos faltantes: {', '.join(missing)}",
                "raw_response": {}
            }

        body = {
            "amount":        charge_data['amount'],
            "currency_code": charge_data.get('currency_code', 'PEN'),
            "email":         charge_data['email'],
            "source_id":     charge_data['token_id'],
            "capture":       charge_data.get('capture', True),
            "installments":  charge_data.get('installments', 0),
            "description":   charge_data.get('description', 'Latconecta'),
            "metadata": {
                "order_number": charge_data.get('order_number', ''),
            },
        }

        logger.info(
            f"🔄 Culqi Charge: amount={body['amount']} {body['currency_code']}, "
            f"token={charge_data['token_id'][:20]}..."
        )
        logger.info(f"📦 Charge body: {body}")

        try:
            options = self._get_rsa_options()
            if options:
                result = self.client.charge.create(data=body, **options)
            else:
                result = self.client.charge.create(data=body)

            logger.debug(f"   Culqi response: {result}")

            status_code = result.get('status', 0)
            data = result.get('data', {})

            # Culqi retorna status 201 para cargo exitoso
            if status_code == 201 and data.get('object') == 'charge':
                outcome = data.get('outcome', {})
                charge_id = data.get('id', '')
                outcome_type = outcome.get('type', '')

                logger.info(
                    f"✅ Culqi Charge exitoso: id={charge_id}, "
                    f"outcome={outcome_type}"
                )

                return {
                    "success": True,
                    "charge_id": charge_id,
                    "outcome_type": outcome_type,
                    "amount": data.get('amount'),
                    "currency_code": data.get('currency_code'),
                    "message": outcome.get('user_message', 'Cargo exitoso'),
                    "raw_response": data
                }
            else:
                error_msg = data.get('user_message') or data.get('merchant_message') or 'Error procesando cargo'
                logger.warning(f"⚠️ Culqi Charge rechazado: {error_msg}")
                return {
                    "success": False,
                    "charge_id": None,
                    "outcome_type": None,
                    "amount": None,
                    "currency_code": None,
                    "message": error_msg,
                    "raw_response": data
                }

        except Exception as e:
            logger.error(f"❌ Culqi Charge exception: {str(e)}")
            return {
                "success": False,
                "charge_id": None,
                "outcome_type": None,
                "amount": None,
                "currency_code": None,
                "message": f"Error de conexión con Culqi: {str(e)}",
                "raw_response": {}
            }

    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea una orden de pago en Culqi.
        Necesaria para habilitar Yape, billeteras y PagoEfectivo en el Checkout V4.

        Args:
            order_data: dict con:
                - amount: int (requerido) — monto en céntimos
                - currency_code: str — 'PEN'
                - order_number: str (requerido) — referencia única
                - description: str
                - expiration_date: int — Unix timestamp (default: +1 hora)
                - first_name: str
                - last_name: str
                - email: str
                - phone_number: str

        Returns:
            dict normalizado:
            {
                "success": bool,
                "order_id": str | None,   # ord_live_XXX — va al settings.order del frontend
                "order_number": str | None,
                "message": str,
                "raw_response": dict
            }
        """
        required = ['amount', 'order_number']
        missing = [f for f in required if not order_data.get(f)]
        if missing:
            return {
                "success": False,
                "order_id": None,
                "order_number": None,
                "message": f"Campos requeridos faltantes: {', '.join(missing)}",
                "raw_response": {}
            }

        import time
        expiration = order_data.get('expiration_date') or int(time.time()) + 3600

        body = {
            "amount":        order_data['amount'],
            "currency_code": order_data.get('currency_code', 'PEN'),
            "description":   order_data.get('description', 'Latconecta'),
            "order_number":  order_data['order_number'],
            "client_details": {
                "first_name":   order_data.get('first_name', 'Cliente'),
                "last_name":    order_data.get('last_name', 'Latconecta'),
                "email":        order_data.get('email', 'cliente@latconecta.com'),
                "phone_number": order_data.get('phone_number', '999999999'),
            },
            "expiration_date": expiration,
        }

        logger.info(
            f"🔄 Culqi Order: amount={body['amount']} {body['currency_code']}, "
            f"order_number={order_data['order_number']}"
        )

        try:
            result = self.client.order.create(data=body)
            logger.debug(f"   Culqi order response: {result}")

            status_code = result.get('status', 0)
            data = result.get('data', {})

            if status_code == 201 and data.get('object') == 'order':
                order_id = data.get('id', '')
                logger.info(f"✅ Culqi Order creada: id={order_id}")
                return {
                    "success": True,
                    "order_id": order_id,
                    "order_number": order_data['order_number'],
                    "message": "Orden creada exitosamente",
                    "raw_response": data
                }
            else:
                error_msg = data.get('user_message') or data.get('merchant_message') or 'Error creando orden'
                logger.warning(f"⚠️ Culqi Order rechazada: {error_msg}")
                return {
                    "success": False,
                    "order_id": None,
                    "order_number": None,
                    "message": error_msg,
                    "raw_response": data
                }

        except Exception as e:
            logger.error(f"❌ Culqi Order exception: {str(e)}")
            return {
                "success": False,
                "order_id": None,
                "order_number": None,
                "message": f"Error de conexión con Culqi: {str(e)}",
                "raw_response": {}
            }

    async def create_refund(self, refund_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea una devolución (refund) en Culqi.

        Args:
            refund_data: dict con:
                - charge_id: str (requerido) — ID del cargo (chr_live_XXX)
                - amount: int (requerido) — monto en céntimos (puede ser parcial)
                - reason: str — 'solicitud_comprador' | 'duplicado' | 'fraude'

        Returns:
            dict normalizado:
            {
                "success": bool,
                "refund_id": str | None,
                "amount": int | None,
                "message": str,
                "raw_response": dict
            }
        """
        required = ['charge_id', 'amount']
        missing = [f for f in required if not refund_data.get(f)]
        if missing:
            return {
                "success": False,
                "refund_id": None,
                "amount": None,
                "message": f"Campos requeridos faltantes: {', '.join(missing)}",
                "raw_response": {}
            }

        body = {
            "amount":    refund_data['amount'],
            "charge_id": refund_data['charge_id'],
            "reason":    refund_data.get('reason', 'solicitud_comprador'),
        }

        logger.info(
            f"🔄 Culqi Refund: charge_id={refund_data['charge_id']}, "
            f"amount={refund_data['amount']}"
        )

        try:
            result = self.client.refund.create(data=body)
            logger.debug(f"   Culqi refund response: {result}")

            status_code = result.get('status', 0)
            data = result.get('data', {})

            if status_code == 201 and data.get('object') == 'refund':
                refund_id = data.get('id', '')
                logger.info(f"✅ Culqi Refund exitoso: id={refund_id}")
                return {
                    "success": True,
                    "refund_id": refund_id,
                    "amount": data.get('amount'),
                    "message": "Devolución exitosa",
                    "raw_response": data
                }
            else:
                error_msg = data.get('user_message') or data.get('merchant_message') or 'Error procesando devolución'
                logger.warning(f"⚠️ Culqi Refund rechazado: {error_msg}")
                return {
                    "success": False,
                    "refund_id": None,
                    "amount": None,
                    "message": error_msg,
                    "raw_response": data
                }

        except Exception as e:
            logger.error(f"❌ Culqi Refund exception: {str(e)}")
            return {
                "success": False,
                "refund_id": None,
                "amount": None,
                "message": f"Error de conexión con Culqi: {str(e)}",
                "raw_response": {}
            }

    async def cancel_transaction(self, cancel_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wrapper de cancel_transaction para compatibilidad con PaymentGatewayService.
        En Culqi una cancelación es un refund total.

        Args:
            cancel_data: dict con:
                - charge_id: str (requerido)
                - amount: int (requerido) — monto en céntimos
                - reason: str

        Returns:
            dict normalizado compatible con PaymentGatewayService:
            {
                "success": bool,
                "cancel_id": str | None,
                "authorization_code_cancel": str | None,
                "message": str,
                "raw_response": dict
            }
        """
        refund_data = {
            "charge_id": cancel_data.get('charge_id'),
            "amount":    cancel_data.get('amount'),
            "reason":    cancel_data.get('reason', 'solicitud_comprador'),
        }

        result = await self.create_refund(refund_data)

        return {
            "success": result["success"],
            "cancel_id": result.get("refund_id"),
            "authorization_code_cancel": result.get("refund_id"),
            "message": result["message"],
            "raw_response": result.get("raw_response", {})
        }
