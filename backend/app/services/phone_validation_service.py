"""
Phone Validation Service - Validación Local de Números de Teléfono
==================================================================

Valida números de teléfono localmente según país y operador.
Actualmente implementado para Venezuela (VEN).
Para cualquier otro país retorna valid=True automáticamente.

Uso:
    from app.services.phone_validation_service import validate_phone_local

    result = validate_phone_local(
        phone_number="04141234567",
        country="VEN",
        operator="MOVISTAR"
    )
    # result = {"valid": True, "message": "...", "phone_number": "..."}
"""

import logging

logger = logging.getLogger(__name__)

# ================================================================
# PREFIJOS POR PAÍS Y OPERADOR
# Fuente: Tabla de servicios Servipagos (20260210)
# ================================================================

# Prefijos geográficos fijos Venezuela (compartidos por múltiples operadores)
_VEN_PREFIJOS_FIJOS = [
    '0212', '0234', '0235', '0238', '0239',
    '0240', '0241', '0242', '0243', '0244', '0245', '0246', '0247', '0248', '0249',
    '0251', '0252', '0253', '0254', '0255', '0256', '0257', '0258', '0259',
    '0261', '0262', '0263', '0264', '0265', '0266', '0267', '0268', '0269',
    '0271', '0272', '0273', '0274', '0275', '0276', '0277', '0278', '0279',
    '0281', '0282', '0283', '0284', '0285', '0286', '0287', '0288', '0289',
    '0291', '0292', '0293', '0294', '0295',
]

# Mapa de prefijos válidos por operador Venezuela
# None = cualquier valor, sin validación de prefijo
_VEN_OPERATOR_PREFIXES = {
    'MOVISTAR':  ['0414', '0424'],
    'MOVISTAR1': None,                                          # Pospago - cualquier valor
    'MOVISTAR2': ['0414', '0424'] + _VEN_PREFIJOS_FIJOS,       # Fija - prefijos geográficos
    'MOVILNET':  ['0416', '0426'] + _VEN_PREFIJOS_FIJOS,
    'DIGITEL':   ['0412', '0422', '58412'] + _VEN_PREFIJOS_FIJOS,
    'DIGITEL1':  ['0412', '0422', '58412'] + _VEN_PREFIJOS_FIJOS,
    'INTER':     None,                                          # Cualquier valor
    'CANTV':     ['0212', '0700', '0900'] + _VEN_PREFIJOS_FIJOS,
}

# Longitud esperada por país (dígitos)
_PHONE_LENGTH = {
    'VEN': 11,
    'PE':  9,
    'MX':  10,
}


# ================================================================
# FUNCIÓN PRINCIPAL
# ================================================================

def validate_phone_local(
    phone_number: str,
    country: str,
    operator: str
) -> dict:
    """
    Valida un número de teléfono localmente según país y operador.

    Args:
        phone_number: Número de teléfono a validar
        country:      Código de país alpha-3 (ej: 'VEN', 'PER', 'MEX')
                      o alpha-2 (ej: 'VE', 'PE', 'MX')
        operator:     Código de operador según tabla vendor_products.vp_operator
                      (ej: 'MOVISTAR', 'DIGITEL', 'MOVILNET', etc.)

    Returns:
        dict con claves:
            valid (bool): True si el número es válido
            message (str): Descripción del resultado o error
            phone_number (str): Número recibido
    """
    phone = str(phone_number).strip()

    # Normalizar country a alpha-3 para comparación
    country_upper = country.upper()
    country_alpha3 = _normalize_country(country_upper)

    logger.info(f"[PhoneValidation] country={country_alpha3}, operator={operator}, phone={phone}")

    # ============================================================
    # Solo Venezuela tiene validación local implementada
    # Cualquier otro país retorna valid=True
    # ============================================================
    if country_alpha3 != 'VEN':
        logger.info(f"[PhoneValidation] País {country_alpha3} sin validación local → valid=True")
        return {
            "valid": True,
            "message": f"No local validation required for country {country_alpha3}",
            "phone_number": phone
        }

    # ============================================================
    # VALIDACIÓN VENEZUELA
    # ============================================================

    # 1. Solo dígitos
    if not phone.isdigit():
        return _invalid(phone, "El número de teléfono debe contener solo dígitos")

    # 2. Longitud: 11 dígitos
    expected_length = _PHONE_LENGTH.get('VEN', 11)
    if len(phone) != expected_length:
        return _invalid(
            phone,
            f"El número para Venezuela debe tener {expected_length} dígitos, se recibieron {len(phone)}"
        )

    # 3. Validar operador conocido
    operator_upper = operator.upper()
    if operator_upper not in _VEN_OPERATOR_PREFIXES:
        logger.warning(f"[PhoneValidation] Operador desconocido: {operator} → valid=True por defecto")
        return {
            "valid": True,
            "message": f"Operador {operator} sin reglas de prefijo definidas",
            "phone_number": phone
        }

    # 4. Verificar prefijos
    valid_prefixes = _VEN_OPERATOR_PREFIXES[operator_upper]

    # Operadores sin restricción de prefijo
    if valid_prefixes is None:
        logger.info(f"[PhoneValidation] Operador {operator} acepta cualquier prefijo → valid=True")
        return {
            "valid": True,
            "message": f"Número válido para operador {operator}",
            "phone_number": phone
        }

    # Verificar que el número empiece con alguno de los prefijos válidos
    phone_prefix_4 = phone[:4]   # Prefijos de 4 dígitos (ej: 0414)
    phone_prefix_5 = phone[:5]   # Prefijos de 5 dígitos (ej: 58412)

    matched = any(
        phone.startswith(p.strip()) for p in valid_prefixes
    )

    if matched:
        matched_prefix = next(p.strip() for p in valid_prefixes if phone.startswith(p.strip()))
        logger.info(f"[PhoneValidation] ✅ Prefijo válido: {matched_prefix} para {operator}")
        return {
            "valid": True,
            "message": f"Número válido para operador {operator}",
            "phone_number": phone
        }
    else:
        prefixes_display = ', '.join(p.strip() for p in valid_prefixes[:5])
        if len(valid_prefixes) > 5:
            prefixes_display += f" (y {len(valid_prefixes) - 5} más)"
        logger.warning(
            f"[PhoneValidation] ❌ Prefijo inválido: {phone_prefix_4} para {operator}. "
            f"Válidos: {', '.join(p.strip() for p in valid_prefixes[:10])}"
        )
        return _invalid(
            phone,
            f"El número {phone} no corresponde al operador {operator}. "
            f"Prefijos válidos: {prefixes_display}"
        )


# ================================================================
# HELPERS
# ================================================================

def _invalid(phone: str, message: str) -> dict:
    return {"valid": False, "message": message, "phone_number": phone}


def _normalize_country(country: str) -> str:
    """Normaliza código de país a alpha-3."""
    mapping = {
        'VE': 'VEN',
        'PE': 'PER',
        'MX': 'MEX',
        'CO': 'COL',
        'AR': 'ARG',
        'CL': 'CHL',
        'EC': 'ECU',
        'BO': 'BOL',
        'PY': 'PRY',
        'UY': 'URY',
    }
    return mapping.get(country, country)