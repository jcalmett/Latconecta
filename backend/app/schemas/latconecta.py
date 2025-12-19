"""
LATCONECTA - Latconecta Schemas
Schemas Pydantic para validación de datos de Latconecta
Actualizado: 2025-12-17 - Renombrado company_* a latconecta_*
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class LatconectaBase(BaseModel):
    """Schema base con campos comunes"""
    latconecta_name: str = Field(..., min_length=1, max_length=50)
    latconecta_logo: Optional[str] = Field(None, max_length=500)
    latconecta_photo: Optional[str] = Field(None, max_length=500)
    
    # Fotos Marketing
    latconecta_photo_mkt1: Optional[str] = Field(None, max_length=500)
    latconecta_photo_mkt2: Optional[str] = Field(None, max_length=500)
    latconecta_photo_mkt3: Optional[str] = Field(None, max_length=500)
    latconecta_photo_mkt4: Optional[str] = Field(None, max_length=500)
    
    # Descripción y lemas
    latconecta_description: Optional[str] = Field(None, max_length=500)
    latconecta_lema_1: Optional[str] = Field(None, max_length=500)
    latconecta_lema_2: Optional[str] = Field(None, max_length=500)
    
    # Balance (solo lectura, no se envía en create/update)
    # latconecta_credit_balance y latconecta_date_balance se manejan internamente
    
    # Contacto
    latconecta_mail_support: Optional[str] = Field(None, max_length=255)
    latconecta_mail_comercial: Optional[str] = Field(None, max_length=255)
    latconecta_phone: Optional[str] = Field(None, max_length=50)
    latconecta_address: Optional[str] = Field(None, max_length=500)
    latconecta_web: Optional[str] = Field(None, max_length=255)
    
    # Redes sociales
    latconecta_facebook: Optional[str] = Field(None, max_length=255)
    latconecta_instagram: Optional[str] = Field(None, max_length=255)
    latconecta_twitter: Optional[str] = Field(None, max_length=255)
    latconecta_linkedin: Optional[str] = Field(None, max_length=255)
    latconecta_youtube: Optional[str] = Field(None, max_length=255)
    
    # Estado
    latconecta_status: Optional[str] = Field(default="active", pattern="^(active|inactive)$")

    class Config:
        from_attributes = True


class LatconectaUpdate(BaseModel):
    """Schema para actualizar Latconecta - todos los campos opcionales"""
    latconecta_name: Optional[str] = Field(None, min_length=1, max_length=50)
    latconecta_logo: Optional[str] = Field(None, max_length=500)
    latconecta_photo: Optional[str] = Field(None, max_length=500)
    
    # Fotos Marketing
    latconecta_photo_mkt1: Optional[str] = Field(None, max_length=500)
    latconecta_photo_mkt2: Optional[str] = Field(None, max_length=500)
    latconecta_photo_mkt3: Optional[str] = Field(None, max_length=500)
    latconecta_photo_mkt4: Optional[str] = Field(None, max_length=500)
    
    # Descripción y lemas
    latconecta_description: Optional[str] = Field(None, max_length=500)
    latconecta_lema_1: Optional[str] = Field(None, max_length=500)
    latconecta_lema_2: Optional[str] = Field(None, max_length=500)
    
    # Contacto
    latconecta_mail_support: Optional[str] = Field(None, max_length=255)
    latconecta_mail_comercial: Optional[str] = Field(None, max_length=255)
    latconecta_phone: Optional[str] = Field(None, max_length=50)
    latconecta_address: Optional[str] = Field(None, max_length=500)
    latconecta_web: Optional[str] = Field(None, max_length=255)
    
    # Redes sociales
    latconecta_facebook: Optional[str] = Field(None, max_length=255)
    latconecta_instagram: Optional[str] = Field(None, max_length=255)
    latconecta_twitter: Optional[str] = Field(None, max_length=255)
    latconecta_linkedin: Optional[str] = Field(None, max_length=255)
    latconecta_youtube: Optional[str] = Field(None, max_length=255)
    
    # Estado
    latconecta_status: Optional[str] = Field(None, pattern="^(active|inactive)$")
    
    # Auditoría
    updated_by: Optional[str] = Field(None, max_length=100)

    class Config:
        from_attributes = True


class LatconectaResponse(LatconectaBase):
    """Schema para respuestas - incluye campos de solo lectura"""
    latconecta_id: int
    
    # Balance de crédito (solo lectura)
    latconecta_credit_balance: Optional[Decimal] = None
    latconecta_date_balance: Optional[date] = None
    
    # Auditoría
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_update_date: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None,
            Decimal: lambda v: float(v) if v else None
        }


# Alias para compatibilidad
LatconectaInDB = LatconectaResponse