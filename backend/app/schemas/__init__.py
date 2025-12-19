"""
Schemas Pydantic para Bitel
Validan y serializan datos de entrada/salida de la API
"""
from .company import CompanyBase, CompanyCreate, CompanyUpdate, CompanyInDB
from .service import ServiceBase, ServiceCreate, ServiceUpdate, ServiceInDB
from .product import ProductBase, ProductCreate, ProductUpdate, ProductInDB
from .user import UserBase, UserCreate, UserUpdate, UserInDB, UserPublic
from .purchase import (
    PurchaseBase,
    PurchaseCreate,
    PurchaseUpdate,
    PurchaseInDB,
    PurchaseListResponse,
    PurchaseStats,
    PurchaseSummary
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

# Alias para compatibilidad con router que espera PurchasePublic
PurchasePublic = PurchaseInDB

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
    "PurchaseBase",
    "PurchaseCreate",
    "PurchaseUpdate",
    "PurchaseInDB",
    "PurchasePublic",  # Alias de PurchaseInDB
    "PurchaseListResponse",
    "PurchaseStats",
    "PurchaseSummary",
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