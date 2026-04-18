"""
Configuración centralizada del proyecto Latconecta
Variables de sistema únicamente - Datos de vendors están en BD
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Configuración de la aplicación Latconecta
    Lee variables de entorno desde el archivo .env
    """

    # =========================================================================
    # CONFIGURACIÓN DE BASE DE DATOS
    # =========================================================================
    DATABASE_URL: str

    # =========================================================================
    # CONFIGURACIÓN DE SEGURIDAD JWT
    # =========================================================================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # =========================================================================
    # CONFIGURACIÓN DE LA APLICACIÓN
    # =========================================================================
    APP_NAME: str = "Latconecta API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # =========================================================================
    # CONFIGURACIÓN CORS
    # =========================================================================
    CORS_ORIGINS: list = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://77.42.92.151:5173",  # Admin en servidor
    "http://77.42.92.151:5174",  # Users en servidor
    "http://77.42.92.151",        # Sin puerto

    ]

    # =========================================================================
    # CONFIGURACIÓN DE AMBIENTE
    # =========================================================================
    # Ambiente actual: development, uat, production
    # - development: Usa mock universal interno
    # - uat: Usa APIs reales de vendors (datos UAT en BD)
    # - production: Usa APIs reales de vendors (datos PROD en BD)
    ENVIRONMENT: str = "development"

    # =========================================================================
    # CONFIGURACIÓN DE DEPLOYMENT (País de instalación)
    # =========================================================================
    # País donde está instalado el sistema (determina gateway de pagos,
    # barcode API, y regulaciones locales).
    # IMPORTANTE: Esto NO es el catálogo de países (tabla countries en BD).
    # Los countries en BD agrupan servicios/productos disponibles para venta.
    # DEPLOYMENT_COUNTRY indica DESDE DÓNDE se vende y CÓMO se cobra.
    #
    # Valores: PE (Perú), MX (México), US (USA)
    DEPLOYMENT_COUNTRY: str = "PE"

    # Gateway de pagos activo para esta instalación
    # PE → izipay  (tarjeta, Yape, Plin)
    # MX → conekta (tarjeta, OXXO, SPEI) - futuro
    # US → stripe  (tarjeta, Apple Pay)  - futuro
    PAYMENT_GATEWAY: str = "izipay"

    # =========================================================================
    # CONFIGURACIÓN DE IZIPAY - PASARELA DE PAGOS (Peru)
    # Solo aplica cuando PAYMENT_GATEWAY=izipay
    # =========================================================================
    IZIPAY_API_URL: str = "https://sandbox-api-pw.izipay.pe"
    IZIPAY_MERCHANT_CODE: str = ""
    IZIPAY_API_KEY: str = ""
    IZIPAY_HMAC_SHA256: str = ""
    IZIPAY_TOKEN_ENDPOINT: str = "/security/v1/Token/Generate"
    IZIPAY_CANCEL_PATH: str = "/cancel/api/Transaction/Cancel"
    IZIPAY_RSA_PUBLIC_KEY: str = ""
    IZIPAY_CANCEL_ENDPOINT: str = ""

    # =========================================================================
    # CONFIGURACIÓN SMTP — RECUPERACIÓN DE CONTRASEÑA
    # Usar Gmail con App Password (myaccount.google.com/apppasswords)
    # =========================================================================
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "LatConecta"

    # =========================================================================
    # CONFIGURACIÓN DE CONEKTA - PASARELA DE PAGOS (México) - FUTURO
    # Solo aplica cuando PAYMENT_GATEWAY=conekta
    # =========================================================================
    # CONEKTA_API_KEY: str = ""
    # CONEKTA_API_VERSION: str = "2.1.0"
    # CONEKTA_LOCALE: str = "es"

    # =========================================================================
    # CONFIGURACIÓN DE STRIPE - PASARELA DE PAGOS (USA) - FUTURO
    # Solo aplica cuando PAYMENT_GATEWAY=stripe
    # =========================================================================
    # STRIPE_SECRET_KEY: str = ""
    # STRIPE_PUBLISHABLE_KEY: str = ""
    # STRIPE_WEBHOOK_SECRET: str = ""

    # Control de login con vendors
    # False en development (usa mock/simulador)
    # True en uat/production (login real con vendors)
    ENABLE_VENDOR_LOGIN: bool = False

    # =========================================================================
    # CONFIGURACIÓN DE MOCK (Solo para DEVELOPMENT)
    # =========================================================================
    # Tasa de éxito de transacciones mock (0.0 a 1.0)
    MOCK_SUCCESS_RATE: float = 0.95

    # Delay mínimo y máximo para simular latencia de red (segundos)
    MOCK_DELAY_MIN: float = 0.5
    MOCK_DELAY_MAX: float = 2.0

    # Forzar un tipo de error específico (None para aleatorio)
    # Valores: insufficient_balance, invalid_phone, service_unavailable, timeout, invalid_product
    MOCK_FORCED_ERROR: Optional[str] = None

    # =========================================================================
    # CONFIGURACIÓN DE VENDOR SIMULATOR (Fase 2)
    # =========================================================================
    VENDOR_SIMULATOR_ENABLED: bool = True  # True para usar simulador
    VENDOR_SIMULATOR_URL: str = "http://localhost:5001"  # URL del simulador

    # =========================================================================
    # CONFIGURACIÓN DE VENDORS (LEGACY - Mantener por compatibilidad)
    # =========================================================================
    # NOTA: Estos valores se mantienen para código legacy
    # Los vendors nuevos se gestionan desde la BD (tabla vendors)

    VENDOR_MODE: str = "mock"  # mock/real (legacy)

    # Latcom (legacy - mantener por compatibilidad)
    LATCOM_URL: Optional[str] = "https://uatlat.mitopup.com"
    LATCOM_USERNAME: Optional[str] = None
    LATCOM_PASSWORD: Optional[str] = None
    LATCOM_API_KEY: Optional[str] = None
    LATCOM_USER_UID: Optional[str] = None
    LATCOM_TIMEOUT: int = 45


    # Additional settings
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://77.42.92.151:5173,http://77.42.92.151:5174,http://77.42.92.151"
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5242880
    RATE_LIMIT_PER_MINUTE: int = 60
    LOG_LEVEL: str = "INFO"

    # Mock legacy
    MOCK_MODE: str = "success"  # success, timeout, product_not_found, etc.
    MOCK_DELAY: float = 1.0  # Segundos de delay simulado

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Instancia global de configuración
settings = Settings()


# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

def is_development() -> bool:
    """
    Verifica si estamos en ambiente de desarrollo
    En development, se usa el mock universal en vez de vendors reales

    Returns:
        True si ENVIRONMENT == "development"
    """
    return settings.ENVIRONMENT == "development"


def is_uat() -> bool:
    """
    Verifica si estamos en ambiente UAT

    Returns:
        True si ENVIRONMENT == "uat"
    """
    return settings.ENVIRONMENT == "uat"


def is_production() -> bool:
    """
    Verifica si estamos en ambiente de producción

    Returns:
        True si ENVIRONMENT == "production"
    """
    return settings.ENVIRONMENT == "production"


def get_mock_config() -> dict:
    """
    Obtiene la configuración del mock para development

    Returns:
        Dict con configuración del mock
    """
    return {
        "success_rate": settings.MOCK_SUCCESS_RATE,
        "delay_min": settings.MOCK_DELAY_MIN,
        "delay_max": settings.MOCK_DELAY_MAX,
        "forced_error": settings.MOCK_FORCED_ERROR
    }


def get_environment_info() -> dict:
    """
    Obtiene información del ambiente actual

    Returns:
        Dict con información del ambiente
    """
    return {
        "environment": settings.ENVIRONMENT,
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG,
        "is_development": is_development(),
        "is_uat": is_uat(),
        "is_production": is_production(),
        "uses_mock": is_development(),
        "vendor_login_enabled": settings.ENABLE_VENDOR_LOGIN
    }


def validate_environment():
    """
    Valida que el ambiente esté correctamente configurado
    Imprime información al inicio del servidor
    """
    valid_environments = ["development", "uat", "production"]

    if settings.ENVIRONMENT not in valid_environments:
        raise ValueError(
            f"ENVIRONMENT debe ser uno de: {valid_environments}. "
            f"Valor actual: {settings.ENVIRONMENT}"
        )

    # Imprimir información
    print("\n" + "="*60)
    print("🚀 LATCONECTA - CONFIGURACIÓN")
    print("="*60)
    print(f"🌍 Ambiente: {settings.ENVIRONMENT.upper()}")

    if is_development():
        print("🧪 Modo: DEVELOPMENT")
        print("   → Usando MOCK UNIVERSAL (no vendors reales)")
        print("   → Datos de BD son completos (vendors, products, mappings)")
        print("   → Solo las llamadas HTTP van al mock")
    elif is_uat():
        print("🔬 Modo: UAT")
        print("   → Usando APIs REALES de vendors (ambiente UAT)")
        print("   → Datos de vendors leídos desde BD")
        print("   → ⚠️  Acceso restringido")
    else:
        print("🏭 Modo: PRODUCTION")
        print("   → Usando APIs REALES de vendors (ambiente PRODUCCIÓN)")
        print("   → Datos de vendors leídos desde BD")
        print("   → ⚠️  Acceso MUY restringido")

    # Mostrar info del vendor login
    if settings.ENABLE_VENDOR_LOGIN:
        print("\n🔐 VENDOR LOGIN: HABILITADO ✅")
        print("   → Login automático al iniciar backend")
        print("   → Renovación automática de tokens cada 5 min")
    else:
        print("\n🔐 VENDOR LOGIN: DESHABILITADO ⚠️")
        print("   → Usando simulador/mock local")
        print("   → No hay conexión con vendors reales")

    # Mostrar info del vendor simulator
    if settings.VENDOR_SIMULATOR_ENABLED:
        print("\n🎭 VENDOR SIMULATOR ACTIVADO")
        print(f"   → URL: {settings.VENDOR_SIMULATOR_URL}")
        print("   → Las llamadas a vendors irán al simulador")
    
    print("="*60 + "\n")


# Validar al importar
validate_environment()


# ============================================================================
# BACKWARD COMPATIBILITY (mantiene código legacy funcionando)
# ============================================================================

def get_latcom_config() -> dict:
    """
    Obtiene configuración de LATCOM (backward compatibility)
    Para código existente que usa LATCOM

    Returns:
        Dict con configuración LATCOM
    """
    return {
        "url": settings.LATCOM_URL,
        "username": settings.LATCOM_USERNAME,
        "password": settings.LATCOM_PASSWORD,
        "api_key": settings.LATCOM_API_KEY,
        "user_uid": settings.LATCOM_USER_UID,
        "timeout": settings.LATCOM_TIMEOUT,
        "mode": settings.VENDOR_MODE,
        "mock_mode": settings.MOCK_MODE,
        "mock_delay": settings.MOCK_DELAY
    }


# ============================================================================
# EJEMPLO DE USO
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("CONFIGURACIÓN - LATCONECTA")
    print("="*60 + "\n")

    info = get_environment_info()
    for key, value in info.items():
        print(f"{key}: {value}")

    print("\n" + "="*60)
    print("CONFIGURACIÓN MOCK")
    print("="*60 + "\n")

    if is_development():
        mock_cfg = get_mock_config()
        for key, value in mock_cfg.items():
            print(f"{key}: {value}")
    else:
        print("Mock no disponible en este ambiente")

    print("\n" + "="*60)
    print("CONFIGURACIÓN LATCOM (Legacy)")
    print("="*60 + "\n")

    latcom = get_latcom_config()
    for key, value in latcom.items():
        if 'password' not in key.lower() and 'key' not in key.lower():
            print(f"{key}: {value}")
        else:
            print(f"{key}: {'*' * 8 if value else 'None'}")
