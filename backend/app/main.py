"""
FastAPI Main Application - Latconecta Backend
API REST para la plataforma Latconecta
🔒 MEJORADO: CORS usa settings.CORS_ORIGINS (dinámico por ambiente)
🔒 MEJORADO: Security headers reforzados
"""

from contextlib import asynccontextmanager
from app.routers import exchange_rate
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import JSONResponse
import time
import os
from app.config import settings
from app.events import startup_event, shutdown_event
from app.payments.router import router as payments_router

# ✅ Rate limiting
from app.rate_limit import limiter, RATE_LIMITS, configure_rate_limits

# Deshabilitar docs en producción
_docs_url    = None if settings.ENVIRONMENT == "production" else "/docs"
_redoc_url   = None if settings.ENVIRONMENT == "production" else "/redoc"
_openapi_url = None if settings.ENVIRONMENT == "production" else "/openapi.json"


# Lifespan — reemplaza @app.on_event("startup") / ("shutdown") deprecados
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestiona el ciclo de vida de la aplicación (startup / shutdown)"""
    await startup_event()
    yield
    await shutdown_event()


# Crear instancia de FastAPI con metadata
app = FastAPI(
    lifespan=lifespan,
    title="Latconecta API",
    version="2.0.0",
    description="""
    ## API REST para Latconecta Platform

    Plataforma digital de servicios multi-tenant que permite:
    * 📱 **Top Ups** - Recargas de celular
    * 📦 **Paquetes** - Paquetes de datos y minutos
    * 🏠 **Servicios Fijos** - Telefonía fija
    * 📱 **Smartphones** - Venta de dispositivos

    ### Autenticación
    La API utiliza JWT (JSON Web Tokens) para autenticación.

    ### Roles de Usuario
    * **user**: Usuario regular (puede hacer compras)
    * **admin**: Administrador (puede gestionar productos y servicios)
    * **superadmin**: Super administrador (acceso completo)

    ### Endpoints Principales
    * **Authentication** - Login, registro y perfil
    * **Companies** - Información de compañías
    * **Services** - Tipos de servicios (Top Ups, Paquetes, etc.)
    * **Products** - Productos disponibles por servicio
    * **Users** - Gestión de usuarios
    * **Purchases** - Transacciones y compras
    * **Vendor API Mappings** - Mapeo de APIs de vendors
    * **Mock Vendors** - Sistema de mock para testing
    * **Operations Config** - Control centralizado de operaciones
    * **Reclamaciones** - Libro de Reclamaciones Virtual LR-001
    """,
    docs_url=_docs_url,
    redoc_url=_redoc_url,
    openapi_url=_openapi_url
)

# ✅ Configurar rate limiting
configure_rate_limits(app)

# ✅ Configurar CORS con orígenes seguros desde settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)

# ═══════════════════════════════════════════════════════════════════════════
# MIDDLEWARE PARA CORS EN ARCHIVOS ESTÁTICOS
# ═══════════════════════════════════════════════════════════════════════════

@app.middleware("http")
async def add_cors_headers_to_static_files(request: Request, call_next):
    """
    Middleware para agregar headers CORS solo a imágenes en /uploads
    """
    response = await call_next(request)

    if request.url.path.startswith("/uploads"):
        image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg')
        if any(request.url.path.lower().endswith(ext) for ext in image_extensions):
            origin = request.headers.get("origin")
            if settings.ENVIRONMENT in ["production", "uat"]:
                if origin in settings.CORS_ORIGINS:
                    response.headers["Access-Control-Allow-Origin"] = origin
            else:
                response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"

    return response

# Middleware para asegurar charset UTF-8 en responses
@app.middleware("http")
async def add_charset_middleware(request, call_next):
    response = await call_next(request)
    content_type = response.headers.get("content-type", "")
    if "application/json" in content_type and "charset" not in content_type:
        response.headers["content-type"] = "application/json; charset=utf-8"
    return response

# Middleware para logging de requests
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Middleware para agregar tiempo de procesamiento en headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 🔒 Middleware para security headers adicionales
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Agrega headers de seguridad a todas las respuestas"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Latconecta API - Backend",
        "version": "2.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "operational"
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    environment = os.getenv("ENVIRONMENT", "development")
    return {
        "status": "ok",
        "app": "Latconecta API",
        "version": "2.0.0",
        "environment": environment
    }


# Importar y registrar routers
from app.routers import (
    auth,
    users,
    products,
    services,
    companies,
    purchases,
    exchange_rate,
    upload,
    countries,
    vendors,
    vendor_products,
    latconecta,
    vendor_api_mappings,
    mock_vendors,
    operations_config,
)

# ✅ LR-001 — Libro de Reclamaciones Virtual
from app.complaints.router import router as complaints_router

# Registrar routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(companies.router, prefix="/api/v1/companies", tags=["Companies"])
app.include_router(services.router, prefix="/api/v1/services", tags=["Services"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(purchases.router, prefix="/api/v1/purchases", tags=["Purchases"])
app.include_router(countries.router, prefix="/api/v1/countries", tags=["Countries"])
app.include_router(vendors.router, prefix="/api/v1/vendors", tags=["Vendors"])
app.include_router(vendor_products.router, prefix="/api/v1/vendor-products", tags=["Vendor Products"])
app.include_router(latconecta.router, prefix="/api/v1/latconecta", tags=["Latconecta"])
app.include_router(exchange_rate.router, prefix="/api/v1/exchange-rate", tags=["Exchange Rate"])

# ✅ Control centralizado de operaciones
app.include_router(operations_config.router, prefix="/api/v1/operations", tags=["Operations Config"])

# Vendor API Mappings y Mock Vendors
app.include_router(vendor_api_mappings.router, prefix="/api/v1/vendor-api-mappings", tags=["Vendor API Mappings"])
app.include_router(mock_vendors.router, prefix="/api/v1/mock", tags=["Mock Vendors"])

# Upload routers
from app.routers.upload_reclamaciones import router as upload_reclamaciones_router
app.include_router(upload_reclamaciones_router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")

# Payments router
app.include_router(payments_router, prefix="/api/v1")

# ✅ LR-001 — Libro de Reclamaciones Virtual
app.include_router(complaints_router, prefix="/api/v1", tags=["Reclamaciones"])

# Servir archivos estáticos
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint no encontrado",
            "path": str(request.url)
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "message": str(exc) if settings.DEBUG else "Error interno"
        }
    )
