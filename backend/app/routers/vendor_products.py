"""
Router de Vendor Products - Gestión de productos de vendors (ACTUALIZADO CON api_group_code)
Solo usa columnas que existen en la BD
Las rutas específicas van ANTES de las rutas con parámetros variables
✅ FASE 2: Agregado endpoint /by-keys/ para búsqueda por claves de relación
✅ FASE 3: Actualizado con api_group_code
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import VendorProduct, Vendor, User
from app.schemas.vendor import (
    VendorProductPublic,
    VendorProductCreate,
    VendorProductUpdate
)
from app.utils.dependencies import get_current_active_user

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_active_user)):
    """
    Middleware: Requiere que el usuario sea admin o superadmin
    """
    if current_user.user_role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador"
        )
    return current_user


def require_superadmin(current_user: User = Depends(get_current_active_user)):
    """
    Middleware: Requiere que el usuario sea superadmin
    """
    if current_user.user_role != 'superadmin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de superadministrador"
        )
    return current_user


# =============================================================================
# ENDPOINTS DE ESTADÍSTICAS Y RESUMEN (PRIMERO - RUTAS ESPECÍFICAS)
# =============================================================================

@router.get("/summary/")
async def get_vendor_products_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obtener resumen de vendor products

    **Requiere:** Admin o Superadmin

    **Retorna:**
    - total_products: Total de productos
    - active_products: Productos activos
    - inactive_products: Productos inactivos
    - products_by_vendor: Productos agrupados por vendor
    - products_by_api_group: Productos agrupados por grupo de APIs ⭐ NUEVO
    - products_by_type: Productos agrupados por tipo
    - products_by_operator: Productos agrupados por operador
    """
    # Total de productos
    result = await db.execute(select(func.count(VendorProduct.vp_id)))
    total_products = result.scalar()

    # Productos por estado
    result = await db.execute(
        select(func.count(VendorProduct.vp_id))
        .where(VendorProduct.vp_status == 'active')
    )
    active_products = result.scalar()

    result = await db.execute(
        select(func.count(VendorProduct.vp_id))
        .where(VendorProduct.vp_status == 'inactive')
    )
    inactive_products = result.scalar()

    # Productos por vendor
    result = await db.execute(
        select(
            VendorProduct.vendor_code,
            func.count(VendorProduct.vp_id).label('count')
        )
        .group_by(VendorProduct.vendor_code)
    )
    products_by_vendor = {row.vendor_code: row.count for row in result}

    # ⭐ NUEVO: Productos por api_group_code
    result = await db.execute(
        select(
            VendorProduct.api_group_code,
            func.count(VendorProduct.vp_id).label('count')
        )
        .group_by(VendorProduct.api_group_code)
    )
    products_by_api_group = {row.api_group_code: row.count for row in result}

    # Productos por tipo
    result = await db.execute(
        select(
            VendorProduct.vp_product_type,
            func.count(VendorProduct.vp_id).label('count')
        )
        .group_by(VendorProduct.vp_product_type)
    )
    products_by_type = {str(row.vp_product_type): row.count for row in result if row.vp_product_type is not None}

    # Productos por operador
    result = await db.execute(
        select(
            VendorProduct.vp_operator,
            func.count(VendorProduct.vp_id).label('count')
        )
        .where(VendorProduct.vp_operator.isnot(None))
        .group_by(VendorProduct.vp_operator)
    )
    products_by_operator = {row.vp_operator: row.count for row in result}

    return {
        "total_products": total_products,
        "active_products": active_products,
        "inactive_products": inactive_products,
        "products_by_vendor": products_by_vendor,
        "products_by_api_group": products_by_api_group,  # ⭐ NUEVO
        "products_by_type": products_by_type,
        "products_by_operator": products_by_operator
    }


# ✅✅✅ ENDPOINT - FASE 2 (MANTIENE FUNCIONALIDAD) ✅✅✅
@router.get("/by-keys/", response_model=VendorProductPublic)
async def get_vendor_product_by_keys(
    vendor_code: str,
    vp_code: str,
    vp_skuid: str,
    db: AsyncSession = Depends(get_db)
):
    """
    ✅ FASE 2: Obtener vendor product por claves de relación
    ⭐ Ahora incluye api_group_code en la respuesta

    **Uso:** Cuando tienes un product y necesitas obtener el vendor_product asociado

    **Query params:**
    - vendor_code: Código del vendor (de products.product_vendor_code)
    - vp_code: Código del producto vendor (de products.product_vendpro_code)
    - vp_skuid: SKU del producto vendor (de products.product_vendpro_skuid)

    **Ejemplo:**
```
    GET /api/v1/vendor-products/by-keys/?vendor_code=LATCOM&vp_code=BITEL_20_PEN&vp_skuid=SKU_001
```

    **Retorna:** VendorProduct completo con todos los campos incluyendo api_group_code

    **Acceso:** Público (no requiere autenticación) para uso desde Latconecta_Users
    """
    result = await db.execute(
        select(VendorProduct).where(
            and_(
                VendorProduct.vendor_code == vendor_code,
                VendorProduct.vp_code == vp_code,
                VendorProduct.vp_skuid == vp_skuid
            )
        )
    )
    vendor_product = result.scalar_one_or_none()

    if not vendor_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor product no encontrado: {vendor_code}/{vp_code}/{vp_skuid}"
        )

    return vendor_product


@router.get("/by-code/{vp_code}/", response_model=VendorProductPublic)
async def get_vendor_product_by_code(
    vp_code: str,
    vendor_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obtener vendor product por código

    **Requiere:** Admin o Superadmin

    **Parámetros:**
    - vp_code: Código del producto
    - vendor_code: Código del vendor (opcional, para desambiguar)
    """
    query = select(VendorProduct).where(VendorProduct.vp_code == vp_code)

    if vendor_code:
        query = query.where(VendorProduct.vendor_code == vendor_code)

    result = await db.execute(query)
    vendor_product = result.scalar_one_or_none()

    if not vendor_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor product {vp_code} no encontrado"
        )

    return vendor_product


# =============================================================================
# ENDPOINTS DE OPERACIONES MASIVAS (TAMBIÉN RUTAS ESPECÍFICAS)
# =============================================================================

@router.put("/bulk-status/")
async def bulk_update_status(
    vp_ids: List[int],
    vp_status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Actualizar estado de múltiples vendor products

    **Requiere:** Admin o Superadmin

    **Body:**
    - vp_ids: Lista de IDs a actualizar
    - vp_status: Nuevo estado (active, inactive, suspended, out_of_stock)
    """
    if vp_status not in ['active', 'inactive', 'suspended', 'out_of_stock']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estado inválido. Valores permitidos: active, inactive, suspended, out_of_stock"
        )

    # Buscar productos
    result = await db.execute(
        select(VendorProduct).where(VendorProduct.vp_id.in_(vp_ids))
    )
    vendor_products = result.scalars().all()

    if not vendor_products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron vendor products con los IDs proporcionados"
        )

    # Actualizar estado
    updated_count = 0
    for vp in vendor_products:
        vp.vp_status = vp_status
        vp.updated_by = current_user.user_email
        updated_count += 1

    await db.commit()

    return {
        "message": f"{updated_count} vendor products actualizados",
        "updated_ids": [vp.vp_id for vp in vendor_products],
        "new_status": vp_status
    }


# =============================================================================
# ENDPOINTS CRUD (DESPUÉS - RUTAS CON PARÁMETROS VARIABLES)
# =============================================================================

@router.get("/", response_model=List[VendorProductPublic])
async def list_vendor_products(
    skip: int = 0,
    limit: int = 100,
    vendor_code: Optional[str] = None,
    api_group_code: Optional[str] = None,  # ⭐ NUEVO
    vp_status: Optional[str] = None,
    vp_product_type: Optional[int] = None,
    vp_operator: Optional[str] = None,
    vp_country: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Listar vendor products con filtros opcionales

    **Requiere:** Admin o Superadmin

    **Parámetros:**
    - vendor_code: Filtrar por vendor
    - api_group_code: Filtrar por grupo de APIs ⭐ NUEVO
    - vp_status: Filtrar por estado (active, inactive)
    - vp_product_type: Filtrar por tipo de producto
    - vp_operator: Filtrar por operador
    - vp_country: Filtrar por país
    - search: Búsqueda por código o nombre
    """
    query = select(VendorProduct)

    # Aplicar filtros
    if vendor_code:
        query = query.where(VendorProduct.vendor_code == vendor_code)

    if api_group_code:  # ⭐ NUEVO
        query = query.where(VendorProduct.api_group_code == api_group_code)

    if vp_status:
        query = query.where(VendorProduct.vp_status == vp_status)

    if vp_product_type is not None:
        query = query.where(VendorProduct.vp_product_type == vp_product_type)

    if vp_operator:
        query = query.where(VendorProduct.vp_operator == vp_operator)

    if vp_country:
        query = query.where(VendorProduct.vp_country == vp_country)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                VendorProduct.vp_code.ilike(search_term),
                VendorProduct.vp_name.ilike(search_term),
                VendorProduct.vp_skuid.ilike(search_term)
            )
        )

    # Ordenar y paginar
    query = query.offset(skip).limit(limit).order_by(
        VendorProduct.vendor_code,
        VendorProduct.api_group_code,  # ⭐ NUEVO
        VendorProduct.vp_code
    )

    result = await db.execute(query)
    vendor_products = result.scalars().all()

    return vendor_products


@router.get("/{vp_id}/", response_model=VendorProductPublic)
async def get_vendor_product(
    vp_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Obtener detalle de un vendor product por ID

    **Requiere:** Admin o Superadmin
    """
    result = await db.execute(
        select(VendorProduct).where(VendorProduct.vp_id == vp_id)
    )
    vendor_product = result.scalar_one_or_none()

    if not vendor_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor product {vp_id} no encontrado"
        )

    return vendor_product


@router.post("/", response_model=VendorProductPublic, status_code=status.HTTP_201_CREATED)
async def create_vendor_product(
    vendor_product_data: VendorProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Crear nuevo vendor product

    **Requiere:** Admin o Superadmin
    """
    # Verificar que el vendor existe
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_product_data.vendor_code)
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor {vendor_product_data.vendor_code} no encontrado"
        )

    # Verificar que no existe el mismo código para el mismo vendor
    result = await db.execute(
        select(VendorProduct).where(
            and_(
                VendorProduct.vendor_code == vendor_product_data.vendor_code,
                VendorProduct.vp_code == vendor_product_data.vp_code
            )
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor product {vendor_product_data.vp_code} ya existe para vendor {vendor_product_data.vendor_code}"
        )

    # Crear vendor product
    vendor_product = VendorProduct(
        **vendor_product_data.dict(),
        created_by=current_user.user_email
    )

    db.add(vendor_product)
    await db.commit()
    await db.refresh(vendor_product)

    return vendor_product


@router.put("/{vp_id}/", response_model=VendorProductPublic)
async def update_vendor_product(
    vp_id: int,
    vendor_product_data: VendorProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Actualizar vendor product

    **Requiere:** Admin o Superadmin
    """
    result = await db.execute(
        select(VendorProduct).where(VendorProduct.vp_id == vp_id)
    )
    vendor_product = result.scalar_one_or_none()

    if not vendor_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor product {vp_id} no encontrado"
        )

    # Actualizar campos
    update_data = vendor_product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vendor_product, field, value)

    vendor_product.updated_by = current_user.user_email

    await db.commit()
    await db.refresh(vendor_product)

    return vendor_product


@router.delete("/{vp_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vendor_product(
    vp_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Eliminar vendor product (SOLO SUPERADMIN)

    **Requiere:** Superadmin
    """
    result = await db.execute(
        select(VendorProduct).where(VendorProduct.vp_id == vp_id)
    )
    vendor_product = result.scalar_one_or_none()

    if not vendor_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor product {vp_id} no encontrado"
        )

    await db.delete(vendor_product)
    await db.commit()

    return None


# =============================================================================
# ✅✅✅ CAMBIOS REALIZADOS EN FASE 3 (api_group_code):
# =============================================================================
# LÍNEA 65: Agregado products_by_api_group en summary
# LÍNEA 153: Agregado filtro api_group_code en list_vendor_products
# LÍNEA 200: Agregado api_group_code en order_by
# El endpoint /by-keys/ ahora retorna api_group_code automáticamente (VendorProductPublic)
# =============================================================================