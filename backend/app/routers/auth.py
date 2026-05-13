"""
Router de Autenticación
Endpoints para login, registro y obtención de usuario actual
✅ Rate limiting en login (5/min), forgot (3/min), reset (5/min), register (3/min)
✅ Refresh tokens con Redis
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models import User
from app.schemas.auth import (
    LoginRequest,
    Token,
    UserRegister,
    UserResponse,
    PasswordChange
)
from app.utils.auth import verify_password, get_password_hash, create_access_token
from app.utils.dependencies import get_current_active_user
from app.rate_limit import limiter, RATE_LIMITS
from app.services.refresh_token_manager import refresh_token_manager

router = APIRouter()


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 30


class LogoutRequest(BaseModel):
    refresh_token: str


@router.post("/login", response_model=Token, summary="Login de usuario")
@limiter.limit(RATE_LIMITS["login"])
async def login(
    request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.user_email == credentials.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.user_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.user_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Usuario {user.user_status}"
        )

    user.user_last_login_date = datetime.utcnow()
    await db.commit()

    access_token = create_access_token(data={
        "user_id": user.user_id,
        "email": user.user_email,
        "role": user.user_role,
        "type": "access"
    })
    refresh_token = refresh_token_manager.generate_refresh_token(user.user_id)

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.user_id,
        user_email=user.user_email,
        user_name=user.user_name,
        user_role=user.user_role,
        user_photo=user.user_photo,
        user_phone_country_code=user.user_phone_country_code,
        user_phone_number=user.user_phone_number,
        refresh_token=refresh_token
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(
    request: Request,
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.user_email == user_data.user_email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    db_user = User(
        user_name=user_data.user_name,
        user_email=user_data.user_email,
        user_password=get_password_hash(user_data.user_password),
        user_phone_country_code=user_data.user_phone_country_code or '+51',
        user_phone_number=user_data.user_phone_number,
        user_role="user",
        user_status="active",
        created_by="self-registration"
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    access_token = create_access_token(data={
        "user_id": db_user.user_id,
        "email": db_user.user_email,
        "role": db_user.user_role,
        "type": "access"
    })
    refresh_token = refresh_token_manager.generate_refresh_token(db_user.user_id)

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=db_user.user_id,
        user_email=db_user.user_email,
        user_name=db_user.user_name,
        user_role=db_user.user_role,
        user_photo=db_user.user_photo,
        user_phone_country_code=db_user.user_phone_country_code,
        user_phone_number=db_user.user_phone_number,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
@limiter.limit("10/minute")
async def refresh_access_token(
    request: Request,
    refresh_request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = refresh_token_manager.validate_refresh_token(refresh_request.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado"
        )
    
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or user.user_status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo"
        )
    
    refresh_token_manager.revoke_refresh_token(refresh_request.refresh_token)
    
    new_access_token = create_access_token(data={
        "user_id": user.user_id,
        "email": user.user_email,
        "role": user.user_role,
        "type": "access"
    })
    
    return RefreshTokenResponse(access_token=new_access_token)


@router.post("/logout")
@limiter.limit("10/minute")
async def logout(
    request: Request,
    logout_request: LogoutRequest,
    current_user: User = Depends(get_current_active_user)
):
    revoked = refresh_token_manager.revoke_refresh_token(logout_request.refresh_token)
    return {"success": True, "message": "Sesión cerrada"}


@router.post("/logout-all")
@limiter.limit("5/minute")
async def logout_all_devices(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    count = refresh_token_manager.revoke_all_user_tokens(current_user.user_id)
    return {"success": True, "message": f"Sesión cerrada en {count} dispositivo(s)"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(password_data.current_password, current_user.user_password):
        raise HTTPException(400, "Contraseña actual incorrecta")
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(400, "Las contraseñas nuevas no coinciden")
    if len(password_data.new_password) < 8:
        raise HTTPException(400, "La nueva contraseña debe tener al menos 8 caracteres")
    if not password_data.new_password[0].isupper():
        raise HTTPException(400, "La nueva contraseña debe comenzar con mayúscula")

    current_user.user_password = get_password_hash(password_data.new_password)
    current_user.updated_by = current_user.user_email
    current_user.last_update_date = datetime.utcnow()
    await db.commit()

    count = refresh_token_manager.revoke_all_user_tokens(current_user.user_id)
    return {"success": True, "message": f"Contraseña actualizada. {count} dispositivo(s) cerrados."}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


@router.post("/forgot-password")
@limiter.limit(RATE_LIMITS["forgot_password"])
async def forgot_password(
    request: Request,
    forgot_request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    from app.services.email_service import generate_reset_code, send_reset_code
    result = await db.execute(select(User).where(User.user_email == forgot_request.email))
    user = result.scalar_one_or_none()
    if user and user.user_status == "active":
        code = generate_reset_code()
        user.user_session_token = get_password_hash(code)
        user.user_session_expiry = datetime.utcnow() + timedelta(minutes=15)
        user.last_update_date = datetime.utcnow()
        await db.commit()
        try:
            await send_reset_code(to_email=user.user_email, user_name=user.user_name, code=code)
        except Exception:
            pass
    return {"success": True, "message": "Si el email está registrado, recibirás un código"}


@router.post("/reset-password")
@limiter.limit(RATE_LIMITS["reset_password"])
async def reset_password(
    request: Request,
    reset_request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    INVALID_MSG = "El código ingresado no es válido o ha expirado"
    result = await db.execute(select(User).where(User.user_email == reset_request.email))
    user = result.scalar_one_or_none()
    if not user or user.user_status != "active":
        raise HTTPException(400, INVALID_MSG)
    if not user.user_session_token or not user.user_session_expiry:
        raise HTTPException(400, INVALID_MSG)
    if datetime.utcnow() > user.user_session_expiry:
        user.user_session_token = None
        user.user_session_expiry = None
        await db.commit()
        raise HTTPException(400, INVALID_MSG)
    if not verify_password(reset_request.code, user.user_session_token):
        raise HTTPException(400, INVALID_MSG)
    if len(reset_request.new_password) < 8:
        raise HTTPException(400, "La nueva contraseña debe tener al menos 8 caracteres")
    if not reset_request.new_password[0].isupper():
        raise HTTPException(400, "La nueva contraseña debe comenzar con mayúscula")
    user.user_password = get_password_hash(reset_request.new_password)
    user.user_session_token = None
    user.user_session_expiry = None
    user.updated_by = "password-reset"
    user.last_update_date = datetime.utcnow()
    await db.commit()
    count = refresh_token_manager.revoke_all_user_tokens(user.user_id)
    return {"success": True, "message": f"Contraseña restablecida. {count} dispositivo(s) cerrados."}
