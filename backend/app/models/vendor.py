"""
Modelo Vendor - Maestro de vendors/proveedores (Versión 2 - Con Balance)
"""
from sqlalchemy import Column, String, Integer, Boolean, TIMESTAMP, Text, Numeric, func
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base


class Vendor(Base):
    """
    Modelo de vendors/proveedores de servicios
    
    Almacena credenciales, configuración y balance de cada vendor (Latcom, Vendor2, etc)
    Versión 2: Incluye campos de balance
    """
    __tablename__ = "vendors"
    
    # =========================================================================
    # PRIMARY KEY
    # =========================================================================
    vendor_code = Column(String(50), primary_key=True, index=True)
    
    # =========================================================================
    # INFORMACIÓN GENERAL
    # =========================================================================
    vendor_name = Column(String(100), nullable=False)
    vendor_display_name = Column(String(100))
    vendor_description = Column(Text)
    
    # =========================================================================
    # URLs DE SERVICIOS
    # =========================================================================
    vendor_url_uat = Column(String(255))      # URL de UAT/Testing
    vendor_url_prod = Column(String(255))     # URL de Producción
    
    # =========================================================================
    # CREDENCIALES
    # =========================================================================
    vendor_username = Column(String(100))
    vendor_password = Column(String(255))     # Almacenar cifrado
    vendor_api_key = Column(String(255))      # dist_api en Latcom
    vendor_user_uid = Column(String(100))     # user_uid específico del vendor
    
    # =========================================================================
    # TOKENS DE AUTENTICACIÓN
    # =========================================================================
    vendor_access_token = Column(Text)        # Token actual
    vendor_token_expiry = Column(TIMESTAMP)   # Cuándo expira el token
    
    # =========================================================================
    # BALANCE DEL VENDOR
    # =========================================================================
    vendor_balance_currency = Column(String(10))     # Moneda: PEN, USD, MXN
    vendor_balance_amount = Column(Numeric(15, 2))   # Saldo actual
    vendor_balance_last_update = Column(TIMESTAMP)   # Última actualización
    
    # =========================================================================
    # CONFIGURACIÓN
    # =========================================================================
    vendor_status = Column(String(20), default='active')  # 'active', 'inactive'
    vendor_timeout = Column(Integer, default=45)  # Timeout en segundos
    is_production = Column(Boolean, default=False)  # TRUE = prod, FALSE = UAT
    
    # =========================================================================
    # SINCRONIZACIÓN AUTOMÁTICA
    # =========================================================================
    auto_sync_products = Column(Boolean, default=False)
    sync_interval_hours = Column(Integer, default=24)
    last_sync_date = Column(TIMESTAMP)
    
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
    vendor_products = relationship(
        "VendorProduct",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return (
            f"<Vendor("
            f"code={self.vendor_code}, "
            f"name={self.vendor_name}, "
            f"status={self.vendor_status}, "
            f"balance={self.vendor_balance_amount} {self.vendor_balance_currency}, "
            f"is_prod={self.is_production}"
            f")>"
        )
    
    @property
    def url(self) -> str:
        """
        Obtener URL actual según configuración
        """
        return self.vendor_url_prod if self.is_production else self.vendor_url_uat
    
    @property
    def is_active(self) -> bool:
        """
        Verificar si el vendor está activo
        """
        return self.vendor_status == 'active'
    
    @property
    def has_balance_info(self) -> bool:
        """
        Verificar si tiene información de balance
        """
        return (
            self.vendor_balance_amount is not None 
            and self.vendor_balance_currency is not None
        )
    
    @property
    def balance_is_fresh(self) -> bool:
        """
        Verificar si el balance es reciente (menos de 24 horas)
        """
        if not self.vendor_balance_last_update:
            return False
        
        time_diff = datetime.now() - self.vendor_balance_last_update
        return time_diff < timedelta(hours=24)
    
    @property
    def balance_status(self) -> str:
        """
        Obtener estado del balance: 'fresh', 'stale', 'unknown'
        """
        if not self.has_balance_info:
            return 'unknown'
        
        if not self.vendor_balance_last_update:
            return 'unknown'
        
        return 'fresh' if self.balance_is_fresh else 'stale'
    
    @property
    def formatted_balance(self) -> str:
        """
        Obtener balance formateado para mostrar
        """
        if not self.has_balance_info:
            return "No disponible"
        
        return f"{self.vendor_balance_amount:,.2f} {self.vendor_balance_currency}"
    
    def is_low_balance(self, threshold: float = 100.0) -> bool:
        """
        Verificar si el balance está bajo
        
        Args:
            threshold: Umbral mínimo (en la moneda del vendor)
        
        Returns:
            bool: True si el balance está bajo o no disponible
        """
        if not self.has_balance_info:
            return True
        
        return float(self.vendor_balance_amount) < threshold
    
    def update_balance(self, amount: float, currency: str = None) -> None:
        """
        Actualizar balance del vendor
        
        Args:
            amount: Nuevo monto del balance
            currency: Moneda (opcional, usa la existente si no se proporciona)
        """
        self.vendor_balance_amount = amount
        if currency:
            self.vendor_balance_currency = currency
        self.vendor_balance_last_update = datetime.now()
    
    def to_dict(self) -> dict:
        """
        Convertir a diccionario (sin credenciales)
        """
        return {
            'vendor_code': self.vendor_code,
            'vendor_name': self.vendor_name,
            'vendor_display_name': self.vendor_display_name,
            'vendor_status': self.vendor_status,
            'is_production': self.is_production,
            'url': self.url,
            'timeout': self.vendor_timeout,
            
            # Balance info
            'balance_currency': self.vendor_balance_currency,
            'balance_amount': float(self.vendor_balance_amount) if self.vendor_balance_amount else None,
            'balance_last_update': self.vendor_balance_last_update.isoformat() if self.vendor_balance_last_update else None,
            'balance_formatted': self.formatted_balance,
            'balance_status': self.balance_status,
            'has_balance_info': self.has_balance_info
        }
    
    def to_dict_with_credentials(self) -> dict:
        """
        Convertir a diccionario con credenciales (solo para admin)
        """
        data = self.to_dict()
        data.update({
            'vendor_username': self.vendor_username,
            'vendor_api_key': self.vendor_api_key,
            'vendor_user_uid': self.vendor_user_uid
            # NO incluir vendor_password por seguridad
        })
        return data
