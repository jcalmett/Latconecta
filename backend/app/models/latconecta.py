"""
LATCONECTA - Latconecta Model
Modelo para información de la empresa matriz Latconecta
Actualizado: 2025-12-17 - Renombrado company_* a latconecta_*
"""
from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, CheckConstraint
from sqlalchemy.sql import func
from app.database import Base


class Latconecta(Base):
    __tablename__ = 'latconecta'

    # ID único (siempre 1)
    latconecta_id = Column(Integer, primary_key=True, default=1)

    # Información básica
    latconecta_name = Column(String(50), nullable=False)
    latconecta_logo = Column(String(500))
    latconecta_photo = Column(String(500))
    
    # Fotos Marketing
    latconecta_photo_mkt1 = Column(String(500))
    latconecta_photo_mkt2 = Column(String(500))
    latconecta_photo_mkt3 = Column(String(500))
    latconecta_photo_mkt4 = Column(String(500))
    
    # Descripción y lemas
    latconecta_description = Column(String(500))
    latconecta_lema_1 = Column(String(500))
    latconecta_lema_2 = Column(String(500))
    
    # Balance de crédito
    latconecta_credit_balance = Column(Numeric(12, 2), default=0.00)
    latconecta_date_balance = Column(Date)
    
    # Contacto
    latconecta_mail_support = Column(String(255))
    latconecta_mail_comercial = Column(String(255))
    latconecta_phone = Column(String(50))
    latconecta_address = Column(String(500))
    latconecta_web = Column(String(255))
    
    # Redes sociales
    latconecta_facebook = Column(String(255))
    latconecta_instagram = Column(String(255))
    latconecta_twitter = Column(String(255))
    latconecta_linkedin = Column(String(255))
    latconecta_youtube = Column(String(255))
    
    # Estado
    latconecta_status = Column(String(20), default='active')
    
    # Auditoría
    created_by = Column(String(100))
    updated_by = Column(String(100))
    last_update_date = Column(DateTime, default=func.now(), onupdate=func.now())

    # Constraint: Solo puede haber 1 registro
    __table_args__ = (
        CheckConstraint('latconecta_id = 1', name='chk_latconecta_id'),
    )

    def __repr__(self):
        return f"<Latconecta(id={self.latconecta_id}, name={self.latconecta_name})>"