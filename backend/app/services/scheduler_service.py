"""
Scheduler Service
Ejecuta tareas programadas como renovación automática de tokens
"""
import asyncio
from datetime import datetime
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import AsyncSessionLocal  # ← CORREGIDO
from app.models.vendor import Vendor
from app.services.token_manager import token_manager
from app.config import settings

logger = logging.getLogger(__name__)


class SchedulerService:
    """
    Servicio de tareas programadas
    
    Tareas:
    - Renovación automática de tokens de vendors
    - Ejecuta cada 5 minutos
    - Renueva tokens que expiran en menos de 5 minutos
    """
    
    def __init__(self):
        self._running = False
        self._task = None
        self._interval_seconds = 300  # 5 minutos
    
    async def start(self):
        """Inicia el scheduler"""
        if self._running:
            logger.warning("⚠️ Scheduler ya está corriendo")
            return
        
        if not settings.ENABLE_VENDOR_LOGIN:
            logger.info("⚠️ Scheduler NO iniciado (vendor login deshabilitado)")
            return
        
        self._running = True
        self._task = asyncio.create_task(self._run())
        logger.info(f"🚀 Scheduler iniciado (intervalo: {self._interval_seconds}s)")
    
    async def stop(self):
        """Detiene el scheduler"""
        if not self._running:
            return
        
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("🛑 Scheduler detenido")
    
    async def _run(self):
        """Loop principal del scheduler"""
        while self._running:
            try:
                await self._refresh_tokens_task()
                
                # Ejecutar cada X segundos
                await asyncio.sleep(self._interval_seconds)
                
            except asyncio.CancelledError:
                logger.info("⚠️ Scheduler cancelado")
                break
            except Exception as e:
                logger.error(f"❌ Error en scheduler loop: {e}", exc_info=True)
                # Esperar 1 minuto antes de reintentar si hay error
                await asyncio.sleep(60)
    
    async def _refresh_tokens_task(self):
        """Tarea de renovación de tokens"""
        try:
            logger.debug("🔄 Verificando tokens que necesitan renovación...")
            
            # Obtener vendors que necesitan refresh (expiran en < 5 min)
            vendors_to_refresh = await token_manager.get_all_vendors_needing_refresh(
                threshold_minutes=5
            )
            
            if not vendors_to_refresh:
                logger.debug("✅ Todos los tokens están vigentes")
                return
            
            logger.info(
                f"🔄 Renovando tokens para {len(vendors_to_refresh)} vendor(s): "
                f"{', '.join(vendors_to_refresh)}"
            )
            
            # Renovar cada vendor
            async with AsyncSessionLocal() as db:  # ← CORREGIDO
                for vendor_code in vendors_to_refresh:
                    try:
                        await self._login_vendor(db, vendor_code)
                    except Exception as e:
                        logger.error(
                            f"❌ Error renovando token para {vendor_code}: {e}",
                            exc_info=True
                        )
                        
        except Exception as e:
            logger.error(f"❌ Error en refresh_tokens_task: {e}", exc_info=True)
    
    async def _login_vendor(self, db: AsyncSession, vendor_code: str):
        """
        Ejecuta login para un vendor específico
        
        Args:
            db: Sesión de BD
            vendor_code: Código del vendor a renovar
        """
        logger.info(f"🔐 Renovando token para {vendor_code}...")
        
        try:
            # Obtener vendor de BD
            result = await db.execute(
                select(Vendor).where(
                    Vendor.vendor_code == vendor_code,
                    Vendor.vendor_status == 'active'
                )
            )
            vendor = result.scalar_one_or_none()
            
            if not vendor:
                logger.error(f"❌ Vendor {vendor_code} no encontrado o inactivo")
                return
            
            # Determinar URL según ambiente
            base_url = vendor.vendor_url_prod if vendor.is_production else vendor.vendor_url_uat
            
            if not base_url:
                logger.error(f"❌ {vendor_code}: URL no configurada")
                return
            
            # Importar aquí para evitar import circular
            from app.services.vendor_login_service import VendorLoginService
            
            login_service = VendorLoginService(db)
            token_result = await login_service.execute_login(vendor)
            
            if token_result and token_result.get('success'):
                token = token_result.get('access_token')
                expires_in = token_result.get('expires_in', 3000)
                
                # Guardar en cache
                await token_manager.set_token(
                    vendor_code,
                    token,
                    expires_in_seconds=expires_in
                )
                
                logger.info(f"✅ Token renovado exitosamente para {vendor_code}")
            else:
                error_msg = token_result.get('error', 'Unknown error') if token_result else 'No response'
                logger.error(f"❌ Login fallido para {vendor_code}: {error_msg}")
                
        except Exception as e:
            logger.error(f"❌ Error en login de {vendor_code}: {e}", exc_info=True)


# Instancia global singleton
scheduler_service = SchedulerService()