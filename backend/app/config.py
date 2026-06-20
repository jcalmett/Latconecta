"""
Configuración centralizada del proyecto Latconecta
Variables de sistema únicamente - Datos de vendors están en BD
🔒 MEJORADO: Validación de SECRET_KEY (mínimo 32 caracteres)
🔒 MEJORADO: CORS dinámico por ambiente (local vs producción)
"""

from pydantic_settings import BaseSettings
from typing import Optional, List
import warnings


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
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    # =========================================================================
    # CONFIGURACIÓN CORS - Lista de orígenes permitidos
    # =========================================================================
    # Desarrollo local
    LOCAL_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]
    
    # Producción / UAT
    PRODUCTION_ORIGINS: List[str] = [
        "https://77.42.92.151",
        "https://77.42.92.151/latconecta_admin",
        "https://77.42.92.151/latconecta_users",
        "http://77.42.92.151:8100",  # Backend directo (para debugging)
        "https://77.42.92.151:5176",  # Culqi sandbox simulator
        "https://peruse.latconecta.com",
        "https://peradm.latconecta.com",
    ]

    # =========================================================================
    # CONFIGURACIÓN DE AMBIENTE Y PAÍS
    # =========================================================================
    ENVIRONMENT: str = "development"
    DEPLOYMENT_COUNTRY: str = "PE"
    PAYMENT_GATEWAY: str = "culqi"

    # =========================================================================
    # IMPUESTO A LAS VENTAS — CONFIGURABLE POR PAÍS DE INSTALACIÓN
    # PE: IGV 18% | MX: IVA 16% | VE: IVA 16%
    # =========================================================================
    TAX_LABEL: str = "IGV"
    TAX_RATE: float = 0.18

    # =========================================================================
    # MÉTODOS DE PAGO DISPONIBLES POR INSTALACIÓN
    # =========================================================================
    CARD_AVAILABLE: bool = True
    BARCODE_AVAILABLE: bool = True
    # PIN para acceso al OperationsPanel — requerido para cambiar F1/F2
    # Vacío = panel deshabilitado (producción). Definir en .env para pruebas.
    OPS_PANEL_PIN: str = ""

    # =========================================================================
    # CONFIGURACIÓN DE CULQI - PASARELA DE PAGOS (Perú)
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
    # CONTROL DE VENDORS
    # =========================================================================
    ENABLE_VENDOR_LOGIN: bool = False
    VENDOR_SIMULATOR_ENABLED: bool = True
    VENDOR_SIMULATOR_URL: str = "http://localhost:5001"

    # =========================================================================
    # CONFIGURACIÓN DE MOCK (Solo para DEVELOPMENT)
    # =========================================================================
    MOCK_SUCCESS_RATE: float = 0.95
    MOCK_DELAY_MIN: float = 0.5
    MOCK_DELAY_MAX: float = 2.0
    MOCK_FORCED_ERROR: Optional[str] = None

    # =========================================================================
    # REDIS (opcional - para token_manager multi-instancia)
    # =========================================================================
    REDIS_URL: Optional[str] = None

    # =========================================================================
    # SEGURIDAD
    # =========================================================================
    RATE_LIMIT_PER_MINUTE: int = 10  # Intentos de login por minuto
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

    @property
    def CORS_ORIGINS(self) -> List[str]:
        """
        🔒 Retorna los orígenes CORS permitidos según el ambiente.
        En desarrollo: permite localhosts.
        En UAT/Producción: solo dominios seguros (HTTPS).
        """
        if self.ENVIRONMENT in ["production", "uat"]:
            return self.PRODUCTION_ORIGINS
        return self.LOCAL_ORIGINS + self.PRODUCTION_ORIGINS

    def model_post_init(self, __context):
        """
        🔒 Validaciones post-inicialización (CRÍTICAS)
        """
        # 1. Validar SECRET_KEY (mínimo 32 caracteres)
        if len(self.SECRET_KEY) < 32:
            raise ValueError(
                f"❌ SECRET_KEY debe tener al menos 32 caracteres. "
                f"Longitud actual: {len(self.SECRET_KEY)}. "
                f"Genera una clave segura con: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )
        
        # 2. Validar entorno
        valid_envs = ["development", "uat", "production"]
        if self.ENVIRONMENT not in valid_envs:
            raise ValueError(
                f"ENVIRONMENT debe ser uno de: {valid_envs}. "
                f"Valor actual: {self.ENVIRONMENT}"
            )
        
        # 3. Validar país de despliegue
        valid_countries = ["PE", "MX", "US"]
        if self.DEPLOYMENT_COUNTRY not in valid_countries:
            raise ValueError(
                f"DEPLOYMENT_COUNTRY debe ser uno de: {valid_countries}. "
                f"Valor actual: {self.DEPLOYMENT_COUNTRY}"
            )
        
        # 4. Validar consistencia de métodos de pago según país
        #    La tabla COUNTRY_PAYMENT_CONFIG (en gateway.py) es la fuente de verdad.
        #    Aquí solo validamos que el país tenga configuración definida.
        valid_gateways_by_country = {
            "PE": ["culqi"],
            "MX": ["stripe", "latamgroup"],   # por definir al integrar MX
            "US": ["stripe"],
        }
        allowed = valid_gateways_by_country.get(self.DEPLOYMENT_COUNTRY, [])
        if allowed and self.PAYMENT_GATEWAY not in allowed:
            raise ValueError(
                f"Para {self.DEPLOYMENT_COUNTRY} el PAYMENT_GATEWAY debe ser uno de: {allowed}. "
                f"Actual: {self.PAYMENT_GATEWAY}"
            )
        
        # 5. Advertencia en desarrollo con DEBUG activado
        if self.ENVIRONMENT == "development" and self.DEBUG:
            warnings.warn(
                "⚠️ Modo DEBUG activado en DEVELOPMENT. No usar en producción.",
                UserWarning
            )


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
        "vendor_login_enabled": settings.ENABLE_VENDOR_LOGIN,
        "deployment_country": settings.DEPLOYMENT_COUNTRY,
        "payment_gateway": settings.PAYMENT_GATEWAY,
        "card_available": settings.CARD_AVAILABLE,
        "barcode_available": settings.BARCODE_AVAILABLE,
    }


def validate_environment():
    """Imprime resumen de configuración al iniciar"""
    print("\n" + "="*60)
    print("🚀 LATCONECTA - CONFIGURACIÓN")
    print("="*60)
    print(f"🌍 Ambiente: {settings.ENVIRONMENT.upper()}")
    print(f"🌍 País: {settings.DEPLOYMENT_COUNTRY} | Gateway: {settings.PAYMENT_GATEWAY}")
    print(f"💳 Tarjeta: {'✅' if settings.CARD_AVAILABLE else '❌'} | Barcode: {'✅' if settings.BARCODE_AVAILABLE else '❌'}")
    print(f"🔐 SECRET_KEY: {'✅ OK (' + str(len(settings.SECRET_KEY)) + ' caracteres)' if len(settings.SECRET_KEY) >= 32 else '❌ DEMASIADO CORTA'}")

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

    if settings.REDIS_URL:
        print("\n🔄 REDIS: HABILITADO")
    else:
        print("\n🔄 REDIS: NO CONFIGURADO (token_manager en memoria)")

    print(f"\n🔒 CORS Orígenes permitidos ({len(settings.CORS_ORIGINS)}):")
    for origin in settings.CORS_ORIGINS:
        print(f"   → {origin}")

    print("="*60 + "\n")


# Validar al importar
validate_environment()


if __name__ == "__main__":
    info = get_environment_info()
    for key, value in info.items():
        print(f"{key}: {value}")
