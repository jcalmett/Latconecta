"""
Router de Services
Endpoints para gestionar los servicios ofrecidos (Top Ups, Paquetes, etc.)
✅ CONVERTIDO A ASYNC (AsyncSession)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession  # ✅ CAMBIO 1
from sqlalchemy import select  # ✅ CAMBIO 2
from typing import List
from app.database import get_db
from app.models import Service, User
from app.schemas import ServiceInDB, ServiceCreate, ServiceUpdate
from app.utils.dependencies import get_current_admin

router = APIRouter()


@router.get("/", response_model=List[ServiceInDB], summary="Listar todos los servicios")
async def list_services(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: AsyncSession = Depends(get_db)  # ✅ CAMBIO 3: AsyncSession
):
    """
    Lista todos los servicios disponibles

    **No requiere autenticación** - Información pública

    Parámetros:
    - skip: Número de registros a saltar (paginación)
    - limit: Número máximo de registros a retornar
    - status_filter: Filtrar por estado ('active', 'inactive')

    Retorna lista de servicios como Top Ups, Paquetes, Servicios Fijos, Smartphones
    """
    # ✅ CAMBIO 4: Usar select() en lugar de query()
    query = select(Service)

    if status_filter:
        query = query.where(Service.status == status_filter)

    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)  # ✅ CAMBIO 5: await
    services = result.scalars().all()
    
    return services


@router.get("/{service_id}", response_model=ServiceInDB, summary="Obtener un servicio por ID")
async def get_service(
    service_id: int,
    db: AsyncSession = Depends(get_db)  # ✅ CAMBIO 6: AsyncSession
):
    """
    Obtiene los detalles de un servicio específico

    **No requiere autenticación** - Información pública
    """
    # ✅ CAMBIO 7: Usar select() + await
    result = await db.execute(
        select(Service).where(Service.service_id == service_id)
    )
    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {service_id} no encontrado"
        )

    return service


@router.post("/", response_model=ServiceInDB, status_code=status.HTTP_201_CREATED, summary="Crear nuevo servicio")
async def create_service(
    service_data: ServiceCreate,
    db: AsyncSession = Depends(get_db),  # ✅ CAMBIO 8: AsyncSession
    current_user: User = Depends(get_current_admin)
):
    """
    Crea un nuevo servicio

    **Requiere autenticación:** Admin o Superadmin

    Ejemplos de servicios:
    - Top Ups (Recargas)
    - Paquetes (Datos y minutos)
    - Servicios Fijos (Telefonía fija)
    - Smartphones (Venta de dispositivos)
    """
    # Crear nuevo servicio
    db_service = Service(
        service_name=service_data.service_name,
        service_photo=service_data.service_photo,
        service_photo_mkt=service_data.service_photo_mkt,
        service_description=service_data.service_description,
        status=service_data.status or "active",
        created_by=current_user.user_email
    )

    db.add(db_service)  # ✅ NO necesita await
    await db.commit()  # ✅ CAMBIO 9: await
    await db.refresh(db_service)  # ✅ CAMBIO 10: await

    return db_service


@router.put("/{service_id}", response_model=ServiceInDB, summary="Actualizar servicio")
async def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: AsyncSession = Depends(get_db),  # ✅ CAMBIO 11: AsyncSession
    current_user: User = Depends(get_current_admin)
):
    """
    Actualiza un servicio existente

    **Requiere autenticación:** Admin o Superadmin

    Permite actualizar:
    - Nombre, fotos, descripción
    - Estado del servicio
    """
    # ✅ CAMBIO 12: Usar select() + await
    result = await db.execute(
        select(Service).where(Service.service_id == service_id)
    )
    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {service_id} no encontrado"
        )

    # Actualizar solo los campos que vienen en el request
    update_data = service_data.model_dump(exclude_unset=True)

    # Agregar información de auditoría
    if update_data:
        update_data["updated_by"] = current_user.user_email

    for field, value in update_data.items():
        setattr(service, field, value)

    await db.commit()  # ✅ CAMBIO 13: await
    await db.refresh(service)  # ✅ CAMBIO 14: await

    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar servicio")
async def delete_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),  # ✅ CAMBIO 15: AsyncSession
    current_user: User = Depends(get_current_admin)
):
    """
    Elimina un servicio

    **Requiere autenticación:** Admin o Superadmin

    ⚠️ **CUIDADO:** Esto también eliminará todos los productos asociados al servicio
    debido a la relación cascade en el modelo.
    """
    # ✅ CAMBIO 16: Usar select() + await
    result = await db.execute(
        select(Service).where(Service.service_id == service_id)
    )
    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Servicio con ID {service_id} no encontrado"
        )

    await db.delete(service)  # ✅ CAMBIO 17: await
    await db.commit()  # ✅ CAMBIO 18: await

    return None