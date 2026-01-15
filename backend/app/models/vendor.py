"""
Modelo Vendor - Maestro de vendors/proveedores (Versión 3 - Balance Dual USD + Local)
"""
from sqlalchemy import Column, String, Integer, Boolean, TIMESTAMP, Text, Numeric, func
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base


class Vendor(Base):
    """
    Modelo de vendors/proveedores de servicios

    Almacena credenciales, configuración y balance de cada vendor (Latcom, Vendor2, etc)
    Versión 3: Sistema dual de balance - USD + Moneda Local
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
    # BALANCE DEL VENDOR - Sistema Dual USD + Moneda Local
    # =========================================================================
    
    # Balance en USD
    vendor_usd_balance = Column(
        Numeric(15, 2),
        comment="Balance en USD"
    )
    vendor_usd_date_balance = Column(
        TIMESTAMP,
        comment="Última actualización del balance USD"
    )

    # Balance en moneda local
    vendor_local_currency = Column(
        String(10),
        comment="Código de moneda local (PEN, MXN, etc)"
    )
    vendor_local_balance = Column(
        Numeric(15, 2),
        comment="Balance en moneda local"
    )
    vendor_local_date_balance = Column(
        TIMESTAMP,
        comment="Última actualización del balance local"
    )

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
            f"usd_balance={self.vendor_usd_balance}, "
            f"local_balance={self.vendor_local_balance} {self.vendor_local_currency}, "
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
    def has_usd_balance_info(self) -> bool:
        """
        Verificar si tiene información de balance USD
        """
        return self.vendor_usd_balance is not None

    @property
    def has_local_balance_info(self) -> bool:
        """
        Verificar si tiene información de balance en moneda local
        """
        return (
            self.vendor_local_balance is not None
            and self.vendor_local_currency is not None
        )

    @property
    def usd_balance_is_fresh(self) -> bool:
        """
        Verificar si el balance USD es reciente (menos de 24 horas)
        """
        if not self.vendor_usd_date_balance:
            return False

        time_diff = datetime.now() - self.vendor_usd_date_balance
        return time_diff < timedelta(hours=24)

    @property
    def local_balance_is_fresh(self) -> bool:
        """
        Verificar si el balance local es reciente (menos de 24 horas)
        """
        if not self.vendor_local_date_balance:
            return False

        time_diff = datetime.now() - self.vendor_local_date_balance
        return time_diff < timedelta(hours=24)

    @property
    def usd_balance_status(self) -> str:
        """
        Obtener estado del balance USD: 'fresh', 'stale', 'unknown'
        """
        if not self.has_usd_balance_info:
            return 'unknown'

        if not self.vendor_usd_date_balance:
            return 'unknown'

        return 'fresh' if self.usd_balance_is_fresh else 'stale'

    @property
    def local_balance_status(self) -> str:
        """
        Obtener estado del balance local: 'fresh', 'stale', 'unknown'
        """
        if not self.has_local_balance_info:
            return 'unknown'

        if not self.vendor_local_date_balance:
            return 'unknown'

        return 'fresh' if self.local_balance_is_fresh else 'stale'

    @property
    def formatted_usd_balance(self) -> str:
        """
        Obtener balance USD formateado para mostrar
        """
        if not self.has_usd_balance_info:
            return "No disponible"

        return f"{self.vendor_usd_balance:,.2f} USD"

    @property
    def formatted_local_balance(self) -> str:
        """
        Obtener balance local formateado para mostrar
        """
        if not self.has_local_balance_info:
            return "No disponible"

        return f"{self.vendor_local_balance:,.2f} {self.vendor_local_currency}"

    def is_low_usd_balance(self, threshold: float = 100.0) -> bool:
        """
        Verificar si el balance USD está bajo

        Args:
            threshold: Umbral mínimo en USD

        Returns:
            bool: True si el balance está bajo o no disponible
        """
        if not self.has_usd_balance_info:
            return True

        return float(self.vendor_usd_balance) < threshold

    def is_low_local_balance(self, threshold: float = 1000.0) -> bool:
        """
        Verificar si el balance local está bajo

        Args:
            threshold: Umbral mínimo en moneda local

        Returns:
            bool: True si el balance está bajo o no disponible
        """
        if not self.has_local_balance_info:
            return True

        return float(self.vendor_local_balance) < threshold

    def update_usd_balance(self, amount: float) -> None:
        """
        Actualizar balance USD del vendor

        Args:
            amount: Nuevo monto del balance USD
        """
        self.vendor_usd_balance = amount
        self.vendor_usd_date_balance = datetime.now()

    def update_local_balance(self, amount: float, currency: str = None) -> None:
        """
        Actualizar balance en moneda local del vendor

        Args:
            amount: Nuevo monto del balance local
            currency: Código de moneda (opcional, usa la existente si no se proporciona)
        """
        self.vendor_local_balance = amount
        if currency:
            self.vendor_local_currency = currency
        self.vendor_local_date_balance = datetime.now()

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

            # Balance USD
            'vendor_usd_balance': float(self.vendor_usd_balance) if self.vendor_usd_balance else None,
            'vendor_usd_date_balance': self.vendor_usd_date_balance.isoformat() if self.vendor_usd_date_balance else None,
            'usd_balance_formatted': self.formatted_usd_balance,
            'usd_balance_status': self.usd_balance_status,

            # Balance Local
            'vendor_local_currency': self.vendor_local_currency,
            'vendor_local_balance': float(self.vendor_local_balance) if self.vendor_local_balance else None,
            'vendor_local_date_balance': self.vendor_local_date_balance.isoformat() if self.vendor_local_date_balance else None,
            'local_balance_formatted': self.formatted_local_balance,
            'local_balance_status': self.local_balance_status,

            # Info general
            'has_usd_balance_info': self.has_usd_balance_info,
            'has_local_balance_info': self.has_local_balance_info
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