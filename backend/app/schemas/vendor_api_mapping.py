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
    
    source_field puede ser:
    - Campo de purchase: purchase_reference, purchase_date, etc.
    - Campo de vendor_product: vp_operator, vp_country, etc.
    - Constante: constant:valor (ej: constant:MEX, constant:1, constant:true)
    
    Ejemplos:
    - source_field="purchase_phone_number" → Toma el valor del campo purchase_phone_number
    - source_field="constant:MEX" → Envía siempre el string "MEX"
    - source_field="constant:1" → Envía siempre el número 1
    - source_field="constant:true" → Envía siempre el booleano true
    """
    api_field: str = Field(..., description="Nombre del campo en la API del vendor")
    source_field: str = Field(..., description="Campo origen (purchase_*, vp_*, o constant:valor)")
    data_type: str = Field(..., description="Tipo de dato: string, float, int, boolean, date")
    required: bool = Field(default=True, description="Si el campo es obligatorio")
    default_value: Optional[Any] = Field(None, description="Valor por defecto si no existe")
    transformation: Optional[str] = Field(None, description="Transformación a aplicar")

    @field_validator('data_type')
    @classmethod
    def validate_data_type(cls, v):
        valid_types = ['string', 'float', 'int', 'decimal', 'boolean', 'date', 'datetime']
        if v not in valid_types:
            raise ValueError(f'data_type debe ser uno de: {valid_types}')
        return v

    @field_validator('source_field')
    @classmethod
    def validate_source_field(cls, v):
        # Puede ser: purchase_*, vp_*, o constant:*
        if not (v.startswith('purchase_') or v.startswith('vp_') or v.startswith('constant:')):
            raise ValueError('source_field debe empezar con purchase_, vp_, o constant:')
        
        # Si es constante, validar que tenga un valor después de ':'
        if v.startswith('constant:'):
            value_part = v[9:]  # Todo después de 'constant:'
            if not value_part or value_part.strip() == '':
                raise ValueError('constant: debe tener un valor (ej: constant:MEX)')
        
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
    api_group_code: str = Field(..., max_length=50, description="Código del grupo de APIs")  # ⭐ NUEVO
    operation_type: str = Field(..., max_length=50, description="Tipo de operación")
    mapping_code: str = Field(..., max_length=5, description="Código único del mapping (ej: VAL01)")
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

    @field_validator('api_group_code')  # ⭐ NUEVO
    @classmethod
    def validate_api_group_code(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('api_group_code no puede estar vacío')
        # Puede ser DT001, MP001, 001, etc.
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
            raise ValueError('mapping_code debe tener exactamente 5 caracteres (ej: VAL01)')
        return v.strip().upper()


class VendorApiMappingCreate(VendorApiMappingBase):
    """
    Schema para crear un nuevo mapping
    """
    pass


class VendorApiMappingUpdate(BaseModel):
    """
    Schema para actualizar un mapping (todos los campos opcionales)
    """
    api_group_code: Optional[str] = Field(None, max_length=50)  # ⭐ NUEVO
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
    request_fields: Campos disponibles para construir REQUEST al vendor
    response_fields: Campos disponibles para recibir RESPONSE del vendor
    """
    request_fields: List[AvailableField]
    response_fields: List[AvailableField]


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
    Retorna lista de campos disponibles para REQUEST MAPPING (enviar al vendor)
    Basado en: MAPEO_CAMPOS_PURCHASES_RESUMEN.xlsx - Columna "Considerado Lista Request"
    Total: 26 campos (según Excel oficial)
    """
    return [
        AvailableField(
            field_name="purchase_reference",
            field_type="string",
            description="Referencia única de la compra",
            source="purchase",
            example="REF-20260119-ABC123"
        ),
        AvailableField(
            field_name="purchase_date",
            field_type="datetime",
            description="Fecha y hora de la compra",
            source="purchase",
            example="2026-01-19T10:30:00"
        ),
        AvailableField(
            field_name="purchase_phone_number",
            field_type="string",
            description="Número de teléfono del cliente",
            source="purchase",
            example="+51987654321"
        ),
        AvailableField(
            field_name="purchase_currency",
            field_type="string",
            description="Moneda de la compra (USD, PEN, MXN, etc)",
            source="purchase",
            example="MXN"
        ),
        AvailableField(
            field_name="purchase_base_price",
            field_type="decimal",
            description="Precio base del producto",
            source="purchase",
            example="450.00"
        ),
        AvailableField(
            field_name="purchase_discount",
            field_type="decimal",
            description="Descuento aplicado",
            source="purchase",
            example="5.00"
        ),
        AvailableField(
            field_name="purchase_fee",
            field_type="decimal",
            description="Comisión o fee del servicio",
            source="purchase",
            example="2.50"
        ),
        AvailableField(
            field_name="purchase_total_amount",
            field_type="decimal",
            description="Monto total a pagar (base - descuento + fee)",
            source="purchase",
            example="447.50"
        ),
        AvailableField(
            field_name="purchase_payment_method",
            field_type="string",
            description="Método de pago (Credit Card, Debit Card, Barcode, etc.)",
            source="purchase",
            example="Credit Card"
        ),
        AvailableField(
            field_name="purchase_delivery_status",
            field_type="string",
            description="Estado de entrega del servicio",
            source="purchase",
            example="pending"
        ),
        AvailableField(
            field_name="purchase_delivery_phone",
            field_type="string",
            description="Teléfono de entrega (para smartphones)",
            source="purchase",
            example="+51912345678"
        ),
        AvailableField(
            field_name="purchase_delivery_name",
            field_type="string",
            description="Nombre del destinatario (para smartphones)",
            source="purchase",
            example="Juan Pérez"
        ),
        AvailableField(
            field_name="purchase_delivery_address",
            field_type="string",
            description="Dirección de entrega (para smartphones)",
            source="purchase",
            example="Av. Principal 123, Lima"
        ),
        AvailableField(
            field_name="purchase_receip_url",
            field_type="string",
            description="URL de la imagen del recibo",
            source="purchase",
            example="https://cdn.latconecta.com/receipts/12345.pdf"
        ),
        AvailableField(
            field_name="purchase_account_number",
            field_type="string",
            description="Número de cuenta a pagar (para bill payment)",
            source="purchase",
            example="333333333333333"
        ),
        AvailableField(
            field_name="purchase_vendor_code",
            field_type="string",
            description="Código del vendor (LATCOM, DTONE, etc)",
            source="purchase",
            example="LATCOM"
        ),
        AvailableField(
            field_name="purchase_product_type",
            field_type="string",
            description="Tipo de producto del vendor",
            source="purchase",
            example="bill_payment"
        ),
        AvailableField(
            field_name="purchase_vendpro_code",
            field_type="string",
            description="Código de producto en el vendor",
            source="purchase",
            example="LTBILL001"
        ),
        AvailableField(
            field_name="purchase_vendor_skuid",
            field_type="string",
            description="SKU del producto en el vendor",
            source="purchase",
            example="LTBILLSKU1"
        ),
        AvailableField(
            field_name="purchase_vendpro_country",
            field_type="string",
            description="País del producto (del vendor)",
            source="purchase",
            example="MEX"
        ),
        AvailableField(
            field_name="purchase_vendpro_operator",
            field_type="string",
            description="Operador del producto (del vendor)",
            source="purchase",
            example="Latamgroup"
        ),
        AvailableField(
            field_name="purchase_vendpro_product_type",
            field_type="string",
            description="Tipo de producto del vendor (1 o 2)",
            source="purchase",
            example="2"
        ),
        AvailableField(
            field_name="purchase_vendpro_amount_type",
            field_type="string",
            description="Tipo de monto del vendor product (F/R/V)",
            source="purchase",
            example="R"
        ),
        AvailableField(
            field_name="purchase_vendpro_maximum_amount",
            field_type="decimal",
            description="Monto máximo permitido del vendor product",
            source="purchase",
            example="1000.00"
        ),
        AvailableField(
            field_name="purchase_vendor_currency",
            field_type="string",
            description="Moneda en la que cobra el vendor",
            source="purchase",
            example="MXN"
        ),
        AvailableField(
            field_name="purchase_vendor_amount",
            field_type="decimal",
            description="Monto que se paga al vendor",
            source="purchase",
            example="450.00"
        ),
        AvailableField(
            field_name="purchase_vendor_cost",
            field_type="decimal",
            description="Costo del producto para nosotros",
            source="purchase",
            example="445.00"
        ),
        AvailableField(
            field_name="purchase_exch_rate",
            field_type="decimal",
            description="Tipo de cambio aplicado",
            source="purchase",
            example="19.50"
        ),
        AvailableField(
            field_name="vendor_name",
            field_type="string",
            description="Nombre del vendor",
            source="purchase",
            example="LATCOM"
        )
    ]


def get_available_vendor_product_fields() -> List[AvailableField]:
    """
    Retorna lista de campos disponibles para RESPONSE MAPPING (recibir del vendor)
    Basado en: MAPEO_CAMPOS_PURCHASES_RESUMEN.xlsx - Columna "Considerado Lista Response"
    Total: 21 campos (20 del Excel + purchase_vendor_amount agregado)
    
    Nota: purchase_vendor_amount se incluye en RESPONSE porque puede ser actualizado
    por el vendor con el monto final confirmado.
    """
    return [
        AvailableField(
            field_name="purchase_payment_status",
            field_type="string",
            description="Estado del pago (Success, Failed, Pending)",
            source="purchase",
            example="Success"
        ),
        AvailableField(
            field_name="purchase_payment_ref",
            field_type="string",
            description="Referencia del pago",
            source="purchase",
            example="PAY-20260119-XYZ789"
        ),
        AvailableField(
            field_name="purchase_credit_card_last_digits",
            field_type="string",
            description="Últimos 4 dígitos de la tarjeta",
            source="purchase",
            example="1234"
        ),
        AvailableField(
            field_name="purchase_barcode_code",
            field_type="string",
            description="Código de barras generado",
            source="purchase",
            example="BAR123456789"
        ),
        AvailableField(
            field_name="purchase_barcode_image",
            field_type="string",
            description="URL de la imagen del código de barras",
            source="purchase",
            example="https://storage.com/barcodes/BAR123456789.png"
        ),
        AvailableField(
            field_name="purchase_delivery_status",
            field_type="string",
            description="Estado de entrega/provisión del servicio",
            source="purchase",
            example="Success"
        ),
        AvailableField(
            field_name="purchase_provision_ref",
            field_type="string",
            description="Referencia de la provisión del vendor",
            source="purchase",
            example="PROV-VND-12345"
        ),
        AvailableField(
            field_name="purchase_reversal_ref",
            field_type="string",
            description="Referencia de reversión (si aplica)",
            source="purchase",
            example="REV-VND-67890"
        ),
        AvailableField(
            field_name="purchase_vendor_json",
            field_type="string",
            description="JSON completo de la respuesta del vendor (para auditoría)",
            source="purchase",
            example='{"status": "success", "transaction_id": "TXN123"}'
        ),
        AvailableField(
            field_name="purchase_vendor_date_petition",
            field_type="datetime",
            description="Fecha y hora del request al vendor",
            source="purchase",
            example="2026-01-19T10:30:00"
        ),
        AvailableField(
            field_name="purchase_vendor_date_response",
            field_type="datetime",
            description="Fecha y hora de la respuesta del vendor",
            source="purchase",
            example="2026-01-19T10:30:02"
        ),
        AvailableField(
            field_name="purchase_vendor_response_code",
            field_type="string",
            description="Código de respuesta del vendor",
            source="purchase",
            example="200"
        ),
        AvailableField(
            field_name="purchase_vendor_response_description",
            field_type="string",
            description="Descripción de la respuesta del vendor",
            source="purchase",
            example="Transaction completed successfully"
        ),
        AvailableField(
            field_name="purchase_vendor_purchase_id",
            field_type="string",
            description="ID de la compra en el sistema del vendor",
            source="purchase",
            example="VND-PURCHASE-98765"
        ),
        AvailableField(
            field_name="purchase_vendor_amount",
            field_type="decimal",
            description="Monto confirmado por el vendor (puede actualizarse en response)",
            source="purchase",
            example="450.00"
        ),
        AvailableField(
            field_name="purchase_status",
            field_type="string",
            description="Estado general de la compra (Success, Failed, Pending)",
            source="purchase",
            example="Success"
        ),
        AvailableField(
            field_name="vendor_name",
            field_type="string",
            description="Nombre del vendor",
            source="purchase",
            example="LATCOM"
        ),
        AvailableField(
            field_name="vendor_trans_id",
            field_type="string",
            description="Transaction ID del vendor",
            source="purchase",
            example="TXN-LATCOM-12345"
        ),
        AvailableField(
            field_name="vendor_provider_trans_id",
            field_type="string",
            description="Transaction ID del proveedor final (si aplica)",
            source="purchase",
            example="PROV-TXN-67890"
        ),
        AvailableField(
            field_name="vendor_request",
            field_type="string",
            description="JSON del request enviado al vendor (para auditoría)",
            source="purchase",
            example='{"phone": "+51987654321", "amount": 50}'
        ),
        AvailableField(
            field_name="vendor_response",
            field_type="string",
            description="JSON de la respuesta del vendor (para auditoría)",
            source="purchase",
            example='{"status": "success", "transaction_id": "TXN123"}'
        )
    ]


# ============================================================================
# FUNCIÓN AUXILIAR PARA ENDPOINT
# ============================================================================

def get_available_request_fields() -> List[AvailableField]:
    """Alias para get_available_purchase_fields - Campos para REQUEST"""
    return get_available_purchase_fields()


def get_available_response_fields() -> List[AvailableField]:
    """Alias para get_available_vendor_product_fields - Campos para RESPONSE"""
    return get_available_vendor_product_fields()