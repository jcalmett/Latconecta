"""
Schemas Pydantic para Vendor y VendorProduct
Versión 3: Balance dual USD + Moneda Local
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

    # Balance USD
    vendor_usd_balance: Optional[Decimal] = Field(None, ge=0)
    
    # Balance Local
    vendor_local_currency: Optional[str] = Field(None, max_length=10)
    vendor_local_balance: Optional[Decimal] = Field(None, ge=0)


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

    # Balance USD
    vendor_usd_balance: Optional[Decimal] = Field(None, ge=0)
    
    # Balance Local
    vendor_local_currency: Optional[str] = Field(None, max_length=10)
    vendor_local_balance: Optional[Decimal] = Field(None, ge=0)


class VendorBalanceUpdate(BaseModel):
    """Schema específico para actualizar balance (USD o Local)"""
    # Balance USD
    vendor_usd_balance: Optional[Decimal] = Field(None, ge=0, description="Nuevo balance USD")
    
    # Balance Local
    vendor_local_balance: Optional[Decimal] = Field(None, ge=0, description="Nuevo balance local")
    vendor_local_currency: Optional[str] = Field(None, max_length=10, description="Moneda local")

    class Config:
        json_schema_extra = {
            "example": {
                "vendor_usd_balance": 5420.50,
                "vendor_local_balance": 18500.00,
                "vendor_local_currency": "PEN"
            }
        }


class VendorPublic(VendorBase):
    """Schema para respuesta pública (sin credenciales sensibles)"""
    # Balance USD
    vendor_usd_balance: Optional[Decimal]
    vendor_usd_date_balance: Optional[datetime]
    
    # Balance Local
    vendor_local_currency: Optional[str]
    vendor_local_balance: Optional[Decimal]
    vendor_local_date_balance: Optional[datetime]

    # Propiedades calculadas
    usd_balance_formatted: Optional[str] = Field(None, description="Balance USD formateado")
    usd_balance_status: Optional[str] = Field(None, description="Estado balance USD: fresh, stale, unknown")
    local_balance_formatted: Optional[str] = Field(None, description="Balance local formateado")
    local_balance_status: Optional[str] = Field(None, description="Estado balance local: fresh, stale, unknown")
    has_usd_balance_info: bool = Field(False, description="Si tiene info de balance USD")
    has_local_balance_info: bool = Field(False, description="Si tiene info de balance local")

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

    # Balance USD
    vendor_usd_balance: Optional[Decimal]
    vendor_usd_date_balance: Optional[datetime]
    usd_balance_formatted: str
    usd_balance_status: str
    
    # Balance Local
    vendor_local_currency: Optional[str]
    vendor_local_balance: Optional[Decimal]
    vendor_local_date_balance: Optional[datetime]
    local_balance_formatted: str
    local_balance_status: str

    class Config:
        from_attributes = True


# =============================================================================
# VENDOR_PRODUCT SCHEMAS (ACTUALIZADOS CON API_GROUP_CODE)
# =============================================================================

class VendorProductBase(BaseModel):
    """Schema base de VendorProduct"""
    vendor_code: str = Field(..., max_length=50)
    api_group_code: Optional[str] = Field(None, max_length=50, description="Código del grupo de APIs (opcional)")
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
    vp_fee_usd: Optional[Decimal] = Field(default=Decimal('0.00000'))


class VendorProductCreate(VendorProductBase):
    """Schema para crear VendorProduct"""
    pass


class VendorProductUpdate(BaseModel):
    """Schema para actualizar VendorProduct (todos opcionales)"""
    api_group_code: Optional[str] = Field(None, max_length=50, description="Código del grupo de APIs")
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
    vp_fee_usd: Optional[Decimal] = None


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
    vendor_usd_balance: Optional[Decimal]
    vendor_usd_date_balance: Optional[datetime]
    usd_balance_status: Optional[str]
    vendor_local_currency: Optional[str]
    vendor_local_balance: Optional[Decimal]
    vendor_local_date_balance: Optional[datetime]
    local_balance_status: Optional[str]


class VendorProductSearchResponse(BaseModel):
    """Respuesta de búsqueda de vendor_products"""
    total: int
    items: list[VendorProductPublic]


class LowBalanceAlert(BaseModel):
    """Alerta de saldo bajo"""
    vendor_code: str
    vendor_name: str
    
    # Balance USD
    usd_balance: Optional[Decimal]
    usd_balance_last_update: Optional[datetime]
    usd_days_since_update: Optional[int]
    
    # Balance Local
    local_currency: Optional[str]
    local_balance: Optional[Decimal]
    local_balance_last_update: Optional[datetime]
    local_days_since_update: Optional[int]
    
    alert_type: str  # 'low_usd_balance', 'low_local_balance', 'no_balance', 'stale_balance'

    class Config:
        json_schema_extra = {
            "example": {
                "vendor_code": "LATCOM",
                "vendor_name": "Latcom Services",
                "usd_balance": 85.50,
                "usd_balance_last_update": "2024-12-11T10:30:00",
                "usd_days_since_update": 0,
                "local_currency": "PEN",
                "local_balance": 2500.00,
                "local_balance_last_update": "2024-12-11T10:30:00",
                "local_days_since_update": 0,
                "alert_type": "low_usd_balance"
            }
        }