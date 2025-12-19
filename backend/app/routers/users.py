"""
Router de Users
Endpoints para gestionar usuarios del sistema
✅ CONVERTIDO A ASYNC (AsyncSession)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession  # ✅ CAMBIO 1
from sqlalchemy import select  # ✅ CAMBIO 2
from typing import List
from app.database import get_db
from app.models import User
from app.schemas import UserPublic, UserCreate, UserUpdate
from app.utils.dependencies import get_current_admin, get_current_active_user
from app.utils.auth import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[UserPublic], summary="Listar usuarios")
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role_filter: str = None,
    status_filter: str = None,
    db: AsyncSession = Depends(get_db),  # ✅ CAMBIO 3: AsyncSession
    current_user: User = Depends(get_current_admin)
):
    """
    Lista todos los usuarios del sistema

    **Requiere autenticación:** Admin o Superadmin

    Parámetros:
    - skip: Número de registros a saltar (paginación)
    - limit: Número máximo de registros a retornar
    - role_filter: Filtrar por rol ('user', 'admin', 'superadmin')
    - status_filter: Filtrar por estado ('active', 'blocked', 'pending')
    """
    # ✅ CAMBIO 4: Usar select() en lugar de query()
    query = select(User)

    # Aplicar filtros
    if role_filter:
        query = query.where(User.user_role == role_filter)

    if status_filter:
        query = query.where(User.user_status == status_filter)

    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)  # ✅ CAMBIO 5: await
    users = result.scalars().all()
    
    return users


@router.get("/{user_id}", response_model=UserPublic, summary="Obtener un usuario por ID")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),  # ✅ CAMBIO 6: AsyncSession
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtiene los detalles de un usuario específico

    **Requiere autenticación:**
    - Admin/Superadmin: Puede ver cualquier usuario
    - User regular: Solo puede ver su propio perfil
    """
    # ✅ CAMBIO 7: Usar select() + await
    result = await db.execute(
        select(User).where(User.user_id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado"
        )

    # Verificar permisos: admin puede ver cualquiera, user solo su perfil
    if current_user.user_role not in ["admin", "superadmin"]:
        if current_user.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver este usuario"
            )

    return user


@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED, summary="Crear nuevo usuario")
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),  # ✅ CAMBIO 8: AsyncSession
    current_user: User = Depends(get_current_admin)
):
    """
    Crea un nuevo usuario en el sistema

    **Requiere autenticación:** Admin o Superadmin

    Los usuarios regulares deben usar el endpoint /api/v1/auth/register
    """
    # ✅ CAMBIO 9: Verificar si el email ya existe con select() + await
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

    db.add(db_user)  # ✅ NO necesita await
    await db.commit()  # ✅ CAMBIO 10: await
    await db.refresh(db_user)  # ✅ CAMBIO 11: await

    return db_user


@router.put("/{user_id}", response_model=UserPublic, summary="Actualizar usuario")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),  # ✅ CAMBIO 12: AsyncSession
    current_user: User = Depends(get_current_active_user)
):
    """
    Actualiza un usuario existente

    **Requiere autenticación:**
    - Admin/Superadmin: Puede actualizar cualquier usuario
    - User regular: Solo puede actualizar su propio perfil (excepto rol y status)

    Permite actualizar:
    - Información personal (nombre, foto, teléfono)
    - Rol y estado (solo admin)
    """
    # ✅ CAMBIO 13: Usar select() + await
    result = await db.execute(
        select(User).where(User.user_id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado"
        )

    # Verificar permisos
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

    # Si viene user_password, hashearlo
    if "user_password" in update_data:
        update_data["user_password"] = get_password_hash(update_data["user_password"])

    # Agregar información de auditoría
    if update_data:
        update_data["updated_by"] = current_user.user_email

    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()  # ✅ CAMBIO 14: await
    await db.refresh(user)  # ✅ CAMBIO 15: await

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar usuario")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),  # ✅ CAMBIO 16: AsyncSession
    current_user: User = Depends(get_current_admin)
):
    """
    Elimina un usuario

    **Requiere autenticación:** Admin o Superadmin

    ⚠️ **CUIDADO:** Esto eliminará el usuario permanentemente.
    Las compras asociadas a este usuario mantendrán su información histórica.
    """
    # ✅ CAMBIO 17: Usar select() + await
    result = await db.execute(
        select(User).where(User.user_id == user_id)
    )
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

    await db.delete(user)  # ✅ CAMBIO 18: await
    await db.commit()  # ✅ CAMBIO 19: await

    return None