# ========================================
# VENDOR API MAPPER
# Motor de transformación configurable
# NO REQUIERE CÓDIGO NUEVO POR VENDOR
# ✅ ACTUALIZADO: Soporta formato JSONPath
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
        ✅ ACTUALIZADO: Detecta automáticamente el formato

        Args:
            source_data: Datos de purchase + vendor product

        Returns:
            JSON formateado para el vendor (con orden preservado)
        """
        # ✅ NUEVO: Detectar formato del request_mapping
        if 'fields' in self.request_mapping:
            # Formato VIEJO (con fields array)
            return self._build_request_old_format(source_data)
        else:
            # Formato NUEVO (JSONPath: {"source_field": "$.target_field"})
            return self._build_request_jsonpath_format(source_data)

    def _build_request_old_format(self, source_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Formato viejo con fields array
        """
        request = OrderedDict()
        fields = self.request_mapping.get('fields', [])

        for field_config in fields:
            api_field = field_config['api_field']
            source_field = field_config['source_field']
            data_type = field_config.get('data_type', 'string')
            required = field_config.get('required', False)

            # ✅ NUEVO: Soporte para constant:valor
            if source_field.startswith('constant:'):
                # Extraer el valor de la constante
                constant_value = source_field.split(':', 1)[1]
                # Convertir al tipo correcto
                if data_type == 'integer':
                    value = int(constant_value)
                elif data_type == 'float':
                    value = float(constant_value)
                elif data_type == 'boolean':
                    value = constant_value.lower() in ('true', '1', 'yes')
                else:
                    value = constant_value
            else:
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

    def _build_request_jsonpath_format(self, source_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        ✅ NUEVO: Formato JSONPath: {"source_field": "$.target_field"}
        """
        request = OrderedDict()

        for source_field, jsonpath in self.request_mapping.items():
            # Extraer target_field del JSONPath ($.target_field → target_field)
            if jsonpath.startswith('$.'):
                target_field = jsonpath[2:]  # Remover "$."
            else:
                target_field = jsonpath

            # ✅ NUEVO: Soporte para constant:valor
            if source_field.startswith('constant:'):
                # Extraer el valor de la constante
                constant_value = source_field.split(':', 1)[1]
                value = constant_value
            else:
                # Obtener valor del source
                value = source_data.get(source_field)

            # Aplicar transformaciones si existen
            value = self._apply_transformations(
                value,
                source_field,
                source_data
            )

            # Solo agregar si el valor no es None
            if value is not None:
                self._set_nested_field(request, target_field, value)

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
        
        El response_mapping tiene formato:
        {
          "vendor_field": "latconecta_field",
          "trans_id": "vendor_trans_id",
          "status": "purchase_status"
        }
        
        Donde KEY = campo en response del vendor
              VALUE = campo destino en Latconecta
        """
        # ✅ CORREGIDO: Manejar None en response_mapping
        response_mapping = self.mapping_config.get('response_mapping') or {}
        parsed = {}

        # Iterar sobre el mapeo: vendor_field -> latconecta_field
        for vendor_field, latconecta_field in response_mapping.items():
            # Obtener valor del response del vendor
            value = self._get_nested_value(vendor_response, vendor_field)
            if value is not None:
                # Guardar con el nombre del campo de Latconecta
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
        ✅ ACTUALIZADO: Maneja formato JSONPath
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
            # ✅ NUEVO: Extraer campo del JSONPath si aplica
            if isinstance(success_field, str) and success_field.startswith('$.'):
                success_field = success_field[2:]
            
            success_values = success_config.get('success_values', [])
            actual_value = self._get_nested_value(response_data, success_field)
            return actual_value in success_values

        return True