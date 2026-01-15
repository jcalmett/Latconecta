"""
LATCONECTA - Countries Router
Endpoints para gestión de países (multi-país)
Actualizado: 2026-01-10 - Renombrado campos de tipo de cambio
CORRECCIÓN: country_er_usd_pen → country_er_usd, country_date_er → country_er_date
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import List

from app.database import get_db
from app.models.country import Country
from app.schemas.country import CountryCreate, CountryUpdate, CountryResponse
from app.utils.dependencies import get_current_user, get_current_admin

router = APIRouter(tags=["Countries"])

# ==========================================
# GET ALL COUNTRIES
# ==========================================
@router.get("/", response_model=List[CountryResponse])
async def get_all_countries(
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener todos los países del sistema
    """
    result = await db.execute(
        select(Country).order_by(Country.country_name)
    )
    countries = result.scalars().all()
    
    if not countries:
        # Si no hay países, retornar lista vacía en lugar de error
        return []
    
    return countries


# ==========================================
# GET COUNTRY BY ID
# ==========================================
@router.get("/{country_id}", response_model=CountryResponse)
async def get_country_by_id(
    country_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener un país por ID
    """
    result = await db.execute(
        select(Country).filter(Country.country_id == country_id)
    )
    country = result.scalar_one_or_none()
    
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"País con ID {country_id} no encontrado"
        )
    
    return country


# ==========================================
# CREATE COUNTRY
# ==========================================
@router.post("/", response_model=CountryResponse, status_code=status.HTTP_201_CREATED)
async def create_country(
    country_create: CountryCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """
    Crear un nuevo país (solo administradores)
    """
    # Verificar si el código de país ya existe
    existing = await db.execute(
        select(Country).filter(Country.country_code == country_create.country_code.upper())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un país con el código {country_create.country_code}"
        )
    
    # Crear nuevo país
    country_data = country_create.dict()
    country_data['country_code'] = country_data['country_code'].upper()
    country_data['created_by'] = current_user.user_email
    country_data['updated_by'] = current_user.user_email
    
    new_country = Country(**country_data)
    
    try:
        db.add(new_country)
        await db.commit()
        await db.refresh(new_country)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear país: {str(e)}"
        )
    
    return new_country


# ==========================================
# UPDATE COUNTRY
# ==========================================
@router.put("/{country_id}", response_model=CountryResponse)
async def update_country(
    country_id: int,
    country_update: CountryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """
    Actualizar un país (solo administradores)
    Si se actualiza country_er_usd, se actualiza automáticamente country_er_date
    """
    # Obtener país
    result = await db.execute(
        select(Country).filter(Country.country_id == country_id)
    )
    country = result.scalar_one_or_none()
    
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"País con ID {country_id} no encontrado"
        )
    
    # Actualizar campos
    update_data = country_update.dict(exclude_unset=True)
    update_data['updated_by'] = current_user.user_email
    
    # Si se actualiza la tasa de cambio, actualizar fecha - ✅ CORREGIDO
    if 'country_er_usd' in update_data and update_data['country_er_usd'] is not None:
        if country.country_er_usd != update_data['country_er_usd']:
            update_data['country_er_date'] = datetime.now()
    
    # Si se actualiza el código, convertir a mayúsculas
    if 'country_code' in update_data:
        update_data['country_code'] = update_data['country_code'].upper()
        
        # Verificar que no exista otro país con ese código
        existing = await db.execute(
            select(Country).filter(
                Country.country_code == update_data['country_code'],
                Country.country_id != country_id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro país con el código {update_data['country_code']}"
            )
    
    for key, value in update_data.items():
        setattr(country, key, value)
    
    try:
        await db.commit()
        await db.refresh(country)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar país: {str(e)}"
        )
    
    return country


# ==========================================
# DELETE COUNTRY
# ==========================================
@router.delete("/{country_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_country(
    country_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """
    Eliminar un país (solo administradores)
    ADVERTENCIA: Esto eliminará todas las compañías y productos asociados en cascada
    """
    # Obtener país
    result = await db.execute(
        select(Country).filter(Country.country_id == country_id)
    )
    country = result.scalar_one_or_none()
    
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"País con ID {country_id} no encontrado"
        )
    
    try:
        await db.delete(country)
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar país: {str(e)}"
        )
    
    return None