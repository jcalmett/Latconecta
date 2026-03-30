# ========================================
# UNIVERSAL VENDOR INTEGRATION SERVICE
# Integración con cualquier vendor sin código nuevo
# ✅ ACTUALIZADO CON api_group_code
# ✅ ACTUALIZADO CON vendor simulator support (Fase 2)
# ✅ ACTUALIZADO CON extra_headers en api_key_header (LATCOM)
# ========================================

import httpx
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy import text  # ← AGREGADO para queries SQL en texto
from .vendor_api_mapper import VendorAPIMapper
import logging
import json
from app.config import settings  # ← AGREGADO para vendor simulator

logger = logging.getLogger(__name__)


class UniversalVendorService:
    """
    Servicio universal para integración con vendors
    NO REQUIERE CÓDIGO NUEVO para agregar vendors
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.timeout = 30.0

    async def get_vendor_mapping(
        self,
        vendor_code: str,
        api_group_code: str,  # ⭐ NUEVO
        operation_type: str = 'provision'  # ⭐ ACTUALIZADO (antes 'topup')
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene configuración de mapping desde BD

        Args:
            vendor_code: Código del vendor (DTONE, MEGAPUNTO, etc.)
            api_group_code: Código del grupo de APIs (DT001, MP001, etc.) ⭐ NUEVO
            operation_type: Tipo de operación (provision, validation, query, reversal, etc.)
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
        Obtiene información del vendor desde BD
        """
        query = """
            SELECT
                vendor_url_uat,
                vendor_url_prod,
                vendor_api_key,
                vendor_username,
                vendor_password,
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

        return {
            "base_url": row.vendor_url_prod if row.is_production else row.vendor_url_uat,
            "api_key": row.vendor_api_key,
            "username": row.vendor_username,
            "password": row.vendor_password,
            "is_production": row.is_production
        }

    async def execute_vendor_request(
        self,
        vendor_code: str,
        api_group_code: str,  # ⭐ NUEVO
        operation_type: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Ejecuta request a vendor API

        Args:
            vendor_code: Código del vendor
            api_group_code: Código del grupo de APIs ⭐ NUEVO
            operation_type: Tipo de operación ('provision', 'validation', 'query', etc.)
            data: Datos de la compra/operación

        Returns:
            Respuesta procesada
        """

        # 1. Obtener configuración
        logger.info(f"🔍 Buscando mapping: vendor={vendor_code}, group={api_group_code}, op={operation_type}")
        mapping_config = await self.get_vendor_mapping(
            vendor_code,
            api_group_code,
            operation_type
        )

        if not mapping_config:
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
            return {
                "status": "error",
                "error_code": "VENDOR_NOT_FOUND",
                "error_message": f"Vendor {vendor_code} no encontrado"
            }

        # 2. Crear mapper
        mapper = VendorAPIMapper(mapping_config)

        try:
            # 3. Construir request body
            request_body = mapper.build_request(data)
            print(f"[{vendor_code}/{api_group_code}] Request body: {json.dumps(request_body)}", flush=True)

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
                url = f"{vendor_info['base_url']}{mapping_config['endpoint_url']}"
                logger.info(f"🌐 Using REAL VENDOR: {url}")

            # 5.5. Agregar mapping_code al header (para logs del simulador)
            if settings.VENDOR_SIMULATOR_ENABLED:
                headers['X-Mapping-Code'] = mapping_config.get('mapping_code', 'UNKNOWN')

            # 6. Ejecutar request
            async with httpx.AsyncClient(timeout=mapping_config['timeout_seconds']) as client:

                http_method = mapping_config['http_method'].upper()

                if http_method == 'POST':
                    response = await client.post(url, json=request_body, headers=headers)
                elif http_method == 'GET':
                    response = await client.get(url, params=request_body, headers=headers)
                elif http_method == 'PUT':
                    response = await client.put(url, json=request_body, headers=headers)
                else:
                    raise ValueError(f"HTTP method {http_method} not supported")

            logger.info(
                f"[{vendor_code}/{api_group_code}] Response status: {response.status_code}"
            )

            # 7. Parsear respuesta
            response_data = response.json() if response.text else {}

            # 8. Verificar éxito
            is_success = mapper.is_success_response(response.status_code, response_data)

            if is_success:
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
                return {
                    "status": "error",
                    "error_code": response_data.get('error_code', 'VENDOR_ERROR'),
                    "error_message": response_data.get('error_message', 'Vendor returned error'),
                    "status_code": response.status_code,
                    "vendor_request": request_body,
                    "vendor_response": response_data,
                    "raw_response": response_data
                }

        except httpx.TimeoutException:
            logger.error(f"[{vendor_code}/{api_group_code}] Timeout")
            return {
                "status": "error",
                "error_code": "TIMEOUT",
                "error_message": "Request to vendor timed out"
            }

        except Exception as e:
            import traceback
            logger.error(f"[{vendor_code}/{api_group_code}] Error: {str(e)}")
            logger.error(f"[{vendor_code}/{api_group_code}] Traceback: {traceback.format_exc()}")
            return {
                "status": "error",
                "error_code": "INTEGRATION_ERROR",
                "error_message": str(e)
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

        Tipos soportados:
        - bearer: Authorization: Bearer {token}
        - api_key_header: {header_name}: {api_key} + extra_headers opcionales
        - basic: Authorization: Basic {base64(user:pass)}
        """
        headers = {
            "Content-Type": "application/json",
            **(additional_headers or {})
        }

        if auth_type == 'bearer':
            header_name = auth_config.get('header_name', 'Authorization')
            token_prefix = auth_config.get('token_prefix', 'Bearer ')
            headers[header_name] = f"{token_prefix}{vendor_info['api_key']}"

        elif auth_type == 'api_key_header':
            header_name = auth_config.get('header_name', 'X-API-Key')
            headers[header_name] = vendor_info['api_key']
            extra_headers = auth_config.get('extra_headers', {})
            for key, value in extra_headers.items():
                if value == '{vendor_username}':
                    value = vendor_info.get('username', '')
                elif value == '{vendor_api_key}':
                    value = vendor_info.get('api_key', '')
                headers[key] = value

        elif auth_type == 'basic':
            import base64
            credentials = f"{vendor_info['username']}:{vendor_info['password']}"
            encoded = base64.b64encode(credentials.encode()).decode()
            headers['Authorization'] = f"Basic {encoded}"

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


# ========================================
# ⭐ NUEVAS FUNCIONES HELPER PARA OTRAS OPERACIONES
# ========================================

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
