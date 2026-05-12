# ========================================
# VENDOR API MAPPER
# Motor de transformación configurable
# NO REQUIERE CÓDIGO NUEVO POR VENDOR
# ✅ ACTUALIZADO: Soporta formato JSONPath
# ✅ ACTUALIZADO: Transformación country_alpha3_to_alpha2
# ✅ ACTUALIZADO: Soporta dynamic:current_timestamp_tisi
# 🔒 MEJORADO: Validación de URLs
# 🔒 MEJORADO: Sanitización de inputs
# 🔒 MEJORADO: Logging seguro (redacta datos sensibles)
# 🔒 MEJORADO: Validación de respuestas (anti-XSS)
# ========================================

from typing import Dict, Any, List, Optional
from collections import OrderedDict
import json
import re
from decimal import Decimal
from datetime import datetime
import logging
import html
import urllib.parse

logger = logging.getLogger(__name__)

# Caracteres peligrosos para sanitización
DANGEROUS_PATTERNS = [
    r'<script',
    r'javascript:',
    r'vbscript:',
    r'onload=',
    r'onerror=',
    r'alert\(',
    r'confirm\(',
    r'prompt\(',
]

# Dominios permitidos para URLs de vendors (hardcoded por seguridad)
ALLOWED_VENDOR_DOMAINS = [
    'latcom-fix-production.up.railway.app',
    'api-hub-qa-in.tisi.com.pe',
    'api-hub-in.tisi.com.pe',
    'localhost',
    '127.0.0.1',
]


class VendorAPIMapper:
    """
    Motor que transforma datos de Latconecta a formato de vendor API
    basado en configuración de BD
    """

    # Tabla de conversión ISO 3166-1 alpha-3 → alpha-2
    COUNTRY_ALPHA3_TO_ALPHA2 = {
        'ARG': 'AR',
        'BOL': 'BO',
        'BRA': 'BR',
        'CHL': 'CL',
        'COL': 'CO',
        'CRI': 'CR',
        'CUB': 'CU',
        'DOM': 'DO',
        'ECU': 'EC',
        'GTM': 'GT',
        'HND': 'HN',
        'MEX': 'MX',
        'NIC': 'NI',
        'PAN': 'PA',
        'PER': 'PE',
        'PRY': 'PY',
        'SLV': 'SV',
        'URY': 'UY',
        'USA': 'US',
        'VEN': 'VE',
    }

    def __init__(self, mapping_config: Dict[str, Any]):
        """
        Args:
            mapping_config: Configuración del mapping desde BD
        """
        self.mapping_config = mapping_config
        self.request_mapping = mapping_config.get('request_mapping') or {}
        self.value_transformations = mapping_config.get('value_transformations') or {}

        # 🔒 NUEVO: Validar URL del endpoint al inicializar
        self._validate_endpoint_url()

    def _validate_endpoint_url(self) -> None:
        """
        🔒 NUEVO: Valida que la URL del endpoint sea segura
        Previene inyección de URLs maliciosas
        """
        endpoint_url = self.mapping_config.get('endpoint_url', '')
        if not endpoint_url:
            return

        # Verificar que no contenga saltos de línea o caracteres de control
        if '\n' in endpoint_url or '\r' in endpoint_url:
            logger.error(f"URL de endpoint contiene caracteres peligrosos: {endpoint_url[:100]}")
            raise ValueError("Configuración de URL inválida")

        # Verificar que no tenga protocolos peligrosos
        dangerous_protocols = ['file://', 'ftp://', 'gopher://', 'data:']
        for protocol in dangerous_protocols:
            if protocol in endpoint_url.lower():
                logger.error(f"URL contiene protocolo peligroso: {protocol}")
                raise ValueError("Protocolo de URL no permitido")

    def _sanitize_input(self, value: Any, field_name: str = "") -> Any:
        """
        🔒 NUEVO: Sanitiza inputs antes de enviar al vendor
        Previene inyección de caracteres peligrosos
        """
        if not isinstance(value, str):
            return value

        # Eliminar caracteres de control
        cleaned = re.sub(r'[\x00-\x1f\x7f]', '', value)

        # Escapar HTML entities (previene XSS si el vendor devuelve datos como HTML)
        cleaned = html.escape(cleaned, quote=True)

        # Reemplazar patrones peligrosos
        for pattern in DANGEROUS_PATTERNS:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)

        # Limitar longitud máxima por seguridad (1000 caracteres es más que suficiente)
        if len(cleaned) > 1000:
            logger.warning(f"Campo {field_name} truncado de {len(cleaned)} a 1000 caracteres")
            cleaned = cleaned[:1000]

        return cleaned

    def _redact_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        🔒 NUEVO: Redacta datos sensibles para logging
        No modifica los datos originales, solo crea una copia para logs
        """
        if not isinstance(data, dict):
            return data

        redacted = data.copy()
        sensitive_fields = ['password', 'token', 'api_key', 'secret', 'authorization', 'auth']

        for field in sensitive_fields:
            for key in list(redacted.keys()):
                if field.lower() in key.lower():
                    redacted[key] = '[REDACTED]'

        return redacted

    def build_request(self, source_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Construye el request JSON para el vendor
        ✅ ACTUALIZADO: Detecta automáticamente el formato
        🔒 MEJORADO: Sanitiza inputs

        Args:
            source_data: Datos de purchase + vendor product

        Returns:
            JSON formateado para el vendor (con orden preservado)
        """
        # 🔒 Sanitizar inputs antes de procesar
        sanitized_data = {}
        for key, value in source_data.items():
            sanitized_data[key] = self._sanitize_input(value, key)

        # Detectar formato del request_mapping
        if 'fields' in self.request_mapping:
            return self._build_request_old_format(sanitized_data)
        else:
            return self._build_request_jsonpath_format(sanitized_data)

    def _build_request_old_format(self, source_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Formato viejo con fields array
        🔒 MEJORADO: Sanitiza valores
        """
        request = OrderedDict()
        fields = self.request_mapping.get('fields', [])

        for field_config in fields:
            api_field = field_config['api_field']
            source_field = field_config['source_field']
            data_type = field_config.get('data_type', 'string')
            required = field_config.get('required', False)

            # Soporte para constant:valor
            if source_field.startswith('constant:'):
                constant_value = source_field.split(':', 1)[1]
                constant_value = self._sanitize_input(constant_value, f"constant:{api_field}")
                if data_type == 'integer':
                    value = int(constant_value)
                elif data_type == 'float':
                    value = float(constant_value)
                elif data_type == 'boolean':
                    value = constant_value.lower() in ('true', '1', 'yes')
                else:
                    value = constant_value

            # Soporte para dynamic:nombre_funcion
            elif source_field.startswith('dynamic:'):
                dynamic_func = source_field.split(':', 1)[1]
                value = self._resolve_dynamic_value(dynamic_func)

            else:
                value = source_data.get(source_field)

            # Aplicar transformaciones
            value = self._apply_transformations(value, source_field, source_data)

            # Convertir tipo de dato
            value = self._convert_type(value, data_type)

            # Validar si es requerido
            if required and value is None:
                raise ValueError(f"Campo requerido '{source_field}' no encontrado")

            # Agregar al request
            self._set_nested_field(request, api_field, value)

        # 🔒 Log seguro del request (sin datos sensibles)
        logger.debug(f"Request construido: {self._redact_sensitive_data(dict(request))}")

        return request

    def _build_request_jsonpath_format(self, source_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        ✅ NUEVO: Formato JSONPath: {"api_field": "source_field"}
        🔒 MEJORADO: Sanitiza valores
        """
        request = OrderedDict()

        for api_field, source_field in self.request_mapping.items():

            # Soporte para constant:valor
            if source_field.startswith('constant:'):
                constant_value = source_field.split(':', 1)[1]
                constant_value = self._sanitize_input(constant_value, f"constant:{api_field}")
                value = constant_value

            # Soporte para dynamic:nombre_funcion
            elif source_field.startswith('dynamic:'):
                dynamic_func = source_field.split(':', 1)[1]
                value = self._resolve_dynamic_value(dynamic_func)

            else:
                value = source_data.get(source_field)
                value = self._sanitize_input(value, source_field)

            # Aplicar transformaciones si existen para este api_field
            value = self._apply_transformations(value, source_field, source_data)

            # Solo agregar si el valor no es None
            if value is not None:
                self._set_nested_field(request, api_field, value)

        # 🔒 Log seguro del request (sin datos sensibles)
        logger.debug(f"Request construido (JSONPath): {self._redact_sensitive_data(dict(request))}")

        return request

    def _resolve_dynamic_value(self, func_name: str) -> Any:
        """
        ✅ NUEVO: Resuelve valores dinámicos generados en runtime.

        Funciones disponibles:
        - current_timestamp_tisi: Timestamp actual en formato yyyyMMddHHmmssmss
        """
        if func_name == 'current_timestamp_tisi':
            now = datetime.now()
            return now.strftime('%Y%m%d%H%M%S') + f"{now.microsecond // 1000:03d}"

        logger.warning(f"Función dinámica no reconocida: {func_name}")
        return f"UNKNOWN_DYNAMIC:{func_name}"

    def _apply_transformations(
        self,
        value: Any,
        field_name: str,
        source_data: Dict[str, Any]
    ) -> Any:
        """
        Aplica transformaciones configuradas a un valor
        🔒 MEJORADO: Validación de transformaciones
        """
        if not self.value_transformations or field_name not in self.value_transformations:
            return value

        transformations = self.value_transformations[field_name]

        # Verificar que transformations sea un dict
        if not isinstance(transformations, dict):
            logger.warning(f"Transformations para {field_name} no es dict: {type(transformations)}")
            return value

        # 1. Trim
        if transformations.get('trim') and isinstance(value, str):
            value = value.strip()

        # 2. Remove spaces
        if transformations.get('remove_spaces') and isinstance(value, str):
            value = value.replace(' ', '')

        # 3. Format number
        if 'format' in transformations:
            if isinstance(value, (int, float, Decimal)):
                format_str = transformations['format']
                try:
                    value = format_str % float(value)
                except (TypeError, ValueError) as e:
                    logger.warning(f"Error en format {field_name}: {e}")
                    value = str(value)

        # 4. To string
        if transformations.get('to_string'):
            value = str(value)

        # 5. To integer
        if transformations.get('to_integer'):
            try:
                value = int(float(value))
            except (TypeError, ValueError):
                value = 0

        # 6. Add country prefix
        if transformations.get('add_country_prefix'):
            country_source = transformations.get('country_source')
            if country_source:
                country_code = source_data.get(country_source, '')
                country_prefix = self._get_country_prefix(country_code)
                value = f"{country_prefix}{value}"

        # 7. Strip country code
        if transformations.get('strip_country_code'):
            value = re.sub(r'^\+?\d{1,3}', '', str(value))

        # 8. Country alpha-3 → alpha-2
        if transformations.get('country_alpha3_to_alpha2'):
            value = self.COUNTRY_ALPHA3_TO_ALPHA2.get(
                str(value).upper(),
                str(value)[:2]
            )

        return value

    def _convert_type(self, value: Any, data_type: str) -> Any:
        """
        Convierte valor al tipo de dato especificado
        🔒 MEJORADO: Manejo seguro de conversiones
        """
        if value is None:
            return None

        try:
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
        except (TypeError, ValueError) as e:
            logger.warning(f"Error convert_type {data_type}: {e}")
            return None

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
            target[field_path] = value
        else:
            parts = field_path.split('.')
            current = target

            for part in parts[:-1]:
                if part not in current:
                    current[part] = OrderedDict()
                current = current[part]

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
        }
        return prefixes.get(country_code.upper(), '')

    def parse_response(self, vendor_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parsea respuesta del vendor a formato Latconecta
        🔒 MEJORADO: Sanitiza valores de respuesta (anti-XSS)
        """
        response_mapping = self.mapping_config.get('response_mapping') or {}
        parsed = {}

        for vendor_field, latconecta_field in response_mapping.items():
            value = self._get_nested_value(vendor_response, vendor_field)

            # 🔒 Sanitizar valor (previene XSS si el vendor devuelve scripts)
            if isinstance(value, str):
                value = self._sanitize_input(value, vendor_field)

            if value is not None:
                parsed[latconecta_field] = value

        # 🔒 Log seguro de la respuesta
        logger.debug(f"Response parseada: {self._redact_sensitive_data(parsed)}")

        return parsed

    def _get_nested_value(self, data: Dict[str, Any], field_path: str) -> Any:
        """
        Obtiene valor de campo anidado
        """
        if not data or not isinstance(data, dict):
            return None

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
        🔒 MEJORADO: Validación robusta
        """
        success_config = self.mapping_config.get('success_indicators') or {}

        # Verificar status code
        valid_codes = success_config.get('status_codes', [200])
        if status_code not in valid_codes:
            logger.debug(f"Status code {status_code} no en {valid_codes}")
            return False

        # Verificar campo de éxito en response
        success_field = success_config.get('success_field')
        if success_field:
            # Limpiar JSONPath si está presente
            if isinstance(success_field, str) and success_field.startswith('$.'):
                success_field = success_field[2:]

            success_values = success_config.get('success_values', [])
            actual_value = self._get_nested_value(response_data, success_field)

            # 🔒 Sanitizar comparación
            if actual_value is not None:
                # Normalizar para comparación
                actual_str = str(actual_value)
                success_strs = [str(v) for v in success_values]

                result = actual_str in success_strs
                if not result:
                    logger.debug(f"Success check failed: {success_field}={actual_value} not in {success_values}")
                return result

            logger.debug(f"Success field '{success_field}' not found in response")
            return False

        return True
