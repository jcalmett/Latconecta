"""
Router: Exchange Rate
Endpoint para obtener tipos de cambio con márgenes aplicados
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal
from datetime import datetime

from app.database import get_db
from app.services.exchange_rate_service import ExchangeRateService

router = APIRouter()

@router.get("")
async def get_exchange_rate(
    from_currency: str = Query(..., description="Moneda origen (ej: USD, PEN, MXN, BOL)"),
    to_currency: str = Query(..., description="Moneda destino (ej: USD, PEN, MXN, BOL)"),
    margin_type: Literal['pricing', 'conciliation', 'conversion'] = Query(
        ..., 
        description="Tipo de margen: pricing (-5%), conciliation (+5%), conversion (-5%)"
    ),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener tipo de cambio con margen aplicado
    
    **Márgenes:**
    - `pricing`: -5% (para proteger margen en productos)
    - `conciliation`: +5% (para conciliación con vendor)
    - `conversion`: -5% (para conversiones generales)
    
    **Ejemplos:**
    - USD → MXN con margen pricing (-5%): TC oficial 20.00 → 19.00
    - PEN → BOL con margen pricing (-5%): TC oficial 7.25 → 6.89
    - USD → PEN con margen conciliation (+5%): TC oficial 3.80 → 3.99
    
    **Response:**
    ```json
    {
        "rate": 19.00,
        "from_currency": "USD",
        "to_currency": "MXN",
        "margin_type": "pricing",
        "timestamp": "2026-01-03T10:30:00"
    }
    ```
    """
    
    # Obtener tasa de cambio con margen
    rate = await ExchangeRateService.get_exchange_rate(
        from_currency,
        to_currency,
        margin_type,
        db
    )
    
    return {
        "rate": float(rate),
        "from_currency": from_currency,
        "to_currency": to_currency,
        "margin_type": margin_type,
        "timestamp": datetime.now().isoformat()
    }
