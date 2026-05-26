# backend/app/payments/gateway.py
"""
Payment Gateway Service - Orquestador Genérico Multi-Gateway

Arquitectura:
  purchases.py → PaymentGatewayService → CulqiAdapter    (PE - activo)
                                        → StripeAdapter   (MX/US - futuro)
                                        → LatamGroup      (MX barcode - futuro)

Para agregar un nuevo país o procesador:
  1. Agregar entrada en COUNTRY_PAYMENT_CONFIG con card_gateway y barcode_gateway
  2. Agregar entrada en PAYMENT_ADAPTER_REGISTRY con el módulo y clase del adaptador
  3. Agregar entrada en BARCODE_ADAPTER_REGISTRY si aplica
  4. Implementar el adaptador correspondiente
  5. Actualizar valid_gateways_by_country en config.py
"""

import logging
from typing import Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)

# ─── TABLA MAESTRA: configuración de procesadores por país ───────────────────
#
# card_gateway:    procesador de tarjeta de crédito activo para este país
# barcode_gateway: procesador de barcode activo para este país (None si no aplica)
#
# Para agregar MX: agregar entrada con sus procesadores cuando estén definidos
# Para agregar US: agregar entrada con stripe y barcode=None
#
COUNTRY_PAYMENT_CONFIG = {
    "PE": {
        "card_gateway":    "culqi",       # Culqi — tarjeta, Yape, billeteras
        "barcode_gateway": "barcodeapi",  # barcodeapi.org
    },
    "MX": {
        "card_gateway":    "stripe",      # Stripe (pendiente integración)
        "barcode_gateway": "latamgroup",  # LatamGroup (pendiente integración)
    },
    "US": {
        "card_gateway":    "stripe",      # Stripe (pendiente integración)
        "barcode_gateway": None,          # No aplica en USA
    },
}

# ─── REGISTRY DE ADAPTADORES DE TARJETA ──────────────────────────────────────
#
# Agregar entrada cuando el adaptador esté implementado.
# El gateway_name debe coincidir con card_gateway en COUNTRY_PAYMENT_CONFIG.
#
PAYMENT_ADAPTER_REGISTRY = {
    "culqi": {
        "module": "app.payments.culqi_adapter",
        "class": "CulqiAdapter",
        "countries": ["PE"],
        "description": "Culqi — Perú (tarjeta, Yape, billeteras, PagoEfectivo)"
    },
    # "stripe": {
    #     "module": "app.payments.stripe_adapter",
    #     "class": "StripeAdapter",
    #     "countries": ["MX", "US"],
    #     "description": "Stripe — México / USA (tarjeta, Apple Pay)"
    # },
    # "latamgroup": {
    #     "module": "app.payments.latamgroup_adapter",
    #     "class": "LatamGroupAdapter",
    #     "countries": ["MX"],
    #     "description": "LatamGroup — México (tarjeta)"
    # },
}

# ─── REGISTRY DE ADAPTADORES DE BARCODE ──────────────────────────────────────
#
# key: barcode_gateway name (debe coincidir con barcode_gateway en COUNTRY_PAYMENT_CONFIG)
#
BARCODE_ADAPTER_REGISTRY = {
    "barcodeapi": {
        "module": "app.barcode.service",
        "class": "PeruBarcodeAdapter",
        "countries": ["PE"],
        "description": "barcodeapi.org — Perú"
    },
    # "latamgroup": {
    #     "module": "app.barcode.latamgroup_adapter",
    #     "class": "LatamGroupBarcodeAdapter",
    #     "countries": ["MX"],
    #     "description": "LatamGroup — México (barcode/OXXO)"
    # },
}


class PaymentGatewayService:
    """
    Servicio genérico que orquesta operaciones de pago
    independientemente del proveedor (Culqi, Conekta, Stripe, etc.)
    """

    def __init__(self):
        self._adapters = {}
        self._active_gateway = getattr(settings, 'PAYMENT_GATEWAY', 'culqi')
        self._deployment_country = getattr(settings, 'DEPLOYMENT_COUNTRY', 'PE')
        self._register_active_adapter()

    def _register_active_adapter(self):
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
        return self._active_gateway

    @property
    def deployment_country(self) -> str:
        return self._deployment_country

    def get_adapter(self, gateway_name: str = None):
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
        name = gateway_name or self._active_gateway
        logger.info(f"🔄 Cancel request via gateway: {name}")

        try:
            adapter = self.get_adapter(name)
            result = await adapter.cancel_transaction(cancel_data)

            if result.get('success'):
                logger.info(f"✅ Cancel successful via {name}: cancel_id={result.get('cancel_id')}")
            else:
                logger.warning(f"⚠️ Cancel failed via {name}: {result.get('message')}")

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
                "success": False, "gateway": name, "cancel_id": None,
                "authorization_code_cancel": None, "message": str(e), "raw_response": {}
            }
        except Exception as e:
            logger.error(f"❌ Cancel exception via {name}: {e}")
            return {
                "success": False, "gateway": name, "cancel_id": None,
                "authorization_code_cancel": None, "message": f"Error: {str(e)}", "raw_response": {}
            }

    def list_gateways(self) -> list:
        return list(self._adapters.keys())

    def get_deployment_info(self) -> dict:
        return {
            "deployment_country": self._deployment_country,
            "active_gateway": self._active_gateway,
            "registered_adapters": list(self._adapters.keys()),
            "available_gateways": list(PAYMENT_ADAPTER_REGISTRY.keys()),
        }


# Instancia global (singleton)
payment_gateway_service = PaymentGatewayService()
