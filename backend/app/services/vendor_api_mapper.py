# ========================================
# VENDOR API MAPPER
# Motor de transformación configurable
# NO REQUIERE CÓDIGO NUEVO POR VENDOR
# ========================================

from typing import Dict, Any, List, Optional
from collections import OrderedDict
import json
import re
from decimal import Decimal

class VendorAPIMapper:
    """
    Motor que transforma datos de Latconecta a formato de vendor API
    basado en configuración de BD
    """

    def __init__(self, mapping_config: Dict[str, Any]):
        """
        Args:
            mapping_config: Configuración del mapping desde BD
        """
        self.mapping_config = mapping_config
        # ✅ CORREGIDO: Manejar None explícitamente
        self.request_mapping = mapping_config.get('request_mapping') or {}
        self.value_transformations = mapping_config.get('value_transformations') or {}

    def build_request(self, source_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Construye el request JSON para el vendor

        Args:
            source_data: Datos de purchase + vendor product

        Returns:
            JSON formateado para el vendor (con orden preservado)
        """
        # Usar OrderedDict para preservar orden
        request = OrderedDict()

        # Procesar cada campo según configuración
        fields = self.request_mapping.get('fields', [])

        for field_config in fields:
            api_field = field_config['api_field']
            source_field = field_config['source_field']
            data_type = field_config.get('data_type', 'string')
            required = field_config.get('required', False)

            # Obtener valor del source
            value = source_data.get(source_field)

            # Aplicar transformaciones
            value = self._apply_transformations(
                value,
                source_field,
                source_data
            )

            # Convertir tipo de dato
            value = self._convert_type(value, data_type)

            # Validar si es requerido
            if required and value is None:
                raise ValueError(f"Campo requerido '{source_field}' no encontrado")

            # Agregar al request (maneja campos anidados)
            self._set_nested_field(request, api_field, value)

        return request

    def _apply_transformations(
        self,
        value: Any,
        field_name: str,
        source_data: Dict[str, Any]
    ) -> Any:
        """
        Aplica transformaciones configuradas a un valor
        """
        # ✅ CORREGIDO: Verificar que value_transformations no sea None
        if not self.value_transformations or field_name not in self.value_transformations:
            return value

        transformations = self.value_transformations[field_name]

        # Trim
        if transformations.get('trim') and isinstance(value, str):
            value = value.strip()

        # Remove spaces
        if transformations.get('remove_spaces') and isinstance(value, str):
            value = value.replace(' ', '')

        # Format number
        if 'format' in transformations:
            if isinstance(value, (int, float, Decimal)):
                format_str = transformations['format']
                value = format_str % float(value)

        # To string
        if transformations.get('to_string'):
            value = str(value)

        # To integer
        if transformations.get('to_integer'):
            value = int(float(value))

        # Add country prefix
        if transformations.get('add_country_prefix'):
            country_source = transformations.get('country_source')
            if country_source:
                country_code = source_data.get(country_source, '')
                country_prefix = self._get_country_prefix(country_code)
                value = f"{country_prefix}{value}"

        # Strip country code
        if transformations.get('strip_country_code'):
            # Eliminar prefijos comunes: +51, 51, etc.
            value = re.sub(r'^\+?\d{1,3}', '', str(value))

        return value

    def _convert_type(self, value: Any, data_type: str) -> Any:
        """
        Convierte valor al tipo de dato especificado
        """
        if value is None:
            return None

        if data_type == 'string':
            return str(value)
        elif data_type == 'integer':
            return int(float(value))
        elif data_type == 'float':
            return float(value)
        elif data_type == 'boolean':
            return bool(value)
        else:
            return value

    def _set_nested_field(
        self,
        target: OrderedDict,
        field_path: str,
        value: Any
    ):
        """
        Establece valor en campo anidado (ej: 'recipientPhone.number')
        """
        if '.' not in field_path:
            # Campo simple
            target[field_path] = value
        else:
            # Campo anidado
            parts = field_path.split('.')
            current = target

            # Navegar/crear estructura anidada
            for part in parts[:-1]:
                if part not in current:
                    current[part] = OrderedDict()
                current = current[part]

            # Establecer valor final
            current[parts[-1]] = value

    def _get_country_prefix(self, country_code: str) -> str:
        """
        Obtiene prefijo telefónico por código de país
        """
        prefixes = {
            'PE': '51',
            'MX': '52',
            'CO': '57',
            'US': '1',
            'BR': '55',
            # Agregar más según necesidad
        }
        return prefixes.get(country_code.upper(), '')

    def parse_response(self, vendor_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parsea respuesta del vendor a formato Latconecta
        """
        # ✅ CORREGIDO: Manejar None en response_mapping
        response_mapping = self.mapping_config.get('response_mapping') or {}
        parsed = {}

        for vendor_field, latconecta_field in response_mapping.items():
            value = self._get_nested_value(vendor_response, vendor_field)
            if value is not None:
                parsed[latconecta_field] = value

        return parsed

    def _get_nested_value(self, data: Dict[str, Any], field_path: str) -> Any:
        """
        Obtiene valor de campo anidado
        """
        if '.' not in field_path:
            return data.get(field_path)

        parts = field_path.split('.')
        current = data

        for part in parts:
            if isinstance(current, dict):
                current = current.get(part)
            else:
                return None

        return current

    def is_success_response(
        self,
        status_code: int,
        response_data: Dict[str, Any]
    ) -> bool:
        """
        Determina si la respuesta es exitosa
        """
        # ✅ CORREGIDO: Manejar None en success_indicators
        success_config = self.mapping_config.get('success_indicators') or {}

        # Verificar status code
        valid_codes = success_config.get('status_codes', [200])
        if status_code not in valid_codes:
            return False

        # Verificar campo de éxito en response
        success_field = success_config.get('success_field')
        if success_field:
            success_values = success_config.get('success_values', [])
            actual_value = self._get_nested_value(response_data, success_field)
            return actual_value in success_values

        return True


# ========================================
# EJEMPLO DE USO
# ========================================

if __name__ == "__main__":

    # Simular configuración desde BD (DTone)
    dtone_config = {
        "request_mapping": {
            "fields": [
                {"api_field": "phone_number", "source_field": "purchase_phone_number", "data_type": "string", "required": True},
                {"api_field": "product_sku", "source_field": "vp_skuid", "data_type": "string", "required": True},
                {"api_field": "amount", "source_field": "purchase_vendor_amount", "data_type": "float", "required": True},
                {"api_field": "currency", "source_field": "purchase_vendor_currency", "data_type": "string", "required": True},
                {"api_field": "reference", "source_field": "purchase_reference", "data_type": "string", "required": True}
            ]
        },
        "value_transformations": {
            "purchase_phone_number": {"trim": True, "remove_spaces": True},
            "purchase_vendor_amount": {"format": "%.2f"}
        },
        "response_mapping": {
            "transaction_id": "purchase_vendor_purchase_id",
            "status": "purchase_delivery_status"
        },
        "success_indicators": {
            "status_codes": [200, 201],
            "success_field": "status",
            "success_values": ["SUCCESS"]
        }
    }

    # Datos de compra
    purchase_data = {
        "purchase_phone_number": " 999 888 777 ",
        "vp_skuid": "SKU_001",
        "purchase_vendor_amount": 50.0,
        "purchase_vendor_currency": "PEN",
        "purchase_reference": "REF-12345"
    }

    # Crear mapper
    mapper = VendorAPIMapper(dtone_config)

    # Generar request
    request = mapper.build_request(purchase_data)

    print("Request generado:")
    print(json.dumps(request, indent=2))
    # Output:
    # {
    #   "phone_number": "999888777",
    #   "product_sku": "SKU_001",
    #   "amount": 50.0,
    #   "currency": "PEN",
    #   "reference": "REF-12345"
    # }

    # Simular respuesta del vendor
    vendor_response = {
        "transaction_id": "VENDOR-123456",
        "status": "SUCCESS",
        "timestamp": "2025-12-26T10:00:00Z"
    }

    # Parsear respuesta
    parsed = mapper.parse_response(vendor_response)
    print("\nRespuesta parseada:")
    print(json.dumps(parsed, indent=2))
    # Output:
    # {
    #   "purchase_vendor_purchase_id": "VENDOR-123456",
    #   "purchase_delivery_status": "SUCCESS"
    # }

    # Verificar éxito
    is_success = mapper.is_success_response(200, vendor_response)
    print(f"\n¿Exitoso? {is_success}")