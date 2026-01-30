"""
Barcode Payment Service - Latconecta
Generación de códigos de barras para pagos en efectivo

Este módulo maneja la generación de códigos de barras que los usuarios
pueden pagar en tiendas autorizadas (agentes, bancos, etc.)

Formato: LCAAMMDDHHMMSS99999.99
Ejemplo: LC260124160530000012.00
"""

import os
import json
from typing import Dict, Any
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from urllib.parse import quote
import logging

logger = logging.getLogger(__name__)


class BarcodeService:
    """
    Servicio para métodos de pago alternativos (barcode)
    
    IZIPAY (tarjetas) está en: backend/app/payments/
    """
    
    def __init__(self):
        # ==================== CONFIGURACIÓN ====================
        self.config = {
            'BARCODE': {
                'enabled': True,
                'mode': 'success',  # 'success' | 'error'
                'provider': 'barcodeapi',  # Servicio gratuito para demo
                'format': 'CODE128'
            }
        }
        
        # Intentar cargar desde archivo (opcional)
        self._load_from_file()
        
        logger.info("💳 PaymentGatewayService inicializado")
        self._log_config()
    
    def _load_from_file(self):
        """Cargar configuración desde archivo JSON (opcional)"""
        config_file = Path(__file__).parent.parent / "config" / "payment_config.json"
        
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
        logger.info("CONFIGURACIÓN PAYMENT GATEWAY:")
        for method, cfg in self.config.items():
            status = "✅" if cfg.get('enabled') else "❌"
            mode = cfg.get('mode', 'N/A')
            logger.info(f"  {method:15} → {status} Mode: {mode}")
        logger.info("=" * 60)
    
    # ==================== GENERACIÓN DE BARCODE ====================
    
    def _generate_barcode_code(self, amount: Decimal) -> str:
        """
        Genera código de barcode con formato: LCAAMMDDHHMMSS99999.99
        
        Ejemplo: LC260123160001000012.00
        
        Args:
            amount: Monto del pago
        
        Returns:
            Código de barcode (24 caracteres)
        """
        now = datetime.now()
        
        # Fecha/hora: AAMMDDHHMMSS (12 caracteres)
        date_part = now.strftime("%y%m%d%H%M%S")
        
        # Monto con punto decimal: 99999.99 (10 caracteres)
        # Pad con ceros a la izquierda para longitud fija
        amount_str = f"{float(amount):010.2f}"
        
        # Formato completo: LC + AAMMDDHHMMSS + 99999.99
        barcode_code = f"LC{date_part}{amount_str}"
        
        logger.debug(f"Generated barcode code: {barcode_code}")
        
        return barcode_code
    
    def _generate_barcode_url(self, barcode_code: str) -> str:
        """
        Genera URL de imagen del barcode usando servicio gratuito
        
        Servicio: https://barcodeapi.org (gratuito, sin API key)
        
        Args:
            barcode_code: Código del barcode
        
        Returns:
            URL de imagen PNG del barcode
        """
        provider = self.config['BARCODE'].get('provider', 'barcodeapi')
        barcode_format = self.config['BARCODE'].get('format', 'CODE128')
        
        # Codificar el código para URL (aunque el punto decimal es seguro)
        encoded_code = quote(barcode_code)
        
        if provider == 'barcodeapi':
            # Servicio gratuito - sin autenticación
            url = f"https://barcodeapi.org/api/{barcode_format}/{encoded_code}"
        else:
            # Fallback genérico
            url = f"https://barcode.example.com/{encoded_code}.png"
        
        logger.debug(f"Generated barcode URL: {url}")
        
        return url
    
    def generate_barcode(self, amount: Decimal, reference: str = None) -> Dict[str, Any]:
        """
        Genera código de barras para pago
        
        MODO SUCCESS: Genera código y URL real
        MODO ERROR: Simula fallo en generación
        
        Args:
            amount: Monto del pago
            reference: Referencia del purchase (opcional)
        
        Returns:
            {
                'success': True/False,
                'barcode': 'LC260123160001000012.00',
                'barcode_image': 'https://barcodeapi.org/...',
                'amount': Decimal('12.00'),
                'error_code': 'ERROR_CODE' (si falla),
                'error_message': 'Error...' (si falla)
            }
        """
        config = self.config['BARCODE']
        
        logger.info(f"🏷️ Generating barcode for amount: {amount}")
        
        # MODO ERROR (simulado)
        if config.get('mode') == 'error':
            error_msg = "Error generando código de barras (simulado)"
            logger.error(f"❌ Barcode generation failed (mock): {error_msg}")
            
            return {
                'success': False,
                'barcode': None,
                'barcode_image': None,
                'amount': amount,
                'error_code': 'BARCODE_GENERATION_ERROR',
                'error_message': error_msg,
                'provider': config.get('provider'),
                'timestamp': datetime.now().isoformat()
            }
        
        # MODO SUCCESS (normal)
        try:
            barcode_code = self._generate_barcode_code(amount)
            barcode_image_url = self._generate_barcode_url(barcode_code)
            
            logger.info(f"✅ Barcode generated successfully: {barcode_code}")
            
            return {
                'success': True,
                'barcode': barcode_code,
                'barcode_image': barcode_image_url,
                'amount': amount,
                'error_code': None,
                'error_message': None,
                'provider': config.get('provider'),
                'reference': reference,
                'expiration': None,  # Los barcodes no expiran por ahora
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            error_msg = f"Error inesperado generando barcode: {str(e)}"
            logger.error(f"❌ {error_msg}")
            
            return {
                'success': False,
                'barcode': None,
                'barcode_image': None,
                'amount': amount,
                'error_code': 'UNEXPECTED_ERROR',
                'error_message': error_msg,
                'provider': config.get('provider'),
                'timestamp': datetime.now().isoformat()
            }
    
    # ==================== CONFIGURACIÓN DINÁMICA ====================
    
    def set_barcode_mode(self, mode: str):
        """
        Cambiar modo de barcode en tiempo de ejecución
        
        Args:
            mode: 'success' | 'error'
        
        Example:
            payment_gateway.set_barcode_mode('error')
            # Ahora todos los barcodes fallarán
        """
        if mode in ['success', 'error']:
            self.config['BARCODE']['mode'] = mode
            logger.info(f"🔧 Barcode mode configurado a: {mode}")
            self._log_config()
            return True
        else:
            logger.warning(f"⚠️ Modo inválido: {mode}. Use 'success' o 'error'")
            return False
    
    def get_config(self) -> Dict:
        """Retorna configuración actual"""
        return self.config.copy()


# ==================== INSTANCIA GLOBAL (SINGLETON) ====================

barcode_service = BarcodeService()


# ==================== FUNCIONES HELPER ====================

def generate_barcode(amount: Decimal, reference: str = None) -> Dict[str, Any]:
    """
    Helper function para generar barcode
    Usa la instancia global del servicio
    """
    return barcode_service.generate_barcode(amount, reference)


def set_barcode_mode(mode: str) -> bool:
    """
    Helper function para cambiar modo de barcode
    """
    return barcode_service.set_barcode_mode(mode)