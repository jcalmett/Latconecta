"""
Router — Libro de Reclamaciones Virtual — LR-001
"""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import io

from app.database import get_db
from app.dependencies import get_current_user_required as get_current_user, get_current_admin_user, get_current_user_optional as get_optional_user
from app.complaints import service
from app.complaints.schemas import (
    ComplaintCreate, ComplaintResponse, ComplaintStatusResponse,
    ComplaintConsultaRequest, OfertaRespuesta, ComplaintAdminUpdate
)

router = APIRouter()


# ── PÚBLICOS ──────────────────────────────────────────────────────────────

@router.post("/reclamaciones", response_model=ComplaintResponse, status_code=201, tags=["Reclamaciones"])
async def registrar_reclamacion(
    data: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """Registra una reclamación. Público — sin auth requerida."""
    user_id = current_user.user_id if current_user else None
    return await service.registrar_reclamacion(db, data, user_id)


@router.post("/reclamaciones/consultar", response_model=ComplaintStatusResponse, tags=["Reclamaciones"])
async def consultar_estado(
    data: ComplaintConsultaRequest,
    db: AsyncSession = Depends(get_db),
):
    """Consulta pública por número correlativo + DNI."""
    return await service.consultar_estado(db, data.numero_correlativo, data.consumidor_nro_doc)


@router.get("/reclamaciones/oferta/{numero}", response_model=ComplaintStatusResponse, tags=["Reclamaciones"])
async def consultar_para_oferta(
    numero: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Consulta por número correlativo solo — usado desde el link del email de oferta.
    No requiere DNI porque el link ya es el mecanismo de autenticación (Art. 6-A).
    """
    return await service.consultar_para_oferta(db, numero)


@router.post("/reclamaciones/oferta/respuesta", response_model=ComplaintResponse, tags=["Reclamaciones"])
async def responder_oferta(
    data: OfertaRespuesta,
    db: AsyncSession = Depends(get_db),
):
    """Consumidor acepta o rechaza la oferta del proveedor — Art. 6-A DS 101-2022."""
    return await service.responder_oferta(db, data)


@router.get("/reclamaciones/mis-reclamaciones", tags=["Reclamaciones"])
async def mis_reclamaciones(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await service.mis_reclamaciones(db, current_user.user_id)


# ── ADMIN ─────────────────────────────────────────────────────────────────

@router.get("/admin/reclamaciones", tags=["Admin — Reclamaciones"])
async def listar_reclamaciones(
    skip:                int  = Query(0, ge=0),
    limit:               int  = Query(50, ge=1, le=200),
    estado:              Optional[str] = None,
    tipo:                Optional[str] = None,
    canal:               Optional[str] = None,
    vencimiento_proximo: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    return await service.listar_admin(db, skip, limit, estado, tipo, canal, vencimiento_proximo)


@router.get("/admin/reclamaciones/export", tags=["Admin — Reclamaciones"])
async def exportar_reclamaciones(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    csv_content = await service.exportar_csv(db)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reclamaciones_latconecta.csv"}
    )


@router.get("/admin/reclamaciones/{complaint_id}", tags=["Admin — Reclamaciones"])
async def detalle_reclamacion(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    return await service.detalle_admin(db, complaint_id)


@router.put("/admin/reclamaciones/{complaint_id}", tags=["Admin — Reclamaciones"])
async def actualizar_reclamacion(
    complaint_id: int,
    data: ComplaintAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_admin_user),
):
    admin_user = current_user.user_email or "admin"
    return await service.actualizar_admin(db, complaint_id, data, admin_user)
