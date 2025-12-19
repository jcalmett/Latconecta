"""
FastAPI Main Application - Bitel Backend
API REST para la plataforma Bitel
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import JSONResponse
import time
from app.config import settings

# Crear instancia de FastAPI con metadata
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## API REST para Bitel Platform
    
    Plataforma digital de servicios para Bitel que permite:
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
    * **Companies** - Información de Bitel
    * **Services** - Tipos de servicios (Top Ups, Paquetes, etc.)
    * **Products** - Productos disponibles por servicio
    * **Users** - Gestión de usuarios
    * **Purchases** - Transacciones y compras
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
# OPCIÓN 2: MIDDLEWARE MÁS ESPECÍFICO
# Solo aplica CORS a archivos de imagen en /uploads
# ═══════════════════════════════════════════════════════════════════════

@app.middleware("http")
async def add_cors_headers_to_static_files(request: Request, call_next):
    """
    Middleware para agregar headers CORS solo a imágenes en /uploads
    Más específico que agregar a todo /uploads
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
        "message": "Bitel API - Backend",
        "version": settings.APP_VERSION,
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
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


# Importar y registrar routers
from app.routers import auth, users, products, services, companies, purchases, upload, countries, vendors, vendor_products, latconecta

# Registrar routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(companies.router, prefix="/api/v1/companies", tags=["Companies"])
app.include_router(services.router, prefix="/api/v1/services", tags=["Services"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(purchases.router, prefix="/api/v1/purchases", tags=["Purchases"])
app.include_router(countries.router, prefix="/api/v1/countries", tags=["Countries"])
app.include_router(vendors.router, prefix="/api/v1/vendors", tags=["vendors"])
app.include_router(vendor_products.router, prefix="/api/v1/vendor-products", tags=["vendor-products"])
app.include_router(latconecta.router, prefix="/api/v1/latconecta", tags=["Latconecta"])

# Upload router
from app.routers import upload
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
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} iniciado")
    print(f"📚 Documentación disponible en: http://127.0.0.1:8100/docs")
    print(f"🔍 Debug mode: {settings.DEBUG}")
    print(f"✅ Todos los routers cargados correctamente")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Evento al cerrar la aplicación"""
    print(f"👋 {settings.APP_NAME} detenido")
