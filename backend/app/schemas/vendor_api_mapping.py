"""
Schemas Pydantic para Vendor API Mappings
Sistema de mapeo flexible que soporta múltiples operaciones por VendorProduct
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, List, Any
from datetime import datetime


# ============================================================================
# SUB-SCHEMAS PARA JSONB
# ============================================================================

class RequestFieldMapping(BaseModel):
    """
    Mapeo de un campo individual en el request
    """
    api_field: str = Field(..., description="Nombre del campo en la API del vendor")
    source_field: str = Field(..., description="Campo origen (purchase_* o vp_*)")
    data_type: str = Field(..., description="Tipo de dato: string, float, int, boolean, date")
    required: bool = Field(default=True, description="Si el campo es obligatorio")
    default_value: Optional[Any] = Field(None, description="Valor por defecto si no existe")
    transformation: Optional[str] = Field(None, description="Transformación a aplicar")
    
    @field_validator('data_type')
    @classmethod
    def validate_data_type(cls, v):
        valid_types = ['string', 'float', 'int', 'boolean', 'date', 'datetime']
        if v not in valid_types:
            raise ValueError(f'data_type debe ser uno de: {valid_types}')
        return v
    
    @field_validator('source_field')
    @classmethod
    def validate_source_field(cls, v):
        # Debe empezar con purchase_ o vp_
        if not (v.startswith('purchase_') or v.startswith('vp_')):
            raise ValueError('source_field debe empezar con purchase_ o vp_')
        return v


class RequestMapping(BaseModel):
    """
    Estructura del request_mapping JSONB
    """
    fields: List[RequestFieldMapping] = Field(..., description="Lista de campos a mapear")
    
    @field_validator('fields')
    @classmethod
    def validate_fields_not_empty(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Debe haber al menos 1 campo en request_mapping')
        return v


# ============================================================================
# SCHEMAS PRINCIPALES
# ============================================================================

class VendorApiMappingBase(BaseModel):
    """
    Base schema para Vendor API Mapping
    """
    vendor_code: str = Field(..., max_length=50, description="Código del vendor")
    operation_type: str = Field(..., max_length=50, description="Tipo de operación")
    mapping_code: str = Field(..., max_length=5, description="Código único del mapping (ej: MAV01)")
    http_method: str = Field(default="POST", max_length=10, description="Método HTTP")
    endpoint_url: Optional[str] = Field(None, max_length=500, description="URL del endpoint")
    auth_type: Optional[str] = Field(None, max_length=50, description="Tipo de autenticación")
    auth_config: Optional[Dict[str, Any]] = Field(None, description="Configuración de auth (JSONB)")
    request_mapping: Dict[str, Any] = Field(..., description="Mapeo de request (JSONB)")
    value_transformations: Optional[Dict[str, Any]] = Field(None, description="Transformaciones de valores")
    response_mapping: Optional[Dict[str, str]] = Field(None, description="Mapeo de response (JSONB)")
    success_indicators: Optional[Dict[str, Any]] = Field(None, description="Indicadores de éxito")
    timeout_seconds: int = Field(default=30, ge=1, le=300, description="Timeout en segundos")
    headers: Optional[Dict[str, str]] = Field(None, description="Headers adicionales")
    is_active: bool = Field(default=True, description="Si el mapping está activo")
    
    @field_validator('http_method')
    @classmethod
    def validate_http_method(cls, v):
        valid_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        if v.upper() not in valid_methods:
            raise ValueError(f'http_method debe ser uno de: {valid_methods}')
        return v.upper()
    
    @field_validator('vendor_code')
    @classmethod
    def validate_vendor_code(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('vendor_code no puede estar vacío')
        return v.strip().upper()
    
    @field_validator('operation_type')
    @classmethod
    def validate_operation_type(cls, v):
        # Tipos de operaciones válidas
        valid_operations = [
            'provision',      # Provisionar servicio/producto
            'validation',     # Validar datos (número, cuenta, etc.)
            'reservation',    # Reservar/separar
            'query',          # Consultar estado
            'reversal',       # Revertir transacción
            'confirmation',   # Confirmar transacción
            'cancellation',   # Cancelar
            'balance_check'   # Verificar saldo
        ]
        
        if v.lower() not in valid_operations:
            raise ValueError(f'operation_type debe ser uno de: {valid_operations}')
        
        return v.strip().lower()
    
    @field_validator('mapping_code')
    @classmethod
    def validate_mapping_code(cls, v):
        if not v or len(v) != 5:
            raise ValueError('mapping_code debe tener exactamente 5 caracteres (ej: MAV01)')
        return v.strip().upper()


class VendorApiMappingCreate(VendorApiMappingBase):
    """
    Schema para crear un nuevo mapping
    """
    pass


class VendorApiMappingUpdate(BaseModel):
    """
    Schema para actualizar un mapping (todos los campos opcionales excepto mapping_code)
    """
    operation_type: Optional[str] = Field(None, max_length=50)
    http_method: Optional[str] = Field(None, max_length=10)
    endpoint_url: Optional[str] = Field(None, max_length=500)
    auth_type: Optional[str] = Field(None, max_length=50)
    auth_config: Optional[Dict[str, Any]] = None
    request_mapping: Optional[Dict[str, Any]] = None
    value_transformations: Optional[Dict[str, Any]] = None
    response_mapping: Optional[Dict[str, str]] = None
    success_indicators: Optional[Dict[str, Any]] = None
    timeout_seconds: Optional[int] = Field(None, ge=1, le=300)
    headers: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None


class VendorApiMappingResponse(VendorApiMappingBase):
    """
    Schema para response (incluye campos auto-generados)
    """
    mapping_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS PARA OPERATION TYPES
# ============================================================================

class OperationType(BaseModel):
    """
    Información sobre un tipo de operación
    """
    code: str
    name: str
    description: str
    typical_order: int  # Orden típico de ejecución
    is_critical: bool   # Si es crítica para el flujo


def get_available_operation_types() -> List[OperationType]:
    """
    Retorna lista de tipos de operaciones disponibles
    """
    return [
        OperationType(
            code="validation",
            name="Validación",
            description="Validar datos antes de provisionar (número telefónico, cuenta, etc.)",
            typical_order=1,
            is_critical=True
        ),
        OperationType(
            code="reservation",
            name="Reserva",
            description="Reservar o separar el producto/servicio antes de confirmar",
            typical_order=2,
            is_critical=False
        ),
        OperationType(
            code="provision",
            name="Provisionamiento",
            description="Provisionar el servicio o producto principal",
            typical_order=3,
            is_critical=True
        ),
        OperationType(
            code="confirmation",
            name="Confirmación",
            description="Confirmar la transacción después del provisionamiento",
            typical_order=4,
            is_critical=False
        ),
        OperationType(
            code="query",
            name="Consulta",
            description="Consultar estado de una transacción",
            typical_order=0,  # Se ejecuta bajo demanda
            is_critical=False
        ),
        OperationType(
            code="reversal",
            name="Reversión",
            description="Revertir una transacción fallida",
            typical_order=0,  # Se ejecuta bajo demanda
            is_critical=False
        ),
        OperationType(
            code="cancellation",
            name="Cancelación",
            description="Cancelar una transacción pendiente",
            typical_order=0,  # Se ejecuta bajo demanda
            is_critical=False
        ),
        OperationType(
            code="balance_check",
            name="Verificación de Saldo",
            description="Verificar saldo disponible del vendor",
            typical_order=0,  # Se ejecuta bajo demanda
            is_critical=False
        )
    ]


# ============================================================================
# SCHEMAS AUXILIARES
# ============================================================================

class AvailableField(BaseModel):
    """
    Schema para campos disponibles
    """
    field_name: str
    field_type: str
    description: str
    source: str  # "purchase" o "vendor_product"
    example: Optional[str] = None


class AvailableFieldsResponse(BaseModel):
    """
    Response con campos disponibles
    """
    purchase_fields: List[AvailableField]
    vendor_product_fields: List[AvailableField]


class TestMappingRequest(BaseModel):
    """
    Request para testear un mapping
    """
    test_data: Dict[str, Any] = Field(..., description="Datos de prueba")
    use_real_api: bool = Field(default=False, description="Usar API real o mock")


class TestMappingResponse(BaseModel):
    """
    Response del test de mapping
    """
    success: bool
    request_built: Dict[str, Any]
    response_received: Optional[Dict[str, Any]] = None
    response_parsed: Optional[Dict[str, Any]] = None
    errors: Optional[List[str]] = None
    execution_time_ms: float


# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

def get_available_purchase_fields() -> List[AvailableField]:
    """
    Retorna lista de campos disponibles de la tabla purchases
    """
    return [
        AvailableField(
            field_name="purchase_reference",
            field_type="string",
            description="Referencia única de la compra",
            source="purchase",
            example="PUR-20241229-ABC123"
        ),
        AvailableField(
            field_name="purchase_phone_number",
            field_type="string",
            description="Número de teléfono del cliente",
            source="purchase",
            example="+51987654321"
        ),
        AvailableField(
            field_name="purchase_account_number",
            field_type="string",
            description="Número de cuenta",
            source="purchase",
            example="123456789"
        ),
        AvailableField(
            field_name="purchase_total_amount",
            field_type="float",
            description="Monto total de la compra",
            source="purchase",
            example="50.00"
        ),
        AvailableField(
            field_name="purchase_currency",
            field_type="string",
            description="Moneda de la compra",
            source="purchase",
            example="PEN"
        ),
        AvailableField(
            field_name="purchase_vendor_amount",
            field_type="float",
            description="Monto a enviar al vendor",
            source="purchase",
            example="48.50"
        ),
        AvailableField(
            field_name="purchase_vendor_currency",
            field_type="string",
            description="Moneda del vendor",
            source="purchase",
            example="USD"
        ),
        AvailableField(
            field_name="purchase_vendor_purchase_id",
            field_type="string",
            description="ID de transacción del vendor",
            source="purchase",
            example="VND-12345"
        ),
        AvailableField(
            field_name="purchase_delivery_status",
            field_type="string",
            description="Estado de entrega",
            source="purchase",
            example="completed"
        ),
        AvailableField(
            field_name="purchase_vendor_date_response",
            field_type="datetime",
            description="Fecha de respuesta del vendor",
            source="purchase",
            example="2024-12-29T10:30:00"
        ),
        AvailableField(
            field_name="purchase_vendor_response_code",
            field_type="string",
            description="Código de respuesta del vendor",
            source="purchase",
            example="200"
        )
    ]


def get_available_vendor_product_fields() -> List[AvailableField]:
    """
    Retorna lista de campos disponibles de vendor_products
    """
    return [
        AvailableField(
            field_name="vp_skuid",
            field_type="string",
            description="SKU único del producto vendor",
            source="vendor_product",
            example="PE_BITEL_50_SKU"
        ),
        AvailableField(
            field_name="vp_code",
            field_type="string",
            description="Código del producto vendor",
            source="vendor_product",
            example="BITEL_50"
        ),
        AvailableField(
            field_name="vp_name",
            field_type="string",
            description="Nombre del producto vendor",
            source="vendor_product",
            example="Recarga Bitel S/50"
        ),
        AvailableField(
            field_name="vp_country",
            field_type="string",
            description="País del producto",
            source="vendor_product",
            example="PER"
        ),
        AvailableField(
            field_name="vp_operator",
            field_type="string",
            description="Operador del producto",
            source="vendor_product",
            example="bitel"
        ),
        AvailableField(
            field_name="vp_currency",
            field_type="string",
            description="Moneda del producto",
            source="vendor_product",
            example="PEN"
        ),
        AvailableField(
            field_name="vp_amount",
            field_type="float",
            description="Monto del producto",
            source="vendor_product",
            example="50.00"
        ),
        AvailableField(
            field_name="vp_product_type",
            field_type="int",
            description="Tipo de producto",
            source="vendor_product",
            example="1"
        )
    ]