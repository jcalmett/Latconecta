"""
Mock Service para simular APIs externas
Permite configurar respuestas exitosas/fallidas para pruebas

USO:
1. Configurar respuestas en config/mock_config.json
2. O usar variables de entorno
3. O cambiar directamente en este archivo (para pruebas rápidas)
4. O desde el MockControlPanel en el frontend (en tiempo real)

✅ ACTUALIZADO: Agregado ANULACION_GATEWAY para controlar anulación real de pagos
"""

import os
import json
from typing import Dict, Any, Literal
from datetime import datetime
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class MockAPIService:
    """Servicio para simular APIs externas"""

    def __init__(self):
        # ==================== CONFIGURACIÓN DE RESPUESTAS ====================
        # Cambiar estos valores para probar diferentes escenarios

        self.config = {
            # VALIDACIONES
            'VALNRO': {
                'enabled': True,
                'response': 'success',  # 'success' | 'error'
                'delay_ms': 200
            },
            'VALCUENTA': {
                'enabled': True,
                'response': 'success',  # 'success' | 'error'
                'monto_base': 85.50,     # Monto de la deuda
                'indicador': 'T',        # 'T' = Total, 'R' = Parcial permitido
                'delay_ms': 300
            },

            # PAGOS
            'PAGOTARJETA': {
                'enabled': True,
                'response': 'success',  # 'success' | 'error'
                'delay_ms': 500
            },
            'BARCODE': {
                'enabled': True,
                'response': 'success',  # 'success' | 'error'
                'delay_ms': 200
            },

            # PROVISIÓN (por tipo de producto)
            'PROVISION_TOPUP': {
                'enabled': True,
                'response': 'success',  # 'success' | 'error'
                'delay_ms': 800
            },
            'PROVISION_PACKAGE': {
                'enabled': True,
                'response': 'success',
                'delay_ms': 800
            },
            'PROVISION_TRANSFER': {
                'enabled': True,
                'response': 'success',
                'delay_ms': 600
            },
            'PROVISION_BILLPAYMENT': {
                'enabled': True,
                'response': 'success',
                'delay_ms': 900
            },
            'PROVISION_SMARTPHONE': {
                'enabled': True,
                'response': 'success',
                'delay_ms': 1000
            },

            # REVERSIÓN (NIVEL 1 - mock, sin APIs externas)
            'REVERSION': {
                'enabled': True,
                'response': 'success',  # 'success' | 'error'
                'delay_ms': 400
            },

            # ✅ NUEVO: ANULACIÓN VIA GATEWAY (NIVEL 2 - APIs reales)
            # Controla si la anulación real (IZIPAY/Conekta/Stripe) se ejecuta
            # 'success' → llama al gateway real para anular
            # 'error'   → simula fallo de anulación sin llamar al gateway
            'ANULACION_GATEWAY': {
                'enabled': True,
                'response': 'success',  # 'success' | 'error'
                'delay_ms': 500
            },
        }

        # Intentar cargar desde archivo (opcional)
        self._load_from_file()

        # Logs de configuración inicial
        logger.info("🎭 MockAPIService inicializado")
        self._log_config()

    def _load_from_file(self):
        """Cargar configuración desde archivo JSON (opcional)"""
        config_file = Path(__file__).parent.parent / "config" / "mock_config.json"

        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    file_config = json.load(f)
                    self.config.update(file_config)
                    logger.info(f"📄 Configuración cargada desde {config_file}")
            except Exception as e:
                logger.warning(f"No se pudo cargar {config_file}: {e}")

    def _log_config(self):
        """Mostrar configuración actual en logs"""
        logger.info("=" * 60)
        logger.info("CONFIGURACIÓN MOCK APIs:")
        for api, cfg in self.config.items():
            status = "✅" if cfg['response'] == 'success' else "❌"
            logger.info(f"  {api:25} → {status} {cfg['response']}")
        logger.info("=" * 60)

    # ==================== VALIDACIONES ====================

    def validate_phone(self, phone_number: str) -> Dict[str, Any]:
        """
        Simula validación de número telefónico (VALNRO)

        Returns:
            {
                'valid': True/False,
                'phone_number': str,
                'error_message': str (si aplica)
            }
        """
        config = self.config['VALNRO']

        if config['response'] == 'success':
            return {
                'valid': True,
                'phone_number': phone_number,
                'carrier': 'MOCK_CARRIER',
                'region': 'Lima'
            }
        else:
            return {
                'valid': False,
                'phone_number': phone_number,
                'error_message': 'Número no válido (simulado)'
            }

    def validate_account(self, account_number: str) -> Dict[str, Any]:
        """
        Simula validación de cuenta (VALCUENTA)

        Returns:
            {
                'valid': True/False,
                'account_number': str,
                'monto_base': float,
                'indicador': 'T' | 'R',
                'account_holder': str,
                'error_message': str (si aplica)
            }
        """
        config = self.config['VALCUENTA']

        if config['response'] == 'success':
            return {
                'valid': True,
                'account_number': account_number,
                'monto_base': config['monto_base'],
                'indicador': config['indicador'],
                'account_holder': 'Juan Pérez (Mock)',
                'service_type': 'Luz'
            }
        else:
            return {
                'valid': False,
                'account_number': account_number,
                'error_message': 'Cuenta no encontrada (simulado)'
            }

    # ==================== PAGOS ====================

    def process_card_payment(self, amount: float, card_data: Dict = None) -> Dict[str, Any]:
        """
        Simula procesamiento de pago con tarjeta (PAGOTARJETA)

        Returns:
            {
                'success': True/False,
                'payment_ref': str,
                'amount': float,
                'timestamp': str,
                'error_message': str (si aplica)
            }
        """
        config = self.config['PAGOTARJETA']

        if config['response'] == 'success':
            return {
                'success': True,
                'payment_ref': f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'amount': amount,
                'card_last_digits': '4532',
                'timestamp': datetime.now().isoformat(),
                'auth_code': f"AUTH{datetime.now().strftime('%H%M%S')}"
            }
        else:
            return {
                'success': False,
                'error_code': 'CARD_DECLINED',
                'error_message': 'Tarjeta rechazada (simulado)',
                'timestamp': datetime.now().isoformat()
            }

    def generate_barcode(self, amount: float) -> Dict[str, Any]:
        """
        Simula generación de código de barras (BARCODE)

        Returns:
            {
                'success': True/False,
                'barcode': str,
                'barcode_image': str,
                'amount': float,
                'expiration': str,
                'error_message': str (si aplica)
            }
        """
        config = self.config['BARCODE']

        if config['response'] == 'success':
            barcode_number = f"BC{datetime.now().strftime('%Y%m%d%H%M%S')}"
            return {
                'success': True,
                'barcode': barcode_number,
                'barcode_image': f"https://barcode.example.com/{barcode_number}.png",
                'amount': amount,
                'expiration': datetime.now().isoformat(),
                'reference': f"REF-{barcode_number}"
            }
        else:
            return {
                'success': False,
                'error_code': 'BARCODE_ERROR',
                'error_message': 'Error generando código de barras (simulado)'
            }

    # ==================== PROVISIÓN ====================

    def provision_service(
        self,
        product_type: Literal['topup', 'package', 'transfer', 'bill_payment', 'smartphone'],
        provision_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Simula provisión del servicio según el tipo de producto

        Returns:
            {
                'success': True/False,
                'provision_ref': str,
                'delivery_status': str,
                'error_message': str (si aplica)
            }
        """
        # Mapear tipo de producto a configuración
        config_key = f"PROVISION_{product_type.upper()}"
        config = self.config.get(config_key, self.config['PROVISION_TOPUP'])

        if config['response'] == 'success':
            # Delivery status según tipo
            if product_type == 'smartphone':
                delivery_status = 'ordered'
            else:
                delivery_status = 'completed'

            return {
                'success': True,
                'provision_ref': f"PROV-{product_type.upper()}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'delivery_status': delivery_status,
                'timestamp': datetime.now().isoformat(),
                'vendor_reference': f"VEND-{datetime.now().strftime('%H%M%S')}"
            }
        else:
            return {
                'success': False,
                'error_code': 'PROVISION_FAILED',
                'error_message': f'Error en provisión de {product_type} (simulado)',
                'timestamp': datetime.now().isoformat()
            }

    # ==================== REVERSIÓN ====================

    def reverse_payment(self, payment_ref: str, amount: float) -> Dict[str, Any]:
        """
        Simula reversión de pago (REVERSION) - NIVEL 1

        Returns:
            {
                'success': True/False,
                'reversal_ref': str,
                'original_payment_ref': str,
                'amount': float,
                'error_message': str (si aplica)
            }
        """
        config = self.config['REVERSION']

        if config['response'] == 'success':
            return {
                'success': True,
                'reversal_ref': f"REV-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'original_payment_ref': payment_ref,
                'amount': amount,
                'timestamp': datetime.now().isoformat(),
                'status': 'completed'
            }
        else:
            return {
                'success': False,
                'original_payment_ref': payment_ref,
                'error_code': 'REVERSAL_FAILED',
                'error_message': 'Error en reversión (simulado)',
                'timestamp': datetime.now().isoformat()
            }

    # ==================== ✅ NUEVO: ANULACIÓN GATEWAY ====================

    def should_call_real_gateway_cancel(self) -> bool:
        """
        Verifica si se debe llamar al gateway real para anulación.

        Controlado desde el MockControlPanel con ANULACION_GATEWAY:
        - 'success' → SÍ llamar al gateway real (IZIPAY/Conekta/Stripe)
        - 'error'   → NO llamar, simular fallo directo

        Returns:
            True si debe llamar al gateway real
        """
        config = self.config.get('ANULACION_GATEWAY', {})
        return config.get('response') == 'success'

    def simulate_gateway_cancel_failure(self, payment_ref: str, amount: float) -> Dict[str, Any]:
        """
        Simula un fallo de anulación del gateway (cuando ANULACION_GATEWAY='error')

        Returns:
            dict con formato normalizado de fallo
        """
        logger.warning(f"🎭 MOCK: Simulando fallo de anulación gateway para {payment_ref}")
        return {
            'success': False,
            'gateway': 'mock',
            'cancel_id': None,
            'authorization_code_cancel': None,
            'message': 'Anulación fallida (simulado por MockControlPanel)',
            'raw_response': {
                'mock': True,
                'original_payment_ref': payment_ref,
                'amount': amount,
                'timestamp': datetime.now().isoformat()
            }
        }

    # ==================== CONFIGURACIÓN DINÁMICA ====================

    def set_api_response(self, api_name: str, response: Literal['success', 'error']):
        """
        Cambiar respuesta de una API en tiempo de ejecución

        Ejemplo:
            mock_service.set_api_response('PAGOTARJETA', 'error')
            # Ahora todos los pagos fallarán
        """
        if api_name in self.config:
            self.config[api_name]['response'] = response
            logger.info(f"🔧 {api_name} configurado a: {response}")
            return True
        else:
            logger.warning(f"⚠️ API {api_name} no encontrada en configuración")
            return False

    def reset_all_success(self):
        """Configurar todas las APIs para retornar éxito"""
        for api in self.config.keys():
            self.config[api]['response'] = 'success'
        logger.info("✅ Todas las APIs configuradas en SUCCESS")
        self._log_config()

    def reset_all_error(self):
        """Configurar todas las APIs para retornar error"""
        for api in self.config.keys():
            self.config[api]['response'] = 'error'
        logger.warning("❌ Todas las APIs configuradas en ERROR")
        self._log_config()


# Instancia global (singleton)
mock_api_service = MockAPIService()