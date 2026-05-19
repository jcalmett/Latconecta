"""
Modelo Product - Sincronizado con tabla products
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, Numeric, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Product(Base):
    """
    Modelo de productos Latconecta
    Sincronizado con la estructura real de la tabla products
    """
    __tablename__ = "products"

    # =========================================================================
    # PRIMARY KEY
    # =========================================================================
    product_id = Column(Integer, primary_key=True, index=True)

    # =========================================================================
    # FOREIGN KEY
    # =========================================================================
    service_id = Column(Integer, ForeignKey("services.service_id"), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)

    # =========================================================================
    # IDENTIFICACIÓN
    # =========================================================================
    product_code = Column(String(50), unique=True, nullable=False, index=True)
    product_name = Column(String(100), nullable=False)
    product_description = Column(String(500))
    product_photo = Column(String(500))

    # =========================================================================
    # PRECIOS
    # =========================================================================
    product_currency = Column(String(10), nullable=False)
    
    # Precios base
    product_base_price = Column(Numeric(10, 2), nullable=False)
    product_base_price_max = Column(Numeric(10, 2))  # Para productos de rango (tipo R)
    
    # Descuentos
    product_discount_percentage = Column(Numeric(5, 2), nullable=False, default=0)
    product_discount_amount = Column(Numeric(10, 2), nullable=False, default=0)
    product_discount_amount_max = Column(Numeric(10, 2))  # ✅ NUEVO: Descuento máximo (tipo R)
    
    # Fee
    product_fee = Column(Numeric(10, 2), nullable=False, default=0)
    
    # Totales
    product_total_price = Column(Numeric(10, 2), nullable=False)
    product_total_price_max = Column(Numeric(10, 2))  # ✅ NUEVO: Total máximo (tipo R)

    # ⭐ Configuración de montos
    product_amount_type = Column(String(1))  # F=Fijo, R=Rango, V=Variable

    # =========================================================================
    # VENDOR/PROVEEDOR
    # =========================================================================
    product_vendor_code = Column(String(100))
    product_vendpro_code = Column(String(50), nullable=False, default='Vend001')
    product_vendpro_skuid = Column(String(50), nullable=False)

    # =========================================================================
    # ESTADO
    # =========================================================================
    product_status = Column(String(20), nullable=False, default='active')

    # =========================================================================
    # AUDITORÍA
    # =========================================================================
    created_by = Column(String(100))
    updated_by = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # =========================================================================
    # RELACIONES
    # =========================================================================
    service = relationship("Service", back_populates="products")
    purchases = relationship("Purchase", back_populates="product")
    country = relationship("Country", back_populates="products")
    company = relationship("Company", back_populates="products")


    def __repr__(self):
        return (
            f"<Product("
            f"id={self.product_id}, "
            f"code={self.product_code}, "
            f"name={self.product_name}, "
            f"price={self.product_total_price} {self.product_currency}, "
            f"status={self.product_status}"
            f")>"
        )

    @property
    def is_active(self) -> bool:
        """Verificar si el producto está activo"""
        return self.product_status == 'active'

    @property
    def has_vendor(self) -> bool:
        """Verificar si el producto tiene vendor asociado"""
        return self.product_vendor_code is not None