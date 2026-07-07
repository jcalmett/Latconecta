"""
LATCONECTA - WhatsApp Bot Router
=================================
Endpoints exclusivos para el canal WhatsApp (bot Node.js + Baileys/Cloud API).

Autenticación: header X-Bot-Service-Token (mismo patrón que X-Ops-Pin en
operations_config.py). NO usa JWT de usuario porque el bot actúa como
servicio de sistema, no como usuario autenticado.

Sigue el patrón ya existente en purchases.py: SQLAlchemy async, HTTPException,
logging, sin lógica de negocio duplicada (reutiliza modelos existentes).
"""

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from pydantic import BaseModel
import logging

from app.database import get_db
from app.models.user import User
from app.models.purchase import Purchase
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


def verify_bot_token(x_bot_service_token: Optional[str] = Header(None)):
    """Valida el token de servicio del bot enviado en header X-Bot-Service-Token.

    Mismo patrón que verify_ops_pin en operations_config.py.
    """
    if not settings.BOT_SERVICE_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="BOT_SERVICE_TOKEN no configurado en el servidor"
        )
    if x_bot_service_token != settings.BOT_SERVICE_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de servicio del bot inválido"
        )
    return True


def _normalize_phone(value: Optional[str]) -> str:
    """Quita espacios, guiones y el símbolo '+' para comparar números de forma consistente."""
    if not value:
        return ""
    return value.replace("+", "").replace(" ", "").replace("-", "").strip()


class IdentifyRequest(BaseModel):
    country_code: str   # ej: "51"
    phone_number: str   # ej: "987654321"


class IdentifyResponse(BaseModel):
    status: str  # "found" | "not_found"
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    has_anonymous_purchases: bool = False


class PurchaseSummary(BaseModel):
    purchase_id: int
    purchase_reference: str
    purchase_product_name: str
    purchase_total_amount: float
    purchase_currency: str
    purchase_status: Optional[str] = None
    purchase_date: str

    class Config:
        from_attributes = True


@router.post("/identify", response_model=IdentifyResponse)
async def identify_customer(
    data: IdentifyRequest,
    db: AsyncSession = Depends(get_db),
    _auth: bool = Depends(verify_bot_token)
):
    """
    Identifica a un cliente de WhatsApp por su número de teléfono.

    Busca en Users (cuenta registrada). Si no existe, verifica si hay
    compras anónimas previas con ese número (Purchase.purchase_phone_number)
    para poder ofrecer vincularlas más adelante.
    """
    normalized = _normalize_phone(data.country_code + data.phone_number)

    # Filtra en SQL por el número (sin código de país) para no traer toda la tabla,
    # y confirma la coincidencia completa (código + número) en memoria.
    result = await db.execute(
        select(User).where(User.user_phone_number == data.phone_number)
    )
    candidates = result.scalars().all()
    matched_user = None
    for u in candidates:
        u_full = _normalize_phone((u.user_phone_country_code or "") + (u.user_phone_number or ""))
        if u_full == normalized:
            matched_user = u
            break

    if matched_user:
        return IdentifyResponse(
            status="found",
            user_id=matched_user.user_id,
            user_name=matched_user.user_name,
            user_email=matched_user.user_email,
        )

    # No hay cuenta registrada — revisar si hay compras anónimas con este teléfono
    purchase_result = await db.execute(
        select(Purchase).where(Purchase.purchase_phone_number == data.phone_number).limit(1)
    )
    has_purchases = purchase_result.scalar_one_or_none() is not None

    return IdentifyResponse(status="not_found", has_anonymous_purchases=has_purchases)


@router.get("/purchases/by-phone", response_model=List[PurchaseSummary])
async def purchases_by_phone(
    phone_number: str,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    _auth: bool = Depends(verify_bot_token)
):
    """
    Últimas compras registradas con un número de teléfono dado
    (compra anónima vía purchase_phone_number). Uso exclusivo del bot.
    """
    result = await db.execute(
        select(Purchase)
        .where(Purchase.purchase_phone_number == phone_number)
        .order_by(Purchase.purchase_date.desc())
        .limit(limit)
    )
    purchases = result.scalars().all()
    return [
        PurchaseSummary(
            purchase_id=p.purchase_id,
            purchase_reference=p.purchase_reference,
            purchase_product_name=p.purchase_product_name,
            purchase_total_amount=float(p.purchase_total_amount),
            purchase_currency=p.purchase_currency,
            purchase_status=p.purchase_status,
            purchase_date=p.purchase_date.isoformat() if p.purchase_date else "",
        )
        for p in purchases
    ]
