"""
Modelo VendorProduct - Catálogo de productos de vendors (CORREGIDO)
Solo incluye columnas que existen en la BD
"""
from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class VendorProduct(Base):
    """
    Modelo de productos disponibles en cada vendor

    Almacena la información específica de cada producto en el vendor:
    - Códigos y SKUs del vendor
    - Datos del servicio (operador, país, moneda)
    - Información de montos
    - Configuración y metadata
    """
    __tablename__ = "vendor_products"

    # =========================================================================
    # PRIMARY KEY
    # =========================================================================
    vp_id = Column(Integer, primary_key=True, index=True)

    # =========================================================================
    # FOREIGN KEY - Relación con vendors
    # =========================================================================
    vendor_code = Column(
        String(50),
        ForeignKey("vendors.vendor_code", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # =========================================================================
    # IDENTIFICACIÓN DEL PRODUCTO EN VENDOR
    # =========================================================================
    vp_code = Column(String(100), nullable=False, index=True)
    vp_skuid = Column(String(100))
    vp_name = Column(String(255))
    vp_description = Column(Text)

    # =========================================================================
    # INFORMACIÓN DEL SERVICIO
    # =========================================================================
    vp_operator = Column(String(50))          # bitel, claro, movistar, entel
    vp_country = Column(String(50))           # peru, mexico, colombia, etc
    vp_currency = Column(String(10))          # PEN, USD, MXN, etc

    # =========================================================================
    # INFORMACIÓN DE MONTO
    # =========================================================================
    vp_amount = Column(Numeric(10, 2))        # Monto fijo o mínimo
    vp_amount_type = Column(String(20))       # 'fixed', 'range', 'variable'
    vp_minimum_amount = Column(Numeric(10, 2))  # Monto mínimo (para ranges)
    vp_maximum_amount = Column(Numeric(10, 2))  # Monto máximo (para ranges)

    # =========================================================================
    # TIPO DE PRODUCTO
    # =========================================================================
    vp_product_type = Column(Integer)         # 1=bundle/paquete, 2=topup/recarga
    vp_service_type = Column(String(50))      # 'data', 'voice', 'sms', 'combo'

    # =========================================================================
    # COMISIONES Y COSTOS
    # =========================================================================
    vp_commission = Column(Numeric(10, 2))    # Comisión del vendor
    vp_cost = Column(Numeric(10, 2))          # Costo real del vendor

    # =========================================================================
    # CONFIGURACIÓN
    # =========================================================================
    vp_status = Column(String(20), default='active')  # 'active', 'inactive'

    # =========================================================================
    # METADATA ADICIONAL (JSON)
    # =========================================================================
    vp_metadata = Column(JSONB)               # Metadata adicional en JSON

    # =========================================================================
    # AUDITORÍA
    # =========================================================================
    created_by = Column(String(100))
    updated_by = Column(String(100))
    created_at = Column(TIMESTAMP, default=func.current_timestamp())
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # =========================================================================
    # RELACIONES
    # =========================================================================
    vendor = relationship("Vendor", back_populates="vendor_products")

    def __repr__(self):
        return (
            f"<VendorProduct("
            f"id={self.vp_id}, "
            f"vendor={self.vendor_code}, "
            f"code={self.vp_code}, "
            f"operator={self.vp_operator}, "
            f"status={self.vp_status}"
            f")>"
        )

    @property
    def is_active(self) -> bool:
        """Verificar si el vendor_product está activo"""
        return self.vp_status == 'active'

    @property
    def is_range(self) -> bool:
        """Verificar si es un producto de rango"""
        return self.vp_amount_type == 'range'

    @property
    def display_amount(self) -> str:
        """Obtener representación del monto para mostrar"""
        if self.is_range:
            return f"{self.vp_minimum_amount}-{self.vp_maximum_amount} {self.vp_currency}"
        else:
            return f"{self.vp_amount} {self.vp_currency}"

    def to_dict(self) -> dict:
        """Convertir a diccionario"""
        return {
            'vp_id': self.vp_id,
            'vendor_code': self.vendor_code,
            'vp_code': self.vp_code,
            'vp_skuid': self.vp_skuid,
            'vp_name': self.vp_name,
            'vp_operator': self.vp_operator,
            'vp_country': self.vp_country,
            'vp_currency': self.vp_currency,
            'vp_amount': float(self.vp_amount) if self.vp_amount else None,
            'vp_amount_type': self.vp_amount_type,
            'vp_product_type': self.vp_product_type,
            'vp_status': self.vp_status,
            'is_active': self.is_active,
            'display_amount': self.display_amount
        }

    def build_vendor_request_data(self, phone: str, amount: float = None) -> dict:
        """
        Construir datos para request al vendor

        Args:
            phone: Número de teléfono
            amount: Monto (opcional, usa vp_amount si no se proporciona)

        Returns:
            dict: Datos listos para enviar al vendor
        """
        return {
            'phone': phone,
            'operator': self.vp_operator,
            'country': self.vp_country,
            'currency': self.vp_currency,
            'amount': float(amount or self.vp_amount),
            'product_id': self.vp_code,
            'sku_id': self.vp_skuid or '',
            'service_type': self.vp_product_type
        }