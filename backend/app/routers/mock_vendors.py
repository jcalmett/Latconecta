"""
Router de Mock Vendors COMPLETO
- Endpoints universales (provision, validation, query, etc.)
- Endpoints legacy con fallback (VALNUMTEL, APIRECARGA, etc.)
- Sistema de configuración por API
- Responde según config guardada
"""

from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import random
import time
import uuid

# Importar storage de configuración
try:
    from app.routers.mock_config_storage import (
        get_api_config,
        set_api_config,
        get_all_configs,
        set_all_configs,
        reset_to_defaults,
        toggle_api_status,
        get_stats,
        get_global_config,
        set_global_config,
        get_success_rate,
        set_success_rate,
        set_forced_error,
        is_api_success
    )
except ImportError:
    # Fallback si no existe el módulo
    print("⚠️  Warning: mock_config_storage no encontrado, usando fallback")
    def get_api_config(name): return None
    def set_api_config(name, cfg): return cfg
    def get_all_configs(): return {}
    def set_all_configs(cfg): return cfg
    def reset_to_defaults(): return {}
    def toggle_api_status(name): return "success"
    def get_stats(): return {}
    def get_global_config(): return {"success_rate": 0.95, "delay_min": 0.5, "delay_max": 2.0}
    def set_global_config(cfg): return cfg
    def get_success_rate(): return 0.95
    def set_success_rate(rate): return rate
    def set_forced_error(err): return err
    def is_api_success(name): return True

# Importar config de la app
try:
    from app.config import is_development
except ImportError:
    is_development = lambda: True

router = APIRouter(
    prefix="/api/v1/mock",
    tags=["Mock Vendors"],
    responses={404: {"description": "Not found"}}
)

# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

def simulate_delay():
    """Simula latencia de red"""
    global_config = get_global_config()
    delay = random.uniform(
        global_config.get("delay_min", 0.5),
        global_config.get("delay_max", 2.0)
    )
    time.sleep(delay)


def should_succeed_global() -> bool:
    """Determina si operación debe ser exitosa (global)"""
    global_config = get_global_config()
    forced_error = global_config.get("forced_error")
    
    if forced_error:
        return False
    
    success_rate = global_config.get("success_rate", 0.95)
    return random.random() < success_rate


def generate_transaction_id(prefix: str = "MOCK") -> str:
    """Genera un ID de transacción único"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_part = uuid.uuid4().hex[:8].upper()
    return f"{prefix}-{timestamp}-{random_part}"


def get_error_response(error_type: Optional[str] = None) -> Dict[str, Any]:
    """Genera una respuesta de error"""
    errors = {
        "insufficient_balance": {
            "code": "INSUFFICIENT_BALANCE",
            "message": "El vendor no tiene saldo suficiente",
            "status": "failed"
        },
        "invalid_phone": {
            "code": "INVALID_PHONE_NUMBER",
            "message": "Número de teléfono inválido",
            "status": "failed"
        },
        "service_unavailable": {
            "code": "SERVICE_UNAVAILABLE",
            "message": "Servicio temporalmente no disponible",
            "status": "error"
        },
        "timeout": {
            "code": "TIMEOUT",
            "message": "Timeout al procesar la operación",
            "status": "timeout"
        },
        "invalid_product": {
            "code": "INVALID_PRODUCT",
            "message": "Producto no disponible",
            "status": "failed"
        }
    }
    
    global_config = get_global_config()
    forced = global_config.get("forced_error")
    
    if forced and forced in errors:
        error_type = forced
    
    if not error_type:
        error_type = random.choice(list(errors.keys()))
    
    return errors.get(error_type, errors["service_unavailable"])


def validate_auth_header(authorization: Optional[str] = None, x_api_key: Optional[str] = None) -> bool:
    """Valida headers de autenticación"""
    # En mock, ser permisivo
    return True


# ============================================================================
# ENDPOINTS UNIVERSALES - OPERATION TYPES
# ============================================================================

@router.post("/{vendor_code}/provision")
async def mock_provision(
    vendor_code: str,
    request: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Mock universal para PROVISION"""
    simulate_delay()
    success = should_succeed_global()
    transaction_id = generate_transaction_id(vendor_code.upper())
    
    if success:
        return {
            "success": True,
            "operation_type": "provision",
            "transaction_id": transaction_id,
            "status": "completed",
            "message": "Servicio provisionado exitosamente",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "phone_number": request.get("phone_number", ""),
                "product_sku": request.get("product_sku", ""),
                "amount": request.get("amount", 0),
                "balance_before": 1000.00,
                "balance_after": 950.00
            }
        }
    else:
        error = get_error_response()
        return {
            "success": False,
            "operation_type": "provision",
            "transaction_id": transaction_id,
            "status": error["status"],
            "message": error["message"],
            "timestamp": datetime.now().isoformat(),
            "data": {"error_code": error["code"]}
        }


@router.post("/{vendor_code}/validation")
async def mock_validation(
    vendor_code: str,
    request: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Mock universal para VALIDATION"""
    simulate_delay()
    phone_number = request.get("phone_number") or request.get("msisdn") or request.get("account_number")
    
    if phone_number and len(str(phone_number)) >= 9:
        return {
            "success": True,
            "operation_type": "validation",
            "transaction_id": generate_transaction_id(f"{vendor_code}-VAL"),
            "status": "validated",
            "message": "Validación exitosa",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "phone_number": phone_number,
                "is_valid": True,
                "operator": "bitel",
                "country": "PE",
                "account_type": "prepaid"
            }
        }
    else:
        return {
            "success": False,
            "operation_type": "validation",
            "transaction_id": generate_transaction_id(f"{vendor_code}-VAL"),
            "status": "invalid",
            "message": "Número inválido",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "phone_number": phone_number,
                "is_valid": False,
                "error": "Invalid format"
            }
        }


@router.post("/{vendor_code}/query")
async def mock_query(
    vendor_code: str,
    request: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Mock universal para QUERY"""
    simulate_delay()
    transaction_id = request.get("transaction_id")
    statuses = ["completed", "pending", "processing", "failed"]
    status_choice = random.choice(statuses)
    
    return {
        "success": True,
        "operation_type": "query",
        "transaction_id": transaction_id or generate_transaction_id(f"{vendor_code}-QRY"),
        "status": status_choice,
        "message": f"Transacción en estado: {status_choice}",
        "timestamp": datetime.now().isoformat(),
        "data": {
            "original_transaction_id": transaction_id,
            "current_status": status_choice,
            "last_update": datetime.now().isoformat()
        }
    }


@router.post("/{vendor_code}/reversal")
async def mock_reversal(
    vendor_code: str,
    request: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Mock universal para REVERSAL"""
    simulate_delay()
    transaction_id = request.get("transaction_id")
    success = should_succeed_global()
    
    if success:
        return {
            "success": True,
            "operation_type": "reversal",
            "transaction_id": generate_transaction_id(f"{vendor_code}-REV"),
            "status": "reversed",
            "message": "Transacción revertida exitosamente",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "original_transaction_id": transaction_id,
                "reversal_amount": request.get("amount", 0),
                "refund_reference": generate_transaction_id("REFUND")
            }
        }
    else:
        error = get_error_response()
        return {
            "success": False,
            "operation_type": "reversal",
            "transaction_id": generate_transaction_id(f"{vendor_code}-REV-ERR"),
            "status": "failed",
            "message": "No se pudo revertir la transacción",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "original_transaction_id": transaction_id,
                "error_code": error["code"],
                "error_message": error["message"]
            }
        }


@router.post("/{vendor_code}/reservation")
async def mock_reservation(
    vendor_code: str,
    request: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Mock universal para RESERVATION"""
    simulate_delay()
    success = should_succeed_global()
    
    if success:
        reservation_id = generate_transaction_id(f"{vendor_code}-RES")
        return {
            "success": True,
            "operation_type": "reservation",
            "transaction_id": reservation_id,
            "status": "reserved",
            "message": "Producto reservado exitosamente",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "reservation_id": reservation_id,
                "product_sku": request.get("product_sku", ""),
                "reserved_until": datetime.now().isoformat(),
                "amount": request.get("amount", 0)
            }
        }
    else:
        error = get_error_response()
        return {
            "success": False,
            "operation_type": "reservation",
            "transaction_id": generate_transaction_id(f"{vendor_code}-RES-ERR"),
            "status": "failed",
            "message": error["message"],
            "timestamp": datetime.now().isoformat(),
            "data": {"error_code": error["code"]}
        }


@router.post("/{vendor_code}/confirmation")
async def mock_confirmation(
    vendor_code: str,
    request: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Mock universal para CONFIRMATION"""
    simulate_delay()
    transaction_id = request.get("transaction_id")
    
    return {
        "success": True,
        "operation_type": "confirmation",
        "transaction_id": generate_transaction_id(f"{vendor_code}-CNF"),
        "status": "confirmed",
        "message": "Transacción confirmada",
        "timestamp": datetime.now().isoformat(),
        "data": {
            "original_transaction_id": transaction_id,
            "confirmation_code": generate_transaction_id("CONF")
        }
    }


@router.get("/{vendor_code}/balance")
async def mock_balance_check(
    vendor_code: str,
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Mock universal para BALANCE CHECK"""
    simulate_delay()
    
    return {
        "success": True,
        "operation_type": "balance_check",
        "transaction_id": generate_transaction_id(f"{vendor_code}-BAL"),
        "status": "ok",
        "message": "Saldo obtenido",
        "timestamp": datetime.now().isoformat(),
        "data": {
            "balance": round(random.uniform(500, 10000), 2),
            "currency": "USD",
            "last_update": datetime.now().isoformat()
        }
    }


# ============================================================================
# ENDPOINTS LEGACY CON CONFIGURACIÓN
# ============================================================================

@router.post("/legacy/{api_name}")
async def mock_legacy_api(
    api_name: str,
    request: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """
    Endpoint de fallback para APIs legacy
    Responde según configuración guardada en mock_config_storage
    
    Soporta: VALNUMTEL, VALNUMCTA, APIRECARGA, APIPAGOREC, APIYAPE,
             APISMART, APICARD, APIBARC, APIREVCARD
    """
    simulate_delay()
    
    api_name_upper = api_name.upper()
    
    # Obtener configuración de la API
    config = get_api_config(api_name_upper)
    
    if not config:
        # Si no hay config, responder con defaults genéricos
        return {
            "success": True,
            "message": f"Mock legacy response para {api_name} (sin config específica)",
            "timestamp": datetime.now().isoformat(),
            "note": "Configura esta API vía /api/v1/mock/config/legacy/{api_name}"
        }
    
    # Verificar status configurado
    if config.get("status") == "failed":
        # Responder con error
        return {
            "success": False,
            "error": config.get("errorMessage", f"Error en {api_name}"),
            "timestamp": datetime.now().isoformat()
        }
    
    # Responder SUCCESS según tipo de API
    
    # VALIDACIONES
    if api_name_upper == "VALNUMTEL":
        return {
            "success": True,
            "valid": config.get("valid", True),
            "operator": config.get("operator", "bitel"),
            "country": config.get("country", "PE"),
            "account_type": config.get("account_type", "prepaid"),
            "timestamp": datetime.now().isoformat()
        }
    
    elif api_name_upper == "VALNUMCTA":
        return {
            "success": True,
            "valid": config.get("valid", True),
            "monto_base": config.get("monto_base", 85.50),
            "indicador": config.get("indicador", "T"),
            "timestamp": datetime.now().isoformat()
        }
    
    # PROVISIONES
    elif api_name_upper in ["APIRECARGA", "APIPAGOREC", "APIYAPE", "APISMART"]:
        return {
            "success": True,
            "provision_ref": config.get("provision_ref", f"PROV-{api_name_upper}-{generate_transaction_id('')}"),
            "delivery_status": config.get("delivery_status", "completed"),
            "timestamp": datetime.now().isoformat()
        }
    
    # PAGO
    elif api_name_upper == "APICARD":
        return {
            "success": True,
            "payment_ref": config.get("payment_ref", f"PAY-CARD-{generate_transaction_id('')}"),
            "payment_status": config.get("payment_status", "completed"),
            "card_last_digits": config.get("card_last_digits", "1234"),
            "timestamp": datetime.now().isoformat()
        }
    
    elif api_name_upper == "APIREVCARD":
        return {
            "success": True,
            "reversal_ref": config.get("reversal_ref", f"REV-{generate_transaction_id('')}"),
            "reversal_status": config.get("reversal_status", "reversed"),
            "timestamp": datetime.now().isoformat()
        }
    
    elif api_name_upper == "APIBARC":
        return {
            "success": True,
            "barcode": config.get("barcode", f"BC{random.randint(100000000, 999999999)}"),
            "barcode_image": config.get("barcode_image", "https://via.placeholder.com/300x100?text=BARCODE"),
            "payment_status": config.get("payment_status", "pending"),
            "expires_at": config.get("expires_at", "2024-12-31T23:59:59"),
            "timestamp": datetime.now().isoformat()
        }
    
    # Default genérico
    return {
        "success": True,
        "message": f"Mock legacy response para {api_name}",
        "config": config,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# ENDPOINTS DE CONFIGURACIÓN
# ============================================================================

@router.get("/config/legacy/{api_name}")
async def get_api_config_endpoint(api_name: str):
    """
    Obtiene configuración de una API específica
    
    Ejemplo: GET /api/v1/mock/config/legacy/VALNUMCTA
    """
    config = get_api_config(api_name)
    
    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"No hay configuración para {api_name}"
        )
    
    return {
        "api_name": api_name.upper(),
        "config": config
    }


@router.post("/config/legacy/{api_name}")
async def set_api_config_endpoint(api_name: str, config: Dict[str, Any]):
    """
    Configura una API específica
    
    Ejemplo:
    POST /api/v1/mock/config/legacy/VALNUMCTA
    {
      "status": "success",
      "monto_base": 125.50,
      "indicador": "R"
    }
    """
    updated_config = set_api_config(api_name, config)
    
    return {
        "message": f"Configuración guardada para {api_name}",
        "api_name": api_name.upper(),
        "config": updated_config
    }


@router.get("/config/legacy")
async def get_all_configs_endpoint():
    """
    Obtiene todas las configuraciones de APIs
    
    Ejemplo: GET /api/v1/mock/config/legacy
    """
    configs = get_all_configs()
    
    return {
        "total_apis": len(configs),
        "apis": configs
    }


@router.post("/config/legacy/bulk")
async def set_bulk_config_endpoint(configs: Dict[str, Dict[str, Any]]):
    """
    Actualización bulk de configuraciones
    Útil para recibir config desde ApiSimulatorPanel
    
    Ejemplo:
    POST /api/v1/mock/config/legacy/bulk
    {
      "VALNUMCTA": {"status": "success", "monto_base": 85.50},
      "APIRECARGA": {"status": "failed", "errorMessage": "Sin saldo"}
    }
    """
    updated_configs = set_all_configs(configs)
    
    return {
        "message": f"Configuración bulk actualizada para {len(updated_configs)} APIs",
        "total_apis": len(updated_configs),
        "apis": list(updated_configs.keys())
    }


@router.post("/config/legacy/{api_name}/toggle")
async def toggle_api_status_endpoint(api_name: str):
    """
    Toggle status de una API (success ↔ failed)
    
    Ejemplo: POST /api/v1/mock/config/legacy/VALNUMCTA/toggle
    """
    new_status = toggle_api_status(api_name)
    
    return {
        "message": f"Status de {api_name} cambiado",
        "api_name": api_name.upper(),
        "new_status": new_status,
        "config": get_api_config(api_name)
    }


@router.post("/config/legacy/reset")
async def reset_configs_endpoint():
    """
    Resetea todas las configuraciones a valores por defecto
    
    Ejemplo: POST /api/v1/mock/config/legacy/reset
    """
    defaults = reset_to_defaults()
    
    return {
        "message": "Configuraciones reseteadas a defaults",
        "total_apis": len(defaults),
        "apis": list(defaults.keys())
    }


# ============================================================================
# CONFIGURACIÓN GLOBAL
# ============================================================================

@router.get("/config")
async def get_config():
    """Obtiene configuración global del mock"""
    return {
        **get_global_config(),
        "environment": "development" if is_development() else "other",
        "features": {
            "legacy_fallback": True,
            "api_specific_config": True
        }
    }


@router.post("/config/success-rate/{rate}")
async def set_success_rate_endpoint(rate: float):
    """Configura tasa de éxito global"""
    if not 0.0 <= rate <= 1.0:
        raise HTTPException(status_code=400, detail="Rate debe estar entre 0.0 y 1.0")
    
    set_success_rate(rate)
    return {"message": f"Success rate actualizado a {rate*100}%", "success_rate": rate}


@router.post("/config/delay/{min_delay}/{max_delay}")
async def set_delay_endpoint(min_delay: float, max_delay: float):
    """Configura delay de latencia"""
    if min_delay < 0 or max_delay < min_delay:
        raise HTTPException(status_code=400, detail="Delays inválidos")
    
    set_global_config({"delay_min": min_delay, "delay_max": max_delay})
    return {
        "message": f"Delay configurado: {min_delay}s - {max_delay}s",
        "delay_min": min_delay,
        "delay_max": max_delay
    }


@router.post("/config/force-error/{error_type}")
async def force_error_endpoint(error_type: str):
    """Fuerza un tipo de error específico"""
    valid_errors = ["insufficient_balance", "invalid_phone", "service_unavailable", "timeout", "invalid_product", "none"]
    
    if error_type not in valid_errors:
        raise HTTPException(status_code=400, detail=f"error_type debe ser uno de: {valid_errors}")
    
    if error_type == "none":
        set_forced_error(None)
        return {"message": "Error forzado deshabilitado"}
    else:
        set_forced_error(error_type)
        return {"message": f"Todas las operaciones fallarán con: {error_type}", "forced_error": error_type}


@router.get("/config/stats")
async def get_stats_endpoint():
    """Obtiene estadísticas de configuración"""
    return get_stats()


@router.get("/health")
async def health():
    """Health check del mock"""
    stats = get_stats()
    
    return {
        "status": "healthy",
        "service": "mock_vendors_universal",
        "timestamp": datetime.now().isoformat(),
        "features": {
            "operation_types": ["provision", "validation", "query", "reversal", "reservation", "confirmation", "balance_check"],
            "legacy_fallback": True,
            "api_specific_config": True
        },
        "config": get_global_config(),
        "stats": stats
    }