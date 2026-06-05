"""
SQLAlchemy Models — Libro de Reclamaciones Virtual — LR-001
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class ComplaintRecord(Base):
    __tablename__ = "complaint_records"

    id                        = Column(Integer, primary_key=True, index=True)
    numero_correlativo        = Column(String(20), nullable=False, unique=True)
    codigo_identificacion     = Column(String(50), nullable=False, default="LATCOM-VIRTUAL-001")
    fecha_registro            = Column(DateTime(timezone=True), server_default=func.now())

    # Proveedor (snapshot)
    proveedor_razon_social    = Column(String(200), nullable=False)
    proveedor_ruc             = Column(String(11), nullable=False)
    proveedor_domicilio       = Column(Text, nullable=False)

    # Consumidor — Sección B
    consumidor_nombre         = Column(String(200), nullable=False)
    consumidor_domicilio      = Column(Text)
    consumidor_tipo_doc       = Column(String(5), nullable=False, default="DNI")
    consumidor_nro_doc        = Column(String(20), nullable=False)
    consumidor_telefono       = Column(String(20))
    consumidor_email          = Column(String(200), nullable=False)
    consumidor_menor_edad     = Column(Boolean, nullable=False, default=False)
    representante_nombre      = Column(String(200))
    representante_telefono    = Column(String(20))
    representante_email       = Column(String(200))

    # Bien — Sección C
    bien_tipo                 = Column(String(10), nullable=False)
    bien_descripcion          = Column(Text, nullable=False)
    bien_monto                = Column(Numeric(10, 2), nullable=False)

    # Reclamación — Sección D
    tipo_reclamacion          = Column(String(10), nullable=False)
    detalle                   = Column(Text, nullable=False)
    pedido_concreto           = Column(Text, nullable=False)

    # Canal de respuesta
    canal_respuesta           = Column(String(20), nullable=False, default="CORREO_ELECTRONICO")
    direccion_correspondencia = Column(Text)

    # Gestión interna
    estado                    = Column(String(20), nullable=False, default="PENDIENTE")
    fecha_limite_respuesta    = Column(Date, nullable=False)
    respuesta_proveedor       = Column(Text)
    fecha_respuesta           = Column(DateTime(timezone=True))
    responsable_interno       = Column(String(200))

    # Oferta activa (última oferta en curso)
    oferta_texto              = Column(Text)
    oferta_enviada_at         = Column(DateTime(timezone=True))
    oferta_respuesta          = Column(String(10))
    oferta_respuesta_at       = Column(DateTime(timezone=True))
    fecha_suspension_plazo    = Column(Date)
    dias_suspension           = Column(Integer, default=0)

    # Documentos adjuntos (hasta 2, máx 5MB c/u — jpg/jpeg/png/pdf)
    doc1_url                  = Column(String(500))
    doc1_nombre               = Column(String(200))
    doc2_url                  = Column(String(500))
    doc2_nombre               = Column(String(200))

    # Referencias opcionales
    purchase_id               = Column(Integer)
    user_id                   = Column(Integer)

    # Auditoría acuse
    acuse_enviado             = Column(Boolean, nullable=False, default=False)
    acuse_enviado_at          = Column(DateTime(timezone=True))

    # Auditoría estándar
    created_by                = Column(String(100))
    updated_by                = Column(String(100))
    last_update_date          = Column(DateTime(timezone=True), server_default=func.now())

    # Relación con historial de ofertas
    ofertas                   = relationship("ComplaintOffer", back_populates="complaint",
                                             order_by="ComplaintOffer.enviada_at")


class ComplaintOffer(Base):
    __tablename__ = "complaint_offers"

    id                 = Column(Integer, primary_key=True, index=True)
    complaint_id       = Column(Integer, ForeignKey("complaint_records.id"), nullable=False)
    numero_correlativo = Column(String(20), nullable=False)
    oferta_texto       = Column(Text, nullable=False)
    enviada_at         = Column(DateTime(timezone=True), server_default=func.now())
    enviada_por        = Column(String(100))
    respuesta          = Column(String(10))
    respuesta_at       = Column(DateTime(timezone=True))
    observacion        = Column(Text)
    last_update_date   = Column(DateTime(timezone=True), server_default=func.now())

    complaint          = relationship("ComplaintRecord", back_populates="ofertas")
