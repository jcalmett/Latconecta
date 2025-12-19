"""
Servicio REAL de Latcom
Comunicación con API real de Latcom (UAT o Producción)
"""
import httpx
import json
from datetime import datetime
from typing import Dict, Optional
from .vendor_interface import VendorInterface
from .exceptions import (
    VendorAPIError,
    VendorTimeoutError,
    VendorConnectionError,
    VendorAuthenticationError
)


class LatcomService(VendorInterface):
    """
    Implementación REAL del servicio de Latcom
    Se comunica con el API real de Latcom
    """
    
    def __init__(self, config: Dict):
        self.base_url = config['url']
        self.username = config['username']
        self.password = config['password']
        self.api_key = config['api_key']
        self.user_uid = config['user_uid']
        self.timeout = config.get('timeout', 45)
        self.access_token = None
        
        print(f"🌐 [REAL] Inicializado Latcom Service")
        print(f"🌐 [REAL] URL: {self.base_url}")
        print(f"🌐 [REAL] Usuario: {self.username}")
        print(f"🌐 [REAL] Timeout: {self.timeout}s")
    
    async def login(self) -> str:
        """
        Autenticarse con Latcom REAL
        POST /lgn
        """
        url = f"{self.base_url}/lgn"
        
        payload = {
            "username": self.username,
            "password": self.password,
            "dist_api": self.api_key,
            "user_uid": self.user_uid
        }
        
        print(f"🔵 [REAL] Autenticando con Latcom...")
        print(f"🔵 [REAL] URL: {url}")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.access_token = data.get('accessToken')
                    
                    if not self.access_token:
                        raise VendorAuthenticationError(
                            "No se recibió accessToken en respuesta"
                        )
                    
                    print(f"✅ [REAL] Autenticación exitosa")
                    print(f"✅ [REAL] Token: {self.access_token[:30]}...")
                    return self.access_token
                
                else:
                    error_msg = f"Login failed with status {response.status_code}"
                    print(f"❌ [REAL] {error_msg}")
                    
                    try:
                        error_data = response.json()
                        error_msg = f"{error_msg}: {error_data}"
                    except:
                        pass
                    
                    raise VendorAuthenticationError(error_msg)
        
        except httpx.TimeoutException:
            print("⏱️ [REAL] Timeout en login")
            raise VendorTimeoutError("Login timeout - Latcom no respondió")
        
        except httpx.ConnectError as e:
            print(f"🌐 [REAL] Error de conexión: {e}")
            raise VendorConnectionError(f"No se pudo conectar a Latcom: {e}")
        
        except (VendorAuthenticationError, VendorTimeoutError, VendorConnectionError):
            raise
        
        except Exception as e:
            print(f"❌ [REAL] Error inesperado en login: {e}")
            raise VendorAPIError(f"Error en login: {e}")
    
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
        Realizar compra REAL con Latcom
        POST /tn
        """
        url = f"{self.base_url}/tn"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.access_token}"
        }
        
        payload = {
            "targetMSISDN": phone.replace('+', ''),  # Remover + del número
            "operator": operator,
            "country": country,
            "currency": currency,
            "Amount": amount,
            "productId": product_id,
            "skuID": sku_id or "",
            "service": service_type
        }
        
        print(f"🔵 [REAL] Realizando compra en Latcom:")
        print(f"  📱 Teléfono: {phone}")
        print(f"  💰 Monto: {amount} {currency}")
        print(f"  📦 Producto: {product_id}")
        print(f"  🏢 Operador: {operator}")
        print(f"  🔧 Tipo servicio: {service_type}")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ [REAL] Respuesta recibida de Latcom")
                    print(f"✅ [REAL] Response code: {data.get('response_code')}")
                    print(f"✅ [REAL] Trans ID: {data.get('trans_id')}")
                    return data
                
                else:
                    error_msg = f"Purchase failed with status {response.status_code}"
                    print(f"❌ [REAL] {error_msg}")
                    
                    try:
                        error_data = response.json()
                        error_msg = f"{error_msg}: {error_data}"
                    except:
                        pass
                    
                    raise VendorAPIError(error_msg)
        
        except httpx.TimeoutException:
            print(f"⏱️ [REAL] Timeout esperando respuesta ({self.timeout}s)")
            raise TimeoutError(f"Latcom no respondió en {self.timeout} segundos")
        
        except httpx.ConnectError as e:
            print(f"🌐 [REAL] Error de conexión: {e}")
            raise ConnectionError(f"No se pudo conectar a Latcom: {e}")
        
        except (TimeoutError, ConnectionError):
            raise
        
        except Exception as e:
            print(f"❌ [REAL] Error inesperado: {e}")
            raise VendorAPIError(f"Error en purchase: {e}")
    
    async def get_transaction_status(
        self,
        msisdn: str,
        trans_id: str,
        date: str
    ) -> Dict:
        """
        Consultar estado de transacción REAL
        POST /gts
        
        Args:
            msisdn: Número de teléfono
            trans_id: ID de transacción de Latcom
            date: Fecha en formato YYYY-MM-DD
        """
        url = f"{self.base_url}/gts"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.access_token}"
        }
        
        payload = {
            "msisdn": msisdn.replace('+', ''),
            "trans_id": trans_id,
            "date": date
        }
        
        print(f"🔵 [REAL] Consultando estado de transacción: {trans_id}")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # La respuesta es un array con un elemento
                    if isinstance(data, list) and len(data) > 0:
                        result = data[0]
                        print(f"✅ [REAL] Estado: {result.get('status')}")
                        return result
                    else:
                        print(f"⚠️ [REAL] Respuesta vacía o formato inesperado")
                        return {
                            'msisdn': msisdn,
                            'trans_id': trans_id,
                            'status': 'UNKNOWN'
                        }
                
                else:
                    error_msg = f"Get status failed with status {response.status_code}"
                    print(f"❌ [REAL] {error_msg}")
                    raise VendorAPIError(error_msg)
        
        except httpx.TimeoutException:
            print("⏱️ [REAL] Timeout consultando estado")
            raise VendorTimeoutError("Timeout consultando estado de transacción")
        
        except (VendorTimeoutError, VendorAPIError):
            raise
        
        except Exception as e:
            print(f"❌ [REAL] Error consultando estado: {e}")
            raise VendorAPIError(f"Error en get_transaction_status: {e}")
    
    async def get_balance(self) -> Dict:
        """
        Consultar saldo REAL de cuenta Latcom
        GET /wt
        """
        url = f"{self.base_url}/wt"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.access_token}"
        }
        
        print("🔵 [REAL] Consultando saldo de cuenta Latcom")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    url,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # La respuesta es un array con un objeto que tiene 'wallets'
                    if isinstance(data, list) and len(data) > 0:
                        result = data[0]
                        wallets = result.get('wallets', [])
                        
                        print("✅ [REAL] Saldos obtenidos:")
                        for wallet in wallets:
                            print(f"  💰 {wallet['currency']}: {wallet['amount']}")
                        
                        return {'wallets': wallets}
                    else:
                        print("⚠️ [REAL] Respuesta vacía o formato inesperado")
                        return {'wallets': []}
                
                else:
                    error_msg = f"Get balance failed with status {response.status_code}"
                    print(f"❌ [REAL] {error_msg}")
                    raise VendorAPIError(error_msg)
        
        except httpx.TimeoutException:
            print("⏱️ [REAL] Timeout consultando saldo")
            raise VendorTimeoutError("Timeout consultando saldo")
        
        except (VendorTimeoutError, VendorAPIError):
            raise
        
        except Exception as e:
            print(f"❌ [REAL] Error consultando saldo: {e}")
            raise VendorAPIError(f"Error en get_balance: {e}")
