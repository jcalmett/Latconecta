"""
Configuración centralizada del proyecto Bitel
Maneja todas las variables de entorno y configuraciones del sistema
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Configuración de la aplicación Bitel
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
    APP_NAME: str = "Bitel API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # =========================================================================
    # CONFIGURACIÓN CORS
    # =========================================================================
    CORS_ORIGINS: list = [
        "http://localhost:5173",  # Bitel-Admin
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # Bitel-Users
        "http://127.0.0.1:5174",
        "http://localhost:3000",  # React alternativo
        "http://127.0.0.1:3000",
    ]
    
    # =========================================================================
    # CONFIGURACIÓN DE VENDORS (NUEVO)
    # =========================================================================
    
    # Modo de operación: 'mock' para desarrollo, 'real' para producción
    VENDOR_MODE: str = "mock"
    
    # Configuración de Latcom
    LATCOM_URL: Optional[str] = "https://uatlat.mitopup.com"
    LATCOM_USERNAME: Optional[str] = None
    LATCOM_PASSWORD: Optional[str] = None
    LATCOM_API_KEY: Optional[str] = None
    LATCOM_USER_UID: Optional[str] = None
    LATCOM_TIMEOUT: int = 45
    
    # Configuración de Mock (para desarrollo sin vendor real)
    MOCK_MODE: str = "success"  # success, timeout, product_not_found, etc.
    MOCK_DELAY: float = 1.0  # Segundos de delay simulado
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Instancia global de configuración
settings = Settings()