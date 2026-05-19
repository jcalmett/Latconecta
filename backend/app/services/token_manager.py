"""
Token Manager Service
Gestiona tokens de autenticación de vendors en cache de memoria
"""
from typing import Optional, Dict
from datetime import datetime, timedelta, timezone
import asyncio
import logging

logger = logging.getLogger(__name__)


class TokenManager:
    """
    Gestiona tokens de vendors con cache en memoria
    
    Features:
    - Cache en memoria (no BD)
    - Control de expiración
    - Thread-safe con asyncio.Lock
    - Verificación de tokens próximos a expirar
    """
    
    def __init__(self):
        self._tokens: Dict[str, Dict] = {}
        self._lock = asyncio.Lock()
        logger.info("🔐 TokenManager inicializado")
    
    async def get_token(self, vendor_code: str) -> Optional[str]:
        """
        Obtiene token válido para un vendor
        
        Args:
            vendor_code: Código del vendor (ej: LATCOM)
            
        Returns:
            Token válido o None si no existe o expiró
        """
        async with self._lock:
            token_data = self._tokens.get(vendor_code)
            
            if not token_data:
                logger.debug(f"🔍 No hay token en cache para {vendor_code}")
                return None
            
            # Verificar expiración
            if datetime.now(timezone.utc) >= token_data['expires_at']:
                logger.warning(f"⚠️ Token expirado para {vendor_code}")
                del self._tokens[vendor_code]
                return None
            
            logger.debug(f"✅ Token válido recuperado para {vendor_code}")
            return token_data['token']
    
    async def set_token(
        self, 
        vendor_code: str, 
        token: str, 
        expires_in_seconds: int = 3000
    ):
        """
        Guarda token con tiempo de expiración
        
        Args:
            vendor_code: Código del vendor
            token: Access token
            expires_in_seconds: Tiempo de vida en segundos (default: 50 min)
        """
        async with self._lock:
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in_seconds)
            
            self._tokens[vendor_code] = {
                'token': token,
                'expires_at': expires_at,
                'created_at': datetime.now(timezone.utc)
            }
            
            logger.info(
                f"✅ Token guardado para {vendor_code}. "
                f"Expira: {expires_at.strftime('%Y-%m-%d %H:%M:%S')} UTC"
            )
    
    async def remove_token(self, vendor_code: str):
        """Elimina token del cache"""
        async with self._lock:
            if vendor_code in self._tokens:
                del self._tokens[vendor_code]
                logger.info(f"🗑️ Token eliminado para {vendor_code}")
    
    async def get_all_vendors_needing_refresh(self, threshold_minutes: int = 5) -> list[str]:
        """
        Retorna lista de vendors que necesitan renovar token
        
        Args:
            threshold_minutes: Minutos antes de expiración para renovar (default: 5)
            
        Returns:
            Lista de vendor_codes que necesitan refresh
        """
        async with self._lock:
            now = datetime.now(timezone.utc)
            threshold = now + timedelta(minutes=threshold_minutes)
            
            vendors_to_refresh = []
            
            for vendor_code, token_data in self._tokens.items():
                if token_data['expires_at'] <= threshold:
                    logger.debug(
                        f"⏰ {vendor_code} necesita refresh. "
                        f"Expira: {token_data['expires_at'].strftime('%H:%M:%S')}"
                    )
                    vendors_to_refresh.append(vendor_code)
            
            return vendors_to_refresh
    
    async def get_status(self) -> Dict:
        """
        Retorna estado del cache de tokens
        
        Returns:
            Diccionario con información de todos los tokens
        """
        async with self._lock:
            status = {}
            now = datetime.now(timezone.utc)
            
            for vendor_code, token_data in self._tokens.items():
                time_remaining = (token_data['expires_at'] - now).total_seconds()
                
                status[vendor_code] = {
                    'token_preview': token_data['token'][:20] + '...',
                    'created_at': token_data['created_at'].isoformat(),
                    'expires_at': token_data['expires_at'].isoformat(),
                    'seconds_remaining': int(time_remaining),
                    'is_valid': time_remaining > 0
                }
            
            return status


# Instancia global singleton
token_manager = TokenManager()