"""
Modelo Service - Representa la tabla services
Tipos de servicios ofrecidos (Top Ups, Paquetes, Servicios Fijos, Smartphones)
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.database import Base


class Service(Base):
    """
    Modelo de servicios
    Ejemplos: Top Ups, Paquetes, Servicios Fijos, Smartphones
    """
    __tablename__ = "services"

    # Primary Key
    service_id = Column(Integer, primary_key=True, index=True)
    
    # Información del servicio
    service_name = Column(String(50), nullable=False)
    service_photo = Column(String(255))
    service_photo_mkt = Column(String(255))  # Corregido a minúsculas
    service_description = Column(String(500))
    
    # Estado y auditoría
    status = Column(String(20), default='active', index=True)
    created_by = Column(String(100))
    updated_by = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relaciones
    products = relationship("Product", back_populates="service", cascade="all, delete-orphan")

    # NUEVA RELACIÓN
    companies = relationship("Company", back_populates="service")

    def __repr__(self):
        return f"<Service(id={self.service_id}, name='{self.service_name}')>"
