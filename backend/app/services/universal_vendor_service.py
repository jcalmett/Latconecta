# ========================================
# UNIVERSAL VENDOR INTEGRATION SERVICE
# Integración con cualquier vendor sin código nuevo
# ✅ ACTUALIZADO CON api_group_code
# ✅ ACTUALIZADO CON vendor simulator support (Fase 2)
# ✅ ACTUALIZADO CON extra_headers en api_key_header (LATCOM)
# ✅ ACTUALIZADO CON token_manager para auth bearer (MEGAPUNTO)
# ✅ ACTUALIZADO CON execute_catalog_sync (catalog_sync operation_type)
# 🔒 MEJORADO: Retry logic con backoff
# 🔒 MEJORADO: Circuit breaker para vendors caídos
# 🔒 MEJORADO: Validación de URLs
# 🔒 MEJORADO: Redacción de datos sensibles en logs
# 🔒 MEJORADO: Manejo de errores más robusto
# ========================================

import httpx
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy import text
from .vendor_api_mapper import VendorAPIMapper
from .token_manager import token_manager
import logging
import json
from decimal import Decimal
from datetime import datetime
from app.config import settings
import asyncio
import re
import urllib.parse

logger = logging.getLogger(__name__)


# ========================================
# 🔒 CIRCUIT BREAKER
# ========================================

class CircuitBreaker:
    """
    Implementación simple de Circuit Breaker para prevenir
    llamadas repetidas a vendors que están fallando.
    """
    def __init__(self, vendor_code: str, failure_threshold: int = 3, timeout_seconds: int = 60):
        self.vendor_code = vendor_code
        self.failure_threshold = failure_threshold
        self.timeout_seconds = timeout_seconds
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    def record_failure(self):
        """Registra un fallo y abre el circuito si se supera el umbral"""
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(f"🔌 Circuit breaker OPEN for vendor {self.vendor_code} (failures: {self.failure_count})")

    def record_success(self):
        """Registra un éxito y cierra/resetea el circuito"""
        if self.state == "HALF_OPEN":
            self.state = "CLOSED"
            self.failure_count = 0
            logger.info(f"✅ Circuit breaker CLOSED for vendor {self.vendor_code}")
        elif self.state == "CLOSED":
            self.failure_count = 0

    def can_attempt(self) -> bool:
        """Verifica si se puede intentar una llamada"""
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if self.last_failure_time:
                elapsed = (datetime.now() - self.last_failure_time).total_seconds()
                if elapsed >= self.timeout_seconds:
                    self.state = "HALF_OPEN"
                    logger.info(f"🔄 Circuit breaker HALF-OPEN for vendor {self.vendor_code} (timeout elapsed)")
                    return True
            return False
        if self.state == "HALF_OPEN":
            return True
        return True

    def get_state_info(self) -> Dict[str, Any]:
        """Retorna información del estado del circuito"""
        return {
            "vendor_code": self.vendor_code,
            "state": self.state,
            "failure_count": self.failure_count,
            "last_failure": self.last_failure_time.isoformat() if self.last_failure_time else None
        }


# Almacén de circuit breakers por vendor
_circuit_breakers: Dict[str, CircuitBreaker] = {}


def get_circuit_breaker(vendor_code: str) -> CircuitBreaker:
    """Obtiene o crea un circuit breaker para el vendor"""
    if vendor_code not in _circuit_breakers:
        _circuit_breakers[vendor_code] = CircuitBreaker(vendor_code)
    return _circuit_breakers[vendor_code]


class UniversalVendorService:
    """
    Servicio universal para integración con vendors
    NO REQUIERE CÓDIGO NUEVO para agregar vendors
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.timeout = 30.0
        self.max_retries = 3
        self.retry_delay = 1.0  # segundos, aumenta con backoff

    def _validate_url(self, url: str) -> bool:
        """
        🔒 NUEVO: Valida que la URL sea segura
        Previene inyección de URLs maliciosas
        """
        if not url:
            return False

        # Verificar caracteres peligrosos
        dangerous_chars = ['\n', '\r', '\t', '\x00']
        for char in dangerous_chars:
            if char in url:
                logger.error(f"URL contiene caracteres peligrosos: {url[:100]}")
                return False

        # Verificar protocolos permitidos
        allowed_protocols = ['http://', 'https://']
        is_allowed = any(url.lower().startswith(proto) for proto in allowed_protocols)
        if not is_allowed:
            logger.error(f"Protocolo no permitido en URL: {url[:50]}")
            return False

        # Verificar que no contenga doble protocolo (http://http://)
        if url.lower().count('://') > 1:
            logger.error(f"URL contiene múltiples protocolos: {url[:100]}")
            return False

        return True

    def _redact_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        🔒 NUEVO: Redacta datos sensibles para logging
        """
        if not isinstance(data, dict):
            return data

        redacted = data.copy()
        sensitive_fields = ['password', 'token', 'api_key', 'secret', 'authorization', 'auth', 'x-api-key']

        for field in sensitive_fields:
            for key in list(redacted.keys()):
                if field.lower() in key.lower():
                    redacted[key] = '[REDACTED]'

        return redacted

    async def _execute_with_retry(
        self,
        url: str,
        http_method: str,
        request_body: Dict[str, Any],
        headers: Dict[str, str],
        timeout_seconds: int,
        vendor_code: str,
        api_group_code: str
    ) -> httpx.Response:
        """
        🔒 NUEVO: Ejecuta request con reintentos automáticos (backoff exponencial)
        """
        last_exception = None

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                    if http_method == 'POST':
                        response = await client.post(url, json=request_body, headers=headers)
                    elif http_method == 'GET':
                        response = await client.get(url, params=request_body, headers=headers)
                    elif http_method == 'PUT':
                        response = await client.put(url, json=request_body, headers=headers)
                    else:
                        raise ValueError(f"HTTP method {http_method} not supported")

                    # Respuestas 2xx y 4xx (excepto 429) se consideran finales
                    # Solo reintentar en 5xx, 429 (rate limit), o errores de red
                    if response.status_code < 500 and response.status_code != 429:
                        return response

                    # Errores transitorios: 5xx, 429
                    logger.warning(
                        f"[{vendor_code}/{api_group_code}] Attempt {attempt}/{self.max_retries} "
                        f"failed with status {response.status_code}"
                    )
                    last_exception = Exception(f"HTTP {response.status_code}")

            except httpx.TimeoutException as e:
                logger.warning(
                    f"[{vendor_code}/{api_group_code}] Attempt {attempt}/{self.max_retries} timeout: {str(e)}"
                )
                last_exception = e
            except httpx.ConnectError as e:
                logger.warning(
                    f"[{vendor_code}/{api_group_code}] Attempt {attempt}/{self.max_retries} connect error: {str(e)}"
                )
                last_exception = e
            except Exception as e:
                logger.error(
                    f"[{vendor_code}/{api_group_code}] Attempt {attempt}/{self.max_retries} unexpected error: {str(e)}"
                )
                last_exception = e

            # Esperar antes de reintentar (backoff exponencial)
            if attempt < self.max_retries:
                delay = self.retry_delay * (2 ** (attempt - 1))
                logger.info(f"[{vendor_code}/{api_group_code}] Retrying in {delay}s...")
                await asyncio.sleep(delay)

        # Si llegamos aquí, todos los reintentos fallaron
        raise last_exception or Exception("All retry attempts failed")

    async def get_vendor_mapping(
        self,
        vendor_code: str,
        api_group_code: str,
        operation_type: str = 'provision'
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene configuración de mapping desde BD
        """
        query = """
            SELECT
                http_method,
                endpoint_url,
                auth_type,
                auth_config,
                request_mapping,
                value_transformations,
                response_mapping,
                success_indicators,
                timeout_seconds,
                headers,
                mapping_code
            FROM vendor_api_mappings
            WHERE vendor_code = :vendor_code
            AND api_group_code = :api_group_code
            AND operation_type = :operation_type
            AND is_active = true
        """

        result = await self.db.execute(
            text(query),
            {
                "vendor_code": vendor_code,
                "api_group_code": api_group_code,
                "operation_type": operation_type
            }
        )

        row = result.fetchone()
        if not row:
            logger.error(
                f"No mapping found for vendor={vendor_code}, "
                f"group={api_group_code}, operation={operation_type}"
            )
            return None

        return {
            "http_method": row.http_method,
            "endpoint_url": row.endpoint_url,
            "auth_type": row.auth_type,
            "auth_config": row.auth_config,
            "request_mapping": row.request_mapping,
            "value_transformations": row.value_transformations,
            "response_mapping": row.response_mapping,
            "success_indicators": row.success_indicators,
            "timeout_seconds": row.timeout_seconds or 30,
            "headers": row.headers or {},
            "mapping_code": row.mapping_code
        }

    async def get_vendor_info(self, vendor_code: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene información del vendor desde BD.
        """
        query = """
            SELECT /* sync_fix */
                vendor_url_uat,
                vendor_url_prod,
                vendor_api_key,
                vendor_username,
                vendor_password,
                vendor_access_token,
                vendor_token_expiry,
                is_production
            FROM vendors
            WHERE vendor_code = :vendor_code
            AND vendor_status = 'active'
        """

        result = await self.db.execute(
            text(query),
            {"vendor_code": vendor_code}
        )

        row = result.fetchone()
        if not row:
            return None

        access_token = await token_manager.get_token(vendor_code)
        if not access_token and row.vendor_access_token:
            access_token = row.vendor_access_token
            logger.info(f"🔑 {vendor_code}: usando token de BD como fallback (cache vacío)")

        return {
            "base_url": row.vendor_url_prod if row.is_production else row.vendor_url_uat,
            "api_key": row.vendor_api_key,
            "access_token": access_token,
            "username": row.vendor_username,
            "password": row.vendor_password,
            "is_production": row.is_production
        }

    async def execute_vendor_request(
        self,
        vendor_code: str,
        api_group_code: str,
        operation_type: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Ejecuta request a vendor API con retry logic y circuit breaker
        """
        # 🔒 Verificar circuit breaker
        cb = get_circuit_breaker(vendor_code)
        if not cb.can_attempt():
            logger.error(f"🔌 Circuit breaker OPEN for {vendor_code}, skipping request")
            return {
                "status": "error",
                "error_code": "CIRCUIT_OPEN",
                "error_message": f"Vendor {vendor_code} temporarily unavailable due to repeated failures"
            }

        # 1. Obtener configuración
        logger.info(f"🔍 Buscando mapping: vendor={vendor_code}, group={api_group_code}, op={operation_type}")
        mapping_config = await self.get_vendor_mapping(
            vendor_code,
            api_group_code,
            operation_type
        )

        if not mapping_config:
            cb.record_failure()
            return {
                "status": "error",
                "error_code": "CONFIG_NOT_FOUND",
                "error_message": (
                    f"No se encontró configuración para "
                    f"vendor={vendor_code}, group={api_group_code}, operation={operation_type}"
                )
            }

        logger.info(f"✅ Mapping encontrado: {mapping_config.get('endpoint_url')}")

        vendor_info = await self.get_vendor_info(vendor_code)
        if not vendor_info:
            cb.record_failure()
            return {
                "status": "error",
                "error_code": "VENDOR_NOT_FOUND",
                "error_message": f"Vendor {vendor_code} no encontrado"
            }

        # 🔒 Validar URL base del vendor
        base_url = vendor_info['base_url']
        if not self._validate_url(base_url):
            cb.record_failure()
            return {
                "status": "error",
                "error_code": "INVALID_URL",
                "error_message": f"URL de vendor {vendor_code} inválida o insegura"
            }

        # 2. Crear mapper
        mapper = VendorAPIMapper(mapping_config)

        try:
            # 3. Construir request body
            request_body = mapper.build_request(data)
            logger.debug(f"[{vendor_code}/{api_group_code}] Request body: {self._redact_sensitive_data(request_body)}")

            # 4. Preparar headers
            headers = self._build_headers(
                mapping_config.get('auth_type', 'none'),
                mapping_config.get('auth_config') or {},
                vendor_info,
                mapping_config.get('headers') or {}
            )

            # 5. Construir URL completa
            if settings.VENDOR_SIMULATOR_ENABLED:
                url = f"{settings.VENDOR_SIMULATOR_URL}{mapping_config['endpoint_url']}"
                logger.info(f"🎭 Using VENDOR SIMULATOR: {url}")
            else:
                base = vendor_info['base_url'].rstrip('/')
                endpoint = mapping_config['endpoint_url']
                url = f"{base}{endpoint}"
                logger.info(f"🌐 Using REAL VENDOR: {url}")

            # 🔒 Validar URL final
            if not self._validate_url(url):
                cb.record_failure()
                return {
                    "status": "error",
                    "error_code": "INVALID_URL",
                    "error_message": "URL de destino inválida o insegura"
                }

            # 5.5. Agregar mapping_code al header (para logs del simulador)
            if settings.VENDOR_SIMULATOR_ENABLED:
                headers['X-Mapping-Code'] = mapping_config.get('mapping_code', 'UNKNOWN')

            # 6. Ejecutar request con reintentos
            response = await self._execute_with_retry(
                url=url,
                http_method=mapping_config['http_method'].upper(),
                request_body=request_body,
                headers=headers,
                timeout_seconds=mapping_config['timeout_seconds'],
                vendor_code=vendor_code,
                api_group_code=api_group_code
            )

            logger.info(
                f"[{vendor_code}/{api_group_code}] Response status: {response.status_code}"
            )

            # 7. Parsear respuesta
            response_data = response.json() if response.text else {}

            # 8. Verificar éxito
            is_success = mapper.is_success_response(response.status_code, response_data)

            if is_success:
                cb.record_success()
                parsed_response = mapper.parse_response(response_data)
                return {
                    "success": True,
                    "status": "success",
                    **parsed_response,
                    "raw_response": response_data,
                    "vendor_request": request_body,
                    "vendor_response": response_data,
                    "extracted_data": parsed_response
                }
            else:
                # Error del vendor (no transitorio) - no registrar en circuit breaker
                return {
                    "status": "error",
                    "error_code": response_data.get('error_code', 'VENDOR_ERROR'),
                    "error_message": response_data.get('error_message', 'Vendor returned error'),
                    "status_code": response.status_code,
                    "vendor_request": request_body,
                    "vendor_response": response_data,
                    "raw_response": response_data
                }

        except httpx.TimeoutException as e:
            logger.error(f"[{vendor_code}/{api_group_code}] Timeout after retries")
            cb.record_failure()
            return {
                "status": "error",
                "error_code": "TIMEOUT",
                "error_message": "Request to vendor timed out after multiple retries"
            }
        except Exception as e:
            import traceback
            logger.error(f"[{vendor_code}/{api_group_code}] Error: {str(e)}")
            logger.error(f"[{vendor_code}/{api_group_code}] Traceback: {traceback.format_exc()}")
            cb.record_failure()
            return {
                "status": "error",
                "error_code": "INTEGRATION_ERROR",
                "error_message": "Error de comunicación con el proveedor. Intente nuevamente."
            }

    async def execute_catalog_sync(
        self,
        vendor_code: str,
        api_group_code: str,
        triggered_by: str = 'scheduler'
    ) -> Dict[str, Any]:
        """
        Sincroniza catálogo de productos desde el vendor.

        Usa operation_type='catalog_sync' en vendor_api_mappings.
        Genérico para cualquier vendor con endpoint de catálogo.

        El response_mapping del mapping define la estructura de la respuesta:
        {
            "array_path":          "productos",       <- campo que contiene el array
            "skuid_field":         "id_producto",     <- campo del ítem -> vp_skuid
            "nested_prices_array": "precios",         <- array de precios anidado (TISI)
            "price_pen_field":     "precio",          <- precio en Soles -> vp_amount
            "price_ref_field":     "precio_referencial", <- precio en Bs (referencia)
            "exchange_rate_field": "tipo_cambio"      <- TC del día (referencia)
        }

        Estructura real del response TISI /Producto/Sel:
        {
          "codigo": "00",
          "productos": [
            {
              "id_producto": 5580,
              "nombre_producto": "Movistar Celular 500 Bs",
              "precios": [
                {
                  "precio": "4.58",
                  "precio_referencial": "500.00",
                  "tipo_cambio": "109.060000"
                }
              ]
            }
          ]
        }
        """
        sync_start = datetime.now()

        # 🔒 Verificar circuit breaker
        cb = get_circuit_breaker(vendor_code)
        if not cb.can_attempt():
            logger.error(f"🔌 Circuit breaker OPEN for {vendor_code}, skipping catalog_sync")
            return {
                "success": False,
                "error_code": "CIRCUIT_OPEN",
                "error_message": f"Vendor {vendor_code} temporarily unavailable",
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": []
            }

        logger.info(
            f"🔄 Iniciando catalog_sync: vendor={vendor_code}, "
            f"group={api_group_code}, triggered_by={triggered_by}"
        )

        # 1. Obtener mapping con operation_type='catalog_sync'
        mapping_config = await self.get_vendor_mapping(
            vendor_code,
            api_group_code,
            'catalog_sync'
        )

        if not mapping_config:
            msg = (
                f"No se encontró mapping catalog_sync para "
                f"vendor={vendor_code}, group={api_group_code}"
            )
            logger.error(f"❌ {msg}")
            cb.record_failure()
            return {
                "success": False,
                "error_code": "CONFIG_NOT_FOUND",
                "error_message": msg,
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": []
            }

        # 2. Obtener info del vendor (URL + credenciales + token)

        vendor_info = await self.get_vendor_info(vendor_code)
        if not vendor_info:
            cb.record_failure()
            return {
                "success": False,
                "error_code": "VENDOR_NOT_FOUND",
                "error_message": f"Vendor {vendor_code} no encontrado o inactivo",
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": []
            }

        # Si no hay token en cache, hacer login directo
        if not vendor_info.get('access_token'):
            from app.models.vendor import Vendor as VendorModel
            from sqlalchemy import select as sa_select
            from app.services.vendor_login_service import VendorLoginService
            v_result = await self.db.execute(
                sa_select(VendorModel).where(VendorModel.vendor_code == vendor_code)
            )
            vendor_obj = v_result.scalar_one_or_none()
            if vendor_obj:
                login_svc = VendorLoginService(self.db)
                token_result = await login_svc.execute_login(vendor_obj)
                if token_result.get('success'):
                    vendor_info['access_token'] = token_result['access_token']
                    await token_manager.set_token(
                        vendor_code,
                        token_result['access_token'],
                        expires_in_seconds=token_result.get('expires_in', 540)
                    )

        # 3. Construir headers (reutiliza _build_headers sin cambios)
        headers = self._build_headers(
            mapping_config.get('auth_type', 'none'),
            mapping_config.get('auth_config') or {},
            vendor_info,
            mapping_config.get('headers') or {}
        )

        # 4. Construir URL
        if settings.VENDOR_SIMULATOR_ENABLED:
            url = f"{settings.VENDOR_SIMULATOR_URL}{mapping_config['endpoint_url']}"
            logger.info(f"🎭 catalog_sync usando SIMULATOR: {url}")
        else:
            base = vendor_info['base_url'].rstrip('/')
            endpoint = mapping_config['endpoint_url']
            url = f"{base}{endpoint}"
            logger.info(f"🌐 catalog_sync usando VENDOR REAL: {url}")

        # 🔒 Validar URL
        if not self._validate_url(url):
            cb.record_failure()
            return {
                "success": False,
                "error_code": "INVALID_URL",
                "error_message": "URL de catálogo inválida o insegura",
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": []
            }

        # 5. Llamar al endpoint del vendor
        try:
            # El request_mapping del catalog_sync contiene los parámetros
            mapper = VendorAPIMapper(mapping_config)
            request_body = mapper.build_request({})

            async with httpx.AsyncClient(
                timeout=mapping_config.get('timeout_seconds', 60)
            ) as client:
                http_method = mapping_config.get('http_method', 'POST').upper()

                if http_method == 'POST':
                    response = await client.post(url, json=request_body, headers=headers)
                elif http_method == 'GET':
                    response = await client.get(url, params=request_body, headers=headers)
                else:
                    raise ValueError(
                        f"HTTP method {http_method} no soportado para catalog_sync"
                    )

            logger.info(
                f"[{vendor_code}/catalog_sync] Response status: {response.status_code}"
            )

        except httpx.TimeoutException as e:
            logger.error(f"[{vendor_code}/catalog_sync] Timeout: {str(e)}")
            cb.record_failure()
            return {
                "success": False,
                "error_code": "TIMEOUT",
                "error_message": "Timeout al llamar al endpoint de catálogo",
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": []
            }
        except Exception as e:
            logger.error(f"[{vendor_code}/catalog_sync] HTTP error: {str(e)}")
            cb.record_failure()
            return {
                "success": False,
                "error_code": "HTTP_ERROR",
                "error_message": str(e),
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": []
            }

        # 6. Parsear respuesta JSON
        try:
            response_data = response.json() if response.text else {}
        except Exception as e:
            logger.error(f"[{vendor_code}/catalog_sync] Parse error: {str(e)}")
            cb.record_failure()
            return {
                "success": False,
                "error_code": "PARSE_ERROR",
                "error_message": "No se pudo parsear la respuesta del vendor",
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": []
            }

        # 7. Verificar éxito del response
        mapper = VendorAPIMapper(mapping_config)
        if isinstance(response_data, list):
            is_success = response.status_code == 200
        else:
            is_success = mapper.is_success_response(response.status_code, response_data)

        if not is_success:
            error_msg = response_data.get("mensaje", str(response_data)) if isinstance(response_data, dict) else str(response_data)
            cb.record_failure()
            return {
                "success": False,
                "error_code": "VENDOR_ERROR",
                "error_message": f"Vendor retorno error: {error_msg}",
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": []
            }

        # 8. Leer configuración del response_mapping
        response_mapping = mapping_config.get('response_mapping') or {}
        array_path = response_mapping.get('array_path', 'productos')
        skuid_field = response_mapping.get('skuid_field', 'id_producto')
        nested_prices = response_mapping.get('nested_prices_array', 'precios')
        price_pen_field = response_mapping.get('price_pen_field', 'precio')
        price_ref_field = response_mapping.get('price_ref_field', 'precio_referencial')
        exch_rate_field = response_mapping.get('exchange_rate_field', 'tipo_cambio')

        # array_path=None significa que la respuesta raiz ES el array
        if array_path:
            productos_raw = response_data.get(array_path, []) if isinstance(response_data, dict) else []
        else:
            productos_raw = response_data if isinstance(response_data, list) else []

        if not productos_raw:
            logger.warning(f"[{vendor_code}/catalog_sync] Response vacio o sin productos")
            return {
                "success": True,
                "vendor_code": vendor_code,
                "api_group_code": api_group_code,
                "triggered_by": triggered_by,
                "sync_date": sync_start.isoformat(),
                "products_reviewed": 0,
                "products_updated": 0,
                "changes_detail": [],
                "warning": "El vendor no retorno productos"
            }

        # 9. Obtener todos los vendor_products de Venezuela en BD (para detectar NO_VINO)
        bd_vp_query = await self.db.execute(
            text("""
                SELECT vp_id, vp_code, vp_skuid, vp_amount, vp_name, vp_metadata
                FROM vendor_products
                WHERE vendor_code = :vendor_code
                  AND vp_status   = 'active'
            """),
            {"vendor_code": vendor_code}
        )
        bd_vp_rows = bd_vp_query.fetchall()

        # Índice BD por (vp_skuid, precio_referencial_bs)
        bd_by_key = {}
        for r in bd_vp_rows:
            meta = r.vp_metadata or {}
            precio_ref_bd = str(meta.get("precio_referencial", "")).strip()
            if precio_ref_bd:
                key = (str(r.vp_skuid), precio_ref_bd)
                bd_by_key[key] = r

        # Conjunto de claves (skuid, precio_ref) que vinieron de TISI
        claves_recibidas = set()

        # 10. Iterar productos recibidos de TISI y construir reporte
        products_reviewed = 0
        products_updated = 0
        reporte = []

        for item in productos_raw:
            skuid = str(item.get(skuid_field, ''))
            if not skuid:
                continue

            nombre_producto = item.get('nombre_producto', '')

            prices_array = item.get(nested_prices, []) if nested_prices else []
            prices_venezuela = [p for p in prices_array if p.get(price_ref_field) is not None]
            if not prices_venezuela:
                continue

            for price_node in prices_venezuela:
                raw_price_pen = price_node.get(price_pen_field)
                raw_price_ref = price_node.get(price_ref_field)
                raw_exch_rate = price_node.get(exch_rate_field)

                if raw_price_pen is None or raw_price_ref is None:
                    continue

                try:
                    new_price_pen = Decimal(str(raw_price_pen))
                except Exception:
                    continue

                precio_ref_str = str(raw_price_ref).strip()
                clave = (skuid, precio_ref_str)
                claves_recibidas.add(clave)
                products_reviewed += 1

                vp_row = bd_by_key.get(clave)

                if not vp_row:
                    reporte.append({
                        "vp_code": None,
                        "vp_skuid": skuid,
                        "nombre_producto": f"{nombre_producto} {precio_ref_str} Bs.",
                        "status": "NUEVO",
                        "vp_amount_old": None,
                        "vp_amount_new": float(new_price_pen),
                        "precio_referencial_bs": precio_ref_str,
                        "tipo_cambio": str(raw_exch_rate) if raw_exch_rate else None,
                        "alerta_precio": False,
                    })
                    continue

                old_price = vp_row.vp_amount
                vp_id = vp_row.vp_id
                vp_code = vp_row.vp_code

                price_changed = (old_price is None or Decimal(str(old_price)) != new_price_pen)

                alerta_precio = False
                if old_price is not None and old_price > 0:
                    cambio_pct = abs(new_price_pen - Decimal(str(old_price))) / Decimal(str(old_price))
                    alerta_precio = cambio_pct > Decimal('0.10')

                if not price_changed:
                    reporte.append({
                        "vp_code": vp_code,
                        "vp_skuid": skuid,
                        "nombre_producto": nombre_producto,
                        "status": "SIN_CAMBIO",
                        "vp_amount_old": float(old_price) if old_price else None,
                        "vp_amount_new": float(new_price_pen),
                        "precio_referencial_bs": precio_ref_str,
                        "tipo_cambio": str(raw_exch_rate) if raw_exch_rate else None,
                        "alerta_precio": False,
                    })
                    continue

                existing_meta = vp_row.vp_metadata or {}
                new_meta = {
                    **existing_meta,
                    "precio_referencial": precio_ref_str,
                    "tipo_cambio": str(raw_exch_rate) if raw_exch_rate else None,
                    "last_sync_date": sync_start.isoformat(),
                    "last_sync_by": triggered_by,
                }

                await self.db.execute(
                    text("""
                        UPDATE vendor_products
                        SET vp_amount        = :new_price,
                            vp_metadata      = CAST(:meta AS jsonb),
                            last_update_date = NOW(),
                            updated_by       = 'catalog_sync'
                        WHERE vp_id = :vp_id
                    """),
                    {
                        "new_price": float(new_price_pen),
                        "meta": json.dumps(new_meta),
                        "vp_id": vp_id
                    }
                )

                await self.db.execute(
                    text("""
                        UPDATE products
                        SET product_base_price      = :new_price,
                            product_discount_amount = ROUND(:new_price * product_discount_percentage / 100, 2),
                            product_total_price     = ROUND(:new_price - (:new_price * product_discount_percentage / 100) + product_fee, 2),
                            last_update_date    = NOW(),
                            updated_by          = 'catalog_sync'
                        WHERE product_vendor_code  = :vendor_code
                          AND product_vendpro_code = :vp_code
                    """),
                    {
                        "new_price": float(new_price_pen),
                        "vendor_code": vendor_code,
                        "vp_code": vp_code
                    }
                )

                products_updated += 1
                status = "ALERTA" if alerta_precio else "ACTUALIZADO"

                reporte.append({
                    "vp_code": vp_code,
                    "vp_skuid": skuid,
                    "nombre_producto": nombre_producto,
                    "status": status,
                    "vp_amount_old": float(old_price) if old_price else None,
                    "vp_amount_new": float(new_price_pen),
                    "precio_referencial_bs": precio_ref_str,
                    "tipo_cambio": str(raw_exch_rate) if raw_exch_rate else None,
                    "alerta_precio": alerta_precio,
                })

                logger.info(
                    f"{'🚨' if alerta_precio else '✅'} [{vendor_code}/catalog_sync] "
                    f"{status} vp_code={vp_code} precio_ref={precio_ref_str} Bs | {old_price} → {new_price_pen} PEN"
                )

        # 11. Detectar NO_VINO
        for bd_row in bd_vp_rows:
            meta = bd_row.vp_metadata or {}
            precio_ref_bd = str(meta.get("precio_referencial", "")).strip()
            if not precio_ref_bd:
                continue
            clave_bd = (str(bd_row.vp_skuid), precio_ref_bd)
            if clave_bd not in claves_recibidas:
                reporte.append({
                    "vp_code": bd_row.vp_code,
                    "vp_skuid": str(bd_row.vp_skuid),
                    "nombre_producto": bd_row.vp_name or "",
                    "status": "NO_VINO",
                    "vp_amount_old": float(bd_row.vp_amount) if bd_row.vp_amount else None,
                    "vp_amount_new": None,
                    "precio_referencial_bs": precio_ref_bd,
                    "tipo_cambio": None,
                    "alerta_precio": False,
                })
                logger.warning(
                    f"⚠️ [{vendor_code}/catalog_sync] NO_VINO vp_code={bd_row.vp_code} precio_ref={precio_ref_bd} Bs"
                )

        # 12. Actualizar last_sync_date del vendor (dentro de la misma transacción)
        await self.db.execute(
            text("""
                UPDATE vendors
                SET last_sync_date   = NOW(),
                    last_update_date = NOW(),
                    updated_by       = 'catalog_sync'
                WHERE vendor_code = :vendor_code
            """),
            {"vendor_code": vendor_code}
        )

        # 13. Commit único — precios + last_sync_date en una sola transacción
        await self.db.commit()

        count_nuevo = sum(1 for r in reporte if r["status"] == "NUEVO")
        count_actualizado = sum(1 for r in reporte if r["status"] in ("ACTUALIZADO", "ALERTA"))
        count_sin_cambio = sum(1 for r in reporte if r["status"] == "SIN_CAMBIO")
        count_no_vino = sum(1 for r in reporte if r["status"] == "NO_VINO")
        count_alerta = sum(1 for r in reporte if r["alerta_precio"])

        logger.info(
            f"✅ [{vendor_code}/catalog_sync] Completado — "
            f"revisados: {products_reviewed}, actualizados: {products_updated}, "
            f"nuevos: {count_nuevo}, no_vino: {count_no_vino}, alertas: {count_alerta}"
        )

        # 🔒 Éxito - resetear circuit breaker
        cb.record_success()

        return {
            "success": True,
            "vendor_code": vendor_code,
            "api_group_code": api_group_code,
            "triggered_by": triggered_by,
            "sync_date": sync_start.isoformat(),
            "products_reviewed": products_reviewed,
            "products_updated": products_updated,
            "count_nuevo": count_nuevo,
            "count_sin_cambio": count_sin_cambio,
            "count_no_vino": count_no_vino,
            "count_alerta": count_alerta,
            "changes_detail": reporte,
            "message": (
                f"Sync completado: {products_updated} actualizados, "
                f"{count_nuevo} nuevos, {count_no_vino} no vinieron, "
                f"{count_alerta} alertas de precio"
            )
        }

    def _build_headers(
        self,
        auth_type: str,
        auth_config: Dict[str, Any],
        vendor_info: Dict[str, Any],
        additional_headers: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Construye headers del request
        """
        headers = {
            "Content-Type": "application/json",
            **(additional_headers or {})
        }

        if auth_type == 'bearer':
            header_name = auth_config.get('header_name', 'Authorization')
            token_prefix = auth_config.get('token_prefix', 'Bearer ')
            access_token = vendor_info.get('access_token')
            if not access_token:
                logger.warning(
                    f"⚠️ No hay token en cache para este vendor. "
                    f"Verificar que ENABLE_VENDOR_LOGIN=True en UAT/Prod."
                )
            headers[header_name] = f"{token_prefix}{access_token or ''}"

        elif auth_type == 'api_key_header':
            header_name = auth_config.get('header_name', 'X-API-Key')
            headers[header_name] = vendor_info.get('api_key') or ''
            extra_headers = auth_config.get('extra_headers', {})
            for key, value in extra_headers.items():
                if value == '{vendor_username}':
                    value = vendor_info.get('username') or ''
                elif value == '{vendor_api_key}':
                    value = vendor_info.get('api_key') or ''
                headers[key] = value

        elif auth_type == 'basic':
            import base64
            credentials = f"{vendor_info['username']}:{vendor_info['password']}"
            encoded = base64.b64encode(credentials.encode()).decode()
            headers['Authorization'] = f"Basic {encoded}"

        # 🔒 Redactar headers sensibles en logs (solo debug)
        safe_headers = {}
        for k, v in headers.items():
            if 'authorization' in k.lower() or 'api-key' in k.lower():
                safe_headers[k] = '[REDACTED]'
            else:
                safe_headers[k] = v
        logger.debug(f"Headers: {safe_headers}")

        return headers


# ========================================
# FUNCIÓN HELPER PARA USAR EN ROUTERS
# ========================================

async def process_vendor_topup(
    db: AsyncSession,
    vendor_code: str,
    api_group_code: str,
    purchase_data: Dict[str, Any],
    vendor_product_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Procesa recarga con vendor usando servicio universal
    """
    service = UniversalVendorService(db)
    combined_data = {
        **purchase_data,
        **vendor_product_data
    }
    result = await service.execute_vendor_request(
        vendor_code=vendor_code,
        api_group_code=api_group_code,
        operation_type='provision',
        data=combined_data
    )
    return result


async def validate_vendor_phone(
    db: AsyncSession,
    vendor_code: str,
    api_group_code: str,
    phone_number: str,
    additional_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Valida un número de teléfono con el vendor
    """
    service = UniversalVendorService(db)

    validation_mapping = await service.get_vendor_mapping(
        vendor_code=vendor_code,
        api_group_code=api_group_code,
        operation_type='validation'
    )

    if not validation_mapping:
        logger.info(
            f"No validation mapping found for {vendor_code}/{api_group_code}. "
            f"Validation not required - returning success."
        )
        return {
            "status": "success",
            "valid": True,
            "message": "Validation not required by vendor",
            "phone_number": phone_number
        }

    data = {
        "purchase_phone_number": phone_number,
        **(additional_data or {})
    }

    result = await service.execute_vendor_request(
        vendor_code=vendor_code,
        api_group_code=api_group_code,
        operation_type='validation',
        data=data
    )

    return result


async def query_vendor_transaction(
    db: AsyncSession,
    vendor_code: str,
    api_group_code: str,
    transaction_id: str
) -> Dict[str, Any]:
    """
    Consulta el estado de una transacción en el vendor
    """
    service = UniversalVendorService(db)
    data = {"purchase_vendor_purchase_id": transaction_id}
    result = await service.execute_vendor_request(
        vendor_code=vendor_code,
        api_group_code=api_group_code,
        operation_type='query',
        data=data
    )
    return result


async def reverse_vendor_transaction(
    db: AsyncSession,
    vendor_code: str,
    api_group_code: str,
    transaction_id: str,
    reason: str = None
) -> Dict[str, Any]:
    """
    Revierte una transacción en el vendor
    """
    service = UniversalVendorService(db)
    data = {
        "purchase_vendor_purchase_id": transaction_id,
        "reversal_reason": reason or "Customer request"
    }
    result = await service.execute_vendor_request(
        vendor_code=vendor_code,
        api_group_code=api_group_code,
        operation_type='reversal',
        data=data
    )
    return result
