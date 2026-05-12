from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_email: str
    user_name: str
    user_role: str
    user_photo: Optional[str] = None
    user_phone_country_code: Optional[str] = None
    user_phone_number: Optional[str] = None
    refresh_token: Optional[str] = None

class UserRegister(BaseModel):
    user_name: str
    user_email: str
    user_password: str
    user_photo: Optional[str] = None
    user_phone_country_code: Optional[str] = None
    user_phone_number: Optional[str] = None

class UserResponse(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    user_photo: Optional[str] = None
    user_phone_country_code: Optional[str] = None
    user_phone_number: Optional[str] = None
    user_role: str
    user_status: str

class UserUpdate(BaseModel):
    user_name: Optional[str] = None
    user_photo: Optional[str] = None
    user_phone_country_code: Optional[str] = None
    user_phone_number: Optional[str] = None
    user_role: Optional[str] = None
    user_status: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
