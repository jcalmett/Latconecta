from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.company import Company
from app.models.country import Country
from app.models.service import Service

async def validate_company_consistency(
    country_id: int,
    service_id: int,
    db: AsyncSession
) -> None:
    """
    Valida que country_id y service_id existan
    """
    # Verificar country existe
    result = await db.execute(select(Country).filter(Country.country_id == country_id))
    country = result.scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail=f"País con ID {country_id} no existe")
    
    # Verificar service existe
    result = await db.execute(select(Service).filter(Service.service_id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail=f"Servicio con ID {service_id} no existe")

async def validate_product_consistency(
    country_id: int,
    company_id: int,
    service_id: int,
    db: AsyncSession
) -> None:
    """
    Valida que country_id, company_id y service_id sean consistentes
    """
    # Verificar company existe
    result = await db.execute(select(Company).filter(Company.company_id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail=f"Compañía con ID {company_id} no existe")
    
    # Verificar consistencia con country
    if company.country_id != country_id:
        raise HTTPException(
            status_code=400,
            detail=f"country_id {country_id} no coincide con country_id de la compañía ({company.country_id})"
        )
    
    # Verificar consistencia con service
    if company.service_id != service_id:
        raise HTTPException(
            status_code=400,
            detail=f"service_id {service_id} no coincide con service_id de la compañía ({company.service_id})"
        )
