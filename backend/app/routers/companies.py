"""
LATCONECTA - Companies Router
Endpoints para gestión de compañías
Actualizado: 2025-12-20 - Agregado filtrado por país y servicio en GET /companies/
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.database import get_db
from app.models.company import Company
from app.models.country import Country
from app.models.service import Service
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["Companies"])


async def validate_company_consistency(
    country_id: int,
    service_id: int,
    db: AsyncSession
) -> None:
    """
    Valida que country_id y service_id existan en la BD

    Args:
        country_id: ID del país
        service_id: ID del servicio
        db: Sesión de base de datos

    Raises:
        HTTPException 404: Si el país o servicio no existen
    """
    # Verificar que el país existe
    result = await db.execute(
        select(Country).where(Country.country_id == country_id)
    )
    country = result.scalar_one_or_none()

    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"País con ID {country_id} no existe"
        )

    # Verificar que el servicio existe
    result = await db.execute(
        select(Service).where(Service.service_id == service_id)
    )
    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {service_id} no existe"
        )


@router.get("/", response_model=List[CompanyResponse])
async def get_companies(
    country: Optional[str] = None,
    service: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener lista de compañías con filtrado opcional

    Args:
        country: Código de país para filtrar (ej: "PE", "CL") - OPCIONAL
        service: Nombre de servicio para filtrar (ej: "TopUps") - OPCIONAL
        skip: Número de registros a saltar (paginación)
        limit: Límite de registros a retornar
        db: Sesión de base de datos

    Returns:
        Lista de compañías con todos sus campos incluyendo:
        - country_id, country_name, country_code (via relationship)
        - service_id, service_name (via relationship)
        - company_mail_commercial_support
        - company_credit_balance
        - company_date_balance
        - company_barcode_available
        - company_mail_customer_support

    Examples:
        GET /companies/ → Todas las compañías
        GET /companies/?country=PE → Compañías en Perú
        GET /companies/?service=TopUps → Compañías con servicio TopUps
        GET /companies/?country=PE&service=TopUps → Compañías TopUps en Perú
    """
    # Construir query base con eager loading de relationships
    query = select(Company).options(
        selectinload(Company.country),
        selectinload(Company.service)
    )

    # Filtrar por país si se proporciona
    if country:
        # Obtener country_id del código de país
        country_result = await db.execute(
            select(Country.country_id).where(Country.country_code == country)
        )
        country_id = country_result.scalar_one_or_none()
        if country_id:
            query = query.where(Company.country_id == country_id)
        else:
            # Si no existe el país, retornar vacío
            return []

    # Filtrar por servicio si se proporciona
    if service:
        # Obtener service_id del nombre de servicio
        service_result = await db.execute(
            select(Service.service_id).where(Service.service_name == service)
        )
        service_id = service_result.scalar_one_or_none()
        if service_id:
            query = query.where(Company.service_id == service_id)
        else:
            # Si no existe el servicio, retornar vacío
            return []

    # Aplicar paginación
    query = query.offset(skip).limit(limit)

    # Ejecutar query
    result = await db.execute(query)
    companies = result.scalars().all()

    return companies


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener una compañía por ID

    Args:
        company_id: ID de la compañía
        db: Sesión de base de datos

    Returns:
        Compañía con todos sus campos incluyendo los nuevos de Latconecta

    Raises:
        HTTPException 404: Si la compañía no existe
    """
    result = await db.execute(
        select(Company)
        .options(
            selectinload(Company.country),
            selectinload(Company.service)
        )
        .where(Company.company_id == company_id)
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compañía con ID {company_id} no encontrada"
        )

    return company


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Crear una nueva compañía

    Args:
        company_data: Datos de la compañía
        db: Sesión de base de datos
        current_user: Usuario actual autenticado

    Returns:
        Compañía creada con todos sus campos

    Raises:
        HTTPException 400: Si hay error en validación
        HTTPException 404: Si country_id o service_id no existen
        HTTPException 500: Si hay error al crear

    VALIDACIONES LATCONECTA:
    - country_id debe existir en tabla countries
    - service_id debe existir en tabla services
    - company_name debe ser único por combinación (country_id, service_id)

    Campos nuevos obligatorios:
    - country_id: ID del país donde opera
    - service_id: ID del servicio que ofrece
    - company_mail_commercial_support: Email soporte comercial (opcional)
    """
    try:
        # VALIDACIÓN LATCONECTA: Verificar country_id y service_id
        await validate_company_consistency(
            country_id=company_data.country_id,
            service_id=company_data.service_id,
            db=db
        )

        # Crear nueva compañía
        new_company = Company(
            country_id=company_data.country_id,
            service_id=company_data.service_id,
            company_name=company_data.company_name,
            company_logo=company_data.company_logo,
            company_photo=company_data.company_photo,
            company_photo_mkt1=company_data.company_photo_mkt1,
            company_photo_mkt2=company_data.company_photo_mkt2,
            company_photo_mkt3=company_data.company_photo_mkt3,
            company_photo_mkt4=company_data.company_photo_mkt4,
            company_description5=company_data.company_description5,
            company_lema_1=company_data.company_lema_1,
            company_lema_2=company_data.company_lema_2,
            company_status=company_data.company_status,
            company_credit_balance=company_data.company_credit_balance,
            company_date_balance=company_data.company_date_balance,
            company_barcode_available=company_data.company_barcode_available,
            company_mail_customer_support=company_data.company_mail_customer_support,
            company_mail_commercial_support=company_data.company_mail_commercial_support,
            created_by=company_data.created_by or current_user.user_email
        )

        db.add(new_company)
        await db.commit()
        await db.refresh(new_company)

        return new_company

    except HTTPException:
        # Re-lanzar excepciones HTTP de validación
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear compañía: {str(e)}"
        )


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Actualizar una compañía existente

    Args:
        company_id: ID de la compañía a actualizar
        company_data: Datos a actualizar (todos opcionales)
        db: Sesión de base de datos
        current_user: Usuario actual autenticado

    Returns:
        Compañía actualizada

    Raises:
        HTTPException 404: Si la compañía, país o servicio no existen
        HTTPException 500: Si hay error al actualizar

    VALIDACIONES LATCONECTA:
    - Si se actualiza country_id, debe existir en countries
    - Si se actualiza service_id, debe existir en services

    Nota: Solo se actualizan los campos enviados (no None)
    """
    # Buscar compañía
    result = await db.execute(
        select(Company).where(Company.company_id == company_id)
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compañía con ID {company_id} no encontrada"
        )

    try:
        # Obtener datos a actualizar
        update_data = company_data.model_dump(exclude_unset=True)

        # VALIDACIÓN LATCONECTA: Si se actualizan country_id o service_id, validar
        if 'country_id' in update_data or 'service_id' in update_data:
            country_id_to_validate = update_data.get('country_id', company.country_id)
            service_id_to_validate = update_data.get('service_id', company.service_id)

            await validate_company_consistency(
                country_id=country_id_to_validate,
                service_id=service_id_to_validate,
                db=db
            )

        # Actualizar campos
        for field, value in update_data.items():
            if hasattr(company, field):
                setattr(company, field, value)

        # Actualizar auditoría
        company.updated_by = company_data.updated_by or current_user.user_email

        await db.commit()
        await db.refresh(company)

        return company

    except HTTPException:
        # Re-lanzar excepciones HTTP de validación
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar compañía: {str(e)}"
        )


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Eliminar una compañía (solo admins)

    Args:
        company_id: ID de la compañía a eliminar
        db: Sesión de base de datos
        current_user: Usuario actual autenticado

    Raises:
        HTTPException 403: Si el usuario no es admin
        HTTPException 404: Si la compañía no existe
        HTTPException 400: Si hay productos asociados (ON DELETE RESTRICT)
        HTTPException 500: Si hay error al eliminar
    """
    # Verificar que el usuario sea admin
    if current_user.user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden eliminar compañías"
        )

    # Buscar compañía
    result = await db.execute(
        select(Company).where(Company.company_id == company_id)
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compañía con ID {company_id} no encontrada"
        )

    try:
        await db.delete(company)
        await db.commit()

    except Exception as e:
        await db.rollback()
        # Si hay FK constraint violation (productos asociados)
        if "foreign key" in str(e).lower() or "fk_" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar la compañía porque tiene productos asociados"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar compañía: {str(e)}"
        )