"""
Schemas Pydantic para User
"""
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Schema base para User"""
    user_name: str = Field(..., max_length=50, description="Nombre del usuario")
    user_email: EmailStr = Field(..., description="Email único del usuario")
    user_photo: Optional[str] = Field(None, max_length=255, description="URL foto usuario")
    user_phone_country_code: Optional[str] = Field(None, max_length=50, description="Código país")
    user_phone_number: Optional[str] = Field(None, max_length=50, description="Número teléfono")
    user_role: Optional[str] = Field('user', max_length=20, description="Rol del usuario")
    user_status: Optional[str] = Field('active', max_length=20, description="Estado")

    @field_validator('user_role')
    @classmethod
    def validate_role(cls, v):
        """Validar que el rol sea válido"""
        allowed_roles = ['user', 'admin', 'superadmin']
        if v not in allowed_roles:
            raise ValueError(f'Rol debe ser uno de: {", ".join(allowed_roles)}')
        return v

    @field_validator('user_status')
    @classmethod
    def validate_status(cls, v):
        """Validar que el estado sea válido"""
        # ✅ CORREGIDO: Estados válidos son 'active' e 'inactive'
        allowed_statuses = ['active', 'inactive']
        if v not in allowed_statuses:
            raise ValueError(f'Estado debe ser uno de: {", ".join(allowed_statuses)}')
        return v


class UserCreate(UserBase):
    """Schema para crear User"""
    user_password: str = Field(..., min_length=6, max_length=100, description="Contraseña")
    created_by: Optional[str] = Field(None, max_length=100)


class UserUpdate(BaseModel):
    """Schema para actualizar User - todos los campos son opcionales"""
    user_name: Optional[str] = Field(None, max_length=50)
    user_email: Optional[EmailStr] = None
    user_photo: Optional[str] = Field(None, max_length=255)
    user_phone_country_code: Optional[str] = Field(None, max_length=50)
    user_phone_number: Optional[str] = Field(None, max_length=50)
    user_role: Optional[str] = Field(None, max_length=20)
    user_status: Optional[str] = Field(None, max_length=20)
    user_password: Optional[str] = Field(None, min_length=6, max_length=100, description="Contraseña (opcional para reset admin)")
    updated_by: Optional[str] = Field(None, max_length=100)


class UserInDB(UserBase):
    """Schema para User desde la base de datos"""
    user_id: int
    user_password: str  # Hash de la contraseña
    user_session_token: Optional[str] = None
    user_session_expiry: Optional[datetime] = None
    user_last_login_date: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_update_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserPublic(UserBase):
    """Schema público de User - SIN contraseña ni tokens"""
    user_id: int
    user_last_login_date: Optional[datetime] = None
    last_update_date: Optional[datetime] = None

    class Config:
        from_attributes = True