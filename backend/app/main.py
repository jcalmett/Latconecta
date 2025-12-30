"""
FastAPI Main Application - Latconecta Backend
API REST para la plataforma Latconecta
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import JSONResponse
import time
import os
from app.config import settings

# Crear instancia de FastAPI con metadata
app = FastAPI(
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

    **Credenciales de prueba:**
    - Admin: admin@bitel.com.pe / admin123
    - User: juan@email.com / admin123

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
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════════════
# MIDDLEWARE PARA CORS EN ARCHIVOS ESTÁTICOS
# ═══════════════════════════════════════════════════════════════════════

@app.middleware("http")
async def add_cors_headers_to_static_files(request: Request, call_next):
    """
    Middleware para agregar headers CORS solo a imágenes en /uploads
    """
    response = await call_next(request)

    # Solo aplicar a archivos de imagen en /uploads
    if request.url.path.startswith("/uploads"):
        # Verificar si es una imagen
        image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg')
        if any(request.url.path.lower().endswith(ext) for ext in image_extensions):
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


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Endpoint raíz de la API
    
    Retorna información básica sobre la API
    """
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
    """
    Health check endpoint
    
    Verifica que la API esté funcionando correctamente
    """
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
    upload, 
    countries, 
    vendors, 
    vendor_products, 
    latconecta,
    vendor_api_mappings,  # ⭐ NUEVO
    mock_vendors          # ⭐ NUEVO
)

# Registrar routers con PREFIXES CORRECTOS
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

# ⭐ NUEVOS ROUTERS
app.include_router(vendor_api_mappings.router, prefix="/api/v1/vendor-api-mappings", tags=["Vendor API Mappings"])
app.include_router(mock_vendors.router, prefix="/api/v1/mock", tags=["Mock Vendors"])

# Upload router
app.include_router(upload.router, prefix="/api/v1")

# Servir archivos estáticos
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handler para errores 404"""
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint no encontrado",
            "path": str(request.url)
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handler para errores 500"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "message": str(exc) if settings.DEBUG else "Error interno"
        }
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """Evento al iniciar la aplicación"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    print("\n" + "="*70)
    print("🚀 LATCONECTA BACKEND - INICIADO")
    print("="*70)
    print(f"\n🌍 Ambiente: {environment.upper()}\n")
    
    if environment.lower() == "development":
        print("🧪 MODO DEVELOPMENT:")
        print("   ✅ Sistema completo con datos reales de BD")
        print("   ✅ Vendors, VendorProducts, ApiMappings configurados")
        print("   ✅ Llamadas HTTP interceptadas → Mock Universal")
        print("   ✅ Mock: http://localhost:8100/api/v1/mock/<vendor>/<operation>")
        print("   ✅ Fallback Legacy: http://localhost:8100/api/v1/mock/legacy/<api>")
        print("")
        print("   📊 Mock Config:")
        mock_success_rate = float(os.getenv("MOCK_SUCCESS_RATE", "0.95"))
        print(f"      - Success Rate: {mock_success_rate*100}%")
        print(f"      - Delay: {os.getenv('MOCK_DELAY_MIN', '0.5')}s - {os.getenv('MOCK_DELAY_MAX', '2.0')}s")
        print("      - Legacy Fallback: Enabled")
        print("")
    
    print("📚 Documentación:")
    print("   • Swagger UI: http://localhost:8100/docs")
    print("   • ReDoc: http://localhost:8100/redoc")
    print("")
    print("📋 Convención de Códigos API Mappings:")
    print("   • VAL01: Validación")
    print("   • PRO01: Provisionamiento (obligatorio)")
    print("   • QRY01: Consulta")
    print("   • REV01: Reversión")
    print("")
    print("✅ Todos los routers cargados correctamente")
    print("="*70 + "\n")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Evento al cerrar la aplicación"""
    print("\n👋 Latconecta API - Backend detenido\n")