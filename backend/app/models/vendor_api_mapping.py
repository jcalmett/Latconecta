"""
Modelo VendorApiMapping - Configuración de mapeos de APIs de vendors
Define cómo mapear campos entre purchases y APIs de vendors
"""
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class VendorApiMapping(Base):
    """
    Modelo de configuración de mapeos de APIs

    Almacena la configuración de cómo comunicarse con APIs de vendors:
    - Códigos identificadores
    - Grupo de APIs (api_group_code)
    - URLs y métodos HTTP
    - Autenticación
    - Mapeo de request (Purchase → Vendor API)
    - Mapeo de response (Vendor API → Purchase)
    """
    __tablename__ = "vendor_api_mappings"

    # =========================================================================
    # PRIMARY KEYS
    # =========================================================================
    mapping_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mapping_code = Column(String(5), unique=True, nullable=False, index=True)

    # =========================================================================
    # CONFIGURACIÓN BÁSICA
    # =========================================================================
    vendor_code = Column(String(50), nullable=False, index=True)
    api_group_code = Column(String(50), nullable=False, index=True)  # ⭐ NUEVO
    operation_type = Column(String(50), nullable=False)  # validation, provision, query, reversal, etc
    http_method = Column(String(10), default='POST')     # POST, GET, PUT, PATCH
    endpoint_url = Column(String(500))                   # /api/v1/topup

    # =========================================================================
    # AUTENTICACIÓN
    # =========================================================================
    auth_type = Column(String(50))          # bearer, apikey, basic, none
    auth_config = Column(JSONB)             # Configuración de auth en JSON

    # =========================================================================
    # MAPEOS (JSONB)
    # =========================================================================
    request_mapping = Column(JSONB, nullable=False)      # Purchase → Vendor API
    value_transformations = Column(JSONB)                # Transformaciones de valores
    response_mapping = Column(JSONB)                     # Vendor API → Purchase
    success_indicators = Column(JSONB)                   # Cómo detectar éxito

    # =========================================================================
    # CONFIGURACIÓN ADICIONAL
    # =========================================================================
    timeout_seconds = Column(Integer, default=30)
    headers = Column(JSONB)                 # Headers HTTP adicionales
    is_active = Column(Boolean, default=True)

    # =========================================================================
    # AUDITORÍA
    # =========================================================================
    created_at = Column(TIMESTAMP, default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())

    def __repr__(self):
        return (
            f"<VendorApiMapping("
            f"code={self.mapping_code}, "
            f"vendor={self.vendor_code}, "
            f"group={self.api_group_code}, "  # ⭐ NUEVO
            f"operation={self.operation_type}, "
            f"active={self.is_active}"
            f")>"
        )

    @property
    def is_configured(self) -> bool:
        """Verificar si el mapping está completamente configurado"""
        return (
            self.mapping_code is not None and
            self.vendor_code is not None and
            self.api_group_code is not None and  # ⭐ NUEVO
            self.operation_type is not None and
            self.request_mapping is not None
        )

    @property
    def request_fields_count(self) -> int:
        """Contar campos del request mapping"""
        if not self.request_mapping or 'fields' not in self.request_mapping:
            return 0
        return len(self.request_mapping.get('fields', []))

    @property
    def response_fields_count(self) -> int:
        """Contar campos del response mapping"""
        if not self.response_mapping:
            return 0
        return len(self.response_mapping.keys())

    def to_dict(self) -> dict:
        """Convertir a diccionario"""
        return {
            'mapping_id': self.mapping_id,
            'mapping_code': self.mapping_code,
            'vendor_code': self.vendor_code,
            'api_group_code': self.api_group_code,  # ⭐ NUEVO
            'operation_type': self.operation_type,
            'http_method': self.http_method,
            'endpoint_url': self.endpoint_url,
            'auth_type': self.auth_type,
            'request_mapping': self.request_mapping,
            'response_mapping': self.response_mapping,
            'timeout_seconds': self.timeout_seconds,
            'is_active': self.is_active,
            'is_configured': self.is_configured,
            'request_fields_count': self.request_fields_count,
            'response_fields_count': self.response_fields_count
        }

    def build_api_request(self, source_data: dict) -> dict:
        """
        Construir request para API del vendor basado en mapping

        Args:
            source_data: Datos fuente (de purchase y vendor_product)

        Returns:
            dict: Request construido según el mapping
        """
        if not self.request_mapping or 'fields' not in self.request_mapping:
            return {}

        api_request = {}

        for field_config in self.request_mapping['fields']:
            source_field = field_config.get('source_field')
            api_field = field_config.get('api_field')

            if source_field in source_data:
                api_request[api_field] = source_data[source_field]

        return api_request

    def parse_api_response(self, api_response: dict) -> dict:
        """
        Parsear response del vendor según mapping

        Args:
            api_response: Response del vendor

        Returns:
            dict: Datos mapeados a campos de purchase
        """
        if not self.response_mapping:
            return {}

        parsed_data = {}

        for api_field, purchase_field in self.response_mapping.items():
            if api_field in api_response:
                parsed_data[purchase_field] = api_response[api_field]

        return parsed_data