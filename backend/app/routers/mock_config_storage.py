"""
Mock Config Storage
Sistema de almacenamiento en memoria para configuración de APIs mock
Permite configurar respuestas específicas por cada API
"""

from typing import Dict, Any, Optional
from datetime import datetime

# ============================================================================
# STORAGE GLOBAL (en memoria)
# ============================================================================

# Configuración de cada API
# Estructura: { "VALNUMCTA": { "status": "success", "monto_base": 85.50, ... }, ... }
_api_configs: Dict[str, Dict[str, Any]] = {}

# Configuración global del mock
_global_config = {
    "success_rate": 0.95,
    "delay_min": 0.5,
    "delay_max": 2.0,
    "forced_error": None
}

# ============================================================================
# DEFAULT CONFIGURATIONS
# ============================================================================

DEFAULT_CONFIGS = {
    # VALIDACIONES
    "VALNUMTEL": {
        "status": "success",
        "valid": True,
        "operator": "bitel",
        "country": "PE",
        "account_type": "prepaid",
        "errorMessage": "Número de teléfono inválido"
    },
    
    "VALNUMCTA": {
        "status": "success",
        "valid": True,
        "monto_base": 85.50,
        "indicador": "T",  # T=Total, R=Rango
        "errorMessage": "Número de cuenta inválido"
    },
    
    # PROVISIONES
    "APIRECARGA": {
        "status": "success",
        "provision_ref": "PROV-REC-001",
        "delivery_status": "completed",
        "errorMessage": "Error al provisionar recarga"
    },
    
    "APIPAGOREC": {
        "status": "success",
        "provision_ref": "PROV-PAG-001",
        "delivery_status": "completed",
        "errorMessage": "Error al registrar pago de recibo"
    },
    
    "APIYAPE": {
        "status": "success",
        "provision_ref": "PROV-YAPE-001",
        "delivery_status": "completed",
        "errorMessage": "Error en transferencia YAPE"
    },
    
    "APISMART": {
        "status": "success",
        "provision_ref": "PROV-SMART-001",
        "delivery_status": "pending_delivery",
        "errorMessage": "Error al registrar venta de smartphone"
    },
    
    # PAGO
    "APICARD": {
        "status": "success",
        "payment_ref": "PAY-CARD-001",
        "payment_status": "completed",
        "card_last_digits": "1234",
        "errorMessage": "Error al procesar pago con tarjeta"
    },
    
    "APIREVCARD": {
        "status": "success",
        "reversal_ref": "REV-CARD-001",
        "reversal_status": "reversed",
        "errorMessage": "Error al revertir pago"
    },
    
    "APIBARC": {
        "status": "success",
        "barcode": "BC123456789",
        "barcode_image": "https://via.placeholder.com/300x100?text=BARCODE",
        "payment_status": "pending",
        "expires_at": "2024-12-31T23:59:59",
        "errorMessage": "Error al generar barcode"
    }
}

# ============================================================================
# FUNCIONES DE STORAGE
# ============================================================================

def initialize_defaults():
    """
    Inicializa configuraciones por defecto si no existen
    """
    global _api_configs
    if not _api_configs:
        _api_configs = DEFAULT_CONFIGS.copy()


def get_api_config(api_name: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene la configuración de una API específica
    
    Args:
        api_name: Nombre de la API (VALNUMTEL, APIRECARGA, etc.)
    
    Returns:
        Dict con configuración o None si no existe
    """
    initialize_defaults()
    return _api_configs.get(api_name.upper())


def set_api_config(api_name: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Guarda configuración para una API específica
    
    Args:
        api_name: Nombre de la API
        config: Configuración a guardar
    
    Returns:
        Configuración guardada
    """
    initialize_defaults()
    api_name_upper = api_name.upper()
    
    # Merge con config existente
    existing = _api_configs.get(api_name_upper, {})
    merged = {**existing, **config}
    
    _api_configs[api_name_upper] = merged
    return merged


def update_api_config(api_name: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Actualiza campos específicos de una configuración
    
    Args:
        api_name: Nombre de la API
        updates: Campos a actualizar
    
    Returns:
        Configuración actualizada
    """
    return set_api_config(api_name, updates)


def delete_api_config(api_name: str) -> bool:
    """
    Elimina configuración de una API
    
    Args:
        api_name: Nombre de la API
    
    Returns:
        True si se eliminó, False si no existía
    """
    api_name_upper = api_name.upper()
    if api_name_upper in _api_configs:
        del _api_configs[api_name_upper]
        return True
    return False


def get_all_configs() -> Dict[str, Dict[str, Any]]:
    """
    Obtiene todas las configuraciones
    
    Returns:
        Dict con todas las configuraciones
    """
    initialize_defaults()
    return _api_configs.copy()


def set_all_configs(configs: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Reemplaza todas las configuraciones (bulk update)
    Útil para recibir config desde ApiSimulatorPanel
    
    Args:
        configs: Dict completo de configuraciones
    
    Returns:
        Configuraciones guardadas
    """
    global _api_configs
    _api_configs = {k.upper(): v for k, v in configs.items()}
    return _api_configs


def reset_to_defaults() -> Dict[str, Dict[str, Any]]:
    """
    Resetea todas las configuraciones a valores por defecto
    
    Returns:
        Configuraciones por defecto
    """
    global _api_configs
    _api_configs = DEFAULT_CONFIGS.copy()
    return _api_configs


# ============================================================================
# CONFIGURACIÓN GLOBAL
# ============================================================================

def get_global_config() -> Dict[str, Any]:
    """
    Obtiene configuración global del mock
    
    Returns:
        Config global (success_rate, delays, etc.)
    """
    return _global_config.copy()


def set_global_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Actualiza configuración global
    
    Args:
        config: Nuevos valores
    
    Returns:
        Config actualizada
    """
    global _global_config
    _global_config.update(config)
    return _global_config


def get_success_rate() -> float:
    """Obtiene tasa de éxito global"""
    return _global_config.get("success_rate", 0.95)


def set_success_rate(rate: float) -> float:
    """
    Establece tasa de éxito global
    Solo aplica si API no tiene config específica
    """
    _global_config["success_rate"] = rate
    return rate


def get_forced_error() -> Optional[str]:
    """Obtiene error forzado global"""
    return _global_config.get("forced_error")


def set_forced_error(error_type: Optional[str]) -> Optional[str]:
    """Establece error forzado global"""
    _global_config["forced_error"] = error_type
    return error_type


# ============================================================================
# UTILIDADES
# ============================================================================

def get_api_status(api_name: str) -> str:
    """
    Obtiene status de una API (success/failed)
    
    Args:
        api_name: Nombre de la API
    
    Returns:
        "success" o "failed" o "unknown"
    """
    config = get_api_config(api_name)
    if not config:
        return "unknown"
    return config.get("status", "success")


def is_api_success(api_name: str) -> bool:
    """
    Verifica si una API está configurada como success
    
    Args:
        api_name: Nombre de la API
    
    Returns:
        True si success, False si failed o no existe
    """
    return get_api_status(api_name) == "success"


def toggle_api_status(api_name: str) -> str:
    """
    Cambia el status de una API (success ↔ failed)
    
    Args:
        api_name: Nombre de la API
    
    Returns:
        Nuevo status
    """
    config = get_api_config(api_name) or {}
    current_status = config.get("status", "success")
    new_status = "failed" if current_status == "success" else "success"
    
    update_api_config(api_name, {"status": new_status})
    return new_status


def get_stats() -> Dict[str, Any]:
    """
    Obtiene estadísticas de configuración
    
    Returns:
        Dict con stats
    """
    initialize_defaults()
    
    total_apis = len(_api_configs)
    success_apis = sum(1 for cfg in _api_configs.values() if cfg.get("status") == "success")
    failed_apis = total_apis - success_apis
    
    return {
        "total_apis": total_apis,
        "success_apis": success_apis,
        "failed_apis": failed_apis,
        "success_rate_global": _global_config.get("success_rate"),
        "forced_error": _global_config.get("forced_error"),
        "apis": list(_api_configs.keys()),
        "last_updated": datetime.now().isoformat()
    }


# ============================================================================
# INICIALIZACIÓN
# ============================================================================

# Inicializar defaults al importar
initialize_defaults()


# ============================================================================
# EJEMPLO DE USO
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("MOCK CONFIG STORAGE - EJEMPLO DE USO")
    print("="*60 + "\n")
    
    # 1. Obtener config de una API
    config = get_api_config("VALNUMCTA")
    print(f"Config VALNUMCTA: {config}")
    
    # 2. Actualizar config
    set_api_config("VALNUMCTA", {
        "status": "success",
        "monto_base": 125.75,
        "indicador": "R"
    })
    print(f"\nConfig actualizada: {get_api_config('VALNUMCTA')}")
    
    # 3. Toggle status
    new_status = toggle_api_status("VALNUMCTA")
    print(f"\nNuevo status: {new_status}")
    
    # 4. Stats
    stats = get_stats()
    print(f"\nEstadísticas: {stats}")
    
    # 5. Reset
    reset_to_defaults()
    print(f"\nReseteado a defaults")