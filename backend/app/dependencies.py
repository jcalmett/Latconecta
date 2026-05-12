"""
Dependencies para autenticación opcional y obligatoria
Permite compras anónimas en Users y protege recursos personales

CORREGIDO: Cambio de payload.get("sub") a payload.get("user_id")
El backend genera tokens con "user_id", no "sub"
AGREGADO: Validación de usuario activo (user_status = 'active')
AGREGADO: Funciones para prevenir IDOR
"""

from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.database import get_db
from app.models.user import User
from app.config import settings

logger = logging.getLogger(__name__)

# OAuth2 scheme OPCIONAL - No lanza error si falta el token
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False  # ✅ Clave: No falla si no hay token
)

# OAuth2 scheme REQUERIDO - Para endpoints que sí necesitan autenticación
oauth2_scheme_required = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=True
)


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Obtener usuario actual de forma OPCIONAL

    Retorna:
        - User object si el token es válido y el usuario está ACTIVO
        - None si no hay token, token inválido, o usuario inactivo

    Uso:
        Para endpoints que aceptan tanto usuarios autenticados como anónimos.
        Ejemplo: Compras pueden ser hechas por usuarios o invitados.
    """
    if not token:
        return None

    try:
        # Decodificar token JWT
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Soporte para "user_id" y legacy "sub"
        user_id: int = payload.get("user_id") or payload.get("sub")
        
        if user_id is None:
            return None

        # Buscar usuario en base de datos
        result = await db.execute(
            select(User).where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        # ✅ NUEVO: Verificar que el usuario esté ACTIVO
        if user and user.user_status != 'active':
            logger.warning(f"Intento de acceso de usuario inactivo: {user.user_email}")
            return None

        return user

    except JWTError:
        # Token inválido o expirado - silencioso
        return None
    except Exception as e:
        logger.error(f"Error inesperado en get_current_user_optional: {str(e)}")
        return None


async def get_current_user_required(
    token: str = Depends(oauth2_scheme_required),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Obtener usuario actual de forma REQUERIDA

    Retorna:
        - User object si el token es válido y el usuario está ACTIVO
        - HTTPException 401 si no hay token, es inválido, o usuario inactivo

    Uso:
        Para endpoints que SÍ requieren autenticación obligatoria.
        Ejemplo: Ver perfil, actualizar datos, ver historial de compras.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado. Inicie sesión para acceder a este recurso.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        # Decodificar token JWT
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Soporte para "user_id" y legacy "sub"
        user_id: int = payload.get("user_id") or payload.get("sub")
        
        if user_id is None:
            logger.warning("Token sin user_id/sub")
            raise credentials_exception

        # Buscar usuario en base de datos
        result = await db.execute(
            select(User).where(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        if user is None:
            logger.warning(f"Usuario no encontrado para ID: {user_id}")
            raise credentials_exception

        # ✅ NUEVO: Verificar que el usuario esté ACTIVO
        if user.user_status != 'active':
            logger.warning(f"Intento de acceso de usuario inactivo: {user.user_email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario inactivo. Contacte al administrador."
            )

        return user

    except JWTError as e:
        logger.warning(f"JWTError en get_current_user_required: {str(e)}")
        raise credentials_exception
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado en get_current_user_required: {str(e)}")
        raise credentials_exception


async def get_current_admin_user(
    current_user: User = Depends(get_current_user_required)
) -> User:
    """
    Verificar que el usuario actual sea administrador

    Retorna:
        - User object si es admin o superadmin
        - HTTPException 403 si no tiene permisos

    Uso:
        Para endpoints administrativos que requieren rol de admin.
    """
    if current_user.user_role not in ["admin", "superadmin"]:
        logger.warning(f"Acceso denegado a admin: {current_user.user_email} (rol: {current_user.user_role})")
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

    Retorna:
        - User object si es superadmin
        - HTTPException 403 si no tiene permisos

    Uso:
        Para endpoints críticos que requieren máximos permisos.
    """
    if current_user.user_role != "superadmin":
        logger.warning(f"Acceso denegado a superadmin: {current_user.user_email} (rol: {current_user.user_role})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requiere permisos de superadministrador"
        )

    return current_user


# ============================================================================
# FUNCIONES PARA PREVENIR IDOR (Insecure Direct Object Reference)
# ============================================================================

async def verify_ownership(
    resource_user_id: int,
    current_user: Optional[User],
    resource_name: str = "recurso"
) -> None:
    """
    Verifica que el usuario actual sea el propietario del recurso o un admin.

    Args:
        resource_user_id: ID del usuario propietario del recurso
        current_user: Usuario autenticado (puede ser None)
        resource_name: Nombre del recurso para logs

    Raises:
        HTTPException 401: Si no hay usuario autenticado
        HTTPException 403: Si el usuario no es el propietario ni admin
    """
    # Si no hay usuario autenticado, no puede acceder a recursos de otros
    if current_user is None:
        logger.warning(f"Acceso denegado a {resource_name}: no autenticado")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe iniciar sesión para acceder a este recurso"
        )
    
    # Admin puede ver cualquier recurso
    if current_user.user_role in ["admin", "superadmin"]:
        return
    
    # Usuario normal solo puede ver sus propios recursos
    if current_user.user_id != resource_user_id:
        logger.warning(
            f"IDOR detectado: Usuario {current_user.user_id} intentó acceder "
            f"al {resource_name} del usuario {resource_user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este recurso"
        )


def verify_ownership_sync(
    resource_user_id: int,
    current_user: Optional[User],
    resource_name: str = "recurso"
) -> None:
    """
    Versión síncrona de verify_ownership (para usar dentro de funciones async).
    Lanza las mismas excepciones HTTP.
    """
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe iniciar sesión para acceder a este recurso"
        )
    
    if current_user.user_role in ["admin", "superadmin"]:
        return
    
    if current_user.user_id != resource_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este recurso"
        )


# ============================================================================
# EJEMPLOS DE USO
# ============================================================================

"""
# 1. Endpoint que acepta compras anónimas (NO requiere verify_ownership)
@router.post("/purchases/")
async def create_purchase(
    purchase: PurchaseCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # current_user puede ser None (compra anónima) o User object
    purchase_data = purchase.dict()
    purchase_data['purchase_user_id'] = current_user.user_id if current_user else None
    # ... crear compra


# 2. Endpoint que muestra el perfil del usuario autenticado
@router.get("/profile/")
async def get_profile(
    current_user: User = Depends(get_current_user_required)
):
    # No necesita verify_ownership porque current_user ES el usuario
    return current_user


# 3. Endpoint que muestra el historial de compras de un usuario específico
@router.get("/purchases/{user_id}")
async def get_user_purchases(
    user_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # Verificar que el usuario autenticado sea el propietario o admin
    await verify_ownership(user_id, current_user, "historial de compras")
    
    # Si pasa la verificación, mostrar las compras
    result = await db.execute(
        select(Purchase).where(Purchase.purchase_user_id == user_id)
    )
    return result.scalars().all()


# 4. Endpoint solo para admins (no necesita verify_ownership)
@router.delete("/products/{id}")
async def delete_product(
    id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    # Solo admins llegan aquí por la dependency
    # No necesita verify_ownership
    await db.delete(product)
    await db.commit()
"""
