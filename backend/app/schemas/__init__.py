"""
Schemas Pydantic para Latconecta
Validan y serializan datos de entrada/salida de la API
"""
from .company import CompanyBase, CompanyCreate, CompanyUpdate, CompanyInDB
from .service import ServiceBase, ServiceCreate, ServiceUpdate, ServiceInDB
from .product import ProductBase, ProductCreate, ProductUpdate, ProductInDB
from .user import UserBase, UserCreate, UserUpdate, UserInDB, UserPublic
from .purchase import (
    PurchaseBaseSchema,  # ✅ CORREGIDO: era PurchaseBase
    PurchaseCreate,
    PurchaseUpdate,
    PurchaseInDB,
    PurchaseListResponse,
    PurchaseStatsResponse  # ✅ CORREGIDO: era PurchaseStats
    # ✅ ELIMINADO: PurchaseSummary (no existe)
)
from .auth import Token, TokenData, LoginRequest
from .vendor import (
    VendorPublic,
    VendorCreate,
    VendorUpdate,
    VendorBalanceUpdate,
    VendorWithBalance,
    LowBalanceAlert,
    VendorProductPublic,
    VendorProductCreate,
    VendorProductUpdate
)

# Alias para compatibilidad
PurchasePublic = PurchaseInDB
PurchaseBase = PurchaseBaseSchema  # ✅ AGREGADO: Alias para compatibilidad
PurchaseStats = PurchaseStatsResponse  # ✅ AGREGADO: Alias para compatibilidad

__all__ = [
    # Company schemas
    "CompanyBase",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyInDB",
    # Service schemas
    "ServiceBase",
    "ServiceCreate",
    "ServiceUpdate",
    "ServiceInDB",
    # Product schemas
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "ProductInDB",
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserPublic",
    # Purchase schemas
    "PurchaseBase",  # Alias de PurchaseBaseSchema
    "PurchaseBaseSchema",  # ✅ AGREGADO: Nombre real
    "PurchaseCreate",
    "PurchaseUpdate",
    "PurchaseInDB",
    "PurchasePublic",  # Alias de PurchaseInDB
    "PurchaseListResponse",
    "PurchaseStats",  # Alias de PurchaseStatsResponse
    "PurchaseStatsResponse",  # ✅ AGREGADO: Nombre real
    # ✅ ELIMINADO: PurchaseSummary (no existe)
    # Vendor schemas
    "VendorPublic",
    "VendorCreate",
    "VendorUpdate",
    "VendorBalanceUpdate",
    "VendorWithBalance",
    "LowBalanceAlert",
    # VendorProduct schemas
    "VendorProductPublic",
    "VendorProductCreate",
    "VendorProductUpdate",
    # Auth schemas
    "Token",
    "TokenData",
    "LoginRequest",
]