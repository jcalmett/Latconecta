"""
LATCONECTA - Product Schemas
Esquemas Pydantic para validación de datos de productos
Actualizado: 2025-12-17 - Migración a Latconecta (multi-país, multi-compañía)
Sincronizado con tabla products (21 campos + nuevos campos)
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ProductBase(BaseModel):
    """Schema base para Product"""
    # NUEVOS CAMPOS LATCONECTA - OBLIGATORIOS
    service_id: int = Field(..., description="ID del servicio")
    country_id: int = Field(..., description="ID del país del producto")
    company_id: int = Field(..., description="ID de la compañía que ofrece el producto")
    
    # Campos básicos
    product_code: str = Field(..., max_length=50, description="Código único del producto")
    product_name: str = Field(..., max_length=100, description="Nombre del producto")
    product_description: Optional[str] = Field(None, max_length=500)
    product_photo: Optional[str] = Field(None, max_length=500)
    
    # Campos de precio
    product_currency: str = Field('USD', max_length=10)
    product_base_price: Decimal = Field(..., ge=0)
    product_discount_percentage: Decimal = Field(0, ge=0, le=100)
    product_discount_amount: Decimal = Field(0, ge=0)
    product_fee: Decimal = Field(0, ge=0)
    product_total_price: Decimal = Field(..., ge=0)
    
    # Campos de vendor/proveedor
    product_vendor_code: Optional[str] = Field(None, max_length=100)
    product_vendpro_code: str = Field('Vend001', max_length=50)
    product_vendpro_skuid: str = Field(..., max_length=50)
    
    # Estado
    product_status: str = Field('active', max_length=20)

    @field_validator("country_id")
    @classmethod
    def validate_country_id(cls, v):
        """Valida que country_id sea positivo"""
        if v <= 0:
            raise ValueError("country_id debe ser mayor a 0")
        return v

    @field_validator("company_id")
    @classmethod
    def validate_company_id(cls, v):
        """Valida que company_id sea positivo"""
        if v <= 0:
            raise ValueError("company_id debe ser mayor a 0")
        return v

    @field_validator("service_id")
    @classmethod
    def validate_service_id(cls, v):
        """Valida que service_id sea positivo"""
        if v <= 0:
            raise ValueError("service_id debe ser mayor a 0")
        return v


class ProductCreate(ProductBase):
    """Schema para crear Product"""
    created_by: Optional[str] = Field(None, max_length=100)


class ProductUpdate(BaseModel):
    """Schema para actualizar Product - todos opcionales"""
    # NUEVOS CAMPOS LATCONECTA - OPCIONALES EN UPDATE
    service_id: Optional[int] = None
    country_id: Optional[int] = None
    company_id: Optional[int] = None
    
    # Campos básicos
    product_code: Optional[str] = Field(None, max_length=50)
    product_name: Optional[str] = Field(None, max_length=100)
    product_description: Optional[str] = Field(None, max_length=500)
    product_photo: Optional[str] = Field(None, max_length=500)
    
    # Campos de precio
    product_currency: Optional[str] = Field(None, max_length=10)
    product_base_price: Optional[Decimal] = Field(None, ge=0)
    product_discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    product_discount_amount: Optional[Decimal] = Field(None, ge=0)
    product_fee: Optional[Decimal] = Field(None, ge=0)
    product_total_price: Optional[Decimal] = Field(None, ge=0)
    
    # Campos de vendor/proveedor
    product_vendor_code: Optional[str] = Field(None, max_length=100)
    product_vendpro_code: Optional[str] = Field(None, max_length=50)
    product_vendpro_skuid: Optional[str] = Field(None, max_length=50)
    
    # Estado
    product_status: Optional[str] = Field(None, max_length=20)
    
    # Auditoría
    updated_by: Optional[str] = Field(None, max_length=100)

    @field_validator("country_id")
    @classmethod
    def validate_country_id(cls, v):
        """Valida que country_id sea positivo"""
        if v is not None and v <= 0:
            raise ValueError("country_id debe ser mayor a 0")
        return v

    @field_validator("company_id")
    @classmethod
    def validate_company_id(cls, v):
        """Valida que company_id sea positivo"""
        if v is not None and v <= 0:
            raise ValueError("company_id debe ser mayor a 0")
        return v

    @field_validator("service_id")
    @classmethod
    def validate_service_id(cls, v):
        """Valida que service_id sea positivo"""
        if v is not None and v <= 0:
            raise ValueError("service_id debe ser mayor a 0")
        return v


class ProductInDB(ProductBase):
    """Schema para Product desde la base de datos"""
    product_id: int
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_update_date: Optional[datetime] = None

    class Config:
        from_attributes = True