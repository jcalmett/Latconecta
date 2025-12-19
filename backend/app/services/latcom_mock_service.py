"""
Servicio MOCK de Latcom para desarrollo
Simula todos los escenarios posibles sin necesidad de acceso real al vendor
"""
import asyncio
import random
from datetime import datetime
from typing import Dict, Optional
from .vendor_interface import VendorInterface


class LatcomMockService(VendorInterface):
    """
    Simulador de Latcom para desarrollo
    
    Permite probar TODOS los escenarios sin acceso real:
    - Compras exitosas
    - Errores de negocio (producto no existe, saldo insuficiente, etc)
    - Errores técnicos (timeout, network error, etc)
    - Latencia configurable
    - Comportamiento aleatorio para stress testing
    """
    
    def __init__(self, config: Dict):
        self.config = config
        self.mock_mode = config.get('mock_mode', 'success')
        self.mock_delay = config.get('mock_delay', 1.0)
        self.access_token = None
        
        # Contador para generar IDs únicos
        self.transaction_counter = 1000
        
        print(f"🎭 [MOCK] Inicializado en modo: {self.mock_mode}")
        print(f"🎭 [MOCK] Delay simulado: {self.mock_delay}s")
    
    async def login(self) -> str:
        """Simular login a Latcom"""
        print("🔵 [MOCK] Simulando login a Latcom...")
        
        # Simular latencia de red
        await asyncio.sleep(0.5)
        
        # Generar token mock
        timestamp = int(datetime.now().timestamp())
        self.access_token = f"mock_token_{timestamp}_abc123xyz"
        
        print(f"✅ [MOCK] Token generado: {self.access_token[:30]}...")
        return self.access_token
    
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
        Simular compra con diferentes escenarios según mock_mode
        """
        print(f"🔵 [MOCK] Simulando compra:")
        print(f"  📱 Teléfono: {phone}")
        print(f"  💰 Monto: {amount} {currency}")
        print(f"  📦 Producto: {product_id}")
        print(f"  🏢 Operador: {operator}")
        
        # Simular latencia de red
        await asyncio.sleep(self.mock_delay)
        
        # Generar IDs únicos
        trans_id = f"LT{self.transaction_counter}"
        ven_trans_id = f"{operator.upper()}{self.transaction_counter}"
        self.transaction_counter += 1
        
        # Comportamiento según mock_mode
        mode = self.mock_mode
        
        if mode == 'success':
            return self._mock_success(
                amount, product_id, currency, service_type,
                trans_id, ven_trans_id
            )
        
        elif mode == 'random':
            # 80% éxito, 10% error negocio, 10% error técnico
            rand = random.random()
            if rand < 0.8:
                return self._mock_success(
                    amount, product_id, currency, service_type,
                    trans_id, ven_trans_id
                )
            elif rand < 0.9:
                return self._mock_business_error()
            else:
                return self._mock_technical_error()
        
        elif mode == 'timeout':
            print("⏱️ [MOCK] Simulando timeout (50s)...")
            await asyncio.sleep(50)
            raise TimeoutError("Mock timeout - Vendor no respondió")
        
        elif mode == 'network_error':
            print("🌐 [MOCK] Simulando error de red...")
            raise ConnectionError("Mock network error - No se pudo conectar")
        
        elif mode == 'product_not_found':
            return self._mock_product_not_found()
        
        elif mode == 'insufficient_balance':
            return self._mock_insufficient_balance()
        
        elif mode == 'invalid_phone':
            return self._mock_invalid_phone()
        
        else:
            # Default: éxito
            return self._mock_success(
                amount, product_id, currency, service_type,
                trans_id, ven_trans_id
            )
    
    def _mock_success(
        self,
        amount: float,
        product_id: str,
        currency: str,
        service_type: int,
        trans_id: str,
        ven_trans_id: str
    ) -> Dict:
        """Simular respuesta exitosa"""
        print("✅ [MOCK] Compra exitosa simulada")
        return {
            'Amount': amount,
            'productId': product_id,
            'currency': currency,
            'service': service_type,
            'trans_id': trans_id,
            'status': 'success',
            'created_at': datetime.now().isoformat() + 'Z',
            'ven_transid': ven_trans_id,
            'response_code': '1',
            'response_message': 'Success'
        }
    
    def _mock_business_error(self) -> Dict:
        """Simular error de negocio aleatorio"""
        errors = [
            ('-120054', 'Product not found'),
            ('-1220027', 'Phone Number Is Not Valid'),
            ('-120008', 'Insufficient balance in vendor account'),
        ]
        code, message = random.choice(errors)
        
        print(f"❌ [MOCK] Error de negocio: {code} - {message}")
        return {
            'Amount': 0,
            'trans_id': None,
            'status': 'failed',
            'created_at': datetime.now().isoformat() + 'Z',
            'ven_transid': None,
            'response_code': code,
            'response_message': message
        }
    
    def _mock_technical_error(self) -> Dict:
        """Simular error técnico del vendor"""
        print("⚠️ [MOCK] Error técnico del vendor simulado")
        return {
            'Amount': 0,
            'trans_id': None,
            'status': 'failed',
            'created_at': datetime.now().isoformat() + 'Z',
            'ven_transid': None,
            'response_code': '-140005',
            'response_message': 'Problem occurred in third party vendor API call'
        }
    
    def _mock_product_not_found(self) -> Dict:
        """Simular producto no encontrado"""
        print("❌ [MOCK] Producto no encontrado")
        return {
            'Amount': 0,
            'trans_id': None,
            'status': 'failed',
            'created_at': datetime.now().isoformat() + 'Z',
            'ven_transid': None,
            'response_code': '-120054',
            'response_message': 'Product not found'
        }
    
    def _mock_insufficient_balance(self) -> Dict:
        """Simular saldo insuficiente"""
        print("💰 [MOCK] Saldo insuficiente en cuenta vendor")
        return {
            'Amount': 0,
            'trans_id': None,
            'status': 'failed',
            'created_at': datetime.now().isoformat() + 'Z',
            'ven_transid': None,
            'response_code': '-120008',
            'response_message': 'Insufficient balance in vendor account'
        }
    
    def _mock_invalid_phone(self) -> Dict:
        """Simular teléfono inválido"""
        print("📱 [MOCK] Número de teléfono inválido")
        return {
            'Amount': 0,
            'trans_id': None,
            'status': 'failed',
            'created_at': datetime.now().isoformat() + 'Z',
            'ven_transid': None,
            'response_code': '-1220027',
            'response_message': 'Phone Number Is Not Valid'
        }
    
    async def get_transaction_status(
        self,
        msisdn: str,
        trans_id: str,
        date: str
    ) -> Dict:
        """Simular consulta de estado de transacción"""
        print(f"🔵 [MOCK] Consultando estado de transacción: {trans_id}")
        
        # Simular latencia
        await asyncio.sleep(0.5)
        
        # Simular que la transacción fue exitosa
        print("✅ [MOCK] Estado: SUCCESS")
        return {
            'msisdn': msisdn,
            'trans_id': trans_id,
            'ven_transid': f'MOCK_{trans_id}',
            'status': 'SUCCESS',
            'created_at': datetime.now().isoformat() + 'Z'
        }
    
    async def get_balance(self) -> Dict:
        """Simular consulta de saldo"""
        print("🔵 [MOCK] Consultando saldo de cuenta vendor")
        
        # Simular latencia
        await asyncio.sleep(0.3)
        
        # Retornar saldos mock
        balances = {
            'wallets': [
                {'currency': 'USD', 'amount': 5000.00},
                {'currency': 'PEN', 'amount': 15000.00},
                {'currency': 'EUR', 'amount': 3000.00},
                {'currency': 'MXN', 'amount': 20000.00}
            ]
        }
        
        print("✅ [MOCK] Saldos obtenidos:")
        for wallet in balances['wallets']:
            print(f"  💰 {wallet['currency']}: {wallet['amount']}")
        
        return balances


# Códigos de respuesta de Latcom (del PDF de documentación)
LATCOM_RESPONSE_CODES = {
    '1': 'SUCCESS',
    '-1220027': 'PHONE_NUMBER_INVALID',
    '-1220007': 'MERCHANT_MONTHLY_LIMIT_EXCEEDED',
    '-1220001': 'DAILY_CASHIN_LIMIT_EXCEEDED',
    '-120008': 'INSUFFICIENT_BALANCE',
    '-120054': 'PRODUCT_NOT_FOUND',
    '-120128': 'DUPLICATE_TRANSACTION',
    '-140005': 'VENDOR_API_ERROR',
    '-150010': 'TOKEN_EXPIRED',
    '-20001': 'INVALID_REQUEST_PACKET',
    '-20002': 'MANDATORY_PARAMETER_MISSING',
    
    # Códigos internos para errores técnicos
    'TIMEOUT': 'VENDOR_TIMEOUT',
    'NETWORK_ERROR': 'CONNECTION_FAILED',
    'CONNECTION_REFUSED': 'VENDOR_UNAVAILABLE',
}
