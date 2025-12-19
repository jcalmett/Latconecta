"""
Schemas Pydantic para Vendor y VendorProduct (CORREGIDOS)
Solo incluye columnas que existen en la BD
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


# =============================================================================
# VENDOR SCHEMAS
# =============================================================================

class VendorBase(BaseModel):
    """Schema base de Vendor"""
    vendor_code: str = Field(..., max_length=50)
    vendor_name: str = Field(..., max_length=100)
    vendor_display_name: Optional[str] = Field(None, max_length=100)
    vendor_description: Optional[str] = None
    vendor_url_uat: Optional[str] = Field(None, max_length=255)
    vendor_url_prod: Optional[str] = Field(None, max_length=255)
    vendor_status: str = Field(default='active', max_length=20)
    vendor_timeout: int = Field(default=45)
    is_production: bool = Field(default=False)


class VendorCreate(VendorBase):
    """Schema para crear Vendor"""
    vendor_username: Optional[str] = Field(None, max_length=100)
    vendor_password: Optional[str] = Field(None, max_length=255)
    vendor_api_key: Optional[str] = Field(None, max_length=255)
    vendor_user_uid: Optional[str] = Field(None, max_length=100)

    # Campos de balance opcionales al crear
    vendor_balance_currency: Optional[str] = Field(None, max_length=10)
    vendor_balance_amount: Optional[Decimal] = Field(None, ge=0)


class VendorUpdate(BaseModel):
    """Schema para actualizar Vendor (todos los campos opcionales)"""
    vendor_name: Optional[str] = Field(None, max_length=100)
    vendor_display_name: Optional[str] = Field(None, max_length=100)
    vendor_description: Optional[str] = None
    vendor_url_uat: Optional[str] = Field(None, max_length=255)
    vendor_url_prod: Optional[str] = Field(None, max_length=255)
    vendor_username: Optional[str] = Field(None, max_length=100)
    vendor_password: Optional[str] = Field(None, max_length=255)
    vendor_api_key: Optional[str] = Field(None, max_length=255)
    vendor_user_uid: Optional[str] = Field(None, max_length=100)
    vendor_status: Optional[str] = Field(None, max_length=20)
    vendor_timeout: Optional[int] = None
    is_production: Optional[bool] = None

    # Campos de balance
    vendor_balance_currency: Optional[str] = Field(None, max_length=10)
    vendor_balance_amount: Optional[Decimal] = Field(None, ge=0)


class VendorBalanceUpdate(BaseModel):
    """Schema específico para actualizar solo el balance"""
    vendor_balance_amount: Decimal = Field(..., ge=0, description="Nuevo monto del balance")
    vendor_balance_currency: Optional[str] = Field(None, max_length=10, description="Moneda (opcional)")

    class Config:
        json_schema_extra = {
            "example": {
                "vendor_balance_amount": 5420.50,
                "vendor_balance_currency": "PEN"
            }
        }


class VendorPublic(VendorBase):
    """Schema para respuesta pública (sin credenciales sensibles)"""
    # Campos de balance
    vendor_balance_currency: Optional[str]
    vendor_balance_amount: Optional[Decimal]
    vendor_balance_last_update: Optional[datetime]

    # Propiedades calculadas
    balance_formatted: Optional[str] = Field(None, description="Balance formateado")
    balance_status: Optional[str] = Field(None, description="Estado del balance: fresh, stale, unknown")
    has_balance_info: bool = Field(False, description="Si tiene información de balance")

    # Auditoría
    created_at: datetime
    last_update_date: datetime

    class Config:
        from_attributes = True


class VendorPrivate(VendorPublic):
    """Schema para respuesta con credenciales (solo admin)"""
    vendor_username: Optional[str]
    vendor_api_key: Optional[str]
    vendor_user_uid: Optional[str]
    # NO incluir vendor_password por seguridad

    class Config:
        from_attributes = True


class VendorWithBalance(BaseModel):
    """Schema para respuesta con información completa de balance"""
    vendor_code: str
    vendor_name: str
    vendor_display_name: Optional[str]
    vendor_status: str

    # Balance
    vendor_balance_currency: Optional[str]
    vendor_balance_amount: Optional[Decimal]
    vendor_balance_last_update: Optional[datetime]
    balance_formatted: str
    balance_status: str

    class Config:
        from_attributes = True


# =============================================================================
# VENDOR_PRODUCT SCHEMAS (CORREGIDOS - Solo columnas que existen en BD)
# =============================================================================

class VendorProductBase(BaseModel):
    """Schema base de VendorProduct"""
    vendor_code: str = Field(..., max_length=50)
    vp_code: str = Field(..., max_length=100)
    vp_skuid: Optional[str] = Field(None, max_length=100)
    vp_name: Optional[str] = Field(None, max_length=255)
    vp_description: Optional[str] = None
    vp_operator: Optional[str] = Field(None, max_length=50)
    vp_country: Optional[str] = Field(None, max_length=50)
    vp_currency: Optional[str] = Field(None, max_length=10)
    vp_amount: Optional[Decimal] = None
    vp_amount_type: Optional[str] = Field(None, max_length=20)
    vp_minimum_amount: Optional[Decimal] = None
    vp_maximum_amount: Optional[Decimal] = None
    vp_product_type: Optional[int] = None
    vp_service_type: Optional[str] = Field(None, max_length=50)
    vp_commission: Optional[Decimal] = None
    vp_cost: Optional[Decimal] = None
    vp_status: str = Field(default='active', max_length=20)


class VendorProductCreate(VendorProductBase):
    """Schema para crear VendorProduct"""
    pass


class VendorProductUpdate(BaseModel):
    """Schema para actualizar VendorProduct (todos opcionales)"""
    vp_name: Optional[str] = Field(None, max_length=255)
    vp_description: Optional[str] = None
    vp_operator: Optional[str] = Field(None, max_length=50)
    vp_country: Optional[str] = Field(None, max_length=50)
    vp_currency: Optional[str] = Field(None, max_length=10)
    vp_amount: Optional[Decimal] = None
    vp_amount_type: Optional[str] = Field(None, max_length=20)
    vp_minimum_amount: Optional[Decimal] = None
    vp_maximum_amount: Optional[Decimal] = None
    vp_product_type: Optional[int] = None
    vp_service_type: Optional[str] = Field(None, max_length=50)
    vp_commission: Optional[Decimal] = None
    vp_cost: Optional[Decimal] = None
    vp_status: Optional[str] = Field(None, max_length=20)


class VendorProductPublic(VendorProductBase):
    """Schema para respuesta pública"""
    vp_id: int
    created_at: datetime
    last_update_date: datetime

    class Config:
        from_attributes = True


# =============================================================================
# SCHEMAS PARA ASOCIACIÓN PRODUCT - VENDOR_PRODUCT
# =============================================================================

class ProductVendorAssociation(BaseModel):
    """Schema para asociar un producto con un vendor_product"""
    product_vendor_code: str = Field(..., max_length=50, description="Código del vendor")
    product_vendpro_code: str = Field(..., max_length=100, description="Código del producto en vendor")
    product_vendpro_skuid: Optional[str] = Field(None, max_length=100, description="SKU del producto en vendor")

    class Config:
        json_schema_extra = {
            "example": {
                "product_vendor_code": "LATCOM",
                "product_vendpro_code": "BITEL_20_PEN",
                "product_vendpro_skuid": "SKU_BITEL_20"
            }
        }


# =============================================================================
# SCHEMAS PARA RESPONSES EXTENDIDAS
# =============================================================================

class VendorStatsResponse(BaseModel):
    """Estadísticas de un vendor"""
    vendor_code: str
    vendor_name: str
    total_products: int
    active_products: int
    inactive_products: int
    operators: list[str]
    countries: list[str]

    # Balance info
    vendor_balance_currency: Optional[str]
    vendor_balance_amount: Optional[Decimal]
    vendor_balance_last_update: Optional[datetime]
    balance_status: Optional[str]


class VendorProductSearchResponse(BaseModel):
    """Respuesta de búsqueda de vendor_products"""
    total: int
    items: list[VendorProductPublic]


class LowBalanceAlert(BaseModel):
    """Alerta de saldo bajo"""
    vendor_code: str
    vendor_name: str
    balance_currency: Optional[str]
    balance_amount: Optional[Decimal]
    last_update: Optional[datetime]
    days_since_update: Optional[int]
    alert_type: str  # 'low_balance', 'no_balance', 'stale_balance'

    class Config:
        json_schema_extra = {
            "example": {
                "vendor_code": "LATCOM",
                "vendor_name": "Latcom Services",
                "balance_currency": "PEN",
                "balance_amount": 85.50,
                "last_update": "2024-12-11T10:30:00",
                "days_since_update": 0,
                "alert_type": "low_balance"
            }
        }