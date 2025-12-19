"""
Modelo User - Representa la tabla users
Usuarios del sistema (clientes y administradores)
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """
    Modelo de usuarios
    Incluye clientes y administradores del sistema
    """
    __tablename__ = "users"

    # Primary Key
    user_id = Column(Integer, primary_key=True, index=True)

    # Información personal
    user_photo = Column(String(255))
    user_name = Column(String(50), nullable=False)
    user_email = Column(String(50), unique=True, nullable=False, index=True)
    user_password = Column(String(255), nullable=False)  # Hash bcrypt

    # Teléfono
    user_phone_country_code = Column(String(50))
    user_phone_number = Column(String(50))

    # Roles y estado
    user_role = Column(String(20), default='user', index=True)  # 'user', 'admin', 'superadmin'
    user_status = Column(String(20), default='active')  # ✅ CORREGIDO: 'active', 'inactive'

    # Gestión de sesión
    user_session_token = Column(String(255))
    user_session_expiry = Column(TIMESTAMP)
    user_last_login_date = Column(TIMESTAMP)

    # Auditoría
    created_by = Column(String(100))
    updated_by = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relaciones
    purchases = relationship("Purchase", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.user_id}, email='{self.user_email}', role='{self.user_role}')>"