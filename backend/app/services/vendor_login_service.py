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
    - LATCOM (api_key_header — no requiere login)
    - MEGAPUNTO/TISI (bearer — requiere login con userName/password)
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
                'access_token': str or None,
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
            elif vendor_code == 'MEGAPUNTO':
                return await self._login_megapunto(vendor, base_url)
            else:
                # Vendors sin login implementado no necesitan token dinámico
                # (usan auth_type=apikey, basic, o none — no bearer)
                logger.info(
                    f"ℹ️ Vendor {vendor_code} no requiere login "
                    f"(sin implementación bearer — se omite silenciosamente)"
                )
                return {
                    'success': True,
                    'access_token': None,
                    'expires_in': 0
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

        LATCOM usa auth_type=api_key_header — no requiere token dinámico.
        El api_key se envía directamente en los headers de cada request.
        Este método retorna success=True sin hacer llamada HTTP.
        """
        logger.info(
            f"ℹ️ LATCOM usa api_key_header — no requiere login bearer. "
            f"api_key configurado: {bool(vendor.vendor_api_key)}"
        )
        return {
            'success': True,
            'access_token': None,
            'expires_in': 0
        }

    async def _login_megapunto(self, vendor: Vendor, base_url: str) -> Dict:
        """
        Login específico para MEGAPUNTO/TISI

        Endpoint: POST /Auth/token
        Request: {"userName": "...", "password": "..."}
        Response: {"token": "eyJhbGc..."}
        Token vive: 10 minutos (600 segundos)
        Renovación: cada 9 minutos (540 segundos) — margen de 1 minuto
        """
        try:
            # Validar credenciales
            if not all([vendor.vendor_username, vendor.vendor_password]):
                return {
                    'success': False,
                    'error': 'Credenciales incompletas en BD'
                }

            # TISI usa /Auth/token
            # base_url ya termina en '/' (https://api-hub-qa-in.tisi.com.pe/)
            url = f"{base_url}Auth/token"

            payload = {
                "userName": vendor.vendor_username,
                "password": vendor.vendor_password
            }

            headers = {"Content-Type": "application/json"}

            logger.info(f"🔐 Ejecutando login MEGAPUNTO: {url}")
            logger.debug(f"📤 Usuario: {vendor.vendor_username}")

            timeout = httpx.Timeout(vendor.vendor_timeout or 45.0)

            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                response_data = response.json()

                # MEGAPUNTO/TISI retorna: {"token": "eyJhbGc..."}
                access_token = response_data.get('token')

                if not access_token:
                    logger.error(f"❌ Response sin token: {response_data}")
                    return {
                        'success': False,
                        'error': 'Response sin token'
                    }

                logger.info(
                    f"✅ Login exitoso MEGAPUNTO. "
                    f"Token: {access_token[:20]}... "
                    f"(válido 10 min, renueva en 9 min)"
                )

                return {
                    'success': True,
                    'access_token': access_token,
                    'expires_in': 540  # 9 minutos — token vive 10, renovamos antes
                }

        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP {e.response.status_code}"
            try:
                error_detail = e.response.json()
                error_msg = f"{error_msg}: {error_detail}"
            except Exception:
                error_msg = f"{error_msg}: {e.response.text}"
            logger.error(f"❌ Login MEGAPUNTO falló: {error_msg}")
            return {'success': False, 'error': error_msg}

        except httpx.TimeoutException:
            logger.error(f"❌ Timeout en login MEGAPUNTO")
            return {'success': False, 'error': 'Timeout'}

        except Exception as e:
            logger.error(f"❌ Error en login MEGAPUNTO: {e}", exc_info=True)
            return {'success': False, 'error': str(e)}
