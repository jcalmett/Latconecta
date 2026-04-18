"""
Router de Autenticación
Endpoints para login, registro y obtención de usuario actual
✅ CONVERTIDO A ASYNC (AsyncSession)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession  # ✅ CAMBIO 1
from sqlalchemy import select  # ✅ CAMBIO 2
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User
from app.schemas.auth import (
    LoginRequest,
    Token,
    UserRegister,
    UserResponse,
    UserUpdate,
    PasswordChange
)
from app.utils.auth import verify_password, get_password_hash, create_access_token
from app.utils.dependencies import get_current_active_user
from pydantic import BaseModel, EmailStr

router = APIRouter()


@router.post("/login", response_model=Token, summary="Login de usuario")
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)  # ✅ CAMBIO 3: AsyncSession
):
    """
    Inicia sesión con email y contraseña

    Retorna un token JWT para autenticación en endpoints protegidos

    **Credenciales de prueba:**
    - Admin: admin@bitel.com.pe / admin123
    - User: juan@email.com / admin123
    """
    # ✅ CAMBIO 4: Buscar usuario por email con select() + await
    result = await db.execute(
        select(User).where(User.user_email == credentials.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar contraseña
    if not verify_password(credentials.password, user.user_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verificar que el usuario esté activo
    if user.user_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Usuario {user.user_status}. Contacte al administrador."
        )

    # Actualizar último login
    user.user_last_login_date = datetime.utcnow()
    await db.commit()  # ✅ CAMBIO 5: await

    # Crear token JWT
    access_token = create_access_token(
        data={
            "user_id": user.user_id,
            "email": user.user_email,
            "role": user.user_role
        }
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.user_id,
        user_email=user.user_email,
        user_name=user.user_name,
        user_role=user.user_role,
        user_photo=user.user_photo,
        user_phone_country_code=user.user_phone_country_code,
        user_phone_number=user.user_phone_number
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Registrar nuevo usuario")
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)  # ✅ CAMBIO 6: AsyncSession
):
    """
    Registra un nuevo usuario en el sistema

    El usuario se crea con rol 'user' y estado 'active' por defecto
    Retorna un token JWT para login automático después del registro
    """
    # ✅ CAMBIO 7: Verificar si el email ya existe con select() + await
    result = await db.execute(
        select(User).where(User.user_email == user_data.user_email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Crear nuevo usuario
    db_user = User(
        user_name=user_data.user_name,
        user_email=user_data.user_email,
        user_password=get_password_hash(user_data.user_password),
        user_photo=user_data.user_photo,
        user_phone_country_code=user_data.user_phone_country_code or '+51',
        user_phone_number=user_data.user_phone_number,
        user_role="user",  # Siempre 'user' para registro público
        user_status="active",
        created_by="self-registration"
    )

    db.add(db_user)  # ✅ NO necesita await
    await db.commit()  # ✅ CAMBIO 8: await
    await db.refresh(db_user)  # ✅ CAMBIO 9: await

    # Crear token JWT para login automático
    access_token = create_access_token(
        data={
            "user_id": db_user.user_id,
            "email": db_user.user_email,
            "role": db_user.user_role
        }
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=db_user.user_id,
        user_email=db_user.user_email,
        user_name=db_user.user_name,
        user_role=db_user.user_role,
        user_photo=db_user.user_photo,
        user_phone_country_code=db_user.user_phone_country_code,
        user_phone_number=db_user.user_phone_number
    )


@router.get("/me", response_model=UserResponse, summary="Obtener usuario actual")
async def get_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtiene la información del usuario autenticado actualmente

    **Requiere autenticación:** Token JWT en el header Authorization
    """
    return current_user


@router.post("/change-password", summary="Cambiar contraseña")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)  # ✅ CAMBIO 10: AsyncSession
):
    """
    Cambia la contraseña del usuario autenticado

    **Requiere autenticación:** Token JWT en el header Authorization
    """
    # Verificar contraseña actual
    if not verify_password(password_data.current_password, current_user.user_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )

    # Verificar que las contraseñas nuevas coincidan
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las contraseñas nuevas no coinciden"
        )

    # Verificar que la nueva contraseña sea diferente
    if password_data.current_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe ser diferente a la actual"
        )

    # Actualizar contraseña
    current_user.user_password = get_password_hash(password_data.new_password)
    current_user.updated_by = current_user.user_email
    current_user.last_update_date = datetime.utcnow()

    await db.commit()  # ✅ CAMBIO 11: await

    return {
        "success": True,
        "message": "Contraseña actualizada exitosamente"
    }


# =============================================================================
# RECUPERACIÓN DE CONTRASEÑA — Flujo por código de 6 dígitos
# =============================================================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


@router.post("/forgot-password", summary="Solicitar código de recuperación de contraseña")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Genera un código de 6 dígitos y lo envía al email del usuario.

    Por seguridad, siempre responde con el mismo mensaje
    independientemente de si el email existe o no en el sistema.
    El código es válido por 15 minutos.
    """
    # Importar aquí para evitar import circular al inicio del módulo
    from app.services.email_service import generate_reset_code, send_reset_code

    # Buscar usuario — respuesta genérica siempre (no revelar si email existe)
    result = await db.execute(
        select(User).where(User.user_email == request.email)
    )
    user = result.scalar_one_or_none()

    if user and user.user_status == "active":
        # Generar código y hashearlo para almacenamiento seguro
        code = generate_reset_code()
        hashed_code = get_password_hash(code)
        expiry = datetime.utcnow() + timedelta(minutes=15)

        # Guardar en campos legacy user_session_token / user_session_expiry
        user.user_session_token = hashed_code
        user.user_session_expiry = expiry
        user.updated_by = "password-reset-request"
        user.last_update_date = datetime.utcnow()
        await db.commit()

        # Enviar email (si falla el envío, no revelar el error al cliente)
        try:
            await send_reset_code(
                to_email=user.user_email,
                user_name=user.user_name,
                code=code
            )
        except Exception:
            # Log silencioso — no exponer detalles de infraestructura
            pass

    # Respuesta siempre idéntica
    return {
        "success": True,
        "message": "Si el email está registrado, recibirás un código en los próximos minutos."
    }


@router.post("/reset-password", summary="Restablecer contraseña con código")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verifica el código de 6 dígitos y actualiza la contraseña.

    El código debe ser válido (no expirado) y coincidir con el
    almacenado para el email indicado.
    """
    INVALID_MSG = "El código ingresado no es válido o ha expirado."

    # Buscar usuario
    result = await db.execute(
        select(User).where(User.user_email == request.email)
    )
    user = result.scalar_one_or_none()

    if not user or user.user_status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_MSG
        )

    # Verificar que existe token de reset
    if not user.user_session_token or not user.user_session_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_MSG
        )

    # Verificar que el código no haya expirado
    if datetime.utcnow() > user.user_session_expiry:
        # Limpiar token expirado
        user.user_session_token = None
        user.user_session_expiry = None
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_MSG
        )

    # Verificar que el código coincide (comparación bcrypt)
    if not verify_password(request.code, user.user_session_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_MSG
        )

    # Validar longitud mínima de nueva contraseña
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe tener al menos 6 caracteres."
        )

    # Actualizar contraseña e invalidar token
    user.user_password = get_password_hash(request.new_password)
    user.user_session_token = None
    user.user_session_expiry = None
    user.updated_by = "password-reset"
    user.last_update_date = datetime.utcnow()
    await db.commit()

    return {
        "success": True,
        "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión."
    }
