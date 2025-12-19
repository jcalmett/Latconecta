"""
LATCONECTA - Products Router
Endpoints para gestión de productos (recargas, paquetes, smartphones, etc.)
Actualizado: 2025-12-17 - Migración a Latconecta con validaciones multi-país y multi-compañía
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.models import Product, Service, User, Company, Country
from app.schemas import ProductInDB, ProductCreate, ProductUpdate
from app.utils.dependencies import get_current_admin

router = APIRouter()


async def validate_product_consistency(
    country_id: int,
    company_id: int,
    service_id: int,
    db: AsyncSession
) -> None:
    """
    Valida que country_id, company_id y service_id sean consistentes
    
    Reglas de negocio LATCONECTA:
    - El country_id del producto debe coincidir con el country_id de la compañía
    - El service_id del producto debe coincidir con el service_id de la compañía
    
    Args:
        country_id: ID del país del producto
        company_id: ID de la compañía
        service_id: ID del servicio
        db: Sesión de base de datos
        
    Raises:
        HTTPException 404: Si la compañía no existe
        HTTPException 400: Si hay inconsistencia en los IDs
    """
    # Verificar que la compañía existe
    result = await db.execute(
        select(Company).where(Company.company_id == company_id)
    )
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compañía con ID {company_id} no existe"
        )
    
    # Verificar consistencia con country_id
    if company.country_id != country_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"country_id {country_id} no coincide con country_id de la compañía ({company.country_id})"
        )
    
    # Verificar consistencia con service_id
    if company.service_id != service_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"service_id {service_id} no coincide con service_id de la compañía ({company.service_id})"
        )


@router.get("/", response_model=List[ProductInDB], summary="Listar productos")
async def list_products(
    skip: int = 0,
    limit: int = 100,
    service_id: Optional[int] = Query(None, description="Filtrar por ID de servicio"),
    country_id: Optional[int] = Query(None, description="Filtrar por ID de país"),
    company_id: Optional[int] = Query(None, description="Filtrar por ID de compañía"),
    status_filter: Optional[str] = Query(None, description="Filtrar por estado"),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todos los productos disponibles

    **No requiere autenticación** - Información pública

    Parámetros:
    - skip: Número de registros a saltar (paginación)
    - limit: Número máximo de registros a retornar
    - service_id: Filtrar productos por servicio
    - country_id: Filtrar productos por país (NUEVO LATCONECTA)
    - company_id: Filtrar productos por compañía (NUEVO LATCONECTA)
    - status_filter: Filtrar por estado ('active', 'inactive')

    Retorna lista de productos con precios, descuentos y detalles
    """
    query = select(Product)

    # Aplicar filtros
    if service_id:
        query = query.where(Product.service_id == service_id)

    if country_id:
        query = query.where(Product.country_id == country_id)

    if company_id:
        query = query.where(Product.company_id == company_id)

    if status_filter:
        query = query.where(Product.product_status == status_filter)

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()

    return products


@router.get("/{product_id}", response_model=ProductInDB, summary="Obtener un producto por ID")
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene los detalles de un producto específico

    **No requiere autenticación** - Información pública

    Incluye información de:
    - Precios, descuentos, fees
    - Vendor y proveedor
    - País (country_id) - NUEVO LATCONECTA
    - Compañía (company_id) - NUEVO LATCONECTA
    """
    result = await db.execute(
        select(Product).where(Product.product_id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )

    return product


@router.post("/", response_model=ProductInDB, status_code=status.HTTP_201_CREATED, summary="Crear nuevo producto")
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Crea un nuevo producto

    **Requiere autenticación:** Admin o Superadmin

    VALIDACIONES LATCONECTA:
    - El producto debe estar asociado a un servicio existente
    - El producto debe estar asociado a un país existente (country_id)
    - El producto debe estar asociado a una compañía existente (company_id)
    - El country_id del producto debe coincidir con el de la compañía
    - El service_id del producto debe coincidir con el de la compañía

    Campos nuevos obligatorios:
    - country_id: ID del país del producto
    - company_id: ID de la compañía que ofrece el producto
    
    Ejemplos de productos:
    - Recarga $10, $20, $50 (Topup)
    - Paquetes de 5GB, 10GB, 20GB (pack)
    - Pago de facturas (bill)
    - Smartphones iPhone, Samsung (smartphone)
    - Transferencias (transfer)
    """
    try:
        # VALIDACIÓN LATCONECTA: Verificar consistencia country_id, company_id, service_id
        await validate_product_consistency(
            country_id=product_data.country_id,
            company_id=product_data.company_id,
            service_id=product_data.service_id,
            db=db
        )
        
        # Verificar que el servicio existe
        result = await db.execute(
            select(Service).where(Service.service_id == product_data.service_id)
        )
        service = result.scalar_one_or_none()

        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Servicio con ID {product_data.service_id} no encontrado"
            )

        # Verificar que el código de producto no existe
        result = await db.execute(
            select(Product).where(Product.product_code == product_data.product_code)
        )
        existing_product = result.scalar_one_or_none()

        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un producto con el código '{product_data.product_code}'"
            )

        # Crear nuevo producto con TODOS los campos incluyendo los nuevos de Latconecta
        db_product = Product(
            service_id=product_data.service_id,
            country_id=product_data.country_id,
            company_id=product_data.company_id,
            product_code=product_data.product_code,
            product_name=product_data.product_name,
            product_description=product_data.product_description,
            product_photo=product_data.product_photo,
            product_currency=product_data.product_currency or "USD",
            product_base_price=product_data.product_base_price,
            product_discount_percentage=product_data.product_discount_percentage or 0,
            product_discount_amount=product_data.product_discount_amount or 0,
            product_fee=product_data.product_fee or 0,
            product_total_price=product_data.product_total_price,
            product_vendor_code=product_data.product_vendor_code,
            product_vendpro_code=product_data.product_vendpro_code or "Vend001",
            product_vendpro_skuid=product_data.product_vendpro_skuid,
            product_status=product_data.product_status or "active",
            created_by=current_user.user_email
        )

        db.add(db_product)
        await db.commit()
        await db.refresh(db_product)

        return db_product

    except HTTPException:
        # Re-lanzar excepciones HTTP de validación
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear producto: {str(e)}"
        )


@router.put("/{product_id}", response_model=ProductInDB, summary="Actualizar producto")
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Actualiza un producto existente

    **Requiere autenticación:** Admin o Superadmin

    VALIDACIONES LATCONECTA:
    - Si se actualiza country_id, company_id o service_id, se valida consistencia
    - El country_id debe coincidir con el de la compañía
    - El service_id debe coincidir con el de la compañía

    Permite actualizar:
    - Información básica (nombre, descripción, foto)
    - Precios, descuentos y fees
    - Estado del producto
    - País, compañía y servicio asociados (con validación)
    - Información del proveedor (vendor/operator/country/etc)
    """
    # Buscar producto
    result = await db.execute(
        select(Product).where(Product.product_id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )

    try:
        # Actualizar solo los campos que vienen en el request
        update_data = product_data.model_dump(exclude_unset=True)

        # VALIDACIÓN LATCONECTA: Si se actualizan country_id, company_id o service_id, validar consistencia
        if any(k in update_data for k in ['country_id', 'company_id', 'service_id']):
            country_id_to_validate = update_data.get('country_id', product.country_id)
            company_id_to_validate = update_data.get('company_id', product.company_id)
            service_id_to_validate = update_data.get('service_id', product.service_id)
            
            await validate_product_consistency(
                country_id=country_id_to_validate,
                company_id=company_id_to_validate,
                service_id=service_id_to_validate,
                db=db
            )

        # Si se actualiza el service_id, verificar que existe
        if "service_id" in update_data:
            result = await db.execute(
                select(Service).where(Service.service_id == update_data["service_id"])
            )
            service = result.scalar_one_or_none()

            if not service:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Servicio con ID {update_data['service_id']} no encontrado"
                )

        # Agregar información de auditoría
        if update_data:
            update_data["updated_by"] = current_user.user_email

        # Actualizar campos
        for field, value in update_data.items():
            setattr(product, field, value)

        await db.commit()
        await db.refresh(product)

        return product

    except HTTPException:
        # Re-lanzar excepciones HTTP de validación
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar producto: {str(e)}"
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar producto")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Elimina un producto

    **Requiere autenticación:** Admin o Superadmin

    ⚠️ **CUIDADO:** Esto eliminará el producto permanentemente.
    Las compras asociadas a este producto mantendrán su información histórica.
    """
    # Buscar producto
    result = await db.execute(
        select(Product).where(Product.product_id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {product_id} no encontrado"
        )

    try:
        await db.delete(product)
        await db.commit()

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar producto: {str(e)}"
        )

    return None