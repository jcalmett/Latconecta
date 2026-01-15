"""
LATCONECTA - Company Model
Modelo SQLAlchemy para la tabla companies
Actualizado: 2026-01-10 - Migración a sistema multi-país con balance USD y local
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Company(Base):
    """
    Modelo de Compañía

    Representa las compañías/empresas que ofrecen servicios en la plataforma LATCONECTA.
    Incluye información de branding, marketing, balance y soporte al cliente.
    """
    __tablename__ = "companies"

    # Identificador único
    company_id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ✅ CAMPOS LATCONECTA - Relaciones con country y service
    country_id = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.service_id"), nullable=False)

    # Información básica
    company_name = Column(String(50), nullable=False)

    # Imágenes y branding
    company_logo = Column(String(500), nullable=True)
    company_photo = Column(String(500), nullable=True)
    company_photo_mkt1 = Column(String(500), nullable=True)
    company_photo_mkt2 = Column(String(500), nullable=True)
    company_photo_mkt3 = Column(String(500), nullable=True)
    company_photo_mkt4 = Column(String(500), nullable=True)

    # Información de marketing
    company_description5 = Column(String(500), nullable=True)
    company_lema_1 = Column(String(500), nullable=True)
    company_lema_2 = Column(String(500), nullable=True)

    # Estado
    company_status = Column(String(20), default="active")

    # =========================================================================
    # BALANCE - Sistema dual USD + Moneda Local
    # =========================================================================

    # Balance en USD
    company_usd_balance = Column(
        Numeric(10, 2),
        default=0.00,
        comment="Balance en USD"
    )
    company_usd_date_balance = Column(
        DateTime(timezone=False),
        nullable=True,
        comment="Fecha del último balance USD"
    )

    # Balance en moneda local
    company_local_currency = Column(
        String(3),
        nullable=True,
        comment="Código de moneda local (ISO 3 letras)"
    )
    company_local_balance = Column(
        Numeric(10, 2),
        nullable=True,
        comment="Balance en moneda local"
    )
    company_local_date_balance = Column(
        DateTime(timezone=False),
        nullable=True,
        comment="Fecha del último balance en moneda local"
    )

    # =========================================================================
    # OTROS CAMPOS
    # =========================================================================

    # Disponibilidad de código de barras
    company_barcode_available = Column(
        String(2),
        default="No",
        comment="Indica si código de barras está disponible: Si o No"
    )

    # Emails de soporte
    company_mail_customer_support = Column(
        String(255),
        nullable=True,
        comment="Email de soporte al cliente"
    )
    company_mail_commercial_support = Column(
        String(255),
        nullable=True,
        comment="Email de soporte comercial"
    )

    # =========================================================================
    # RELACIONES
    # =========================================================================

    country = relationship("Country", back_populates="companies")
    service = relationship("Service", back_populates="companies")
    products = relationship("Product", back_populates="company")

    # =========================================================================
    # AUDITORÍA
    # =========================================================================

    created_by = Column(String(100), nullable=True)
    updated_by = Column(String(100), nullable=True)
    last_update_date = Column(
        DateTime(timezone=False),
        default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )

    def __repr__(self):
        return f"<Company(id={self.company_id}, name='{self.company_name}', status='{self.company_status}')>"

    def to_dict(self):
        """Convierte el modelo a diccionario"""
        return {
            "company_id": self.company_id,
            "country_id": self.country_id,
            "service_id": self.service_id,
            "company_name": self.company_name,
            "company_logo": self.company_logo,
            "company_photo": self.company_photo,
            "company_photo_mkt1": self.company_photo_mkt1,
            "company_photo_mkt2": self.company_photo_mkt2,
            "company_photo_mkt3": self.company_photo_mkt3,
            "company_photo_mkt4": self.company_photo_mkt4,
            "company_description5": self.company_description5,
            "company_lema_1": self.company_lema_1,
            "company_lema_2": self.company_lema_2,
            "company_status": self.company_status,
            "company_usd_balance": float(self.company_usd_balance) if self.company_usd_balance else 0.00,
            "company_usd_date_balance": self.company_usd_date_balance.isoformat() if self.company_usd_date_balance else None,
            "company_local_currency": self.company_local_currency,
            "company_local_balance": float(self.company_local_balance) if self.company_local_balance else None,
            "company_local_date_balance": self.company_local_date_balance.isoformat() if self.company_local_date_balance else None,
            "company_barcode_available": self.company_barcode_available,
            "company_mail_customer_support": self.company_mail_customer_support,
            "company_mail_commercial_support": self.company_mail_commercial_support,
            "created_by": self.created_by,
            "updated_by": self.updated_by,
            "last_update_date": self.last_update_date.isoformat() if self.last_update_date else None
        }