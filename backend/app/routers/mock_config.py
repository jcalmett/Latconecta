"""
Mock Configuration Router
Permite configurar respuestas de APIs mock SIN REINICIAR el backend
✅ ACTUALIZADO: Escenarios de anulación gateway
"""

from fastapi import APIRouter, HTTPException, status
from typing import Literal, Dict, Any, Optional
from pydantic import BaseModel

from app.services.mock_api_service import mock_api_service

router = APIRouter()

# ==================== SCHEMAS ====================

class MockConfigUpdate(BaseModel):
    """Request para actualizar configuración de una API"""
    api_name: str
    response: Literal['success', 'error']


class MockConfigBatch(BaseModel):
    """Request para actualizar múltiples APIs a la vez"""
    updates: Dict[str, Literal['success', 'error']]


class ValCuentaConfig(BaseModel):
    """Configuración específica para VALCUENTA"""
    response: Optional[Literal['success', 'error']] = 'success'
    monto_base: Optional[float] = 85.50
    indicador: Optional[Literal['T', 'R']] = 'T'


# ==================== ENDPOINTS ====================

@router.get("/config")
async def get_mock_config():
    """
    Obtener configuración actual de todas las APIs mock

    GET /api/v1/mock/config
    """
    return {
        "config": mock_api_service.config,
        "message": "Configuración actual de APIs mock"
    }

@router.post("/config/valcuenta")
async def update_valcuenta_config(config: ValCuentaConfig):
    """
    Configurar VALCUENTA con parámetros específicos

    POST /api/v1/mock/config/valcuenta
    {
        "response": "success",
        "monto_base": 120.50,
        "indicador": "R"
    }
    """
    mock_api_service.config['VALCUENTA']['response'] = config.response
    mock_api_service.config['VALCUENTA']['monto_base'] = config.monto_base
    mock_api_service.config['VALCUENTA']['indicador'] = config.indicador

    return {
        "success": True,
        "api_name": "VALCUENTA",
        "config": mock_api_service.config['VALCUENTA'],
        "message": "VALCUENTA configurado correctamente"
    }

@router.post("/config/{api_name}")
async def update_mock_config(api_name: str, update: MockConfigUpdate):
    """
    Actualizar configuración de una API específica

    POST /api/v1/mock/config/PAGOTARJETA
    {
        "api_name": "PAGOTARJETA",
        "response": "error"
    }
    """
    success = mock_api_service.set_api_response(api_name, update.response)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API '{api_name}' no encontrada en configuración mock"
        )

    return {
        "success": True,
        "api_name": api_name,
        "new_response": update.response,
        "message": f"API {api_name} configurada a {update.response}"
    }

@router.post("/config/batch")
async def update_mock_config_batch(batch: MockConfigBatch):
    """
    Actualizar configuración de múltiples APIs a la vez

    POST /api/v1/mock/config/batch
    {
        "updates": {
            "PAGOTARJETA": "error",
            "PROVISION_TOPUP": "error",
            "REVERSION": "success"
        }
    }
    """
    results = {}

    for api_name, response in batch.updates.items():
        success = mock_api_service.set_api_response(api_name, response)
        results[api_name] = {
            "success": success,
            "new_response": response if success else None
        }

    return {
        "success": True,
        "results": results,
        "message": f"{len(batch.updates)} APIs actualizadas"
    }

@router.post("/reset/all-success")
async def reset_all_success():
    """
    Resetear TODAS las APIs a success

    POST /api/v1/mock/reset/all-success
    """
    mock_api_service.reset_all_success()

    return {
        "success": True,
        "message": "✅ Todas las APIs configuradas en SUCCESS"
    }


@router.post("/reset/all-error")
async def reset_all_error():
    """
    Resetear TODAS las APIs a error

    POST /api/v1/mock/reset/all-error
    """
    mock_api_service.reset_all_error()

    return {
        "success": True,
        "message": "❌ Todas las APIs configuradas en ERROR"
    }


# ==================== ESCENARIOS PRE-CONFIGURADOS ====================

@router.post("/scenarios/happy-path")
async def scenario_happy_path():
    """
    ESCENARIO 1: Todo exitoso (Happy Path)

    - Validación: ✅
    - Pago: ✅
    - Provisión: ✅
    """
    mock_api_service.reset_all_success()

    return {
        "success": True,
        "scenario": "happy-path",
        "description": "Todo exitoso - Flujo completo sin errores",
        "expected_result": "Purchase completado exitosamente"
    }


@router.post("/scenarios/payment-failed")
async def scenario_payment_failed():
    """
    ESCENARIO 2: Pago rechazado

    - Validación: ✅
    - Pago: ❌ (FALLA)
    """
    mock_api_service.reset_all_success()
    mock_api_service.set_api_response('PAGOTARJETA', 'error')

    return {
        "success": True,
        "scenario": "payment-failed",
        "description": "Pago rechazado - Compra no procede",
        "expected_result": "Error 400: Payment failed"
    }


@router.post("/scenarios/provision-failed-reversal-ok")
async def scenario_provision_failed_reversal_ok():
    """
    ESCENARIO 3: Provisión falla pero reversión exitosa

    - Validación: ✅
    - Pago: ✅
    - Provisión: ❌ (FALLA)
    - Reversión: ✅
    """
    mock_api_service.reset_all_success()
    # Hacer fallar todas las provisiones
    for api in mock_api_service.config.keys():
        if api.startswith('PROVISION_'):
            mock_api_service.set_api_response(api, 'error')

    return {
        "success": True,
        "scenario": "provision-failed-reversal-ok",
        "description": "Provisión falla - Reversión exitosa - Cobro devuelto",
        "expected_result": "payment_status='reversed', delivery_status='failed'"
    }


@router.post("/scenarios/provision-failed-reversal-failed")
async def scenario_provision_failed_reversal_failed():
    """
    ESCENARIO 4: Provisión Y reversión fallan (CRÍTICO)

    - Validación: ✅
    - Pago: ✅ (se cobró)
    - Provisión: ❌ (FALLA - no se entregó)
    - Reversión: ❌ (FALLA - no se devolvió dinero)
    - ⚠️ INTERVENCIÓN MANUAL REQUERIDA
    """
    mock_api_service.reset_all_success()
    # Hacer fallar provisiones
    for api in mock_api_service.config.keys():
        if api.startswith('PROVISION_'):
            mock_api_service.set_api_response(api, 'error')
    # Hacer fallar reversión
    mock_api_service.set_api_response('REVERSION', 'error')

    return {
        "success": True,
        "scenario": "provision-failed-reversal-failed",
        "description": "⚠️ CRÍTICO: Provisión y reversión fallan - Requiere intervención manual",
        "expected_result": "requires_manual_intervention=True, payment_status='completed'"
    }


# ✅ NUEVO: Escenarios de anulación gateway

@router.post("/scenarios/provision-failed-gateway-cancel-ok")
async def scenario_provision_failed_gateway_cancel_ok():
    """
    ESCENARIO 5: Provisión falla + Anulación real de gateway exitosa (NIVEL 2)

    - Validación: ✅
    - Pago con tarjeta: ✅ (cobrado por IZIPAY/Conekta/Stripe)
    - Provisión: ❌ (FALLA)
    - Anulación gateway: ✅ (se devuelve el dinero vía gateway real)

    Usa NIVEL 2 (con api_group_code) + pago real con tarjeta
    """
    mock_api_service.reset_all_success()
    # Hacer fallar todas las provisiones
    for api in mock_api_service.config.keys():
        if api.startswith('PROVISION_'):
            mock_api_service.set_api_response(api, 'error')
    # Anulación gateway exitosa
    mock_api_service.set_api_response('ANULACION_GATEWAY', 'success')

    return {
        "success": True,
        "scenario": "provision-failed-gateway-cancel-ok",
        "description": "Provisión falla - Anulación real de gateway exitosa - Cobro devuelto",
        "expected_result": "payment_status='Refunded', purchase_status='Failed'"
    }


@router.post("/scenarios/provision-failed-gateway-cancel-failed")
async def scenario_provision_failed_gateway_cancel_failed():
    """
    ESCENARIO 6: Provisión falla + Anulación real de gateway falla (CRÍTICO NIVEL 2)

    - Validación: ✅
    - Pago con tarjeta: ✅ (cobrado por IZIPAY/Conekta/Stripe)
    - Provisión: ❌ (FALLA)
    - Anulación gateway: ❌ (FALLA - no se devolvió dinero)
    - ⚠️ INTERVENCIÓN MANUAL REQUERIDA

    Usa NIVEL 2 (con api_group_code) + pago real con tarjeta
    """
    mock_api_service.reset_all_success()
    # Hacer fallar todas las provisiones
    for api in mock_api_service.config.keys():
        if api.startswith('PROVISION_'):
            mock_api_service.set_api_response(api, 'error')
    # Anulación gateway falla
    mock_api_service.set_api_response('ANULACION_GATEWAY', 'error')

    return {
        "success": True,
        "scenario": "provision-failed-gateway-cancel-failed",
        "description": "⚠️ CRÍTICO NIVEL 2: Provisión falla + Anulación gateway falla - Intervención manual",
        "expected_result": "requires_manual_intervention=True, payment_status='Success'"
    }


@router.post("/scenarios/bill-payment-partial")
async def scenario_bill_payment_partial():
    """
    ESCENARIO 7: Bill Payment con pago parcial permitido

    - VALCUENTA retorna indicador='R' (parcial)
    - monto_base = 150.00
    """
    mock_api_service.reset_all_success()
    mock_api_service.config['VALCUENTA']['monto_base'] = 150.00
    mock_api_service.config['VALCUENTA']['indicador'] = 'R'

    return {
        "success": True,
        "scenario": "bill-payment-partial",
        "description": "Bill Payment permite pago parcial",
        "config": {
            "monto_base": 150.00,
            "indicador": "R"
        },
        "expected_result": "Usuario puede pagar monto menor a deuda total"
    }


@router.post("/scenarios/bill-payment-total-only")
async def scenario_bill_payment_total_only():
    """
    ESCENARIO 8: Bill Payment solo acepta pago total

    - VALCUENTA retorna indicador='T' (total)
    - monto_base = 85.50
    """
    mock_api_service.reset_all_success()
    mock_api_service.config['VALCUENTA']['monto_base'] = 85.50
    mock_api_service.config['VALCUENTA']['indicador'] = 'T'

    return {
        "success": True,
        "scenario": "bill-payment-total-only",
        "description": "Bill Payment requiere pago total",
        "config": {
            "monto_base": 85.50,
            "indicador": "T"
        },
        "expected_result": "Usuario debe pagar monto exacto de deuda"
    }


@router.get("/scenarios")
async def list_scenarios():
    """
    Listar todos los escenarios disponibles
    """
    return {
        "scenarios": [
            {
                "id": "happy-path",
                "name": "Todo Exitoso",
                "endpoint": "POST /api/v1/mock/scenarios/happy-path"
            },
            {
                "id": "payment-failed",
                "name": "Pago Rechazado",
                "endpoint": "POST /api/v1/mock/scenarios/payment-failed"
            },
            {
                "id": "provision-failed-reversal-ok",
                "name": "Provisión Falla + Reversión OK (Nivel 1)",
                "endpoint": "POST /api/v1/mock/scenarios/provision-failed-reversal-ok"
            },
            {
                "id": "provision-failed-reversal-failed",
                "name": "⚠️ Provisión y Reversión Fallan (Nivel 1)",
                "endpoint": "POST /api/v1/mock/scenarios/provision-failed-reversal-failed"
            },
            {
                "id": "provision-failed-gateway-cancel-ok",
                "name": "Provisión Falla + Anulación Gateway OK (Nivel 2)",
                "endpoint": "POST /api/v1/mock/scenarios/provision-failed-gateway-cancel-ok"
            },
            {
                "id": "provision-failed-gateway-cancel-failed",
                "name": "⚠️ Provisión Falla + Anulación Gateway Falla (Nivel 2)",
                "endpoint": "POST /api/v1/mock/scenarios/provision-failed-gateway-cancel-failed"
            },
            {
                "id": "bill-payment-partial",
                "name": "Bill Payment Parcial",
                "endpoint": "POST /api/v1/mock/scenarios/bill-payment-partial"
            },
            {
                "id": "bill-payment-total-only",
                "name": "Bill Payment Solo Total",
                "endpoint": "POST /api/v1/mock/scenarios/bill-payment-total-only"
            }
        ]
    }