"""
Dependencies para autenticación opcional
Permite que endpoints acepten usuarios autenticados o anónimos

CORREGIDO: Cambio de payload.get("sub") a payload.get("user_id")
El backend genera tokens con "user_id", no "sub"
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.config import settings

# OAuth2 scheme OPCIONAL - No lanza error si falta el token
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="api/v1/auth/login",
    auto_error=False  # ✅ Clave: No falla si no hay token
)

# OAuth2 scheme REQUERIDO - Para endpoints que sí necesitan autenticación
oauth2_scheme_required = OAuth2PasswordBearer(
    tokenUrl="api/v1/auth/login",
    auto_error=True
)


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Obtener usuario actual de forma OPCIONAL

    Retorna:
        - User object si el token es válido
        - None si no hay token o el token es inválido

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

        # ✅ CORREGIDO: Buscar "user_id" en vez de "sub"
        # El backend auth.py genera el token con "user_id"
        user_id: int = payload.get("user_id") or payload.get("sub")
        
        if user_id is None:
            return None

        # Buscar usuario en base de datos
        result = await db.execute(
            select(User).filter(User.user_id == user_id)
        )
        user = result.scalar_one_or_none()

        return user

    except JWTError:
        # Token inválido o expirado
        return None
    except Exception:
        # Cualquier otro error
        return None


async def get_current_user_required(
    token: str = Depends(oauth2_scheme_required),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Obtener usuario actual de forma REQUERIDA

    Retorna:
        - User object si el token es válido
        - HTTPException 401 si no hay token o es inválido

    Uso:
        Para endpoints que SÍ requieren autenticación obligatoria.
        Ejemplo: Ver perfil, actualizar datos, etc.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Decodificar token JWT
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # ✅ CORREGIDO: Buscar "user_id" en vez de "sub"
        # El backend auth.py genera el token con "user_id"
        user_id: int = payload.get("user_id") or payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido - sin user_id",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Buscar usuario en base de datos
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requiere permisos de superadministrador"
        )

    return current_user


# =====================================================
# EJEMPLO DE USO
# =====================================================

"""
# En tus routers:

from app.dependencies import (
    get_current_user_optional,
    get_current_user_required,
    get_current_admin_user
)

# Endpoint que acepta usuarios o anónimos
@router.post("/purchases/")
async def create_purchase(
    purchase: PurchaseCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # current_user puede ser None (compra anónima)
    # o User object (compra registrada)

    purchase_data = purchase.dict()
    purchase_data['purchase_user_id'] = current_user.user_id if current_user else None
    purchase_data['created_by'] = current_user.user_email if current_user else 'anonymous'

    # ... crear compra


# Endpoint que REQUIERE autenticación
@router.get("/profile/")
async def get_profile(
    current_user: User = Depends(get_current_user_required)
):
    # current_user SIEMPRE será un User object válido
    # Si no hay token válido, se lanza HTTPException 401
    return current_user


# Endpoint solo para admins
@router.delete("/products/{id}")
async def delete_product(
    id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    # Solo admins y superadmins pueden llegar aquí
    # ...
"""