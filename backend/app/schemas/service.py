"""
Schemas Pydantic para Service
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ServiceBase(BaseModel):
    """Schema base para Service"""
    service_name: str = Field(..., max_length=50, description="Nombre del servicio")
    service_photo: Optional[str] = Field(None, max_length=255, description="URL foto servicio")
    service_photo_mkt: Optional[str] = Field(None, max_length=255, description="URL foto marketing")
    service_description: Optional[str] = Field(None, max_length=500, description="Descripción")
    status: Optional[str] = Field('active', max_length=20, description="Estado")


class ServiceCreate(ServiceBase):
    """Schema para crear Service"""
    created_by: Optional[str] = Field(None, max_length=100)


class ServiceUpdate(BaseModel):
    """Schema para actualizar Service - todos los campos son opcionales"""
    service_name: Optional[str] = Field(None, max_length=50)
    service_photo: Optional[str] = Field(None, max_length=255)
    service_photo_mkt: Optional[str] = Field(None, max_length=255)
    service_description: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, max_length=20)
    updated_by: Optional[str] = Field(None, max_length=100)


class ServiceInDB(ServiceBase):
    """Schema para Service desde la base de datos"""
    service_id: int
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_update_date: Optional[datetime] = None

    class Config:
        from_attributes = True
