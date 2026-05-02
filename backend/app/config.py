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
        "http://77.42.92.151:5173",
        "http://77.42.92.151:5174",
        "http://77.42.92.151",
    ]

    # =========================================================================
    # CONFIGURACIÓN DE AMBIENTE
    # =========================================================================
    ENVIRONMENT: str = "development"

    # =========================================================================
    # CONFIGURACIÓN DE DEPLOYMENT (País de instalación)
    # =========================================================================
    DEPLOYMENT_COUNTRY: str = "PE"

    # Gateway de pagos activo para esta instalación
    # PE → culqi   (tarjeta, Yape, billeteras, PagoEfectivo)
    # MX → conekta (tarjeta, OXXO, SPEI) - futuro
    # US → stripe  (tarjeta, Apple Pay)  - futuro
    PAYMENT_GATEWAY: str = "culqi"

    # =========================================================================
    # MÉTODOS DE PAGO DISPONIBLES POR INSTALACIÓN
    # =========================================================================
    CARD_AVAILABLE: bool = True
    BARCODE_AVAILABLE: bool = True

    # =========================================================================
    # CONFIGURACIÓN DE CULQI - PASARELA DE PAGOS (Peru)
    # Solo aplica cuando PAYMENT_GATEWAY=culqi
    # =========================================================================
    CULQI_PUBLIC_KEY: str = ""
    CULQI_SECRET_KEY: str = ""
    CULQI_RSA_ID: str = ""
    CULQI_RSA_PUBLIC_KEY: str = ""

    # =========================================================================
    # CONFIGURACIÓN SMTP — RECUPERACIÓN DE CONTRASEÑA
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
    ENABLE_VENDOR_LOGIN: bool = False

    # =========================================================================
    # CONFIGURACIÓN DE MOCK (Solo para DEVELOPMENT)
    # =========================================================================
    MOCK_SUCCESS_RATE: float = 0.95
    MOCK_DELAY_MIN: float = 0.5
    MOCK_DELAY_MAX: float = 2.0
    MOCK_FORCED_ERROR: Optional[str] = None

    # =========================================================================
    # CONFIGURACIÓN DE VENDOR SIMULATOR (Fase 2)
    # =========================================================================
    VENDOR_SIMULATOR_ENABLED: bool = True
    VENDOR_SIMULATOR_URL: str = "http://localhost:5001"

    # =========================================================================
    # CONFIGURACIÓN DE VENDORS
    # =========================================================================
    VENDOR_MODE: str = "mock"
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
    MOCK_MODE: str = "success"
    MOCK_DELAY: float = 1.0

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
    return settings.ENVIRONMENT == "development"


def is_uat() -> bool:
    return settings.ENVIRONMENT == "uat"


def is_production() -> bool:
    return settings.ENVIRONMENT == "production"


def get_mock_config() -> dict:
    return {
        "success_rate": settings.MOCK_SUCCESS_RATE,
        "delay_min": settings.MOCK_DELAY_MIN,
        "delay_max": settings.MOCK_DELAY_MAX,
        "forced_error": settings.MOCK_FORCED_ERROR
    }


def get_environment_info() -> dict:
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
    valid_environments = ["development", "uat", "production"]

    if settings.ENVIRONMENT not in valid_environments:
        raise ValueError(
            f"ENVIRONMENT debe ser uno de: {valid_environments}. "
            f"Valor actual: {settings.ENVIRONMENT}"
        )

    print("\n" + "="*60)
    print("🚀 LATCONECTA - CONFIGURACIÓN")
    print("="*60)
    print(f"🌍 Ambiente: {settings.ENVIRONMENT.upper()}")
    print(f"🌍 País: {settings.DEPLOYMENT_COUNTRY} | Gateway: {settings.PAYMENT_GATEWAY}")
    print(f"💳 Tarjeta: {'✅' if settings.CARD_AVAILABLE else '❌'} | Barcode: {'✅' if settings.BARCODE_AVAILABLE else '❌'}")

    if is_development():
        print("🧪 Modo: DEVELOPMENT")
        print("   → Usando MOCK UNIVERSAL (no vendors reales)")
    elif is_uat():
        print("🔬 Modo: UAT")
        print("   → Usando APIs REALES de vendors (ambiente UAT)")
    else:
        print("🏭 Modo: PRODUCTION")
        print("   → Usando APIs REALES de vendors (ambiente PRODUCCIÓN)")

    if settings.ENABLE_VENDOR_LOGIN:
        print("\n🔐 VENDOR LOGIN: HABILITADO ✅")
    else:
        print("\n🔐 VENDOR LOGIN: DESHABILITADO ⚠️")

    if settings.VENDOR_SIMULATOR_ENABLED:
        print("\n🎭 VENDOR SIMULATOR ACTIVADO")
        print(f"   → URL: {settings.VENDOR_SIMULATOR_URL}")

    print("="*60 + "\n")


# Validar al importar
validate_environment()


# ============================================================================
# BACKWARD COMPATIBILITY
# ============================================================================

def get_latcom_config() -> dict:
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


if __name__ == "__main__":
    info = get_environment_info()
    for key, value in info.items():
        print(f"{key}: {value}")
