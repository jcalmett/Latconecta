"""
Vendor Login Service
Ejecuta login específico para cada vendor
"""
import httpx
import logging
from typing import Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vendor import Vendor

logger = logging.getLogger(__name__)


class VendorLoginService:
    """
    Servicio para ejecutar login en vendors externos
    
    Soporta:
    - LATCOM (mitopup.com)
    - Extensible para otros vendors
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def execute_login(self, vendor: Vendor) -> Dict:
        """
        Ejecuta login según el vendor
        
        Args:
            vendor: Modelo Vendor con credenciales
            
        Returns:
            {
                'success': bool,
                'access_token': str,
                'expires_in': int (segundos),
                'error': str (si falla)
            }
        """
        vendor_code = vendor.vendor_code
        
        try:
            # Determinar URL según ambiente
            base_url = vendor.vendor_url_prod if vendor.is_production else vendor.vendor_url_uat
            
            if not base_url:
                return {
                    'success': False,
                    'error': f'URL no configurada para {vendor_code}'
                }
            
            # Ejecutar login según vendor
            if vendor_code == 'LATCOM':
                return await self._login_latcom(vendor, base_url)
            else:
                logger.warning(f"⚠️ Login no implementado para vendor: {vendor_code}")
                return {
                    'success': False,
                    'error': f'Login no implementado para {vendor_code}'
                }
                
        except Exception as e:
            logger.error(f"❌ Error en execute_login para {vendor_code}: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _login_latcom(self, vendor: Vendor, base_url: str) -> Dict:
        """
        Login específico para LATCOM
        
        Endpoint: POST /lgn
        Request: username, password, dist_api, user_uid
        Response: accessToken
        """
        try:
            # Validar credenciales
            if not all([
                vendor.vendor_username,
                vendor.vendor_password,
                vendor.vendor_api_key,
                vendor.vendor_user_uid
            ]):
                return {
                    'success': False,
                    'error': 'Credenciales incompletas en BD'
                }
            
            # Preparar request
            url = f"{base_url}/lgn"
            
            payload = {
                "username": vendor.vendor_username,
                "password": vendor.vendor_password,
                "dist_api": vendor.vendor_api_key,
                "user_uid": vendor.vendor_user_uid
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            logger.info(f"🔐 Ejecutando login LATCOM: {url}")
            logger.debug(f"📤 Username: {vendor.vendor_username}")
            
            # Ejecutar llamada HTTP
            timeout = httpx.Timeout(vendor.vendor_timeout or 45.0)
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers
                )
                
                response.raise_for_status()
                
                response_data = response.json()
                
                # LATCOM retorna: {"accessToken": "eyJhbGc..."}
                access_token = response_data.get('accessToken') or response_data.get('access_token')
                
                if not access_token:
                    logger.error(f"❌ Response sin accessToken: {response_data}")
                    return {
                        'success': False,
                        'error': 'Response sin accessToken'
                    }
                
                logger.info(f"✅ Login exitoso LATCOM. Token: {access_token[:20]}...")
                
                return {
                    'success': True,
                    'access_token': access_token,
                    'expires_in': 3000  # 50 minutos (LATCOM da 1 hora)
                }
                
        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP {e.response.status_code}"
            try:
                error_detail = e.response.json()
                error_msg = f"{error_msg}: {error_detail}"
            except:
                error_msg = f"{error_msg}: {e.response.text}"
            
            logger.error(f"❌ Login LATCOM falló: {error_msg}")
            return {
                'success': False,
                'error': error_msg
            }
            
        except httpx.TimeoutException:
            logger.error(f"❌ Timeout en login LATCOM ({vendor.vendor_timeout}s)")
            return {
                'success': False,
                'error': 'Timeout'
            }
            
        except Exception as e:
            logger.error(f"❌ Error en login LATCOM: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }