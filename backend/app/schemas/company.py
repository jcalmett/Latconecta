"""
LATCONECTA - Company Schemas
Esquemas Pydantic para validación de datos de compañías
Actualizado: 2025-12-17 - Migración a Latconecta (multi-país, multi-servicio)
"""
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class CompanyBase(BaseModel):
    """Schema base de Company con campos comunes"""
    # NUEVOS CAMPOS LATCONECTA - OBLIGATORIOS
    country_id: int = Field(..., description="ID del país donde opera la compañía")
    service_id: int = Field(..., description="ID del servicio que ofrece la compañía")
    
    company_name: str = Field(..., min_length=1, max_length=50, description="Nombre de la compañía")
    company_logo: Optional[str] = Field(None, max_length=500, description="URL del logo")
    company_photo: Optional[str] = Field(None, max_length=500, description="URL de la foto principal")
    company_photo_mkt1: Optional[str] = Field(None, max_length=500, description="Foto marketing 1")
    company_photo_mkt2: Optional[str] = Field(None, max_length=500, description="Foto marketing 2")
    company_photo_mkt3: Optional[str] = Field(None, max_length=500, description="Foto marketing 3")
    company_photo_mkt4: Optional[str] = Field(None, max_length=500, description="Foto marketing 4")
    company_description5: Optional[str] = Field(None, max_length=500, description="Descripción")
    company_lema_1: Optional[str] = Field(None, max_length=500, description="Lema 1")
    company_lema_2: Optional[str] = Field(None, max_length=500, description="Lema 2")
    company_status: Optional[str] = Field("active", max_length=20, description="Estado: active/inactive")

    # Campos de crédito y balance
    company_credit_balance: Optional[Decimal] = Field(
        default=Decimal("0.00"),
        ge=0,
        decimal_places=2,
        description="Balance de crédito de la compañía"
    )
    company_date_balance: Optional[date] = Field(
        None,
        description="Fecha del último balance de crédito"
    )
    company_barcode_available: Optional[str] = Field(
        default="No",
        description="Disponibilidad de código de barras: Si o No"
    )
    
    # Emails de soporte
    company_mail_customer_support: Optional[EmailStr] = Field(
        None,
        description="Email de soporte al cliente"
    )
    company_mail_commercial_support: Optional[EmailStr] = Field(
        None,
        description="Email de soporte comercial"
    )

    @field_validator("country_id")
    @classmethod
    def validate_country_id(cls, v):
        """Valida que country_id sea positivo"""
        if v <= 0:
            raise ValueError("country_id debe ser mayor a 0")
        return v

    @field_validator("service_id")
    @classmethod
    def validate_service_id(cls, v):
        """Valida que service_id sea positivo"""
        if v <= 0:
            raise ValueError("service_id debe ser mayor a 0")
        return v

    @field_validator("company_status")
    @classmethod
    def validate_status(cls, v):
        """Valida que el status sea válido"""
        allowed = ["active", "inactive"]
        if v not in allowed:
            raise ValueError(f"Status debe ser uno de: {', '.join(allowed)}")
        return v

    @field_validator("company_barcode_available")
    @classmethod
    def validate_barcode_available(cls, v):
        """Valida que company_barcode_available sea 'Si' o 'No'"""
        if v is None:
            return "No"
        if v not in ["Si", "No"]:
            raise ValueError("company_barcode_available debe ser 'Si' o 'No'")
        return v

    @field_validator("company_credit_balance")
    @classmethod
    def validate_credit_balance(cls, v):
        """Valida que el balance sea un número válido con máximo 2 decimales"""
        if v is None:
            return Decimal("0.00")

        # Convertir a Decimal si viene como float o string
        if not isinstance(v, Decimal):
            v = Decimal(str(v))

        # Validar rango (máximo 99999999.99)
        if v < 0:
            raise ValueError("El balance no puede ser negativo")
        if v > Decimal("99999999.99"):
            raise ValueError("El balance excede el máximo permitido (99999999.99)")

        # Redondear a 2 decimales
        return v.quantize(Decimal("0.01"))


class CompanyCreate(CompanyBase):
    """Schema para crear una nueva compañía"""
    created_by: Optional[str] = Field(None, max_length=100, description="Usuario que crea")


class CompanyUpdate(BaseModel):
    """Schema para actualizar una compañía (todos los campos opcionales)"""
    # NUEVOS CAMPOS LATCONECTA - OPCIONALES EN UPDATE
    country_id: Optional[int] = Field(None, description="ID del país")
    service_id: Optional[int] = Field(None, description="ID del servicio")
    
    company_name: Optional[str] = Field(None, min_length=1, max_length=50)
    company_logo: Optional[str] = Field(None, max_length=500)
    company_photo: Optional[str] = Field(None, max_length=500)
    company_photo_mkt1: Optional[str] = Field(None, max_length=500)
    company_photo_mkt2: Optional[str] = Field(None, max_length=500)
    company_photo_mkt3: Optional[str] = Field(None, max_length=500)
    company_photo_mkt4: Optional[str] = Field(None, max_length=500)
    company_description5: Optional[str] = Field(None, max_length=500)
    company_lema_1: Optional[str] = Field(None, max_length=500)
    company_lema_2: Optional[str] = Field(None, max_length=500)
    company_status: Optional[str] = Field(None, max_length=20)

    # Campos de crédito y balance
    company_credit_balance: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    company_date_balance: Optional[date] = None
    company_barcode_available: Optional[str] = None
    
    # Emails de soporte
    company_mail_customer_support: Optional[EmailStr] = None
    company_mail_commercial_support: Optional[EmailStr] = None

    updated_by: Optional[str] = Field(None, max_length=100, description="Usuario que actualiza")

    @field_validator("country_id")
    @classmethod
    def validate_country_id(cls, v):
        """Valida que country_id sea positivo"""
        if v is not None and v <= 0:
            raise ValueError("country_id debe ser mayor a 0")
        return v

    @field_validator("service_id")
    @classmethod
    def validate_service_id(cls, v):
        """Valida que service_id sea positivo"""
        if v is not None and v <= 0:
            raise ValueError("service_id debe ser mayor a 0")
        return v

    @field_validator("company_status")
    @classmethod
    def validate_status(cls, v):
        """Valida que el status sea válido"""
        if v is None:
            return v
        allowed = ["active", "inactive"]
        if v not in allowed:
            raise ValueError(f"Status debe ser uno de: {', '.join(allowed)}")
        return v

    @field_validator("company_barcode_available")
    @classmethod
    def validate_barcode_available(cls, v):
        """Valida que company_barcode_available sea 'Si' o 'No'"""
        if v is None:
            return v
        if v not in ["Si", "No"]:
            raise ValueError("company_barcode_available debe ser 'Si' o 'No'")
        return v

    @field_validator("company_credit_balance")
    @classmethod
    def validate_credit_balance(cls, v):
        """Valida que el balance sea un número válido con máximo 2 decimales"""
        if v is None:
            return v

        # Convertir a Decimal si viene como float o string
        if not isinstance(v, Decimal):
            v = Decimal(str(v))

        # Validar rango
        if v < 0:
            raise ValueError("El balance no puede ser negativo")
        if v > Decimal("99999999.99"):
            raise ValueError("El balance excede el máximo permitido (99999999.99)")

        # Redondear a 2 decimales
        return v.quantize(Decimal("0.01"))


class CompanyResponse(CompanyBase):
    """Schema de respuesta con todos los campos"""
    company_id: int = Field(..., description="ID único de la compañía")
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_update_date: Optional[datetime] = None

    class Config:
        from_attributes = True  # Permite crear desde modelos SQLAlchemy
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None,
            Decimal: lambda v: float(v) if v else 0.00
        }


class CompanyList(BaseModel):
    """Schema para lista de compañías"""
    companies: list[CompanyResponse]
    total: int = Field(..., description="Total de compañías")

    class Config:
        from_attributes = True


# Alias para compatibilidad con código existente
CompanyInDB = CompanyResponse