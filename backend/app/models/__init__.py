"""
Modelos SQLAlchemy para Latconecta
Mapean las tablas de PostgreSQL a clases Python
Actualizado: 2025-12-17 - Agregado Country
Actualizado: 2026-06-08 - Agregado ComplaintRecord, ComplaintOffer (LR-001)
"""
from .company import Company
from .country import Country
from .service import Service
from .product import Product
from .user import User
from .purchase import Purchase
from .vendor import Vendor
from .vendor_product import VendorProduct
from .vendor_api_mapping import VendorApiMapping

# ✅ LR-001 — Libro de Reclamaciones Virtual
from app.complaints.model import ComplaintRecord, ComplaintOffer

__all__ = [
    "Company",
    "Country",
    "Service",
    "Product",
    "User",
    "Purchase",
    "Vendor",
    "VendorProduct",
    "VendorApiMapping",
    "ComplaintRecord",
    "ComplaintOffer",
]
