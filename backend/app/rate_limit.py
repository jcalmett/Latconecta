"""
Rate Limiting Configuration
Protege endpoints contra ataques de fuerza bruta
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request, HTTPException
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURACIÓN DEL LIMITER
# ============================================================================

# Limiter base usando IP del cliente
limiter = Limiter(key_func=get_remote_address)

# Configuración por endpoint (requests por minuto)
RATE_LIMITS = {
    # Endpoints críticos (muy restrictivos)
    "login": "5/minute",           # 5 intentos por minuto
    "register": "3/minute",        # 3 registros por minuto
    "forgot_password": "3/minute", # 3 solicitudes por minuto
    "reset_password": "5/minute",  # 5 intentos por minuto
    
    # Endpoints generales (menos restrictivos)
    "default": "60/minute",        # 60 requests por minuto
    "admin": "120/minute",         # 120 requests por minuto para admins
    
    # Uploads (moderado)
    "upload": "30/minute",         # 30 subidas por minuto
}


def configure_rate_limits(app: FastAPI):
    """
    Configura los rate limits en la aplicación FastAPI
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    logger.info("✅ Rate limiting configurado")


def get_rate_limit_key_admin(request: Request) -> str:
    """
    Obtiene la clave para rate limiting de admins.
    Los admins tienen límites más altos.
    """
    # Intentar obtener el token JWT
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        # Podríamos decodificar el token para obtener el rol
        # Por simplicidad, usamos IP + prefijo admin
        client_ip = get_remote_address(request)
        return f"admin_{client_ip}"
    return get_remote_address(request)


# ============================================================================
# DECORADORES PARA ENDPOINTS
# ============================================================================

# Estos decoradores se usarán en los routers:
# 
# @router.post("/login")
# @limiter.limit(RATE_LIMITS["login"])
# async def login(request: Request, ...):
#     ...
#
# Para que funcione, cada endpoint debe tener el parámetro `request: Request`
