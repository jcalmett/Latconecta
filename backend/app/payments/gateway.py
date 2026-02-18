# backend/app/payments/gateway.py
"""
Payment Gateway Service - Orquestador Genérico Multi-Gateway

Determina qué adaptador de pagos usar según PAYMENT_GATEWAY en .env,
que a su vez depende de DEPLOYMENT_COUNTRY (país de instalación).

Arquitectura:
  purchases.py → PaymentGatewayService → IzipayAdapter  (PE - actual)
                                        → ConektaAdapter (MX - futuro)
                                        → StripeAdapter  (US - futuro)

  purchases.py → BarcodeGatewayService → PeruBarcodeAdapter  (PE - actual)
                                        → OxxoBarcodeAdapter  (MX - futuro)
                                        → USBarcodeAdapter    (US - futuro)

Mapeo país → gateway:
  PE → izipay   (tarjeta, Yape, Plin)   + barcode (barcodeapi.org)
  MX → conekta  (tarjeta, OXXO, SPEI)   + barcode (por definir)
  US → stripe   (tarjeta, Apple Pay)     + barcode (por definir)

En purchases.py las llamadas son SIEMPRE genéricas:
  result = await payment_gateway.cancel(data)     # nunca "if izipay..."
  barcode = await barcode_gateway.generate(data)   # nunca "if peru..."
"""

import logging
from typing import Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)

# =========================================================================
# REGISTRY: Mapeo de gateway_name → clase adaptador
# Al agregar un nuevo país/gateway, solo se agrega aquí
# =========================================================================
PAYMENT_ADAPTER_REGISTRY = {
    "izipay": {
        "module": "app.payments.izipay_adapter",
        "class": "IzipayAdapter",
        "country": "PE",
        "description": "IZIPAY - Perú (tarjeta, Yape, Plin)"
    },
    # "conekta": {
    #     "module": "app.payments.conekta_adapter",
    #     "class": "ConektaAdapter",
    #     "country": "MX",
    #     "description": "Conekta - México (tarjeta, OXXO, SPEI)"
    # },
    # "stripe": {
    #     "module": "app.payments.stripe_adapter",
    #     "class": "StripeAdapter",
    #     "country": "US",
    #     "description": "Stripe - USA (tarjeta, Apple Pay)"
    # },
}

BARCODE_ADAPTER_REGISTRY = {
    "PE": {
        "module": "app.barcode.service",
        "class": "PeruBarcodeAdapter",
        "description": "Barcode Perú (barcodeapi.org, formato LCAAMMDDHHMMSS)"
    },
    # "MX": {
    #     "module": "app.barcode.oxxo_adapter",
    #     "class": "OxxoBarcodeAdapter",
    #     "description": "OXXO Pay México (referencia de pago)"
    # },
    # "US": {
    #     "module": "app.barcode.us_adapter",
    #     "class": "USBarcodeAdapter",
    #     "description": "US Barcode (por definir)"
    # },
}


class PaymentGatewayService:
    """
    Servicio genérico que orquesta operaciones de pago
    independientemente del proveedor (IZIPAY, Conekta, Stripe, etc.)

    Solo activa el adaptador configurado en PAYMENT_GATEWAY (.env).
    """

    def __init__(self):
        self._adapters = {}
        self._active_gateway = getattr(settings, 'PAYMENT_GATEWAY', 'izipay')
        self._deployment_country = getattr(settings, 'DEPLOYMENT_COUNTRY', 'PE')
        self._register_active_adapter()

    def _register_active_adapter(self):
        """
        Registra SOLO el adaptador configurado en PAYMENT_GATEWAY.
        No carga adaptadores innecesarios.
        """
        gateway_name = self._active_gateway

        if gateway_name not in PAYMENT_ADAPTER_REGISTRY:
            logger.error(
                f"❌ PAYMENT_GATEWAY='{gateway_name}' no existe en registry. "
                f"Opciones: {list(PAYMENT_ADAPTER_REGISTRY.keys())}"
            )
            return

        entry = PAYMENT_ADAPTER_REGISTRY[gateway_name]

        try:
            import importlib
            module = importlib.import_module(entry["module"])
            adapter_class = getattr(module, entry["class"])
            self._adapters[gateway_name] = adapter_class()

            logger.info(
                f"✅ Payment adapter registrado: {gateway_name} "
                f"({entry['description']}) "
                f"[DEPLOYMENT_COUNTRY={self._deployment_country}]"
            )
        except Exception as e:
            logger.error(f"❌ Error registrando {gateway_name}: {e}")

    @property
    def active_gateway(self) -> str:
        """Gateway activo según configuración"""
        return self._active_gateway

    @property
    def deployment_country(self) -> str:
        """País de instalación"""
        return self._deployment_country

    def get_adapter(self, gateway_name: str = None):
        """
        Obtiene el adaptador de pagos.

        Args:
            gateway_name: Nombre del gateway. Si es None, usa el activo.

        Returns:
            Instancia del adaptador

        Raises:
            ValueError si el gateway no está registrado
        """
        name = gateway_name or self._active_gateway
        adapter = self._adapters.get(name)

        if not adapter:
            available = list(self._adapters.keys())
            raise ValueError(
                f"Gateway '{name}' no registrado. "
                f"Disponibles: {available}. "
                f"PAYMENT_GATEWAY={self._active_gateway}"
            )
        return adapter

    async def cancel_transaction(
        self,
        cancel_data: Dict[str, Any],
        gateway_name: str = None
    ) -> Dict[str, Any]:
        """
        Anular/cancelar una transacción de pago.

        Args:
            cancel_data: Datos necesarios para la anulación.
                Cada adaptador define qué campos necesita.
            gateway_name: Gateway específico. Si es None, usa el activo.

        Returns:
            dict normalizado:
            {
                "success": bool,
                "gateway": str,
                "cancel_id": str | None,
                "authorization_code_cancel": str | None,
                "message": str,
                "raw_response": dict
            }
        """
        name = gateway_name or self._active_gateway
        logger.info(f"🔄 Cancel request via gateway: {name}")

        try:
            adapter = self.get_adapter(name)
            result = await adapter.cancel_transaction(cancel_data)

            if result.get('success'):
                logger.info(
                    f"✅ Cancel successful via {name}: "
                    f"cancel_id={result.get('cancel_id')}"
                )
            else:
                logger.warning(
                    f"⚠️ Cancel failed via {name}: "
                    f"{result.get('message')}"
                )

            return {
                "success": result.get("success", False),
                "gateway": name,
                "cancel_id": result.get("cancel_id"),
                "authorization_code_cancel": result.get("authorization_code_cancel"),
                "message": result.get("message", ""),
                "raw_response": result.get("raw_response", {})
            }

        except ValueError as e:
            logger.error(f"❌ Gateway error: {e}")
            return {
                "success": False,
                "gateway": name,
                "cancel_id": None,
                "authorization_code_cancel": None,
                "message": str(e),
                "raw_response": {}
            }
        except Exception as e:
            logger.error(f"❌ Cancel exception via {name}: {e}")
            return {
                "success": False,
                "gateway": name,
                "cancel_id": None,
                "authorization_code_cancel": None,
                "message": f"Error: {str(e)}",
                "raw_response": {}
            }

    def list_gateways(self) -> list:
        """Lista los gateways registrados (activos)"""
        return list(self._adapters.keys())

    def get_deployment_info(self) -> dict:
        """Información del deployment actual"""
        return {
            "deployment_country": self._deployment_country,
            "active_gateway": self._active_gateway,
            "registered_adapters": list(self._adapters.keys()),
            "available_gateways": list(PAYMENT_ADAPTER_REGISTRY.keys()),
            "available_barcode": list(BARCODE_ADAPTER_REGISTRY.keys()),
        }


# Instancia global (singleton)
payment_gateway_service = PaymentGatewayService()