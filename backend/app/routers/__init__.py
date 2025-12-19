"""
Routers para Bitel API
Todos los routers están completos y operativos
"""

from . import auth
from . import companies
from . import services
from . import products
from . import users
from . import purchases
from . import upload
from . import countries
from . import vendors
from . import vendor_products

__all__ = [
    "auth",
    "companies",
    "services",
    "products",
    "users",
    "purchases",
    "upload",
    "countries",
    "vendors",
    "vendor_products"
]