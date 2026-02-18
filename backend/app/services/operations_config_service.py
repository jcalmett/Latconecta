"""
Operations Config Service - CONTROL CENTRALIZADO
=================================================
Reemplaza mock_api_service.py

Controla cómo opera cada operación del sistema:
- Fase 1: Simulado (success/fail controlado desde panel)
- Fase 2: Real (gateway, api_mapping, función codificada)

TODAS las decisiones de mock vs real se toman aquí.
El frontend consulta este config para saber qué hacer.
El backend consulta este config para saber cómo procesar.

Almacenamiento: En memoria (se resetea al reiniciar backend).
Valores por defecto: Todo en Fase 1 / Success.
"""

import logging
from typing import Dict, Any, Literal, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Tipo de modo
ModeType = Literal['fase1', 'fase2']
ResponseType = Literal['success', 'fail']


class OperationsConfigService:
    """Servicio centralizado de configuración de operaciones"""

    # Las 10 operaciones del sistema
    VALID_OPERATIONS = [
        'val_telefono',
        'val_cuenta',
        'pago_tarjeta',
        'pago_barcode',
        'anulacion_tarjeta',
        'provision_topup',
        'provision_package',
        'provision_smartphone',
        'provision_transfer',
        'provision_billpay',
    ]

    # Etiquetas legibles para el panel
    OPERATION_LABELS = {
        'val_telefono':         'Validación Teléfono',
        'val_cuenta':           'Validación Cuenta',
        'pago_tarjeta':         'Pago con Tarjeta',
        'pago_barcode':         'Pago con Barcode',
        'anulacion_tarjeta':    'Anulación Tarjeta',
        'provision_topup':      'Provisión TopUp',
        'provision_package':    'Provisión Paquete',
        'provision_smartphone': 'Provisión Smartphone',
        'provision_transfer':   'Provisión Transferencia',
        'provision_billpay':    'Provisión Bill Payment',
    }

    # Descripción de qué hace Fase 2 en cada operación
    FASE2_DESCRIPTION = {
        'val_telefono':         'API Mapping / Backend codificado',
        'val_cuenta':           'API Mapping / Backend codificado',
        'pago_tarjeta':         'Gateway real (IZIPAY/Conekta/Stripe)',
        'pago_barcode':         'Gateway real de barcode',
        'anulacion_tarjeta':    'Gateway real (Cancel API)',
        'provision_topup':      'API Mapping (UniversalVendorService)',
        'provision_package':    'API Mapping (UniversalVendorService)',
        'provision_smartphone': 'API Mapping (UniversalVendorService)',
        'provision_transfer':   'API Mapping (UniversalVendorService)',
        'provision_billpay':    'API Mapping (UniversalVendorService)',
    }

    def __init__(self):
        """Inicializa con todo en Fase 1 / Success"""
        self.config: Dict[str, Dict[str, Any]] = {}

        for op in self.VALID_OPERATIONS:
            self.config[op] = {
                'mode': 'fase1',           # 'fase1' | 'fase2'
                'fase1_response': 'success',  # 'success' | 'fail' (solo aplica en fase1)
            }

        # Config adicional para val_cuenta (parámetros de simulación)
        self.config['val_cuenta']['fase1_params'] = {
            'monto_base': 85.50,
            'indicador': 'T',
            'account_holder': 'Juan Pérez (Simulado)',
        }

        logger.info("⚙️ OperationsConfigService inicializado")
        self._log_config()

    # ==================== CONSULTAS ====================

    def get_mode(self, operation: str) -> ModeType:
        """Retorna el modo de una operación: 'fase1' o 'fase2'"""
        if operation not in self.config:
            logger.warning(f"Operación desconocida: {operation}, default fase1")
            return 'fase1'
        return self.config[operation]['mode']

    def get_fase1_response(self, operation: str) -> ResponseType:
        """Retorna la respuesta simulada: 'success' o 'fail'"""
        if operation not in self.config:
            return 'success'
        return self.config[operation]['fase1_response']

    def is_fase1(self, operation: str) -> bool:
        """¿Está en Fase 1 (simulado)?"""
        return self.get_mode(operation) == 'fase1'

    def is_fase2(self, operation: str) -> bool:
        """¿Está en Fase 2 (real)?"""
        return self.get_mode(operation) == 'fase2'

    def should_succeed(self, operation: str) -> bool:
        """En Fase 1, ¿debe responder success? (True/False)"""
        if self.is_fase2(operation):
            return True  # En fase2 no aplica, el resultado lo da el sistema real
        return self.get_fase1_response(operation) == 'success'

    def get_full_config(self) -> Dict[str, Any]:
        """Retorna config completo para el panel del frontend"""
        result = {}
        for op in self.VALID_OPERATIONS:
            cfg = self.config[op]
            result[op] = {
                'mode': cfg['mode'],
                'fase1_response': cfg['fase1_response'],
                'label': self.OPERATION_LABELS.get(op, op),
                'fase2_description': self.FASE2_DESCRIPTION.get(op, ''),
            }
            # Agregar params adicionales si existen
            if 'fase1_params' in cfg:
                result[op]['fase1_params'] = cfg['fase1_params']
        return result

    def get_payment_config(self) -> Dict[str, Any]:
        """
        Config específico de pagos para que el frontend sepa qué mostrar.
        El frontend llama esto al abrir el paso de método de pago.
        """
        card_cfg = self.config['pago_tarjeta']
        barcode_cfg = self.config['pago_barcode']

        return {
            'card': {
                'mode': card_cfg['mode'],
                'fase1_response': card_cfg['fase1_response'],
                'enabled': True,  # Siempre habilitado, el mode decide cómo funciona
            },
            'barcode': {
                'mode': barcode_cfg['mode'],
                'fase1_response': barcode_cfg['fase1_response'],
                'enabled': True,  # Siempre habilitado
            },
        }

    # ==================== MODIFICACIONES ====================

    def set_mode(self, operation: str, mode: ModeType) -> bool:
        """Cambiar modo de una operación"""
        if operation not in self.config:
            logger.warning(f"Operación desconocida: {operation}")
            return False
        if mode not in ('fase1', 'fase2'):
            logger.warning(f"Modo inválido: {mode}")
            return False

        old_mode = self.config[operation]['mode']
        self.config[operation]['mode'] = mode
        logger.info(f"🔧 {operation}: {old_mode} → {mode}")
        return True

    def set_fase1_response(self, operation: str, response: ResponseType) -> bool:
        """Cambiar respuesta simulada de una operación"""
        if operation not in self.config:
            logger.warning(f"Operación desconocida: {operation}")
            return False
        if response not in ('success', 'fail'):
            logger.warning(f"Response inválido: {response}")
            return False

        old_resp = self.config[operation]['fase1_response']
        self.config[operation]['fase1_response'] = response
        logger.info(f"🔧 {operation}: fase1_response {old_resp} → {response}")
        return True

    def set_operation(self, operation: str, mode: ModeType, fase1_response: ResponseType = 'success') -> bool:
        """Cambiar modo Y respuesta de una operación de un solo golpe"""
        if operation not in self.config:
            return False
        self.config[operation]['mode'] = mode
        self.config[operation]['fase1_response'] = fase1_response
        logger.info(f"🔧 {operation}: mode={mode}, fase1_response={fase1_response}")
        return True

    def set_val_cuenta_params(self, monto_base: float = None, indicador: str = None, account_holder: str = None) -> bool:
        """Configurar parámetros específicos de validación de cuenta"""
        params = self.config['val_cuenta'].get('fase1_params', {})
        if monto_base is not None:
            params['monto_base'] = monto_base
        if indicador is not None:
            params['indicador'] = indicador
        if account_holder is not None:
            params['account_holder'] = account_holder
        self.config['val_cuenta']['fase1_params'] = params
        logger.info(f"🔧 val_cuenta params: {params}")
        return True

    # ==================== PRESETS (Escenarios) ====================

    def preset_all_fase1_success(self):
        """Todo en Fase 1 / Success"""
        for op in self.VALID_OPERATIONS:
            self.config[op]['mode'] = 'fase1'
            self.config[op]['fase1_response'] = 'success'
        logger.info("✅ PRESET: Todo Fase 1 / Success")
        self._log_config()

    def preset_all_fase1_fail(self):
        """Todo en Fase 1 / Fail"""
        for op in self.VALID_OPERATIONS:
            self.config[op]['mode'] = 'fase1'
            self.config[op]['fase1_response'] = 'fail'
        logger.info("❌ PRESET: Todo Fase 1 / Fail")
        self._log_config()

    def preset_all_fase2(self):
        """Todo en Fase 2 (real)"""
        for op in self.VALID_OPERATIONS:
            self.config[op]['mode'] = 'fase2'
        logger.info("🚀 PRESET: Todo Fase 2")
        self._log_config()

    def preset_happy_path(self):
        """Escenario: Todo simulado y exitoso"""
        self.preset_all_fase1_success()

    def preset_provision_fail_reversal_ok(self):
        """Escenario: Pago OK, provisión falla, anulación OK"""
        self.preset_all_fase1_success()
        for op in self.VALID_OPERATIONS:
            if op.startswith('provision_'):
                self.config[op]['fase1_response'] = 'fail'
        logger.info("⚠️ PRESET: Provisión falla + Anulación OK")

    def preset_provision_fail_reversal_fail(self):
        """Escenario: Pago OK, provisión falla, anulación falla = CRÍTICO"""
        self.preset_all_fase1_success()
        for op in self.VALID_OPERATIONS:
            if op.startswith('provision_'):
                self.config[op]['fase1_response'] = 'fail'
        self.config['anulacion_tarjeta']['fase1_response'] = 'fail'
        logger.info("🚨 PRESET: Provisión falla + Anulación falla (CRÍTICO)")

    def preset_payment_fail(self):
        """Escenario: Pago rechazado"""
        self.preset_all_fase1_success()
        self.config['pago_tarjeta']['fase1_response'] = 'fail'
        self.config['pago_barcode']['fase1_response'] = 'fail'
        logger.info("💳❌ PRESET: Pago rechazado")

    def preset_bill_payment_partial(self):
        """Escenario: Bill Payment con pago parcial"""
        self.preset_all_fase1_success()
        self.set_val_cuenta_params(monto_base=150.00, indicador='R')
        logger.info("📄 PRESET: Bill Payment parcial")

    def preset_bill_payment_total(self):
        """Escenario: Bill Payment solo total"""
        self.preset_all_fase1_success()
        self.set_val_cuenta_params(monto_base=85.50, indicador='T')
        logger.info("📄 PRESET: Bill Payment total")

    # ==================== SIMULACIÓN ====================

    def simulate_response(self, operation: str, request_data: Dict = None) -> Dict[str, Any]:
        """
        Genera respuesta simulada para una operación en Fase 1.
        
        Este método reemplaza TODOS los métodos individuales de mock_api_service:
        - validate_phone() → simulate_response('val_telefono', {...})
        - validate_account() → simulate_response('val_cuenta', {...})
        - process_card_payment() → simulate_response('pago_tarjeta', {...})
        - generate_barcode() → simulate_response('pago_barcode', {...})
        - reverse_payment() → simulate_response('anulacion_tarjeta', {...})
        - provision_service() → simulate_response('provision_topup', {...})
        """
        request_data = request_data or {}
        should_succeed = self.should_succeed(operation)
        timestamp = datetime.now()

        if operation == 'val_telefono':
            if should_succeed:
                return {
                    'valid': True,
                    'phone_number': request_data.get('phone_number', ''),
                    'carrier': 'SIMULATED_CARRIER',
                    'region': 'Lima'
                }
            else:
                return {
                    'valid': False,
                    'phone_number': request_data.get('phone_number', ''),
                    'error_message': 'Número no válido (simulado)'
                }

        elif operation == 'val_cuenta':
            params = self.config['val_cuenta'].get('fase1_params', {})
            if should_succeed:
                return {
                    'valid': True,
                    'account_number': request_data.get('account_number', ''),
                    'monto_base': params.get('monto_base', 85.50),
                    'indicador': params.get('indicador', 'T'),
                    'account_holder': params.get('account_holder', 'Juan Pérez (Simulado)'),
                    'service_type': 'Luz'
                }
            else:
                return {
                    'valid': False,
                    'account_number': request_data.get('account_number', ''),
                    'error_message': 'Cuenta no encontrada (simulado)'
                }

        elif operation == 'pago_tarjeta':
            if should_succeed:
                return {
                    'success': True,
                    'payment_ref': f"SIM-PAY-{timestamp.strftime('%Y%m%d%H%M%S')}",
                    'amount': request_data.get('amount', 0),
                    'card_last_digits': '0000',
                    'timestamp': timestamp.isoformat(),
                    'auth_code': f"SIM{timestamp.strftime('%H%M%S')}"
                }
            else:
                return {
                    'success': False,
                    'error_code': 'CARD_DECLINED',
                    'error_message': 'Tarjeta rechazada (simulado)',
                    'timestamp': timestamp.isoformat()
                }

        elif operation == 'pago_barcode':
            if should_succeed:
                barcode_number = f"SIM-BC{timestamp.strftime('%Y%m%d%H%M%S')}"
                return {
                    'success': True,
                    'barcode': barcode_number,
                    'barcode_image': f"https://barcode.example.com/{barcode_number}.png",
                    'amount': request_data.get('amount', 0),
                    'expiration': timestamp.isoformat(),
                }
            else:
                return {
                    'success': False,
                    'error_code': 'BARCODE_ERROR',
                    'error_message': 'Error generando código de barras (simulado)'
                }

        elif operation == 'anulacion_tarjeta':
            if should_succeed:
                return {
                    'success': True,
                    'reversal_ref': f"SIM-REV-{timestamp.strftime('%Y%m%d%H%M%S')}",
                    'original_payment_ref': request_data.get('payment_ref', ''),
                    'amount': request_data.get('amount', 0),
                    'timestamp': timestamp.isoformat(),
                }
            else:
                return {
                    'success': False,
                    'original_payment_ref': request_data.get('payment_ref', ''),
                    'error_code': 'REVERSAL_FAILED',
                    'error_message': 'Error en anulación (simulado)',
                    'timestamp': timestamp.isoformat()
                }

        elif operation.startswith('provision_'):
            product_type = operation.replace('provision_', '')
            if should_succeed:
                delivery_status = 'ordered' if product_type == 'smartphone' else 'completed'
                return {
                    'success': True,
                    'provision_ref': f"SIM-PROV-{product_type.upper()}-{timestamp.strftime('%Y%m%d%H%M%S')}",
                    'delivery_status': delivery_status,
                    'timestamp': timestamp.isoformat(),
                    'vendor_reference': f"SIM-VEND-{timestamp.strftime('%H%M%S')}"
                }
            else:
                return {
                    'success': False,
                    'error_code': 'PROVISION_FAILED',
                    'error_message': f'Error en provisión de {product_type} (simulado)',
                    'timestamp': timestamp.isoformat()
                }

        else:
            logger.warning(f"Operación no reconocida para simulación: {operation}")
            return {'success': should_succeed, 'message': f'Simulación genérica de {operation}'}

    # ==================== HELPERS ====================

    def get_provision_operation(self, product_type: str) -> str:
        """Mapea product_type a nombre de operación de provisión"""
        mapping = {
            'topup': 'provision_topup',
            'package': 'provision_package',
            'smartphone': 'provision_smartphone',
            'transfer': 'provision_transfer',
            'bill_payment': 'provision_billpay',
        }
        return mapping.get(product_type, 'provision_topup')

    def _log_config(self):
        """Mostrar configuración actual en logs"""
        logger.info("=" * 65)
        logger.info("CONFIGURACIÓN DE OPERACIONES:")
        logger.info(f"  {'OPERACIÓN':<25} {'MODO':<8} {'FASE1 RESP':<12}")
        logger.info("-" * 65)
        for op in self.VALID_OPERATIONS:
            cfg = self.config[op]
            mode_icon = "🎭" if cfg['mode'] == 'fase1' else "🚀"
            resp_icon = "✅" if cfg['fase1_response'] == 'success' else "❌"
            resp_text = f"{resp_icon} {cfg['fase1_response']}" if cfg['mode'] == 'fase1' else "— (real)"
            logger.info(f"  {mode_icon} {op:<23} {cfg['mode']:<8} {resp_text}")
        logger.info("=" * 65)


# Instancia global (singleton)
ops_config = OperationsConfigService()