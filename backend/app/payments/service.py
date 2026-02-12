# backend/app/payments/service.py
"""
Izipay Payment Service
Genera Token de Sesión llamando a la API de Izipay
"""
import httpx
import os
import time
import logging

logger = logging.getLogger(__name__)

from app.config import settings

IZIPAY_API_URL = settings.IZIPAY_API_URL
IZIPAY_TOKEN_ENDPOINT = settings.IZIPAY_TOKEN_ENDPOINT
IZIPAY_MERCHANT_CODE = settings.IZIPAY_MERCHANT_CODE
IZIPAY_API_KEY = settings.IZIPAY_API_KEY


async def generate_session_token(order_number: str, amount: str) -> dict:
    """
    Llama a POST sandbox-api-pw.izipay.pe/security/v1/Token/Generate
    para obtener un JWT (token de sesión) válido por 15 minutos.
    
    Args:
        order_number: Número de pedido (5-15 chars)
        amount: Monto con 2 decimales como string, ej: "15.00"
    
    Returns:
        dict con token JWT o error
    """
    transaction_id = f"{int(time.time() * 1000)}"
    
    url = f"{IZIPAY_API_URL}{IZIPAY_TOKEN_ENDPOINT}"
    
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "transactionId": transaction_id,
    }
    
    body = {
        "requestSource": "ECOMMERCE",
        "merchantCode": IZIPAY_MERCHANT_CODE,
        "orderNumber": order_number,
        "publicKey": IZIPAY_API_KEY,
        "amount": amount,
    }
    
    logger.info(f"🔑 Requesting Izipay session token: order={order_number}, amount={amount}")
    logger.debug(f"   URL: {url}")
    logger.debug(f"   transactionId: {transaction_id}")
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=body, headers=headers)
        
        data = response.json()
        logger.info(f"📨 Izipay response: code={data.get('code')}, message={data.get('message')}")
        
        if response.status_code == 200 and data.get("code") == "00":
            token = data["response"]["token"]
            logger.info(f"✅ Session token obtained (length={len(token)})")
            return {
                "success": True,
                "token": token,
                "transactionId": transaction_id,
            }
        else:
            logger.error(f"❌ Izipay token error: {data}")
            return {
                "success": False,
                "error": data.get("message", "Unknown error"),
                "code": data.get("code", "XX"),
            }
            
    except httpx.TimeoutException:
        logger.error("❌ Izipay timeout")
        return {"success": False, "error": "Timeout connecting to Izipay"}
    except Exception as e:
        logger.error(f"❌ Izipay exception: {str(e)}")
        return {"success": False, "error": str(e)}
