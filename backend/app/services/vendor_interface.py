"""
Interfaz base para servicios de vendors
Garantiza que todas las implementaciones (mock y real) tengan la misma firma
"""
from abc import ABC, abstractmethod
from typing import Dict, Optional


class VendorInterface(ABC):
    """
    Interfaz que TODOS los vendors deben implementar
    Asegura compatibilidad entre mock (desarrollo) y real (producción)
    """
    
    @abstractmethod
    async def login(self) -> str:
        """
        Autenticarse con el vendor
        
        Returns:
            str: access_token para usar en requests posteriores
            
        Raises:
            VendorAPIError: Error en autenticación
            VendorTimeoutError: Timeout en login
        """
        pass
    
    @abstractmethod
    async def purchase(
        self,
        phone: str,
        operator: str,
        country: str,
        currency: str,
        amount: float,
        product_id: str,
        sku_id: Optional[str],
        service_type: int
    ) -> Dict:
        """
        Realizar compra/recarga con el vendor
        
        Args:
            phone: Número de teléfono (ej: "51996412019")
            operator: Operador (ej: "bitel")
            country: País (ej: "peru")
            currency: Moneda (ej: "PEN")
            amount: Monto (ej: 20.0)
            product_id: Código del producto en vendor (ej: "BITEL_20_PEN")
            sku_id: SKU del producto (opcional, para bundles)
            service_type: Tipo de servicio (1=bundle, 2=topup)
        
        Returns:
            Dict con estructura:
            {
                'Amount': float,
                'productId': str,
                'currency': str,
                'service': int,
                'trans_id': str,              # ID de transacción del vendor
                'status': str,                # 'success' o 'failed'
                'created_at': str,            # ISO timestamp
                'ven_transid': str,           # ID del proveedor final
                'response_code': str,         # '1' = éxito, otros = error
                'response_message': str       # Mensaje descriptivo
            }
            
        Raises:
            TimeoutError: Si vendor no responde en tiempo límite
            ConnectionError: Si no puede conectar con vendor
            VendorAPIError: Error en API del vendor
        """
        pass
    
    @abstractmethod
    async def get_transaction_status(
        self,
        msisdn: str,
        trans_id: str,
        date: str
    ) -> Dict:
        """
        Consultar estado de una transacción
        
        Args:
            msisdn: Número de teléfono
            trans_id: ID de transacción del vendor
            date: Fecha en formato YYYY-MM-DD
        
        Returns:
            Dict con estructura:
            {
                'msisdn': str,
                'trans_id': str,
                'ven_transid': str,
                'status': str,              # 'SUCCESS' o 'FAIL'
                'created_at': str
            }
        """
        pass
    
    @abstractmethod
    async def get_balance(self) -> Dict:
        """
        Consultar saldo disponible en cuenta del vendor
        
        Returns:
            Dict con estructura:
            {
                'wallets': [
                    {'currency': 'USD', 'amount': 5000.00},
                    {'currency': 'PEN', 'amount': 15000.00},
                    ...
                ]
            }
        """
        pass
