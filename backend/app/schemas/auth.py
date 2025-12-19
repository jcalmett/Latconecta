"""
Schemas Pydantic para Autenticación
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """Schema para solicitud de login"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., min_length=6, description="Contraseña")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@bitel.com.pe",
                "password": "admin123"
            }
        }


class Token(BaseModel):
    """Schema para respuesta de token JWT"""
    access_token: str = Field(..., description="Token JWT de acceso")
    token_type: str = Field(default="bearer", description="Tipo de token")
    user_id: int = Field(..., description="ID del usuario")
    user_email: str = Field(..., description="Email del usuario")
    user_name: str = Field(..., description="Nombre del usuario")
    user_role: str = Field(..., description="Rol del usuario")
    user_photo: Optional[str] = Field(None, description="URL de la foto del usuario")
    user_phone_country_code: Optional[str] = Field(None)
    user_phone_number: Optional[str] = Field(None)

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user_id": 1,
                "user_email": "admin@bitel.com.pe",
                "user_name": "Admin Bitel",
                "user_role": "admin",
                "user_photo": "http://127.0.0.1:8100/uploads/users/user_photo.jpg"
            }
        }


class TokenData(BaseModel):
    """Schema para datos decodificados del token JWT"""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    """Schema para registro de nuevo usuario"""
    user_name: str = Field(..., min_length=2, description="Nombre completo del usuario")
    user_email: EmailStr = Field(..., description="Email del usuario")
    user_password: str = Field(..., min_length=6, description="Contraseña")
    user_phone_country_code: Optional[str] = Field(default='+51', description="Código de país")
    user_phone_number: Optional[str] = Field(None, description="Número de teléfono")
    user_photo: Optional[str] = Field(None, description="URL de foto de perfil")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_name": "Juan Pérez",
                "user_email": "juan@email.com",
                "user_password": "user123",
                "user_phone_country_code": "+51",
                "user_phone_number": "987654321",
                "user_photo": None
            }
        }


class UserResponse(BaseModel):
    """Schema para respuesta de datos de usuario"""
    user_id: int
    user_name: str
    user_email: EmailStr
    user_phone_country_code: Optional[str] = None
    user_phone_number: Optional[str] = None
    user_photo: Optional[str] = None
    user_role: str
    user_status: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": 2,
                "user_name": "Juan Pérez",
                "user_email": "juan@email.com",
                "user_phone_country_code": "+51",
                "user_phone_number": "987654321",
                "user_photo": "http://127.0.0.1:8100/uploads/users/user_2.jpg",
                "user_role": "user",
                "user_status": "active"
            }
        }


class UserUpdate(BaseModel):
    """Schema para actualización de perfil de usuario"""
    user_name: Optional[str] = Field(None, min_length=2)
    user_phone_country_code: Optional[str] = None
    user_phone_number: Optional[str] = None
    user_photo: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_name": "Juan Pérez Actualizado",
                "user_phone_country_code": "+51",
                "user_phone_number": "987654322",
                "user_photo": "http://127.0.0.1:8100/uploads/users/new_photo.jpg"
            }
        }


class PasswordChange(BaseModel):
    """Schema para cambio de contraseña"""
    current_password: str = Field(..., min_length=6, description="Contraseña actual")
    new_password: str = Field(..., min_length=6, description="Nueva contraseña")
    confirm_password: str = Field(..., min_length=6, description="Confirmar nueva contraseña")
    
    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "user123",
                "new_password": "newpass456",
                "confirm_password": "newpass456"
            }
        }