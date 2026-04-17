"""
Scheduler Service
Ejecuta tareas programadas:
- Renovación automática de tokens de vendors
- Sincronización de catálogos de productos (catalog_sync)
"""
import asyncio
import json
import logging
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, text

from app.database import AsyncSessionLocal
from app.models.vendor import Vendor
from app.services.token_manager import token_manager
from app.config import settings

logger = logging.getLogger(__name__)


class SchedulerService:
    """
    Servicio de tareas programadas

    Tareas:
    - Tarea 1: Renovación automática de tokens de vendors
    - Tarea 2: Sincronización de catálogos de productos (precios Venezuela)
    - Ejecuta cada 5 minutos
    - Renueva tokens que expiran en menos de 5 minutos
    - Sincroniza catálogos según sync_interval_hours de cada vendor
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
                # Tarea 1: renovación de tokens de vendors
                await self._refresh_tokens_task()

                # Tarea 2: sincronización de catálogos de productos
                await self._sync_catalogs_task()

                # Esperar intervalo antes del próximo ciclo
                await asyncio.sleep(self._interval_seconds)

            except asyncio.CancelledError:
                logger.info("⚠️ Scheduler cancelado")
                break
            except Exception as e:
                logger.error(f"❌ Error en scheduler loop: {e}", exc_info=True)
                # Esperar 1 minuto antes de reintentar si hay error
                await asyncio.sleep(60)

    # =========================================================================
    # TAREA 1: RENOVACIÓN DE TOKENS
    # =========================================================================

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
            async with AsyncSessionLocal() as db:
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

    # =========================================================================
    # TAREA 2: SINCRONIZACIÓN DE CATÁLOGOS
    # =========================================================================

    async def _sync_catalogs_task(self):
        """
        Tarea de sincronización de catálogos de productos.

        Ejecuta catalog_sync para cada vendor activo que tenga:
          - auto_sync_products = True
          - Un mapping activo con operation_type = 'catalog_sync'

        La frecuencia está controlada por sync_interval_hours del vendor
        comparada con last_sync_date. Si nunca se sincronizó (NULL) o si
        ya pasó el intervalo configurado, se ejecuta el sync.
        """
        try:
            logger.debug("🔄 Verificando vendors con sync de catálogo pendiente...")

            async with AsyncSessionLocal() as db:

                # Obtener vendors activos con auto_sync habilitado
                result = await db.execute(
                    select(Vendor).where(
                        and_(
                            Vendor.vendor_status == 'active',
                            Vendor.auto_sync_products == True
                        )
                    )
                )
                vendors = result.scalars().all()

                if not vendors:
                    logger.debug("✅ No hay vendors con auto_sync_products habilitado")
                    return

                now = datetime.now()

                for vendor in vendors:
                    try:
                        # Verificar si ya pasó el intervalo configurado
                        if vendor.last_sync_date is not None:
                            interval = timedelta(hours=vendor.sync_interval_hours or 24)
                            next_sync = vendor.last_sync_date + interval
                            if now < next_sync:
                                logger.debug(
                                    f"⏳ {vendor.vendor_code}: próximo sync "
                                    f"{next_sync.strftime('%Y-%m-%d %H:%M')}"
                                )
                                continue

                        logger.info(
                            f"🔄 Ejecutando catalog_sync para {vendor.vendor_code}..."
                        )

                        # Buscar el api_group_code que tiene catalog_sync activo
                        group_query = await db.execute(
                            text("""
                                SELECT api_group_code
                                FROM vendor_api_mappings
                                WHERE vendor_code    = :vendor_code
                                  AND operation_type = 'catalog_sync'
                                  AND is_active      = true
                                LIMIT 1
                            """),
                            {"vendor_code": vendor.vendor_code}
                        )
                        group_row = group_query.fetchone()

                        if not group_row:
                            logger.debug(
                                f"⚠️ {vendor.vendor_code}: sin mapping "
                                f"catalog_sync activo — omitido"
                            )
                            continue

                        # Ejecutar sync con sesión independiente
                        async with AsyncSessionLocal() as sync_db:
                            from app.services.universal_vendor_service import (
                                UniversalVendorService
                            )
                            service = UniversalVendorService(sync_db)
                            sync_result = await service.execute_catalog_sync(
                                vendor_code=vendor.vendor_code,
                                api_group_code=group_row.api_group_code,
                                triggered_by='scheduler'
                            )

                        if sync_result.get('success'):
                            logger.info(
                                f"✅ {vendor.vendor_code} catalog_sync OK — "
                                f"revisados: {sync_result.get('products_reviewed', 0)}, "
                                f"actualizados: {sync_result.get('products_updated', 0)}"
                            )
                        else:
                            logger.error(
                                f"❌ {vendor.vendor_code} catalog_sync FALLÓ — "
                                f"{sync_result.get('error_message', 'error desconocido')}"
                            )

                        # Guardar log en vendor_sync_logs
                        await self._save_sync_log(
                            db, vendor.vendor_code, sync_result
                        )

                    except Exception as e:
                        logger.error(
                            f"❌ Error en catalog_sync de {vendor.vendor_code}: {e}",
                            exc_info=True
                        )

        except Exception as e:
            logger.error(f"❌ Error en _sync_catalogs_task: {e}", exc_info=True)

    async def _save_sync_log(
        self,
        db: AsyncSession,
        vendor_code: str,
        sync_result: dict
    ):
        """
        Guarda el resultado del sync en vendor_sync_logs.

        Args:
            db: Sesión de BD
            vendor_code: Código del vendor
            sync_result: Resultado retornado por execute_catalog_sync
        """
        try:
            # Determinar status del log
            if not sync_result.get('success'):
                status = 'error'
            elif sync_result.get('products_updated', 0) == 0:
                status = 'no_changes'
            else:
                status = 'success'

            await db.execute(
                text("""
                    INSERT INTO vendor_sync_logs (
                        vendor_code,
                        api_group_code,
                        triggered_by,
                        status,
                        products_reviewed,
                        products_updated,
                        error_message,
                        changes_detail,
                        created_by
                    ) VALUES (
                        :vendor_code,
                        :api_group_code,
                        :triggered_by,
                        :status,
                        :products_reviewed,
                        :products_updated,
                        :error_message,
                        :changes_detail::jsonb,
                        'System'
                    )
                """),
                {
                    "vendor_code":       vendor_code,
                    "api_group_code":    sync_result.get('api_group_code', ''),
                    "triggered_by":      sync_result.get('triggered_by', 'scheduler'),
                    "status":            status,
                    "products_reviewed": sync_result.get('products_reviewed', 0),
                    "products_updated":  sync_result.get('products_updated', 0),
                    "error_message":     sync_result.get('error_message'),
                    "changes_detail":    json.dumps(
                        sync_result.get('changes_detail', [])
                    ),
                }
            )
            await db.commit()

        except Exception as e:
            logger.error(
                f"❌ Error guardando sync_log para {vendor_code}: {e}",
                exc_info=True
            )


# Instancia global singleton
scheduler_service = SchedulerService()
