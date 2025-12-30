from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.latconecta import Latconecta
from app.models.user import User
from app.schemas.latconecta import LatconectaInDB, LatconectaUpdate
from app.utils.dependencies import get_current_admin_user

router = APIRouter()

@router.get("", response_model=LatconectaInDB)
async def get_latconecta(
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener información de Latconecta (registro único)
    Público - no requiere autenticación
    """
    result = await db.execute(
        select(Latconecta).filter(Latconecta.latconecta_id == 1)
    )
    latconecta = result.scalar_one_or_none()
    
    if not latconecta:
        raise HTTPException(status_code=404, detail="Registro de Latconecta no encontrado")
    
    return latconecta


@router.put("", response_model=LatconectaInDB)
async def update_latconecta(
    latconecta_update: LatconectaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Actualizar información de Latconecta
    Requiere: Admin
    """
    # Obtener registro único
    result = await db.execute(
        select(Latconecta).filter(Latconecta.latconecta_id == 1)
    )
    latconecta = result.scalar_one_or_none()
    
    if not latconecta:
        raise HTTPException(status_code=404, detail="Registro de Latconecta no encontrado")
    
    # Actualizar campos enviados
    update_data = latconecta_update.dict(exclude_unset=True)
    update_data['updated_by'] = current_user.user_email
    
    for key, value in update_data.items():
        setattr(latconecta, key, value)
    
    await db.commit()
    await db.refresh(latconecta)
    
    return latconecta