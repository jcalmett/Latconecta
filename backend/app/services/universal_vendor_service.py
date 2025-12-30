# ========================================
# UNIVERSAL VENDOR INTEGRATION SERVICE
# Integración con cualquier vendor sin código nuevo
# ========================================

import httpx
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .vendor_api_mapper import VendorAPIMapper
import logging
import json

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
        operation_type: str = 'topup'
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
                headers
            FROM vendor_api_mappings
            WHERE vendor_code = :vendor_code
            AND operation_type = :operation_type
            AND is_active = true
        """
        
        result = await self.db.execute(
            query,
            {
                "vendor_code": vendor_code,
                "operation_type": operation_type
            }
        )
        
        row = result.fetchone()
        if not row:
            logger.error(f"No mapping found for {vendor_code}/{operation_type}")
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
            "headers": row.headers or {}
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
            query,
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
        operation_type: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Ejecuta request a vendor API
        
        Args:
            vendor_code: Código del vendor
            operation_type: Tipo de operación ('topup', 'balance', etc.)
            data: Datos de la compra/operación
            
        Returns:
            Respuesta procesada
        """
        
        # 1. Obtener configuración
        mapping_config = await self.get_vendor_mapping(vendor_code, operation_type)
        if not mapping_config:
            return {
                "status": "error",
                "error_code": "CONFIG_NOT_FOUND",
                "error_message": f"No se encontró configuración para {vendor_code}/{operation_type}"
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
            
            logger.info(f"[{vendor_code}] Request body: {json.dumps(request_body)}")
            
            # 4. Preparar headers
            headers = self._build_headers(
                mapping_config['auth_type'],
                mapping_config['auth_config'],
                vendor_info,
                mapping_config.get('headers', {})
            )
            
            # 5. Construir URL completa
            url = f"{vendor_info['base_url']}{mapping_config['endpoint_url']}"
            
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
            
            logger.info(f"[{vendor_code}] Response status: {response.status_code}")
            
            # 7. Parsear respuesta
            response_data = response.json() if response.text else {}
            
            # 8. Verificar éxito
            is_success = mapper.is_success_response(response.status_code, response_data)
            
            if is_success:
                # Mapear campos de respuesta
                parsed_response = mapper.parse_response(response_data)
                
                return {
                    "status": "success",
                    **parsed_response,
                    "raw_response": response_data
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
            logger.error(f"[{vendor_code}] Timeout")
            return {
                "status": "error",
                "error_code": "TIMEOUT",
                "error_message": "Request to vendor timed out"
            }
        
        except Exception as e:
            logger.error(f"[{vendor_code}] Error: {str(e)}")
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
        """
        headers = {
            "Content-Type": "application/json",
            **additional_headers
        }
        
        # Configurar autenticación
        if auth_type == 'bearer':
            header_name = auth_config.get('header_name', 'Authorization')
            token_prefix = auth_config.get('token_prefix', 'Bearer ')
            headers[header_name] = f"{token_prefix}{vendor_info['api_key']}"
        
        elif auth_type == 'api_key_header':
            header_name = auth_config.get('header_name', 'X-API-Key')
            headers[header_name] = vendor_info['api_key']
        
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
    purchase_data: Dict[str, Any],
    vendor_product_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Procesa recarga con vendor usando servicio universal
    
    Args:
        db: Sesión de BD
        vendor_code: Código del vendor
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
        operation_type='topup',
        data=combined_data
    )
    
    return result


# ========================================
# EJEMPLO DE USO EN ROUTER
# ========================================

"""
# En tu router de purchases:

from .services.universal_vendor_service import process_vendor_topup

@router.post("/purchases")
async def create_purchase(
    purchase_data: PurchaseCreate,
    db: AsyncSession = Depends(get_db)
):
    # 1. Crear purchase en BD
    new_purchase = Purchase(**purchase_data.dict())
    db.add(new_purchase)
    await db.commit()
    
    # 2. Obtener vendor product
    vendor_product = await db.get(VendorProduct, purchase_data.vp_id)
    
    # 3. Procesar con vendor (¡SIN CÓDIGO ESPECÍFICO DEL VENDOR!)
    result = await process_vendor_topup(
        db=db,
        vendor_code=vendor_product.vendor_code,
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
    
    # 4. Actualizar purchase con resultado
    if result["status"] == "success":
        new_purchase.purchase_vendor_purchase_id = result.get("purchase_vendor_purchase_id")
        new_purchase.purchase_delivery_status = "Success"
    else:
        new_purchase.purchase_delivery_status = "Failed"
        new_purchase.purchase_vendor_response_code = result.get("error_code")
    
    await db.commit()
    
    return new_purchase
"""
