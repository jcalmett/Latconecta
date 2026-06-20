"""
Operations Config Router - CONTROL CENTRALIZADO
================================================
Reemplaza mock_config.py

Endpoints para:
- Consultar configuración completa
- Modificar operaciones individuales
- Aplicar presets (escenarios)
- Consultar config de pagos (para frontend)
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header
from typing import Literal, Any, Optional
from pydantic import BaseModel

from app.services.operations_config_service import ops_config
from app.config import settings


def verify_ops_pin(x_ops_pin: Optional[str] = Header(None)):
    """Valida el PIN del OperationsPanel enviado en header X-Ops-Pin."""
    if not settings.OPS_PANEL_PIN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OperationsPanel no disponible en este ambiente"
        )
    if x_ops_pin != settings.OPS_PANEL_PIN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PIN incorrecto"
        )

router = APIRouter()


# ==================== SCHEMAS ====================

class OperationUpdate(BaseModel):
    """Actualizar una operación"""
    mode: Literal['fase1', 'fase2']
    fase1_response: Literal['success', 'fail'] = 'success'



class ValCuentaParams(BaseModel):
    """Parámetros específicos de validación de cuenta"""
    monto_base: Optional[float] = None
    indicador: Optional[Literal['T', 'R']] = None
    account_holder: Optional[str] = None


# ==================== ENDPOINTS PRINCIPALES ====================

@router.get("/config")
async def get_config(_: None = Depends(verify_ops_pin)):
    """Obtener configuración completa — solo admin"""
    return {
        "config": ops_config.get_full_config(),
        "operations": ops_config.VALID_OPERATIONS,
    }


@router.get("/payment-config")
async def get_payment_config(_: None = Depends(verify_ops_pin)):
    """Config específico de pagos — solo admin"""
    return ops_config.get_payment_config()



@router.post("/config/val-cuenta-params")
async def update_val_cuenta_params(params: ValCuentaParams, _: None = Depends(verify_ops_pin)):
    """
    Configurar parámetros de simulación de validación de cuenta.

    POST /api/v1/operations/config/val-cuenta-params
    { "monto_base": 150.00, "indicador": "R" }
    """
    ops_config.set_val_cuenta_params(
        monto_base=params.monto_base,
        indicador=params.indicador,
        account_holder=params.account_holder
    )

    return {
        "success": True,
        "params": ops_config.config['val_cuenta'].get('fase1_params', {}),
    }


@router.post("/config/{operation}")
async def update_operation(operation: str, update: OperationUpdate, _: None = Depends(verify_ops_pin)):
    """
    Actualizar una operación específica.

    POST /api/v1/operations/config/pago_tarjeta
    { "mode": "fase2", "fase1_response": "success" }
    """
    success = ops_config.set_operation(
        operation=operation,
        mode=update.mode,
        fase1_response=update.fase1_response
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Operación '{operation}' no encontrada. Válidas: {ops_config.VALID_OPERATIONS}"
        )

    return {
        "success": True,
        "operation": operation,
        "mode": update.mode,
        "fase1_response": update.fase1_response,
    }






# ==================== PRESETS (Escenarios) ====================

@router.post("/presets/all-fase1-success")
async def preset_all_fase1_success(_: None = Depends(verify_ops_pin)):
    """Todo en Fase 1 / Success"""
    ops_config.preset_all_fase1_success()
    return {"success": True, "preset": "all-fase1-success", "description": "✅ Todo simulado exitoso"}


@router.post("/presets/all-fase1-fail")
async def preset_all_fase1_fail(_: None = Depends(verify_ops_pin)):
    """Todo en Fase 1 / Fail"""
    ops_config.preset_all_fase1_fail()
    return {"success": True, "preset": "all-fase1-fail", "description": "❌ Todo simulado fallido"}


@router.post("/presets/all-fase2")
async def preset_all_fase2(_: None = Depends(verify_ops_pin)):
    """Todo en Fase 2 (real)"""
    ops_config.preset_all_fase2()
    return {"success": True, "preset": "all-fase2", "description": "🚀 Todo en modo real"}


@router.post("/presets/happy-path")
async def preset_happy_path(_: None = Depends(verify_ops_pin)):
    """Escenario: Todo simulado y exitoso"""
    ops_config.preset_happy_path()
    return {"success": True, "preset": "happy-path", "description": "Todo exitoso"}


@router.post("/presets/payment-fail")
async def preset_payment_fail(_: None = Depends(verify_ops_pin)):
    """Escenario: Pago rechazado"""
    ops_config.preset_payment_fail()
    return {"success": True, "preset": "payment-fail", "description": "💳❌ Pago rechazado"}


@router.post("/presets/provision-fail-reversal-ok")
async def preset_provision_fail_reversal_ok(_: None = Depends(verify_ops_pin)):
    """Escenario: Provisión falla + Anulación OK"""
    ops_config.preset_provision_fail_reversal_ok()
    return {"success": True, "preset": "provision-fail-reversal-ok", "description": "⚠️ Provisión falla + Anulación OK"}


@router.post("/presets/provision-fail-reversal-fail")
async def preset_provision_fail_reversal_fail(_: None = Depends(verify_ops_pin)):
    """Escenario: CRÍTICO - Provisión y anulación fallan"""
    ops_config.preset_provision_fail_reversal_fail()
    return {"success": True, "preset": "provision-fail-reversal-fail", "description": "🚨 CRÍTICO: Provisión y anulación fallan"}


@router.post("/presets/bill-payment-partial")
async def preset_bill_payment_partial(_: None = Depends(verify_ops_pin)):
    """Escenario: Bill Payment con pago parcial"""
    ops_config.preset_bill_payment_partial()
    return {"success": True, "preset": "bill-payment-partial", "description": "📄 Bill Payment parcial"}


@router.post("/presets/bill-payment-total")
async def preset_bill_payment_total(_: None = Depends(verify_ops_pin)):
    """Escenario: Bill Payment solo total"""
    ops_config.preset_bill_payment_total()
    return {"success": True, "preset": "bill-payment-total", "description": "📄 Bill Payment total"}


@router.get("/presets")
async def list_presets(_: None = Depends(verify_ops_pin)):
    """Listar todos los presets disponibles"""
    return {
        "presets": [
            {"id": "all-fase1-success", "name": "✅ Todo Fase 1 Success", "endpoint": "POST /api/v1/operations/presets/all-fase1-success"},
            {"id": "all-fase1-fail", "name": "❌ Todo Fase 1 Fail", "endpoint": "POST /api/v1/operations/presets/all-fase1-fail"},
            {"id": "all-fase2", "name": "🚀 Todo Fase 2", "endpoint": "POST /api/v1/operations/presets/all-fase2"},
            {"id": "happy-path", "name": "Todo Exitoso", "endpoint": "POST /api/v1/operations/presets/happy-path"},
            {"id": "payment-fail", "name": "💳❌ Pago Rechazado", "endpoint": "POST /api/v1/operations/presets/payment-fail"},
            {"id": "provision-fail-reversal-ok", "name": "⚠️ Provisión Falla + Anulación OK", "endpoint": "POST /api/v1/operations/presets/provision-fail-reversal-ok"},
            {"id": "provision-fail-reversal-fail", "name": "🚨 CRÍTICO: Todo Falla", "endpoint": "POST /api/v1/operations/presets/provision-fail-reversal-fail"},
            {"id": "bill-payment-partial", "name": "📄 Bill Payment Parcial", "endpoint": "POST /api/v1/operations/presets/bill-payment-partial"},
            {"id": "bill-payment-total", "name": "📄 Bill Payment Total", "endpoint": "POST /api/v1/operations/presets/bill-payment-total"},
        ]
    }