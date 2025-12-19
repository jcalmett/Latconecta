"""
LATCONECTA - Country Schemas
Schemas Pydantic para validación de datos de countries
Actualizado: 2025-12-17 - Cambiado a códigos ISO 3166-1 alpha-3 (3 caracteres)
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class CountryBase(BaseModel):
    """Schema base con campos comunes"""
    country_code: str = Field(..., min_length=2, max_length=3, description="Código ISO de 2 o 3 letras (PE o PER)")
    country_name: str = Field(..., min_length=1, max_length=100)
    country_flag_photo: Optional[str] = Field(None, max_length=500)
    country_photo: Optional[str] = Field(None, max_length=500)
    country_description: Optional[str] = Field(None, max_length=500)

    # Tasa de cambio
    country_er_usd_pen: Optional[Decimal] = Field(
        default=3.75,
        ge=0,
        le=99.999999,
        description="Tasa de cambio USD a PEN"
    )

    status: Optional[str] = Field(default="active", pattern="^(active|inactive)$")

    @field_validator('country_er_usd_pen')
    @classmethod
    def validate_exchange_rate(cls, v):
        """Validar que la tasa tenga máximo 6 decimales"""
        if v is not None:
            # Convertir a Decimal si no lo es
            if not isinstance(v, Decimal):
                v = Decimal(str(v))

            # Verificar cantidad de decimales
            decimal_places = abs(v.as_tuple().exponent)
            if decimal_places > 6:
                raise ValueError('La tasa de cambio no puede tener más de 6 decimales')

            # Verificar rango
            if v < 0 or v > Decimal('9999.999999'):
                raise ValueError('La tasa debe estar entre 0 y 9999.999999')

        return v

    class Config:
        from_attributes = True


class CountryCreate(CountryBase):
    """Schema para crear country"""
    created_by: Optional[str] = Field(default="System", max_length=100)


class CountryUpdate(BaseModel):
    """Schema para actualizar country - todos los campos opcionales"""
    country_code: Optional[str] = Field(None, min_length=2, max_length=3)
    country_name: Optional[str] = Field(None, min_length=1, max_length=100)
    country_flag_photo: Optional[str] = Field(None, max_length=500)
    country_photo: Optional[str] = Field(None, max_length=500)
    country_description: Optional[str] = Field(None, max_length=500)

    # Tasa de cambio
    country_er_usd_pen: Optional[Decimal] = Field(None, ge=0, le=99.999999)

    status: Optional[str] = Field(None, pattern="^(active|inactive)$")
    updated_by: Optional[str] = Field(None, max_length=100)

    @field_validator('country_er_usd_pen')
    @classmethod
    def validate_exchange_rate(cls, v):
        """Validar tasa de cambio en actualización"""
        if v is not None:
            if not isinstance(v, Decimal):
                v = Decimal(str(v))

            decimal_places = abs(v.as_tuple().exponent)
            if decimal_places > 6:
                raise ValueError('La tasa de cambio no puede tener más de 6 decimales')

            if v < 0 or v > Decimal('9999.999999'):
                raise ValueError('La tasa debe estar entre 0 y 9999.999999')

        return v

    class Config:
        from_attributes = True


class CountryResponse(CountryBase):
    """Schema para respuestas - incluye campos de solo lectura"""
    country_id: int

    # Fecha de tasa de cambio (solo lectura)
    country_date_er: Optional[datetime] = None

    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_update_date: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            Decimal: lambda v: float(v) if v else None
        }


# Alias para compatibilidad
CountryInDB = CountryResponse