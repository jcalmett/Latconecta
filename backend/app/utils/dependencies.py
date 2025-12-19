"""
Dependencies para autenticación
Funciones de dependency injection para autenticación y autorización
Unificado: Combina ambos sistemas de autenticación
Actualizado: 2025-12-17 - Versión unificada para Latconecta
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.config import settings
from app.utils.auth import decode_access_token

# ============================================================================
# SECURITY SCHEMES
# ============================================================================

# OAuth2 scheme OPCIONAL - No lanza error si falta el token
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="api/v1/auth/login",
    auto_error=False
)

# OAuth2 scheme REQUERIDO - Para endpoints que sí necesitan autenticación
oauth2_scheme_required = OAuth2PasswordBearer(
    tokenUrl="api/v1/auth/login",
    auto_error=True
)

# HTTPBearer para Swagger UI
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

# ============================================================================
# FUNCIONES PRINCIPALES
# ============================================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Obtiene el usuario actual desde el token JWT (REQUERIDO)
    Sistema HTTPBearer - Compatible con routers antiguos

    Args:
        credentials: Credenciales HTTP Bearer (token)
        db: Sesión de base de datos

    Returns:
        Usuario autenticado

    Raises:
        HTTPException 401: Si el token es inválido o el usuario no existe
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("user_id")

    if user_id is None:
        raise credentials_exception

    result = await db.execute(
        select(User).where(User.user_id == user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Obtiene el usuario actual desde el token JWT (OPCIONAL)
    Permite compras anónimas

    Args:
        credentials: Credenciales HTTP Bearer (token) - OPCIONAL
        db: Sesión de base de datos

    Returns:
        User si está autenticado, None si es anónimo
    """
    if credentials is None:
        return None

    try:
        token = credentials.credentials
        payload = decode_access_token(token)

        if payload is None:
            return None

        user_id: int = payload.get("user_id")

        if user_id is None:
            return None

        result = await db.execute(
            select(User).where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        return user

    except Exception:
        return None


async def get_current_user_required(
    token: str = Depends(oauth2_scheme_required),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Obtener usuario actual de forma REQUERIDA
    Sistema OAuth2PasswordBearer - Para nuevos routers

    Returns:
        User object si el token es válido
        HTTPException 401 si no hay token o es inválido
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id: int = payload.get("user_id") or payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido - sin user_id",
                headers={"WWW-Authenticate": "Bearer"},
            )

        result = await db.execute(
            select(User).filter(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido o expirado: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verifica que el usuario actual esté activo

    Args:
        current_user: Usuario actual desde get_current_user

    Returns:
        Usuario activo

    Raises:
        HTTPException 400: Si el usuario está inactivo o bloqueado
    """
    if current_user.user_status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Usuario inactivo. Estado: {current_user.user_status}"
        )

    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Verifica que el usuario actual sea administrador
    Alias compatible con routers antiguos

    Args:
        current_user: Usuario actual activo

    Returns:
        Usuario administrador

    Raises:
        HTTPException 403: Si el usuario no es admin o superadmin
    """
    if current_user.user_role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos suficientes para realizar esta acción"
        )

    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user_required)
) -> User:
    """
    Verificar que el usuario actual sea administrador
    Para nuevos routers (Latconecta)

    Returns:
        User object si es admin o superadmin
        HTTPException 403 si no tiene permisos
    """
    if current_user.user_role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )

    return current_user


async def get_current_superadmin_user(
    current_user: User = Depends(get_current_user_required)
) -> User:
    """
    Verificar que el usuario actual sea superadministrador

    Returns:
        User object si es superadmin
        HTTPException 403 si no tiene permisos
    """
    if current_user.user_role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requiere permisos de superadministrador"
        )

    return current_user