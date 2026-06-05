"""
Service — Libro de Reclamaciones Virtual — LR-001
"""
import logging, csv, io, re
from datetime import date, datetime, timezone, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func
from app.complaints.model import ComplaintRecord, ComplaintOffer
from app.complaints.schemas import ComplaintCreate, ComplaintAdminUpdate, OfertaRespuesta
from fastapi import HTTPException

logger = logging.getLogger(__name__)


def _valid_email_format(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


async def _valid_email_domain(email: str) -> bool:
    try:
        import dns.resolver
        domain = email.split("@")[1]
        dns.resolver.resolve(domain, "MX")
        return True
    except Exception:
        return False


async def calcular_fecha_limite(db: AsyncSession, desde: date, dias_habiles: int) -> date:
    result = await db.execute(
        text("SELECT fecha FROM calendar_holidays WHERE activo = TRUE ORDER BY fecha")
    )
    feriados = {row[0] for row in result.fetchall()}
    current = desde
    habiles = 0
    while habiles < dias_habiles:
        current += timedelta(days=1)
        if current.weekday() < 5 and current not in feriados:
            habiles += 1
    return current


async def registrar_reclamacion(
    db: AsyncSession,
    data: ComplaintCreate,
    user_id: Optional[int] = None
) -> ComplaintRecord:
    from app.services import email_service

    email_valido = False
    if data.consumidor_email and _valid_email_format(data.consumidor_email):
        email_valido = await _valid_email_domain(data.consumidor_email)

    if not email_valido and not data.consumidor_domicilio:
        raise HTTPException(
            status_code=422,
            detail="Ingrese un correo válido o su domicilio para poder registrar su reclamación."
        )

    canal = data.canal_respuesta
    if not email_valido:
        canal = "CARTA"

    result = await db.execute(text("SELECT * FROM latconecta LIMIT 1"))
    lc = result.fetchone()
    if not lc:
        raise HTTPException(status_code=500, detail="No se encontraron datos del proveedor.")

    year = date.today().year
    result = await db.execute(text("SELECT generate_complaint_number(:y)"), {"y": year})
    numero = result.scalar()

    fecha_limite = await calcular_fecha_limite(db, date.today(), 15)

    complaint = ComplaintRecord(
        numero_correlativo        = numero,
        proveedor_razon_social    = lc.latconecta_name,
        proveedor_ruc             = "00000000000",
        proveedor_domicilio       = lc.latconecta_address or "Miami, FL, USA",
        fecha_limite_respuesta    = fecha_limite,
        user_id                   = user_id,
        canal_respuesta           = canal,
        consumidor_nombre         = data.consumidor_nombre,
        consumidor_domicilio      = data.consumidor_domicilio,
        consumidor_tipo_doc       = data.consumidor_tipo_doc,
        consumidor_nro_doc        = data.consumidor_nro_doc,
        consumidor_telefono       = data.consumidor_telefono,
        consumidor_email          = data.consumidor_email,
        consumidor_menor_edad     = data.consumidor_menor_edad,
        representante_nombre      = data.representante_nombre,
        representante_telefono    = data.representante_telefono,
        representante_email       = data.representante_email,
        bien_tipo                 = data.bien_tipo,
        bien_descripcion          = data.bien_descripcion,
        bien_monto                = data.bien_monto,
        tipo_reclamacion          = data.tipo_reclamacion,
        detalle                   = data.detalle,
        pedido_concreto           = data.pedido_concreto,
        direccion_correspondencia = data.direccion_correspondencia,
        purchase_id               = data.purchase_id,
        doc1_url                  = data.doc1_url,
        doc1_nombre               = data.doc1_nombre,
        doc2_url                  = data.doc2_url,
        doc2_nombre               = data.doc2_nombre,
        created_by                = f"user_{user_id}" if user_id else "publico",
    )
    db.add(complaint)
    await db.flush()

    # Acuse al correo indicado por el consumidor — Art. 4-B DS 006-2014
    # Para menores: el representante es quien presenta — acuse va a su correo
    # pero el nombre del consumidor es el del menor
    acuse_email = data.consumidor_email
    if data.consumidor_menor_edad and data.representante_email:
        acuse_email = data.representante_email
    email_destino_valido = email_valido or (data.consumidor_menor_edad and data.representante_email)

    if email_valido or (data.consumidor_menor_edad and data.representante_email):
        try:
            await email_service.send_complaint_ack(
                to_email      = acuse_email,
                nombre        = data.consumidor_nombre,  # nombre del menor siempre
                numero        = numero,
                fecha         = complaint.fecha_registro,
                tipo          = data.tipo_reclamacion,
                fecha_lim     = fecha_limite,
                canal         = canal,
                bien_desc     = data.bien_descripcion,
                bien_monto    = float(data.bien_monto),
                detalle       = data.detalle,
                pedido        = data.pedido_concreto,
            )
            complaint.acuse_enviado    = True
            complaint.acuse_enviado_at = datetime.now(timezone.utc)
        except Exception as e:
            logger.error(f"Email acuse fallido {numero}: {e}")
    else:
        try:
            await email_service.send_complaint_admin_alert(
                numero = numero,
                motivo = f"Email del consumidor inválido ({data.consumidor_email}). Canal forzado a CARTA. Acuse físico requerido al domicilio: {data.consumidor_domicilio}"
            )
        except Exception as e:
            logger.error(f"Alerta admin fallida {numero}: {e}")

    await db.commit()
    await db.refresh(complaint)
    return complaint


def _normalizar_numero(numero: str) -> str:
    """Acepta 000000132026 o 00000013-2026 — normaliza a 00000013-2026"""
    numero = numero.strip()
    if "-" not in numero and len(numero) == 12:
        return numero[:8] + "-" + numero[8:]
    return numero


async def consultar_para_oferta(db: AsyncSession, numero: str) -> ComplaintRecord:
    """Consulta por número correlativo solo — para el link del email de oferta."""
    numero = _normalizar_numero(numero)
    result = await db.execute(
        select(ComplaintRecord).where(ComplaintRecord.numero_correlativo == numero)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Número de reclamación no encontrado.")
    return complaint


async def consultar_estado(db: AsyncSession, numero: str, nro_doc: str) -> ComplaintRecord:
    """Consulta pública por número correlativo + DNI — P-2"""
    numero = _normalizar_numero(numero)
    result = await db.execute(
        select(ComplaintRecord).where(
            ComplaintRecord.numero_correlativo == numero,
            ComplaintRecord.consumidor_nro_doc == nro_doc
        )
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="No se encontró una reclamación con ese número y documento. Verifique los datos."
        )
    return complaint


async def responder_oferta(db: AsyncSession, data: OfertaRespuesta) -> ComplaintRecord:
    """
    Consumidor acepta o rechaza la oferta activa.
    P-3: recalcula fecha límite si rechaza.
    P-4: notifica al admin.
    P-5: notifica al consumidor.
    Art. 6-A DS 101-2022.
    """
    from app.services import email_service

    result = await db.execute(
        select(ComplaintRecord).where(ComplaintRecord.numero_correlativo == data.numero_correlativo)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Número correlativo no encontrado.")
    if complaint.estado != "OFERTA_ENVIADA":
        raise HTTPException(status_code=400, detail="No hay oferta pendiente de respuesta.")

    # Registrar respuesta en el historial de ofertas (P-6)
    result_offer = await db.execute(
        select(ComplaintOffer).where(
            ComplaintOffer.complaint_id == complaint.id,
            ComplaintOffer.respuesta == None
        ).order_by(ComplaintOffer.enviada_at.desc())
    )
    offer = result_offer.scalar_one_or_none()
    if offer:
        offer.respuesta    = data.respuesta
        offer.respuesta_at = datetime.now(timezone.utc)
        offer.observacion  = data.observacion

    # Actualizar complaint_records
    complaint.oferta_respuesta    = data.respuesta
    complaint.oferta_respuesta_at = datetime.now(timezone.utc)
    complaint.updated_by          = "consumidor"

    if data.respuesta == "ACEPTADA":
        complaint.respuesta_proveedor = "ACUERDO ACEPTADO PARA SOLUCIONAR EL RECLAMO"
        complaint.estado              = "CERRADO"
        complaint.fecha_respuesta     = datetime.now(timezone.utc)

    else:
        # P-3: Recalcular fecha límite restituyendo los días de suspensión no usados
        complaint.estado = "EN_PROCESO"
        if complaint.fecha_suspension_plazo:
            dias_suspendidos = (date.today() - complaint.fecha_suspension_plazo).days
            dias_restantes_suspension = max(0, (complaint.dias_suspension or 0) - dias_suspendidos)
            if dias_restantes_suspension > 0:
                nueva_fecha = complaint.fecha_limite_respuesta + timedelta(days=dias_restantes_suspension)
                complaint.fecha_limite_respuesta = nueva_fecha

        # P-4: Notificar al admin
        dias_restantes = (complaint.fecha_limite_respuesta - date.today()).days
        try:
            await email_service.send_complaint_rechazo_admin(
                numero        = complaint.numero_correlativo,
                consumidor    = complaint.consumidor_nombre,
                dias_restantes = dias_restantes,
                fecha_limite  = complaint.fecha_limite_respuesta,
                observacion   = data.observacion,
            )
        except Exception as e:
            logger.error(f"Alerta rechazo admin fallida {complaint.numero_correlativo}: {e}")

        # P-5: Notificar al consumidor
        try:
            await email_service.send_complaint_rechazo_consumidor(
                to_email      = complaint.consumidor_email,
                nombre        = complaint.consumidor_nombre,
                numero        = complaint.numero_correlativo,
                fecha_limite  = complaint.fecha_limite_respuesta,
            )
        except Exception as e:
            logger.error(f"Notificación rechazo consumidor fallida {complaint.numero_correlativo}: {e}")

    await db.commit()
    await db.refresh(complaint)
    return complaint


async def mis_reclamaciones(db: AsyncSession, user_id: int) -> List[ComplaintRecord]:
    result = await db.execute(
        select(ComplaintRecord)
        .where(ComplaintRecord.user_id == user_id)
        .order_by(ComplaintRecord.fecha_registro.desc())
    )
    return result.scalars().all()


async def listar_admin(
    db: AsyncSession,
    skip: int = 0, limit: int = 50,
    estado: Optional[str] = None,
    tipo: Optional[str] = None,
    canal: Optional[str] = None,
    vencimiento_proximo: bool = False,
) -> dict:
    query = select(ComplaintRecord)
    if estado:
        query = query.where(ComplaintRecord.estado == estado)
    if tipo:
        query = query.where(ComplaintRecord.tipo_reclamacion == tipo)
    if canal:
        query = query.where(ComplaintRecord.canal_respuesta == canal)
    if vencimiento_proximo:
        limite = date.today() + timedelta(days=3)
        query = query.where(
            ComplaintRecord.fecha_limite_respuesta <= limite,
            ComplaintRecord.estado.notin_(["RESPONDIDO", "CERRADO"])
        )
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()
    query = query.order_by(ComplaintRecord.fecha_registro.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    hoy = date.today()
    for item in items:
        item.dias_restantes = (item.fecha_limite_respuesta - hoy).days if item.fecha_limite_respuesta else None
    return {"total": total, "items": items}


async def detalle_admin(db: AsyncSession, complaint_id: int) -> dict:
    """Detalle completo incluyendo historial de ofertas — P-6"""
    result = await db.execute(
        select(ComplaintRecord).where(ComplaintRecord.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Reclamación no encontrada.")

    result_offers = await db.execute(
        select(ComplaintOffer)
        .where(ComplaintOffer.complaint_id == complaint_id)
        .order_by(ComplaintOffer.enviada_at)
    )
    ofertas = result_offers.scalars().all()
    return {"complaint": complaint, "ofertas": ofertas}


async def actualizar_admin(
    db: AsyncSession,
    complaint_id: int,
    data: ComplaintAdminUpdate,
    admin_user: str
) -> ComplaintRecord:
    from app.services import email_service

    result = await db.execute(
        select(ComplaintRecord).where(ComplaintRecord.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Reclamación no encontrada.")

    if data.estado:
        complaint.estado = data.estado
    if data.respuesta_proveedor:
        complaint.respuesta_proveedor = data.respuesta_proveedor
        complaint.fecha_respuesta     = datetime.now(timezone.utc)
    if data.responsable_interno:
        complaint.responsable_interno = data.responsable_interno

    if data.oferta_texto:
        # Registrar en historial de ofertas — P-6
        nueva_oferta = ComplaintOffer(
            complaint_id       = complaint_id,
            numero_correlativo = complaint.numero_correlativo,
            oferta_texto       = data.oferta_texto,
            enviada_por        = admin_user,
        )
        db.add(nueva_oferta)

        # Actualizar campos de oferta activa en complaint_records
        complaint.oferta_texto           = data.oferta_texto
        complaint.oferta_enviada_at      = datetime.now(timezone.utc)
        complaint.oferta_respuesta       = None
        complaint.oferta_respuesta_at    = None
        complaint.estado                 = "OFERTA_ENVIADA"
        complaint.fecha_suspension_plazo = date.today()
        complaint.dias_suspension        = 10

        try:
            await email_service.send_complaint_offer(
                to_email = complaint.consumidor_email,
                nombre   = complaint.consumidor_nombre,
                numero   = complaint.numero_correlativo,
                oferta   = data.oferta_texto,
            )
        except Exception as e:
            logger.error(f"Email oferta fallido {complaint.numero_correlativo}: {e}")

    complaint.updated_by = admin_user
    await db.commit()
    await db.refresh(complaint)
    return complaint


async def exportar_csv(db: AsyncSession) -> str:
    result = await db.execute(
        select(ComplaintRecord).order_by(ComplaintRecord.fecha_registro.desc())
    )
    items = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "N° Correlativo","Fecha Registro","Tipo","Estado",
        "Consumidor","DNI/CE","Email","Canal Respuesta",
        "Bien Tipo","Monto S/","Detalle","Pedido",
        "Fecha Límite","Respuesta Proveedor","Oferta Activa","Oferta Respuesta",
        "Acuse Enviado","Responsable"
    ])
    for r in items:
        writer.writerow([
            r.numero_correlativo, r.fecha_registro, r.tipo_reclamacion, r.estado,
            r.consumidor_nombre, r.consumidor_nro_doc, r.consumidor_email, r.canal_respuesta,
            r.bien_tipo, r.bien_monto, r.detalle, r.pedido_concreto,
            r.fecha_limite_respuesta, r.respuesta_proveedor or "", r.oferta_texto or "", r.oferta_respuesta or "",
            r.acuse_enviado, r.responsable_interno or ""
        ])
    return output.getvalue()


async def check_complaint_deadlines(db: AsyncSession):
    from app.services import email_service
    limite = date.today() + timedelta(days=3)
    result = await db.execute(
        select(ComplaintRecord).where(
            ComplaintRecord.fecha_limite_respuesta <= limite,
            ComplaintRecord.estado.notin_(["RESPONDIDO", "CERRADO"])
        )
    )
    casos = result.scalars().all()
    for caso in casos:
        dias = (caso.fecha_limite_respuesta - date.today()).days
        try:
            await email_service.send_complaint_alert(
                numero       = caso.numero_correlativo,
                consumidor   = caso.consumidor_nombre,
                dias         = dias,
                fecha_limite = caso.fecha_limite_respuesta,
            )
        except Exception as e:
            logger.error(f"Alerta vencimiento fallida {caso.numero_correlativo}: {e}")
    logger.info(f"check_complaint_deadlines: {len(casos)} caso(s) próximo(s) a vencer")
