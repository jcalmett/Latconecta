"""
Factory Pattern para crear instancia correcta de vendor (mock o real)
"""
from typing import Dict
from .vendor_interface import VendorInterface
from .latcom_service import LatcomService
from .latcom_mock_service import LatcomMockService


class VendorFactory:
    """
    Factory para crear instancia correcta de vendor service
    Selecciona entre mock (desarrollo) y real (producción) basado en configuración
    """
    
    @staticmethod
    def create_latcom_service(config: Dict) -> VendorInterface:
        """
        Crear servicio de Latcom (mock o real)
        
        Args:
            config: Diccionario con configuración:
                {
                    'mode': 'mock' | 'real',
                    'url': 'https://...',
                    'username': '...',
                    'password': '...',
                    'api_key': '...',
                    'user_uid': '...',
                    'timeout': 45,
                    
                    # Solo para mock:
                    'mock_mode': 'success' | 'random' | 'timeout' | ...,
                    'mock_delay': 1.0
                }
        
        Returns:
            VendorInterface: Instancia de LatcomMockService o LatcomService
        
        Example:
            # Desarrollo
            config = {'mode': 'mock', 'mock_mode': 'success'}
            service = VendorFactory.create_latcom_service(config)
            
            # Producción
            config = {
                'mode': 'real',
                'url': 'https://prolat.mitopup.com',
                'username': 'user',
                ...
            }
            service = VendorFactory.create_latcom_service(config)
        """
        mode = config.get('mode', 'mock')
        
        if mode == 'mock':
            print("═══════════════════════════════════════")
            print("🎭 USANDO LATCOM MOCK (Desarrollo)")
            print("═══════════════════════════════════════")
            return LatcomMockService(config)
        
        elif mode == 'real':
            print("═══════════════════════════════════════")
            print("🌐 USANDO LATCOM REAL (Producción)")
            print("═══════════════════════════════════════")
            return LatcomService(config)
        
        else:
            raise ValueError(
                f"Modo inválido: {mode}. Opciones: 'mock' o 'real'"
            )
    
    @staticmethod
    def get_available_mock_modes() -> list:
        """
        Obtener lista de modos disponibles para mock
        
        Returns:
            list: Modos disponibles
        """
        return [
            'success',              # Siempre exitoso
            'random',               # Aleatorio (80% éxito, 20% errores)
            'timeout',              # Timeout
            'network_error',        # Error de red
            'product_not_found',    # Producto no encontrado
            'insufficient_balance', # Saldo insuficiente
            'invalid_phone'         # Teléfono inválido
        ]
