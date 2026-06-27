"""
Exchange Rate Service
Obtiene tasas de cambio de APIs externas con fallbacks y aplicación de márgenes

Fuentes:
1. ExchangeRate-API (primaria)
2. Open Exchange Rates (backup)
3. Base de datos (fallback)

Márgenes Latconecta (según casos de negocio):
- 'conciliation': +5% a favor de Latconecta (CASO 1: conciliar pagos MXN a balance USD)
- 'pricing': -5% menos favorable para usuario (CASOS 2 y 3: fijar precios y convertir pagos)
- 'none': 0% sin margen (para conversiones internas o informativas)
"""

import httpx
import logging
from typing import Optional, Literal
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.country import Country

logger = logging.getLogger(__name__)


class ExchangeRateService:
    """Servicio para obtener tasas de cambio"""
    
    # URLs de APIs
    PRIMARY_API_URL = "https://api.exchangerate-api.com/v4/latest/{currency}"
    BACKUP_API_URL = "https://openexchangerates.org/api/latest.json"
    BACKUP_API_KEY = None  # Configurar en producción
    
    # Caché en memoria (simple)
    _cache = {}
    _cache_duration = timedelta(hours=1)
    
    @classmethod
    async def get_exchange_rate(
        cls,
        from_currency: str,
        to_currency: str,
        margin_type: Literal['conciliation', 'pricing', 'none'] = 'none',
        db: Optional[AsyncSession] = None
    ) -> float:
        """
        Obtiene tasa de cambio con margen aplicado
        
        Args:
            from_currency: Moneda origen (USD, PEN, MXN, etc)
            to_currency: Moneda destino
            margin_type: Tipo de margen a aplicar
                - 'conciliation': +5% (CASO 1: conciliar pagos MXN→USD en balance)
                - 'pricing': -5% (CASOS 2 y 3: fijar precios USD→MXN, convertir pagos USD→MXN)
                - 'none': 0% (sin margen, conversiones informativas)
            db: Sesión de base de datos (para fallback)
        
        Returns:
            float: Tasa de cambio con margen aplicado
        
        Example:
            >>> # CASO 1: Conciliar pago MXN a balance USD
            >>> await get_exchange_rate("MXN", "USD", "conciliation")
            0.047619  # (1/21.00) - Latconecta gana
            
            >>> # CASO 2: Fijar precio USD, pagar vendor MXN
            >>> await get_exchange_rate("USD", "MXN", "pricing")
            19.00  # 20.00 × 0.95 - Usuario paga menos MXN al vendor
            
            >>> # CASO 3: Cliente paga USD, enviar MXN al vendor
            >>> await get_exchange_rate("USD", "MXN", "pricing")
            19.00  # 20.00 × 0.95 - Usuario envía menos MXN
        """
        
        # Caso especial: misma moneda
        if from_currency == to_currency:
            return 1.0
        
        # Obtener tasa oficial
        official_rate = await cls._get_official_rate(from_currency, to_currency, db)
        
        # Aplicar margen
        if margin_type == 'conciliation':
            # CASO 1: +5% a favor de Latconecta
            # Ejemplo: 200 MXN ÷ 21.00 = 9.52 USD (menos USD = gana Latconecta)
            final_rate = official_rate * 1.05
            logger.info(
                f"Exchange rate {from_currency}/{to_currency}: "
                f"{official_rate} → {final_rate} (+5% conciliation margin)"
            )
            
        elif margin_type == 'pricing':
            # CASOS 2 y 3: -5% menos favorable para cliente
            # Ejemplo: 10.53 USD × 19.00 = 200 MXN (menos MXN al vendor = protege Latconecta)
            final_rate = official_rate * 0.95
            logger.info(
                f"Exchange rate {from_currency}/{to_currency}: "
                f"{official_rate} → {final_rate} (-5% pricing margin)"
            )
            
        else:  # 'none'
            final_rate = official_rate
            logger.info(
                f"Exchange rate {from_currency}/{to_currency}: "
                f"{official_rate} (no margin)"
            )
        
        return round(final_rate, 6)
    
    @classmethod
    async def _get_official_rate(
        cls,
        from_currency: str,
        to_currency: str,
        db: Optional[AsyncSession] = None
    ) -> float:
        """
        Obtiene tasa oficial de cambio sin margen
        Intenta: API primaria → API backup → Base de datos
        """
        
        # Verificar caché
        cache_key = f"{from_currency}_{to_currency}"
        if cache_key in cls._cache:
            cached_data = cls._cache[cache_key]
            if datetime.now() - cached_data['timestamp'] < cls._cache_duration:
                logger.debug(f"Using cached rate for {cache_key}")
                return cached_data['rate']
        
        # Intentar API primaria
        try:
            rate = await cls._fetch_from_primary_api(from_currency, to_currency)
            if rate:
                # Guardar en caché
                cls._cache[cache_key] = {
                    'rate': rate,
                    'timestamp': datetime.now()
                }
                return rate
        except Exception as e:
            logger.warning(f"Primary API failed: {e}")
        
        # Intentar API backup
        try:
            rate = await cls._fetch_from_backup_api(from_currency, to_currency)
            if rate:
                cls._cache[cache_key] = {
                    'rate': rate,
                    'timestamp': datetime.now()
                }
                return rate
        except Exception as e:
            logger.warning(f"Backup API failed: {e}")
        
        # Fallback a base de datos
        if db:
            try:
                rate = await cls._fetch_from_database(from_currency, to_currency, db)
                if rate:
                    logger.warning(f"Using database fallback rate for {cache_key}")
                    return rate
            except Exception as e:
                logger.error(f"Database fallback failed: {e}")
        
        # Si todo falla, usar tasa por defecto según moneda
        logger.error(f"All sources failed for {from_currency}/{to_currency}, using default")
        return cls._get_default_rate(from_currency, to_currency)
    
    @classmethod
    async def _fetch_from_primary_api(
        cls,
        from_currency: str,
        to_currency: str
    ) -> Optional[float]:
        """
        Obtiene tasa de ExchangeRate-API (primaria)
        
        Endpoint: https://api.exchangerate-api.com/v4/latest/{from_currency}
        Retorna: { "rates": { "PEN": 3.75, "MXN": 20.00, ... } }
        """
        
        url = cls.PRIMARY_API_URL.format(currency=from_currency)
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'rates' in data and to_currency in data['rates']:
                    rate = float(data['rates'][to_currency])
                    logger.info(
                        f"Primary API: {from_currency}/{to_currency} = {rate}"
                    )
                    return rate
        
        return None
    
    @classmethod
    async def _fetch_from_backup_api(
        cls,
        from_currency: str,
        to_currency: str
    ) -> Optional[float]:
        """
        Obtiene tasa de Open Exchange Rates (backup)
        
        Nota: Requiere API key (configurar en producción)
        """
        
        if not cls.BACKUP_API_KEY:
            logger.warning("Backup API key not configured")
            return None
        
        url = f"{cls.BACKUP_API_URL}?app_id={cls.BACKUP_API_KEY}"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                # Open Exchange Rates siempre retorna con base USD
                if 'rates' in data:
                    rates = data['rates']
                    
                    if from_currency == 'USD':
                        # USD → to_currency
                        if to_currency in rates:
                            rate = float(rates[to_currency])
                            logger.info(
                                f"Backup API: {from_currency}/{to_currency} = {rate}"
                            )
                            return rate
                    else:
                        # from_currency → to_currency (conversión indirecta)
                        if from_currency in rates and to_currency in rates:
                            # from → USD → to
                            usd_from = float(rates[from_currency])
                            usd_to = float(rates[to_currency])
                            rate = usd_to / usd_from
                            logger.info(
                                f"Backup API: {from_currency}/{to_currency} = {rate} (indirect)"
                            )
                            return rate
        
        return None
    
    @classmethod
    async def _fetch_from_database(
        cls,
        from_currency: str,
        to_currency: str,
        db: AsyncSession
    ) -> Optional[float]:
        """
        Obtiene tasa de base de datos (fallback)
        
        Actualmente solo soporta USD → PEN desde countries.country_er_usd
        """
        
        # Solo soporta USD → PEN por ahora
        if from_currency == 'USD' and to_currency == 'PEN':
            # Obtener país PE
            result = await db.execute(
                select(Country).where(Country.country_code == 'PE')
            )
            country = result.scalar_one_or_none()
            
            if country and country.country_er_usd:
                rate = float(country.country_er_usd)
                logger.info(
                    f"Database: {from_currency}/{to_currency} = {rate} "
                    f"(from countries.country_er_usd)"
                )
                return rate
        
        elif from_currency == 'PEN' and to_currency == 'USD':
            # Inversa: PEN → USD
            result = await db.execute(
                select(Country).where(Country.country_code == 'PE')
            )
            country = result.scalar_one_or_none()
            
            if country and country.country_er_usd:
                rate = 1.0 / float(country.country_er_usd)
                logger.info(
                    f"Database: {from_currency}/{to_currency} = {rate} (inverse)"
                )
                return rate
        
        return None
    
    @classmethod
    def _get_default_rate(cls, from_currency: str, to_currency: str) -> float:
        """
        Tasas por defecto (último recurso)
        Solo para desarrollo/emergencia
        """
        
        defaults = {
            ('USD', 'PEN'): 3.75,
            ('USD', 'MXN'): 20.00,
            ('USD', 'BOL'): 6.91,
            ('USD', 'COP'): 4000.00,
            ('PEN', 'USD'): 0.2667,
            ('MXN', 'USD'): 0.05,
            ('BOL', 'USD'): 0.1448,
            ('COP', 'USD'): 0.00025,
        }
        
        key = (from_currency, to_currency)
        if key in defaults:
            logger.warning(
                f"Using DEFAULT rate for {from_currency}/{to_currency}: "
                f"{defaults[key]}"
            )
            return defaults[key]
        
        # Si no hay default, retornar 1.0
        logger.error(
            f"No default rate for {from_currency}/{to_currency}, returning 1.0"
        )
        return 1.0
    
    @classmethod
    def clear_cache(cls):
        """Limpiar caché (útil para testing)"""
        cls._cache = {}
        logger.info("Exchange rate cache cleared")


# Instancia global
exchange_rate_service = ExchangeRateService()
