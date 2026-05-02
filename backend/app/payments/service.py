# backend/app/payments/service.py
"""
Payment Service — Culqi
Orquesta operaciones de pago a través del PaymentGatewayService.
"""
import logging

logger = logging.getLogger(__name__)


async def create_charge(charge_data: dict) -> dict:
    """
    Crea un cargo en Culqi.

    Args:
        charge_data: dict con token_id, amount, currency_code, email, etc.

    Returns:
        dict normalizado con success, charge_id, outcome_type, message
    """
    from app.payments.gateway import payment_gateway_service
    adapter = payment_gateway_service.get_adapter()
    return await adapter.create_charge(charge_data)


async def create_order(order_data: dict) -> dict:
    """
    Crea una orden de pago en Culqi.
    Necesaria para habilitar Yape, billeteras y PagoEfectivo en el Checkout V4.

    Args:
        order_data: dict con amount, currency_code, order_number, client_details, etc.

    Returns:
        dict normalizado con success, order_id (ord_live_XXX), message
    """
    from app.payments.gateway import payment_gateway_service
    adapter = payment_gateway_service.get_adapter()
    return await adapter.create_order(order_data)


async def create_refund(refund_data: dict) -> dict:
    """
    Crea una devolución en Culqi.

    Args:
        refund_data: dict con charge_id, amount, reason

    Returns:
        dict normalizado con success, refund_id, amount, message
    """
    from app.payments.gateway import payment_gateway_service
    adapter = payment_gateway_service.get_adapter()
    return await adapter.create_refund(refund_data)


async def cancel_transaction(cancel_data: dict) -> dict:
    """
    Cancela/revierte un cargo usando el PaymentGatewayService.
    En Culqi una cancelación es un refund total.

    Args:
        cancel_data: dict con charge_id, amount, gateway, reason

    Returns:
        dict normalizado compatible con purchases.py
    """
    from app.payments.gateway import payment_gateway_service

    gateway_name = cancel_data.get('gateway', 'culqi')

    logger.info(
        f"🔄 Cancelling transaction: gateway={gateway_name}, "
        f"charge_id={cancel_data.get('charge_id')}, "
        f"amount={cancel_data.get('amount')}"
    )

    result = await payment_gateway_service.cancel_transaction(
        gateway_name=gateway_name,
        cancel_data=cancel_data
    )

    return result
