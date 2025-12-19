"""
LATCONECTA - Country Model
Modelo SQLAlchemy para tabla countries
Actualizado: 2025-12-17 - Migración Latconecta con relaciones
CORRECCIÓN: Agregado import de relationship
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, Numeric
from sqlalchemy.orm import relationship  # ← AGREGADO
from sqlalchemy.sql import func
from app.database import Base


class Country(Base):
    __tablename__ = "countries"
    
    # Identificador
    country_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    country_code = Column(String(3), unique=True, nullable=False)  # Cambiado a 3 para PER, MEX, etc.
    country_name = Column(String(100), nullable=False)
    
    # Multimedia
    country_flag_photo = Column(String(500))
    country_photo = Column(String(500))
    
    # Información
    country_description = Column(String(500))
    
    # Tasa de cambio
    country_er_usd_pen = Column(Numeric(10, 6), default=3.75)
    country_date_er = Column(TIMESTAMP, default=func.current_timestamp())
    
    # Estado
    status = Column(String(20), default="active")
    
    # Auditoría
    created_by = Column(String(100))
    updated_by = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # RELACIONES LATCONECTA
    companies = relationship("Company", back_populates="country")
    products = relationship("Product", back_populates="country")
    
    def to_dict(self):
        """Convertir el objeto a diccionario para respuestas JSON"""
        return {
            "country_id": self.country_id,
            "country_code": self.country_code,
            "country_name": self.country_name,
            "country_flag_photo": self.country_flag_photo,
            "country_photo": self.country_photo,
            "country_description": self.country_description,
            "country_er_usd_pen": float(self.country_er_usd_pen) if self.country_er_usd_pen else None,
            "country_date_er": self.country_date_er.isoformat() if self.country_date_er else None,
            "status": self.status,
            "created_by": self.created_by,
            "updated_by": self.updated_by,
            "last_update_date": self.last_update_date.isoformat() if self.last_update_date else None
        }