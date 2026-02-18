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
            text(query),  # ← ENVUELTO en text()
            {
                "vendor_code": vendor_code,
                "api_group_code": api_group_code,  # ⭐ NUEVO
                "operation_type": operation_type
            }
        )

        row = result.fetchone()
        if not row:
            logger.error(
                f"No mapping found for vendor={vendor_code}, "
                f"group={api_group_code}, operation={operation_type}"  # ⭐ ACTUALIZADO
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
            "mapping_code": row.mapping_code  # ← AGREGADO para logs
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
            text(query),  # ← ENVUELTO en text()
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
        mapping_config = await self.get_vendor_mapping(
            vendor_code,
            api_group_code,  # ⭐ NUEVO
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

            logger.info(
                f"[{vendor_code}/{api_group_code}] Request body: {json.dumps(request_body)}"
            )

            # 4. Preparar headers
            headers = self._build_headers(
                mapping_config.get('auth_type', 'none'),  # ← VALIDAR None
                mapping_config.get('auth_config') or {},  # ← VALIDAR None
                vendor_info,
                mapping_config.get('headers') or {}  # ← VALIDAR None
            )

            # 5. Construir URL completa
            # ⭐ MODIFICADO para soportar vendor simulator
            if settings.VENDOR_SIMULATOR_ENABLED:
                # Usar vendor simulado
                url = f"{settings.VENDOR_SIMULATOR_URL}{mapping_config['endpoint_url']}"
                logger.info(f"🎭 Using VENDOR SIMULATOR: {url}")
            else:
                # Usar vendor real
                url = f"{vendor_info['base_url']}{mapping_config['endpoint_url']}"
                logger.info(f"🌐 Using REAL VENDOR: {url}")

            # 5.5. Agregar mapping_code al header (para logs del simulador)
            # ⭐ AGREGADO para vendor simulator
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
                # Mapear campos de respuesta
                parsed_response = mapper.parse_response(response_data)

                return {
                    "success": True,
                    "status": "success",
                    **parsed_response,
                    "raw_response": response_data,
                    "vendor_request": request_body,  # ✅ AGREGADO para auditoría
                    "vendor_response": response_data,  # ✅ AGREGADO para auditoría
                    "extracted_data": parsed_response  # ✅ AGREGADO para claridad
                }
            else:
                # Error del vendor
                return {
                    "status": "error",
                    "error_code": response_data.get('error_code', 'VENDOR_ERROR'),
                    "error_message": response_data.get('error_message', 'Vendor returned error'),
                    "status_code": response.status_code,
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
            logger.error(f"[{vendor_code}/{api_group_code}] Error: {str(e)}")
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
            **(additional_headers or {})  # ← CORREGIDO: manejar None
        }

        # Configurar autenticación
        if auth_type == 'bearer':
            header_name = auth_config.get('header_name', 'Authorization')
            token_prefix = auth_config.get('token_prefix', 'Bearer ')
            headers[header_name] = f"{token_prefix}{vendor_info['api_key']}"

        elif auth_type == 'api_key_header':
            header_name = auth_config.get('header_name', 'X-API-Key')
            headers[header_name] = vendor_info['api_key']
            # ✅ NUEVO: Soporte para headers adicionales de autenticación
            # Permite configurar múltiples headers desde auth_config
            # Ejemplo LATCOM: x-api-key + x-customer-id
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
    api_group_code: str,  # ⭐ NUEVO PARÁMETRO REQUERIDO
    purchase_data: Dict[str, Any],
    vendor_product_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Procesa recarga con vendor usando servicio universal

    Args:
        db: Sesión de BD
        vendor_code: Código del vendor
        api_group_code: Código del grupo de APIs ⭐ NUEVO
        purchase_data: Datos de la compra
        vendor_product_data: Datos del vendor product

    Returns:
        Resultado de la operación
    """

    service = UniversalVendorService(db)

    # Combinar datos para el mapper
    combined_data = {
        **purchase_data,
        **vendor_product_data
    }

    # Ejecutar request
    result = await service.execute_vendor_request(
        vendor_code=vendor_code,
        api_group_code=api_group_code,  # ⭐ NUEVO
        operation_type='provision',  # ⭐ ACTUALIZADO (antes 'topup')
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

    Args:
        db: Sesión de BD
        vendor_code: Código del vendor
        api_group_code: Código del grupo de APIs
        phone_number: Número a validar
        additional_data: Datos adicionales opcionales

    Returns:
        Resultado de la validación
    """
    service = UniversalVendorService(db)

    # ✅ VERIFICAR SI EXISTE MAPPING DE VALIDACIÓN
    validation_mapping = await service.get_vendor_mapping(
        vendor_code=vendor_code,
        api_group_code=api_group_code,
        operation_type='validation'
    )

    # ✅ SI NO HAY MAPPING DE VALIDACIÓN → Retornar éxito automático
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

    # Si hay mapping, ejecutar validación real
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

    Args:
        db: Sesión de BD
        vendor_code: Código del vendor
        api_group_code: Código del grupo de APIs
        transaction_id: ID de la transacción a consultar

    Returns:
        Estado de la transacción
    """
    service = UniversalVendorService(db)

    data = {
        "purchase_vendor_purchase_id": transaction_id
    }

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

    Args:
        db: Sesión de BD
        vendor_code: Código del vendor
        api_group_code: Código del grupo de APIs
        transaction_id: ID de la transacción a revertir
        reason: Razón de la reversión (opcional)

    Returns:
        Resultado de la reversión
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


# ========================================
# EJEMPLO DE USO EN ROUTER (ACTUALIZADO)
# ========================================

"""
# En tu router de purchases:

from .services.universal_vendor_service import (
    process_vendor_topup,
    validate_vendor_phone,
    query_vendor_transaction
)

@router.post("/purchases")
async def create_purchase(
    purchase_data: PurchaseCreate,
    db: AsyncSession = Depends(get_db)
):
    # 1. Obtener vendor product (ahora incluye api_group_code)
    vendor_product = await db.get(VendorProduct, purchase_data.vp_id)

    # 2. OPCIONAL: Validar teléfono primero
    validation_result = await validate_vendor_phone(
        db=db,
        vendor_code=vendor_product.vendor_code,
        api_group_code=vendor_product.api_group_code,  # ⭐ NUEVO
        phone_number=purchase_data.phone_number
    )

    if validation_result["status"] != "success":
        raise HTTPException(400, "Número de teléfono inválido")

    # 3. Crear purchase en BD
    new_purchase = Purchase(**purchase_data.dict())
    db.add(new_purchase)
    await db.commit()

    # 4. Procesar con vendor (¡AHORA CON api_group_code!)
    result = await process_vendor_topup(
        db=db,
        vendor_code=vendor_product.vendor_code,
        api_group_code=vendor_product.api_group_code,  # ⭐ NUEVO - FUNDAMENTAL
        purchase_data={
            "purchase_phone_number": purchase_data.phone_number,
            "purchase_vendor_amount": purchase_data.amount,
            "purchase_vendor_currency": "PEN",
            "purchase_reference": new_purchase.purchase_reference
        },
        vendor_product_data={
            "vp_skuid": vendor_product.vp_skuid,
            "vp_country": vendor_product.vp_country,
            "vp_code": vendor_product.vp_code
        }
    )

    # 5. Actualizar purchase con resultado
    if result["status"] == "success":
        new_purchase.purchase_vendor_purchase_id = result.get("purchase_vendor_purchase_id")
        new_purchase.purchase_delivery_status = "Success"

        # OPCIONAL: Confirmar transacción si el vendor lo requiere
        # confirmation = await service.execute_vendor_request(...)

    else:
        new_purchase.purchase_delivery_status = "Failed"
        new_purchase.purchase_vendor_response_code = result.get("error_code")

    await db.commit()

    return new_purchase


@router.get("/purchases/{purchase_id}/status")
async def check_purchase_status(
    purchase_id: int,
    db: AsyncSession = Depends(get_db)
):
    # 1. Obtener purchase
    purchase = await db.get(Purchase, purchase_id)

    # 2. Obtener vendor product para api_group_code
    vendor_product = await db.get(VendorProduct, purchase.vp_id)

    # 3. Consultar estado en vendor
    result = await query_vendor_transaction(
        db=db,
        vendor_code=vendor_product.vendor_code,
        api_group_code=vendor_product.api_group_code,  # ⭐ NUEVO
        transaction_id=purchase.purchase_vendor_purchase_id
    )

    return result
"""