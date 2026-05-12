"""
Router de Users
Endpoints para gestionar usuarios del sistema
✅ CONVERTIDO A ASYNC (AsyncSession)
✅ AGREGADO: verify_ownership para prevenir IDOR
✅ CORREGIDO: Uso de dependencies estándar
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.models import User
from app.schemas import UserPublic, UserCreate, UserUpdate
from app.dependencies import (
    get_current_admin_user,
    get_current_user_required,
    verify_ownership
)
from app.utils.auth import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[UserPublic], summary="Listar usuarios")
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role_filter: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # ✅ Solo admin/superadmin
):
    """
    Lista todos los usuarios del sistema

    **Requiere autenticación:** Admin o Superadmin
    """
    query = select(User)

    if role_filter:
        query = query.where(User.user_role == role_filter)
    if status_filter:
        query = query.where(User.user_status == status_filter)

    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return users


@router.get("/{user_id}", response_model=UserPublic, summary="Obtener un usuario por ID")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_required)  # ✅ Requiere autenticación
):
    """
    Obtiene los detalles de un usuario específico

    **Requiere autenticación:**
    - Admin/Superadmin: Puede ver cualquier usuario
    - User regular: Solo puede ver su propio perfil
    """
    # ✅ Verificar que el usuario existe
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado"
        )

    # ✅ Usar verify_ownership (más limpio que la lógica manual)
    await verify_ownership(user_id, current_user, "perfil de usuario")

    return user


@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED, summary="Crear nuevo usuario")
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # ✅ Solo admin/superadmin
):
    """
    Crea un nuevo usuario en el sistema

    **Requiere autenticación:** Admin o Superadmin
    """
    # Verificar si el email ya existe
    result = await db.execute(
        select(User).where(User.user_email == user_data.user_email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Crear nuevo usuario
    db_user = User(
        user_name=user_data.user_name,
        user_email=user_data.user_email,
        user_password=get_password_hash(user_data.user_password),
        user_photo=user_data.user_photo,
        user_phone_country_code=user_data.user_phone_country_code,
        user_phone_number=user_data.user_phone_number,
        user_role=user_data.user_role or "user",
        user_status=user_data.user_status or "active",
        created_by=current_user.user_email
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user


@router.put("/{user_id}", response_model=UserPublic, summary="Actualizar usuario")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_required)  # ✅ Requiere autenticación
):
    """
    Actualiza un usuario existente

    **Requiere autenticación:**
    - Admin/Superadmin: Puede actualizar cualquier usuario
    - User regular: Solo puede actualizar su propio perfil (excepto rol y status)
    """
    # ✅ Verificar que el usuario existe
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado"
        )

    # ✅ Verificar ownership
    is_admin = current_user.user_role in ["admin", "superadmin"]
    is_self = current_user.user_id == user_id

    if not is_admin and not is_self:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este usuario"
        )

    # Actualizar solo los campos que vienen en el request
    update_data = user_data.model_dump(exclude_unset=True)

    # Si no es admin, no puede cambiar rol ni status
    if not is_admin:
        if "user_role" in update_data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para cambiar el rol"
            )
        if "user_status" in update_data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para cambiar el estado"
            )
        # Tampoco puede cambiar el email (por seguridad)
        if "user_email" in update_data and update_data["user_email"] != current_user.user_email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes cambiar tu email de usuario"
            )

    # Si viene user_password, hashearlo
    if "user_password" in update_data:
        update_data["user_password"] = get_password_hash(update_data["user_password"])

    # Agregar información de auditoría
    if update_data:
        update_data["updated_by"] = current_user.user_email

    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar usuario")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # ✅ Solo admin/superadmin
):
    """
    Elimina un usuario

    **Requiere autenticación:** Admin o Superadmin
    """
    # ✅ Verificar que el usuario existe
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado"
        )

    # No permitir eliminar el propio usuario
    if current_user.user_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario"
        )

    await db.delete(user)
    await db.commit()

    return None
