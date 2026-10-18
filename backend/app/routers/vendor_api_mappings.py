"""
Router de Vendor API Mappings
CRUD completo para gestión de mapeos entre purchases y APIs de vendors
Usa convención de códigos: VAL01, PRO01, QRY01, REV01, etc.
✅ CONVERTIDO A ASYNC (AsyncSession)
✅ ACTUALIZADO CON api_group_code
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

# Imports de la app
from app.database import get_db
from app.models.vendor_api_mapping import VendorApiMapping
from app.schemas.vendor_api_mapping import (
    VendorApiMappingCreate,
    VendorApiMappingUpdate,
    VendorApiMappingResponse,
    AvailableFieldsResponse,
    get_available_request_fields,
    get_available_response_fields,
    get_available_operation_types
)
from app.utils.dependencies import get_current_user, get_current_admin

router = APIRouter(
    tags=["Vendor API Mappings"],
    responses={404: {"description": "Not found"}}
)

# ============================================================================
# CRUD OPERATIONS - ORDEN CORRECTO: RUTAS ESPECÍFICAS PRIMERO
# ============================================================================

@router.get("/", response_model=List[VendorApiMappingResponse])
async def list_mappings(
    vendor_code: Optional[str] = None,
    api_group_code: Optional[str] = None,  # ⭐ NUEVO
    operation_type: Optional[str] = None,
    mapping_code: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Lista todos los mappings con filtros opcionales

    Filtros:
    - vendor_code: Filtrar por vendor específico
    - api_group_code: Filtrar por grupo de APIs específico ⭐ NUEVO
    - operation_type: Filtrar por tipo de operación (validation, provision, etc.)
    - mapping_code: Filtrar por código específico (VAL01, PRO01, etc.)
    - is_active: Filtrar por estado activo/inactivo
    """
    query = select(VendorApiMapping)

    if vendor_code:
        query = query.filter(VendorApiMapping.vendor_code == vendor_code.upper())

    if api_group_code:  # ⭐ NUEVO
        query = query.filter(VendorApiMapping.api_group_code == api_group_code.upper())

    if operation_type:
        query = query.filter(VendorApiMapping.operation_type == operation_type.lower())

    if mapping_code:
        query = query.filter(VendorApiMapping.mapping_code == mapping_code.upper())

    if is_active is not None:
        query = query.filter(VendorApiMapping.is_active == is_active)

    query = query.order_by(
        VendorApiMapping.vendor_code,
        VendorApiMapping.api_group_code,  # ⭐ NUEVO
        VendorApiMapping.operation_type,
        VendorApiMapping.mapping_code
    )

    result = await db.execute(query)
    mappings = result.scalars().all()

    return mappings


# ============================================================================
# RUTAS ESPECÍFICAS (sin path parameters) - ANTES DE /{mapping_id}
# ============================================================================

@router.get("/available-fields", response_model=AvailableFieldsResponse)
async def get_available_fields():
    """
    Obtiene la lista de campos disponibles para mapear

    Retorna:
    - purchase_fields: Campos de la tabla purchases
    - vendor_product_fields: Campos de la tabla vendor_products
    """
    return AvailableFieldsResponse(
        request_fields=get_available_request_fields(),
        response_fields=get_available_response_fields()
    )


@router.get("/operation-types", response_model=List)
async def get_operation_types():
    """
    Obtiene la lista de tipos de operaciones disponibles
    Con descripción y orden de ejecución típico
    """
    return get_available_operation_types()


@router.get("/stats/summary")
async def get_mappings_summary(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtiene estadísticas resumen de los mappings
    """
    # Total
    result_total = await db.execute(select(func.count(VendorApiMapping.mapping_id)))
    total = result_total.scalar()

    # Activos
    result_active = await db.execute(
        select(func.count(VendorApiMapping.mapping_id))
        .filter(VendorApiMapping.is_active == True)
    )
    active = result_active.scalar()
    inactive = total - active

    # Contar por vendor
    result_vendors = await db.execute(
        select(
            VendorApiMapping.vendor_code,
            func.count(VendorApiMapping.mapping_id).label("count")
        ).group_by(VendorApiMapping.vendor_code)
    )
    vendors = result_vendors.all()
    vendors_dict = {v[0]: v[1] for v in vendors}

    # Contar por api_group_code ⭐ NUEVO
    result_groups = await db.execute(
        select(
            VendorApiMapping.api_group_code,
            func.count(VendorApiMapping.mapping_id).label("count")
        ).group_by(VendorApiMapping.api_group_code)
    )
    groups = result_groups.all()
    groups_dict = {g[0]: g[1] for g in groups}

    # Contar por operación
    result_operations = await db.execute(
        select(
            VendorApiMapping.operation_type,
            func.count(VendorApiMapping.mapping_id).label("count")
        ).group_by(VendorApiMapping.operation_type)
    )
    operations = result_operations.all()
    operations_dict = {o[0]: o[1] for o in operations}

    return {
        "total_mappings": total,
        "active_mappings": active,
        "inactive_mappings": inactive,
        "by_vendor": vendors_dict,
        "by_api_group": groups_dict,  # ⭐ NUEVO
        "by_operation": operations_dict,
        "last_updated": datetime.now().isoformat()
    }


@router.get("/vendor/{vendor_code}", response_model=List[VendorApiMappingResponse])
async def get_mappings_by_vendor(
    vendor_code: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtiene todos los mappings de un vendor específico
    Ordenados por api_group_code y mapping_code
    """
    result = await db.execute(
        select(VendorApiMapping)
        .filter(VendorApiMapping.vendor_code == vendor_code.upper())
        .order_by(
            VendorApiMapping.api_group_code,  # ⭐ ACTUALIZADO
            VendorApiMapping.mapping_code
        )
    )
    mappings = result.scalars().all()

    if not mappings:
        # No es error 404, simplemente retorna array vacío
        return []

    return mappings


@router.get("/vendor/{vendor_code}/group/{api_group_code}", response_model=List[VendorApiMappingResponse])
async def get_mappings_by_vendor_and_group(
    vendor_code: str,
    api_group_code: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtiene todos los mappings de un vendor y grupo específico
    
    Ejemplo: GET /vendor/DTONE/group/DT001
    Retorna: VAL01, PRO01, QRY01, REV01, etc. del grupo DT001
    """
    result = await db.execute(
        select(VendorApiMapping)
        .filter(
            VendorApiMapping.vendor_code == vendor_code.upper(),
            VendorApiMapping.api_group_code == api_group_code.upper()
        )
        .order_by(VendorApiMapping.operation_type)
    )
    mappings = result.scalars().all()

    if not mappings:
        return []

    return mappings


@router.get("/lookup/{vendor_code}/{api_group_code}/{operation_type}", response_model=VendorApiMappingResponse)
async def get_mapping_by_lookup(
    vendor_code: str,
    api_group_code: str,
    operation_type: str,
    db: AsyncSession = Depends(get_db)
):
    """
    ⭐ ENDPOINT PRINCIPAL PARA BUSCAR MAPPINGS
    
    Obtiene un mapping por (vendor_code, api_group_code, operation_type)
    
    Este es el endpoint que se usa en el flujo de compras:
    1. Usuario selecciona producto → obtenemos vendor_product
    2. vendor_product tiene: vendor_code y api_group_code
    3. Según operación necesaria (validation, provision, etc.) buscamos el mapping
    
    Ejemplo: GET /lookup/DTONE/DT001/provision
    → Retorna el mapping PRO01 para provisionar con DTONE grupo DT001
    
    ⚠️ Este endpoint NO requiere autenticación (usado en flujo de compra)
    """
    result = await db.execute(
        select(VendorApiMapping).filter(
            VendorApiMapping.vendor_code == vendor_code.upper(),
            VendorApiMapping.api_group_code == api_group_code.upper(),
            VendorApiMapping.operation_type == operation_type.lower(),
            VendorApiMapping.is_active == True  # Solo mappings activos
        )
    )
    mapping = result.scalar_one_or_none()

    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró mapping activo para vendor={vendor_code}, group={api_group_code}, operation={operation_type}"
        )

    return mapping


@router.get("/by-code/{vendor_code}/{mapping_code}", response_model=VendorApiMappingResponse)
async def get_mapping_by_code(
    vendor_code: str,
    mapping_code: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtiene un mapping por vendor_code y mapping_code

    Ejemplo: GET /by-code/DTONE/PRO01
    """
    result = await db.execute(
        select(VendorApiMapping).filter(
            VendorApiMapping.vendor_code == vendor_code.upper(),
            VendorApiMapping.mapping_code == mapping_code.upper()
        )
    )
    mapping = result.scalar_one_or_none()

    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mapping {mapping_code} no encontrado para vendor {vendor_code}"
        )

    return mapping


# ============================================================================
# RUTA CON PATH PARAMETER GENÉRICO - AL FINAL DE LOS GETs
# ============================================================================

@router.get("/{mapping_id}", response_model=VendorApiMappingResponse)
async def get_mapping(
    mapping_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtiene un mapping específico por ID
    """
    result = await db.execute(
        select(VendorApiMapping).filter(
            VendorApiMapping.mapping_id == mapping_id
        )
    )
    mapping = result.scalar_one_or_none()

    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mapping con ID {mapping_id} no encontrado"
        )

    return mapping


# ============================================================================
# POST, PUT, DELETE, PATCH
# ============================================================================

@router.post("/", response_model=VendorApiMappingResponse, status_code=status.HTTP_201_CREATED)
async def create_mapping(
    mapping: VendorApiMappingCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """
    Crea un nuevo mapping

    Validaciones:
    - vendor_code debe existir en tabla vendors
    - mapping_code debe ser único
    - La combinación (vendor_code, api_group_code, operation_type) debe ser única ⭐ ACTUALIZADO

    Convención de códigos:
    - VAL01, VAL02: Validación
    - PRO01, PRO02: Provisionamiento
    - QRY01: Consulta
    - REV01: Reversión
    - CON01: Confirmación
    - BAL01: Balance check
    """
    # Verificar si ya existe mapping con este código
    result_code = await db.execute(
        select(VendorApiMapping).filter(
            VendorApiMapping.mapping_code == mapping.mapping_code.upper()
        )
    )
    existing_code = result_code.scalar_one_or_none()

    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un mapping con código {mapping.mapping_code}"
        )

    # ⭐ ACTUALIZADO: Verificar constraint único (vendor_code, api_group_code, operation_type)
    result_existing = await db.execute(
        select(VendorApiMapping).filter(
            VendorApiMapping.vendor_code == mapping.vendor_code.upper(),
            VendorApiMapping.api_group_code == mapping.api_group_code.upper(),
            VendorApiMapping.operation_type == mapping.operation_type.lower()
        )
    )
    existing = result_existing.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un mapping para vendor={mapping.vendor_code}, group={mapping.api_group_code}, operation={mapping.operation_type} (código: {existing.mapping_code})"
        )

    # Crear nuevo mapping
    db_mapping = VendorApiMapping(
        vendor_code=mapping.vendor_code.upper(),
        api_group_code=mapping.api_group_code.upper(),  # ⭐ NUEVO
        operation_type=mapping.operation_type.lower(),
        mapping_code=mapping.mapping_code.upper(),
        http_method=mapping.http_method,
        endpoint_url=mapping.endpoint_url,
        auth_type=mapping.auth_type,
        auth_config=mapping.auth_config,
        request_mapping=mapping.request_mapping,
        value_transformations=mapping.value_transformations,
        response_mapping=mapping.response_mapping,
        success_indicators=mapping.success_indicators,
        timeout_seconds=mapping.timeout_seconds,
        headers=mapping.headers,
        is_active=mapping.is_active
    )

    db.add(db_mapping)
    await db.commit()
    await db.refresh(db_mapping)

    return db_mapping


@router.put("/{mapping_id}", response_model=VendorApiMappingResponse)
async def update_mapping(
    mapping_id: int,
    mapping_update: VendorApiMappingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """
    Actualiza un mapping existente

    Solo actualiza los campos que se envían en el request
    """
    result = await db.execute(
        select(VendorApiMapping).filter(
            VendorApiMapping.mapping_id == mapping_id
        )
    )
    db_mapping = result.scalar_one_or_none()

    if not db_mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mapping con ID {mapping_id} no encontrado"
        )

    # Actualizar solo campos no-None
    update_data = mapping_update.model_dump(exclude_unset=True)

    # ⭐ NUEVO: Si se actualiza api_group_code u operation_type, validar constraint único
    if 'api_group_code' in update_data or 'operation_type' in update_data:
        new_vendor_code = db_mapping.vendor_code
        new_api_group_code = update_data.get('api_group_code', db_mapping.api_group_code).upper()
        new_operation_type = update_data.get('operation_type', db_mapping.operation_type).lower()

        # Verificar que no exista otro mapping con esa combinación
        result_check = await db.execute(
            select(VendorApiMapping).filter(
                VendorApiMapping.vendor_code == new_vendor_code,
                VendorApiMapping.api_group_code == new_api_group_code,
                VendorApiMapping.operation_type == new_operation_type,
                VendorApiMapping.mapping_id != mapping_id  # Excluir el actual
            )
        )
        existing = result_check.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro mapping para vendor={new_vendor_code}, group={new_api_group_code}, operation={new_operation_type}"
            )

    for field, value in update_data.items():
        setattr(db_mapping, field, value)

    # Actualizar timestamp
    db_mapping.updated_at = datetime.now()

    await db.commit()
    await db.refresh(db_mapping)

    return db_mapping


@router.delete("/{mapping_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mapping(
    mapping_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """
    Elimina un mapping

    ADVERTENCIA: Esto eliminará el mapping permanentemente.

    Considera desactivar el mapping (is_active=false) en vez de eliminarlo.
    """
    result = await db.execute(
        select(VendorApiMapping).filter(
            VendorApiMapping.mapping_id == mapping_id
        )
    )
    db_mapping = result.scalar_one_or_none()

    if not db_mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mapping con ID {mapping_id} no encontrado"
        )

    await db.delete(db_mapping)
    await db.commit()

    return None


@router.patch("/{mapping_id}/toggle", response_model=VendorApiMappingResponse)
async def toggle_mapping_status(
    mapping_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """
    Activa o desactiva un mapping (toggle is_active)
    """
    result = await db.execute(
        select(VendorApiMapping).filter(
            VendorApiMapping.mapping_id == mapping_id
        )
    )
    mapping = result.scalar_one_or_none()

    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mapping con ID {mapping_id} no encontrado"
        )

    # Toggle status
    mapping.is_active = not mapping.is_active
    mapping.updated_at = datetime.now()

    await db.commit()
    await db.refresh(mapping)

    return mapping


@router.post("/validate")
async def validate_mapping_data(
    vendor_code: str,
    api_group_code: str,  # ⭐ NUEVO
    request_mapping: dict
):
    """
    Valida un mapping sin guardarlo en BD
    Útil para validar antes de crear
    """
    errors = []
    warnings = []

    # Validar que tenga fields
    if "fields" not in request_mapping or not request_mapping["fields"]:
        errors.append("request_mapping debe tener al menos 1 campo")

    # Validar cada field
    available_sources = [f.field_name for f in get_available_request_fields()] + \
                        [f.field_name for f in get_available_response_fields()]

    if "fields" in request_mapping:
        for idx, field in enumerate(request_mapping["fields"]):
            # Validar campos requeridos
            if "api_field" not in field:
                errors.append(f"Campo {idx}: falta api_field")
            if "source_field" not in field:
                errors.append(f"Campo {idx}: falta source_field")

            # Validar source_field existe
            if "source_field" in field and field["source_field"] not in available_sources:
                warnings.append(
                    f"Campo {idx}: source_field '{field['source_field']}' no está en la lista de campos disponibles"
                )

    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }