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


import redis
import random
import json
import logging

logger = logging.getLogger(__name__)

# ── Schemas para OTP de registro ─────────────────────────────────────────────

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

# ── Redis para OTP de registro ────────────────────────────────────────────────
_redis_client = None

def get_redis():
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(host='127.0.0.1', port=6379, db=1, decode_responses=True)
    return _redis_client

OTP_TTL_SECONDS = 900   # 15 minutos
OTP_PREFIX      = "reg_otp:"
MAX_OTP_ATTEMPTS = 5

def _generate_otp() -> str:
    return str(random.randint(100000, 999999))

def _save_otp(email: str, otp: str, user_data: dict) -> None:
    r = get_redis()
    key = f"{OTP_PREFIX}{email.lower()}"
    payload = {"otp_hash": get_password_hash(otp), "user_data": user_data, "attempts": 0}
    r.setex(key, OTP_TTL_SECONDS, json.dumps(payload))

def _get_otp_payload(email: str):
    r = get_redis()
    raw = r.get(f"{OTP_PREFIX}{email.lower()}")
    return json.loads(raw) if raw else None

def _delete_otp(email: str) -> None:
    get_redis().delete(f"{OTP_PREFIX}{email.lower()}")

def _increment_attempts(email: str, payload: dict) -> int:
    r = get_redis()
    key = f"{OTP_PREFIX}{email.lower()}"
    payload["attempts"] += 1
    ttl = r.ttl(key)
    if ttl > 0:
        r.setex(key, ttl, json.dumps(payload))
    return payload["attempts"]

# ─────────────────────────────────────────────────────────────────────────────

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


@router.post("/register", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def register(
    request: Request,
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    PASO 1 del registro: valida datos y envía OTP al email.
    El usuario NO se crea en BD hasta confirmar el OTP via POST /auth/verify-email.
    """
    # 1. Email no duplicado
    result = await db.execute(select(User).where(User.user_email == user_data.user_email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    # 2. Validar contraseña
    if len(user_data.user_password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")
    if not user_data.user_password[0].isupper():
        raise HTTPException(status_code=400, detail="La contraseña debe comenzar con mayúscula")

    # 3. Guardar datos + OTP en Redis (NO en BD aún)
    otp = _generate_otp()
    _save_otp(
        email=user_data.user_email,
        otp=otp,
        user_data={
            "user_name":               user_data.user_name,
            "user_email":              user_data.user_email,
            "user_password_hash":      get_password_hash(user_data.user_password),
            "user_phone_country_code": user_data.user_phone_country_code or "+51",
            "user_phone_number":       user_data.user_phone_number or "",
        }
    )

    # 4. Enviar email con OTP
    try:
        from app.services.email_service import send_verification_code
        await send_verification_code(
            to_email=user_data.user_email,
            user_name=user_data.user_name,
            code=otp
        )
    except Exception as e:
        _delete_otp(user_data.user_email)
        raise HTTPException(status_code=500, detail="Error al enviar el código. Intenta nuevamente.")

    return {
        "success": True,
        "message": f"Hemos enviado un código de verificación a {user_data.user_email}. Válido por 15 minutos.",
        "email":   user_data.user_email,
    }


@router.post("/verify-email", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def verify_email(
    request: Request,
    verify_data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    PASO 2 del registro: verifica OTP y crea el usuario en BD.
    Máximo 5 intentos. OTP se invalida tras verificación exitosa.
    """
    INVALID_MSG = "El código ingresado no es válido o ha expirado"

    payload = _get_otp_payload(verify_data.email)
    if not payload:
        raise HTTPException(status_code=400, detail=INVALID_MSG)

    if payload.get("attempts", 0) >= MAX_OTP_ATTEMPTS:
        _delete_otp(verify_data.email)
        raise HTTPException(status_code=400, detail="Demasiados intentos. Solicita un nuevo código.")

    if not verify_password(verify_data.code, payload["otp_hash"]):
        attempts  = _increment_attempts(verify_data.email, payload)
        remaining = MAX_OTP_ATTEMPTS - attempts
        raise HTTPException(status_code=400, detail=f"Código incorrecto. {remaining} intento(s) restante(s).")

    # OTP correcto — crear usuario
    ud = payload["user_data"]
    result = await db.execute(select(User).where(User.user_email == ud["user_email"]))
    if result.scalar_one_or_none():
        _delete_otp(verify_data.email)
        raise HTTPException(status_code=400, detail="Email ya registrado")

    db_user = User(
        user_name=ud["user_name"],
        user_email=ud["user_email"],
        user_password=ud["user_password_hash"],
        user_phone_country_code=ud["user_phone_country_code"],
        user_phone_number=ud["user_phone_number"],
        user_role="user",
        user_status="active",
        created_by="self-registration"
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    _delete_otp(verify_data.email)

    access_token  = create_access_token(data={
        "user_id": db_user.user_id,
        "email":   db_user.user_email,
        "role":    db_user.user_role,
        "type":    "access"
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


@router.post("/resend-verification")
@limiter.limit("2/minute")
async def resend_verification(
    request: Request,
    body: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Reenvía el OTP de verificación de registro si hay un registro pendiente."""
    payload = _get_otp_payload(body.email)
    if payload:
        ud      = payload["user_data"]
        new_otp = _generate_otp()
        _save_otp(email=body.email, otp=new_otp, user_data=ud)
        try:
            from app.services.email_service import send_verification_code
            await send_verification_code(to_email=body.email, user_name=ud["user_name"], code=new_otp)
        except Exception:
            pass
    return {"success": True, "message": "Si hay un registro pendiente, recibirás un nuevo código."}


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
