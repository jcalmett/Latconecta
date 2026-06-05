"""
Pydantic Schemas — Libro de Reclamaciones Virtual — LR-001
"""
from pydantic import BaseModel, field_validator
from typing import Optional, Literal, List
from datetime import datetime, date
from decimal import Decimal


class ComplaintCreate(BaseModel):
    consumidor_nombre:          str
    consumidor_domicilio:       Optional[str] = None
    consumidor_tipo_doc:        Literal["DNI", "CE"] = "DNI"
    consumidor_nro_doc:         str
    consumidor_telefono:        Optional[str] = None
    consumidor_email:           str
    consumidor_menor_edad:      bool = False
    representante_nombre:       Optional[str] = None
    representante_telefono:     Optional[str] = None
    representante_email:        Optional[str] = None
    bien_tipo:                  Literal["PRODUCTO", "SERVICIO"]
    bien_descripcion:           str
    bien_monto:                 Decimal
    tipo_reclamacion:           Literal["RECLAMO", "QUEJA"]
    detalle:                    str
    pedido_concreto:            str
    canal_respuesta:            Literal["CORREO_ELECTRONICO", "CARTA"] = "CORREO_ELECTRONICO"
    direccion_correspondencia:  Optional[str] = None
    purchase_id:                Optional[int] = None
    doc1_url:                   Optional[str] = None
    doc1_nombre:                Optional[str] = None
    doc2_url:                   Optional[str] = None
    doc2_nombre:                Optional[str] = None
    confirmacion_veracidad:     bool

    @field_validator("confirmacion_veracidad")
    @classmethod
    def must_confirm(cls, v):
        if not v:
            raise ValueError("Debe confirmar la veracidad de la información.")
        return v

    @field_validator("representante_nombre")
    @classmethod
    def rep_required_if_minor(cls, v, info):
        if info.data.get("consumidor_menor_edad") and not v:
            raise ValueError("Nombre del representante requerido para menor de edad.")
        return v

    @field_validator("direccion_correspondencia")
    @classmethod
    def direccion_required_if_carta(cls, v, info):
        if info.data.get("canal_respuesta") == "CARTA" and not v:
            raise ValueError("Dirección requerida cuando canal de respuesta es CARTA.")
        return v


class ComplaintResponse(BaseModel):
    id:                     int
    numero_correlativo:     str
    fecha_registro:         datetime
    tipo_reclamacion:       str
    estado:                 str
    fecha_limite_respuesta: date
    canal_respuesta:        str
    acuse_enviado:          bool
    doc1_url:               Optional[str] = None
    doc1_nombre:            Optional[str] = None
    doc2_url:               Optional[str] = None
    doc2_nombre:            Optional[str] = None
    model_config = {"from_attributes": True}


class ComplaintStatusResponse(BaseModel):
    numero_correlativo:     str
    tipo_reclamacion:       str
    estado:                 str
    fecha_registro:         datetime
    fecha_limite_respuesta: date
    canal_respuesta:        str
    acuse_enviado:          bool
    oferta_texto:           Optional[str] = None
    oferta_respuesta:       Optional[str] = None
    model_config = {"from_attributes": True}


# Consulta pública por número correlativo + DNI (P-2)
class ComplaintConsultaRequest(BaseModel):
    numero_correlativo: str
    consumidor_nro_doc: str


class OfertaRespuesta(BaseModel):
    numero_correlativo: str
    respuesta:          Literal["ACEPTADA", "RECHAZADA"]
    observacion:        Optional[str] = None  # Comentario al rechazar


class ComplaintAdminUpdate(BaseModel):
    estado:              Optional[str] = None
    respuesta_proveedor: Optional[str] = None
    responsable_interno: Optional[str] = None
    oferta_texto:        Optional[str] = None


class ComplaintOfferSchema(BaseModel):
    id:                int
    oferta_texto:      str
    enviada_at:        datetime
    enviada_por:       Optional[str] = None
    respuesta:         Optional[str] = None
    respuesta_at:      Optional[datetime] = None
    observacion:       Optional[str] = None
    model_config = {"from_attributes": True}
