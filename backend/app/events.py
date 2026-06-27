"""
Application Startup & Shutdown Events
"""
import logging
from sqlalchemy import select

from app.database import AsyncSessionLocal  # ← CORREGIDO
from app.models.vendor import Vendor
from app.services.scheduler_service import scheduler_service
from app.services.token_manager import token_manager
from app.services.vendor_login_service import VendorLoginService
from app.config import settings
from app.database import AsyncSessionLocal as _AsyncSessionLocal

logger = logging.getLogger(__name__)


async def startup_event():
    """
    Ejecuta al iniciar la aplicación
    
    Tareas:
    1. Login inicial de todos los vendors activos (solo en UAT/PROD)
    2. Inicia scheduler de renovación automática
    """
    logger.info("=" * 80)
    logger.info("🚀 INICIANDO LATCONECTA BACKEND")
    logger.info("=" * 80)
    
    # Log de configuración
    logger.info(f"📌 Ambiente: {settings.ENVIRONMENT}")
    logger.info(f"📌 Vendor Login: {'ENABLED ✅' if settings.ENABLE_VENDOR_LOGIN else 'DISABLED ⚠️'}")
    
    try:
        # Solo ejecutar login en UAT y PRODUCCIÓN
        if settings.ENABLE_VENDOR_LOGIN:
            logger.info("🔐 Vendor login HABILITADO - Ejecutando login inicial...")
            await initial_vendor_login()
            
            logger.info("⏰ Iniciando scheduler de renovación automática...")
            await scheduler_service.start()
        else:
            logger.info("⚠️ Vendor login DESHABILITADO (modo desarrollo/mock)")
            logger.info("💡 Usando simulador local para vendors")
        
        # Scheduler diario 08:00 Lima — alertas LR-001 integradas en SchedulerService._check_lr_deadlines_task()

        logger.info("=" * 80)
        logger.info("✅ STARTUP COMPLETADO - BACKEND LISTO")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"❌ ERROR EN STARTUP: {e}")
        logger.error("=" * 80)
        logger.error("Stack trace:", exc_info=True)
        # No lanzar excepción para que el backend siga corriendo


async def shutdown_event():
    """
    Ejecuta al detener la aplicación
    
    Tareas:
    1. Detiene scheduler
    2. Limpia recursos
    """
    logger.info("=" * 80)
    logger.info("🛑 DETENIENDO LATCONECTA BACKEND")
    logger.info("=" * 80)
    
    try:
        if settings.ENABLE_VENDOR_LOGIN:
            logger.info("⏰ Deteniendo scheduler...")
            await scheduler_service.stop()
        
        logger.info("=" * 80)
        logger.info("✅ SHUTDOWN COMPLETADO")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"❌ Error en shutdown: {e}", exc_info=True)


async def initial_vendor_login():
    """
    Login inicial de todos los vendors activos
    
    Se ejecuta al iniciar el backend (solo en UAT/PROD)
    Obtiene tokens de todos los vendors configurados
    """
    logger.info("-" * 80)
    logger.info("🔐 EJECUTANDO LOGIN INICIAL DE VENDORS")
    logger.info("-" * 80)
    
    try:
        async with AsyncSessionLocal() as db:  # ← CORREGIDO
            # Obtener vendors activos
            result = await db.execute(
                select(Vendor).where(Vendor.vendor_status == 'active')
            )
            vendors = result.scalars().all()
            
            if not vendors:
                logger.warning("⚠️ No hay vendors activos configurados en BD")
                return
            
            logger.info(f"📋 {len(vendors)} vendor(s) activo(s) encontrado(s)")
            
            login_service = VendorLoginService(db)
            
            # Login de cada vendor
            success_count = 0
            failed_count = 0
            
            for vendor in vendors:
                try:

                    # Determinar ambiente
                    ambiente = "PROD" if vendor.is_production else "UAT"
                    base_url = vendor.vendor_url_prod if vendor.is_production else vendor.vendor_url_uat
                    
                    logger.info(f"")
                    logger.info(f"🔐 Login: {vendor.vendor_code} ({ambiente})")
                    logger.info(f"   URL: {base_url}")
                    
                    # Ejecutar login
                    token_result = await login_service.execute_login(vendor)
                    
                    if token_result and token_result.get('success'):
                        token = token_result.get('access_token')
                        expires_in = token_result.get('expires_in', 3000)
                        
                        # Guardar en token manager
                        await token_manager.set_token(
                            vendor.vendor_code,
                            token,
                            expires_in_seconds=expires_in
                        )
                        
                        logger.info(f"   ✅ Token obtenido (expira en {expires_in/60:.0f} min)")
                        success_count += 1
                    else:
                        error = token_result.get('error', 'Unknown error') if token_result else 'No response'
                        logger.error(f"   ❌ Login falló: {error}")
                        failed_count += 1
                        
                except Exception as e:
                    logger.error(f"   ❌ Error en login: {e}", exc_info=True)
                    failed_count += 1
            
            # Resumen
            logger.info("-" * 80)
            logger.info(f"📊 RESUMEN LOGIN INICIAL:")
            logger.info(f"   ✅ Exitosos: {success_count}")
            logger.info(f"   ❌ Fallidos: {failed_count}")
            logger.info(f"   📋 Total: {len(vendors)}")
            logger.info("-" * 80)
            
            # Mostrar estado del cache
            if success_count > 0:
                token_status = await token_manager.get_status()
                logger.info("🔑 Tokens en cache:")
                for vendor_code, status in token_status.items():
                    logger.info(f"   - {vendor_code}: válido por {status['seconds_remaining']/60:.0f} min")
                logger.info("-" * 80)
                
    except Exception as e:
        logger.error(f"❌ Error en initial_vendor_login: {e}", exc_info=True)
