"""
Refresh Token Manager - Almacenamiento en Redis
Sin modificar la base de datos
"""

import redis
import secrets
from datetime import datetime, timedelta
from typing import Optional
import json
import logging

logger = logging.getLogger(__name__)

# Configuración Redis
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 1  # Usar DB 1 para refresh tokens (DB 0 para otros usos)
REFRESH_TOKEN_EXPIRE_DAYS = 30


class RefreshTokenManager:
    def __init__(self):
        try:
            self.redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                decode_responses=True
            )
            self.redis_client.ping()
            logger.info("✅ Redis conectado para refresh tokens")
        except Exception as e:
            logger.error(f"❌ Error conectando a Redis: {e}")
            self.redis_client = None

    def generate_refresh_token(self, user_id: int) -> str:
        """Genera un refresh token único para un usuario"""
        token = secrets.token_urlsafe(64)
        
        # Guardar en Redis con expiración
        key = f"refresh_token:{token}"
        value = json.dumps({
            "user_id": user_id,
            "created_at": datetime.now().isoformat()
        })
        
        if self.redis_client:
            self.redis_client.setex(
                key,
                timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
                value
            )
            logger.debug(f"Refresh token generado para user_id={user_id}")
        
        return token

    def validate_refresh_token(self, token: str) -> Optional[int]:
        """Valida un refresh token y retorna user_id si es válido"""
        if not self.redis_client:
            logger.warning("Redis no disponible para validar refresh token")
            return None
        
        key = f"refresh_token:{token}"
        data = self.redis_client.get(key)
        
        if not data:
            logger.warning(f"Refresh token inválido o expirado")
            return None
        
        # Token válido - renovar expiración (rolling)
        self.redis_client.expire(key, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
        
        try:
            token_data = json.loads(data)
            return token_data.get("user_id")
        except Exception as e:
            logger.error(f"Error parseando refresh token: {e}")
            return None

    def revoke_refresh_token(self, token: str) -> bool:
        """Revoca un refresh token (logout o rotación)"""
        if not self.redis_client:
            return False
        
        key = f"refresh_token:{token}"
        return bool(self.redis_client.delete(key))

    def revoke_all_user_tokens(self, user_id: int) -> int:
        """Revoca todos los refresh tokens de un usuario"""
        if not self.redis_client:
            return 0
        
        pattern = f"refresh_token:*"
        count = 0
        for key in self.redis_client.scan_iter(match=pattern):
            data = self.redis_client.get(key)
            if data:
                try:
                    token_data = json.loads(data)
                    if token_data.get("user_id") == user_id:
                        self.redis_client.delete(key)
                        count += 1
                except:
                    pass
        
        logger.info(f"Revocados {count} refresh tokens para user_id={user_id}")
        return count


# Instancia global
refresh_token_manager = RefreshTokenManager()
