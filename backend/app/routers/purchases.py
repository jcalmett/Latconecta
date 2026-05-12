"""
Purchases Router - REFACTORIZADO CON CONTROL CENTRALIZADO
==========================================================

Usa operations_config_service para TODAS las decisiones de fase1/fase2.
Ya no hay lógica dispersa de mock_api_service.

FLUJO: ops_config.is_fase1('operacion') → Simular
       ops_config.is_fase2('operacion') → Real (gateway, api_mapping, función)

MEJORAS DE SEGURIDAD (Mayo 2026):
- GET /{purchase_id}: verifica que el usuario sea el dueño de la compra
- GET /: restringe filtro user_id según rol del usuario
- POST /create: valida que user_id del request coincida con el token
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
import logging
import json

from app.database import get_db
from app.models.purchase import Purchase
from app.models.product import Product
from app.models.vendor_product import VendorProduct
from app.models.vendor import Vendor
from app.models.company import Company
from app.models.user import User
from app.services.purchase_calculator_service import purchase_calculator_service
from app.services.exchange_rate_service import exchange_rate_service
from app.services.operations_config_service import ops_config
from app.services.universal_vendor_service import UniversalVendorService
from app.barcode import barcode_service
from app.dependencies import get_current_user_optional, verify_ownership

logger = logging.getLogger(__name__)
router = APIRouter()


async def _attempt_payment_reversal(request, calculation, payment_ref: str) -> Dict[str, Any]:
    """Intenta revertir/anular un pago cuando la provisión falla."""
    if ops_config.is_fase1('anulacion_tarjeta'):
        logger.info("🎭 FASE 1: Simulando anulación")
        sim = ops_config.simulate_response('anulacion_tarjeta', {
            'payment_ref': payment_ref, 'amount': float(calculation.purchase_total_amount)
        })
        return {'success': sim.get('success', False), 'reversal_ref': sim.get('reversal_ref'), 'cancel_id': None, 'message': sim.get('error_message', '')}
    else:
        has_gw = (request.payment_method == 'card' and request.payment_gateway
                  and request.payment_transaction_id)
        if not has_gw:
            return {'success': False, 'reversal_ref': None, 'cancel_id': None, 'message': 'No hay datos de gateway para anulación real'}
        logger.info(f"🚀 FASE 2: Anulación real via {request.payment_gateway}")
        try:
            from app.payments.gateway import payment_gateway_service
            cancel_data = {
                'gateway':    request.payment_gateway,
                'charge_id':  request.payment_transaction_id,
                'transaction_id': request.payment_transaction_id,
                'order_number': request.payment_order_number,
                'amount':     int(float(calculation.purchase_total_amount) * 100),
                'currency':   request.payment_currency or calculation.purchase_currency,
                'reason':     'solicitud_comprador',
            }
            result = await payment_gateway_service.cancel_transaction(cancel_data=cancel_data)
            return {'success': result.get('success', False), 'reversal_ref': result.get('cancel_id'),
                    'cancel_id': result.get('cancel_id'), 'message': result.get('message', '')}
        except Exception as e:
            logger.error(f"❌ Gateway cancel exception: {str(e)}")
            return {'success': False, 'reversal_ref': None, 'cancel_id': None, 'message': f'Error: {str(e)}'}


def _map_purchase_to_response(purchase: Purchase) -> 'PurchaseResponse':
    return PurchaseResponse(
        purchase_id=purchase.purchase_id, purchase_reference=purchase.purchase_reference,
        purchase_user_id=purchase.purchase_user_id, purchase_phone_number=purchase.purchase_phone_number,
        purchase_account_number=purchase.purchase_account_number, purchase_product_id=purchase.purchase_product_id,
        purchase_service_name=purchase.purchase_service_name, purchase_product_name=purchase.purchase_product_name,
        purchase_product_type=purchase.purchase_product_type,
        purchase_base_price=Decimal(str(purchase.purchase_base_price)),
        purchase_discount=Decimal(str(purchase.purchase_discount or 0)),
        purchase_fee=Decimal(str(purchase.purchase_fee or 0)),
        purchase_total_amount=Decimal(str(purchase.purchase_total_amount)),
        purchase_currency=purchase.purchase_currency, purchase_vendor_code=purchase.purchase_vendor_code,
        purchase_vendor_amount=Decimal(str(purchase.purchase_vendor_amount)) if purchase.purchase_vendor_amount else None,
        purchase_vendor_currency=purchase.purchase_vendor_currency,
        purchase_exch_rate=Decimal(str(purchase.purchase_exch_rate)) if purchase.purchase_exch_rate else None,
        purchase_vendpro_code=purchase.purchase_vendpro_code, purchase_vendor_skuid=purchase.purchase_vendor_skuid,
        purchase_vendpro_country=purchase.purchase_vendpro_country, purchase_vendpro_operator=purchase.purchase_vendpro_operator,
        purchase_vendpro_product_type=purchase.purchase_vendpro_product_type,
        purchase_vendpro_amount_type=purchase.purchase_vendpro_amount_type,
        purchase_vendpro_maximum_amount=Decimal(str(purchase.purchase_vendpro_maximum_amount)) if purchase.purchase_vendpro_maximum_amount else None,
        vendor_name=purchase.vendor_name, purchase_payment_method=purchase.purchase_payment_method,
        purchase_payment_status=purchase.purchase_payment_status,
        purchase_credit_card_last_digits=purchase.purchase_credit_card_last_digits,
        purchase_payment_ref=purchase.purchase_payment_ref, purchase_delivery_status=purchase.purchase_delivery_status,
        purchase_delivery_phone=purchase.purchase_delivery_phone, purchase_delivery_name=purchase.purchase_delivery_name,
        purchase_delivery_address=purchase.purchase_delivery_address, purchase_status=purchase.purchase_status,
        purchase_provision_ref=purchase.purchase_provision_ref, purchase_reversal_ref=purchase.purchase_reversal_ref,
        purchase_barcode_code=purchase.purchase_barcode_code, purchase_barcode_image=purchase.purchase_barcode_image,
        purchase_receip_image=purchase.purchase_receip_image,
        izipay_order_code=getattr(purchase, 'izipay_order_code', None),
        izipay_form_token=getattr(purchase, 'izipay_form_token', None),
        purchase_balance_currency=purchase.purchase_balance_currency,
        purchase_initial_balance=Decimal(str(purchase.purchase_initial_balance)) if purchase.purchase_initial_balance else None,
        purchase_final_balance=Decimal(str(purchase.purchase_final_balance)) if purchase.purchase_final_balance else None,
        vendor_trans_id=purchase.vendor_trans_id, vendor_provider_trans_id=purchase.vendor_provider_trans_id,
        purchase_vendor_cost=Decimal(str(purchase.purchase_vendor_cost)) if purchase.purchase_vendor_cost else None,
        purchase_vendor_json=purchase.purchase_vendor_json,
        purchase_vendor_date_petition=purchase.purchase_vendor_date_petition,
        purchase_vendor_date_response=purchase.purchase_vendor_date_response,
        purchase_vendor_response_code=purchase.purchase_vendor_response_code,
        purchase_vendor_response_description=purchase.purchase_vendor_response_description,
        purchase_vendor_purchase_id=purchase.purchase_vendor_purchase_id,
        vendor_request=purchase.vendor_request, vendor_response=purchase.vendor_response,
        requires_manual_intervention=purchase.requires_manual_intervention or False,
        purchase_ip_petition=purchase.purchase_ip_petition,
        purchase_date_sent_to_conciliation=purchase.purchase_date_sent_to_conciliation,
        created_by=purchase.created_by, updated_by=purchase.updated_by,
        purchase_date=purchase.purchase_date, last_update_date=purchase.last_update_date,
        company_initial_balance=Decimal(str(purchase.purchase_initial_balance)) if purchase.purchase_initial_balance else None,
        company_final_balance=Decimal(str(purchase.purchase_final_balance)) if purchase.purchase_final_balance else None,
        payment_status=purchase.purchase_payment_status, delivery_status=purchase.purchase_delivery_status,
        payment_ref=purchase.purchase_payment_ref, provision_ref=purchase.purchase_provision_ref,
        reversal_ref=purchase.purchase_reversal_ref, barcode=purchase.purchase_barcode_code,
        barcode_image=purchase.purchase_barcode_image,
    )


class PurchaseCreateRequest(BaseModel):
    product_id: int
    user_id: Optional[int] = None
    product_type: Literal['topup', 'smartphone', 'transfer', 'bill_payment', 'package']
    phone_number: Optional[str] = None
    account_number: Optional[str] = None
    validation_data: Optional[Dict[str, Any]] = None
    exchange_rate: Optional[float] = None
    user_selected_amount: Optional[Decimal] = None
    purchase_vendpro_product_type: Optional[str] = None
    purchase_vendpro_amount_type: Optional[str] = None
    purchase_vendpro_maximum_amount: Optional[Decimal] = None
    payment_type: Optional[Literal['full', 'partial']] = 'full'
    bill_total_debt: Optional[Decimal] = None
    bill_currency: Optional[str] = None
    delivery_name: Optional[str] = None
    delivery_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    payment_method: Literal['card', 'barcode']
    payment_gateway: Optional[str] = None
    payment_transaction_uuid: Optional[str] = None
    payment_transaction_id: Optional[str] = None
    payment_reference_number: Optional[str] = None
    payment_order_number: Optional[str] = None
    payment_method_detail: Optional[str] = None
    payment_code_auth: Optional[str] = None
    payment_amount: Optional[Decimal] = None
    payment_currency: Optional[str] = None
    payment_transaction_datetime: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class PurchaseResponse(BaseModel):
    purchase_id: int
    purchase_reference: str
    purchase_user_id: Optional[int] = None
    purchase_phone_number: Optional[str] = None
    purchase_account_number: Optional[str] = None
    purchase_product_id: Optional[int] = None
    purchase_service_name: str
    purchase_product_name: str
    purchase_product_type: Optional[str] = None
    purchase_base_price: Decimal
    purchase_discount: Decimal
    purchase_fee: Decimal
    purchase_total_amount: Decimal
    purchase_currency: str
    purchase_vendor_code: Optional[str] = None
    purchase_vendor_amount: Optional[Decimal] = None
    purchase_vendor_currency: Optional[str] = None
    purchase_exch_rate: Optional[Decimal] = None
    purchase_vendpro_code: Optional[str] = None
    purchase_vendor_skuid: Optional[str] = None
    purchase_vendpro_country: Optional[str] = None
    purchase_vendpro_operator: Optional[str] = None
    purchase_vendpro_product_type: Optional[str] = Field(None, max_length=1)
    purchase_vendpro_amount_type: Optional[str] = None
    purchase_vendpro_maximum_amount: Optional[Decimal] = None
    vendor_name: Optional[str] = None
    purchase_payment_method: str
    purchase_payment_status: str
    purchase_credit_card_last_digits: Optional[str] = None
    purchase_payment_ref: Optional[str] = None
    purchase_delivery_status: Optional[str] = None
    purchase_delivery_phone: Optional[str] = None
    purchase_delivery_name: Optional[str] = None
    purchase_delivery_address: Optional[str] = None
    purchase_status: Optional[str] = None
    purchase_provision_ref: Optional[str] = None
    purchase_reversal_ref: Optional[str] = None
    purchase_barcode_code: Optional[str] = None
    purchase_barcode_image: Optional[str] = None
    purchase_receip_image: Optional[str] = None
    izipay_order_code: Optional[str] = None
    izipay_form_token: Optional[str] = None
    purchase_balance_currency: Optional[str] = None
    purchase_initial_balance: Optional[Decimal] = None
    purchase_final_balance: Optional[Decimal] = None
    vendor_trans_id: Optional[str] = None
    vendor_provider_trans_id: Optional[str] = None
    purchase_vendor_cost: Optional[Decimal] = None
    purchase_vendor_json: Optional[str] = None
    purchase_vendor_date_petition: Optional[datetime] = None
    purchase_vendor_date_response: Optional[datetime] = None
    purchase_vendor_response_code: Optional[str] = None
    purchase_vendor_response_description: Optional[str] = None
    purchase_vendor_purchase_id: Optional[str] = None
    vendor_request: Optional[str] = None
    vendor_response: Optional[str] = None
    requires_manual_intervention: bool = False
    purchase_ip_petition: Optional[str] = None
    purchase_date_sent_to_conciliation: Optional[datetime] = None
    created_by: str = "System"
    updated_by: str = "System"
    purchase_date: datetime
    last_update_date: datetime
    info_message: Optional[str] = None
    amount_breakdown: Optional[Dict[str, Any]] = None
    company_initial_balance: Optional[Decimal] = None
    company_final_balance: Optional[Decimal] = None
    payment_status: Optional[str] = None
    delivery_status: Optional[str] = None
    payment_ref: Optional[str] = None
    provision_ref: Optional[str] = None
    reversal_ref: Optional[str] = None
    barcode: Optional[str] = None
    barcode_image: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("/create", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase(
    request: PurchaseCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)  # ✅ AGREGADO
):
    try:
        logger.info(f"Creating purchase for product_id={request.product_id}")

        # ✅ VALIDACIÓN DE SEGURIDAD: Verificar que user_id coincida con el token
        if request.user_id:
            # Si el request tiene user_id, debe haber un usuario autenticado
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Debe iniciar sesión para crear una compra asociada a su cuenta"
                )
            # Y ese user_id debe ser el mismo que el del token
            if request.user_id != current_user.user_id:
                logger.warning(f"Intento de suplantación: request.user_id={request.user_id}, token.user_id={current_user.user_id}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No puede crear compras en nombre de otro usuario"
                )

        # PASO 1: CARGAR DATOS
        product_query = await db.execute(
            select(Product).options(joinedload(Product.company), joinedload(Product.service))
            .where(Product.product_id == request.product_id))
        product = product_query.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {request.product_id} not found")

        vp_query = await db.execute(select(VendorProduct).where(and_(
            VendorProduct.vendor_code == product.product_vendor_code,
            VendorProduct.vp_code == product.product_vendpro_code,
            VendorProduct.vp_skuid == product.product_vendpro_skuid)))
        vendor_product = vp_query.scalar_one_or_none()
        if not vendor_product:
            raise HTTPException(status_code=400, detail=f"VendorProduct not found")

        v_query = await db.execute(select(Vendor).where(Vendor.vendor_code == product.product_vendor_code))
        vendor = v_query.scalar_one_or_none()
        if not vendor:
            raise HTTPException(status_code=400, detail=f"Vendor not found")

        company = product.company
        if not company:
            raise HTTPException(status_code=400, detail=f"Company not found")

        logger.info(f"Loaded: {product.product_name} / {vendor.vendor_name}")

        # PASO 2: CALCULAR MONTOS
        user_data = {
            'product_type': request.product_type, 'user_selected_amount': request.user_selected_amount,
            'bill_total_debt': request.bill_total_debt, 'bill_currency': request.bill_currency,
            'payment_type': request.payment_type
        }
        calculation = await purchase_calculator_service.calculate(
            product=product, vendor_product=vendor_product, vendor=vendor, user_data=user_data,
            exchange_rate_override=Decimal(str(request.exchange_rate)) if request.exchange_rate else None, db=db)

        # PASO 3: VALIDAR BALANCE
        if vendor_product.vp_currency == 'USD':
            balance_to_use_type, balance_currency = 'usd', 'USD'
            available_balance = Decimal(str(vendor.vendor_usd_balance or 0))
            amount_to_deduct = calculation.purchase_vendor_amount
        else:
            if calculation.purchase_vendor_currency == 'USD':
                balance_to_use_type, balance_currency = 'usd', 'USD'
                available_balance = Decimal(str(vendor.vendor_usd_balance or 0))
                rate = await exchange_rate_service.get_exchange_rate(vendor_product.vp_currency, 'USD', margin_type='conciliation', db=db)
                amount_to_deduct = calculation.purchase_vendor_amount / Decimal(str(rate))
            else:
                balance_to_use_type = 'local'
                balance_currency = vendor.vendor_local_currency
                available_balance = Decimal(str(vendor.vendor_local_balance or 0))
                amount_to_deduct = calculation.purchase_vendor_amount

        if amount_to_deduct > 0 and available_balance < amount_to_deduct:
            raise HTTPException(status_code=400, detail=f"Insufficient vendor balance. Available: {available_balance} {balance_currency}")

        # PASO 4: PROCESAR PAGO
        payment_ref = None
        payment_status = 'Pending'
        barcode = None
        barcode_image = None
        izipay_order_code = None
        izipay_form_token = None

        if request.payment_method == 'card':
            if request.payment_gateway and request.payment_transaction_id:
                # FASE 2: Pago real ya procesado por frontend
                payment_status = 'Success'
                payment_ref = request.payment_reference_number or request.payment_transaction_id
                izipay_order_code = request.payment_order_number
                logger.info(f"💳 FASE 2: Card payment by {request.payment_gateway}, ref={payment_ref}")
            else:
                # FASE 1: Pago simulado
                sim = ops_config.simulate_response('pago_tarjeta', {'amount': float(calculation.purchase_total_amount)})
                if sim.get('success'):
                    payment_status = 'Success'
                    payment_ref = sim.get('payment_ref')
                    logger.info(f"🎭 FASE 1: Card sim success, ref={payment_ref}")
                else:
                    logger.info("🎭 FASE 1: Card sim FAIL")
                    raise HTTPException(status_code=400, detail="Pago con tarjeta rechazado (simulado)")

        elif request.payment_method == 'barcode':
            if ops_config.is_fase2('pago_barcode'):
                barcode_result = barcode_service.generate_barcode(amount=calculation.purchase_total_amount)
                if barcode_result['success']:
                    barcode, barcode_image = barcode_result['barcode'], barcode_result['barcode_image']
                    payment_status = 'Pending'
                    logger.info(f"🚀 FASE 2: Barcode real: {barcode}")
                else:
                    raise HTTPException(status_code=400, detail=f"Barcode failed: {barcode_result.get('error_message')}")
            else:
                sim = ops_config.simulate_response('pago_barcode', {'amount': float(calculation.purchase_total_amount)})
                if sim.get('success'):
                    barcode, barcode_image = sim.get('barcode'), sim.get('barcode_image')
                    payment_status = 'Pending'
                    logger.info(f"🎭 FASE 1: Barcode sim: {barcode}")
                else:
                    raise HTTPException(status_code=400, detail="Barcode fallido (simulado)")

        # PASO 5: PROCESAR PROVISIÓN
        provision_ref = None
        reversal_ref = None
        vendor_trans_id = None
        vendor_provider_trans_id = None
        vendor_request_json = None
        vendor_response_json = None
        delivery_status = None
        purchase_status = 'Pending'
        requires_manual_intervention = False
        provision_op = ops_config.get_provision_operation(request.product_type)

        if payment_status == 'Success':
            if ops_config.is_fase1(provision_op):
                # FASE 1: Provisión simulada
                logger.info(f"🎭 FASE 1: Provisión sim {request.product_type}")
                try:
                    sim = ops_config.simulate_response(provision_op, {})
                    if sim.get('success'):
                        purchase_status = 'Success'
                        provision_ref = sim.get('provision_ref')
                        if request.product_type == 'smartphone':
                            delivery_status = sim.get('delivery_status', 'ordered')
                        logger.info(f"✅ Provisión sim OK: {provision_ref}")
                    else:
                        logger.warning("❌ Provisión sim FAIL - anulando")
                        rev = await _attempt_payment_reversal(request, calculation, payment_ref)
                        if rev.get('success'):
                            payment_status = 'Reversed'
                            purchase_status = 'Failed'
                            reversal_ref = rev.get('reversal_ref') or rev.get('cancel_id')
                        else:
                            payment_status = 'Success'
                            purchase_status = 'Failed'
                            requires_manual_intervention = True
                            logger.error("🚨 CRÍTICO: Provisión Y anulación sim fallaron")
                except Exception as e:
                    logger.error(f"Exception provisión sim: {e}")
                    try:
                        rev = await _attempt_payment_reversal(request, calculation, payment_ref)
                        if rev.get('success'):
                            payment_status, purchase_status = 'Reversed', 'Failed'
                            reversal_ref = rev.get('reversal_ref') or rev.get('cancel_id')
                        else:
                            payment_status, purchase_status = 'Success', 'Failed'
                            requires_manual_intervention = True
                    except:
                        payment_status, purchase_status = 'Success', 'Failed'
                        requires_manual_intervention = True
            else:
                # FASE 2: Provisión real (API Mappings)
                try:
                    vendor_service = UniversalVendorService(db)
                    provision_data = {
                        'purchase_phone_number': request.phone_number,
                        'purchase_account_number': request.account_number,
                        'purchase_vendor_amount': float(calculation.purchase_vendor_amount),
                        'purchase_vendor_currency': calculation.purchase_vendor_currency,
                        'purchase_reference': f"REF-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                        'purchase_vendpro_code': vendor_product.vp_code,
                        'purchase_vendpro_operator': vendor_product.vp_operator,
                        'purchase_vendpro_country': vendor_product.vp_country,
                        'purchase_vendpro_product_type': vendor_product.vp_product_type,
                        'purchase_vendor_skuid': vendor_product.vp_skuid,
                    }
                    logger.info(f"🚀 FASE 2: Provisión real api_group={vendor_product.api_group_code}")
                    prov_result = await vendor_service.execute_vendor_request(
                        vendor_code=vendor.vendor_code, api_group_code=vendor_product.api_group_code,
                        operation_type='provision', data=provision_data)
                    print(f"DEBUG prov_result: {prov_result}", flush=True)
                    vendor_request_json = json.dumps(prov_result.get('vendor_request', provision_data))
                    vendor_response_json = json.dumps(prov_result.get('vendor_response', {}))

                    if prov_result.get('success'):
                        ext = prov_result.get('extracted_data', {})
                        provision_ref = prov_result.get('provision_ref')
                        vendor_trans_id = ext.get('vendor_trans_id')
                        vendor_provider_trans_id = ext.get('vendor_provider_trans_id')
                        if request.product_type == 'smartphone':
                            ds = ext.get('purchase_delivery_status', 'ordered')
                            delivery_status = 'Success' if ds in ['completed','SUCCESS','success'] else ('Ordered' if ds == 'ordered' else ds)
                        purchase_status = 'Success'
                        logger.info(f"✅ Provisión real OK: {provision_ref}")
                    else:
                        logger.warning(f"❌ Provisión real FAIL: {prov_result.get('error')}")
                        rev = await _attempt_payment_reversal(request, calculation, payment_ref)
                        if rev.get('success'):
                            payment_status = 'Refunded' if rev.get('cancel_id') else 'Reversed'
                            purchase_status = 'Failed'
                            reversal_ref = rev.get('reversal_ref') or rev.get('cancel_id')
                        else:
                            payment_status, purchase_status = 'Success', 'Failed'
                            requires_manual_intervention = True
                            logger.error("🚨 CRÍTICO: Provisión real Y anulación fallaron")
                except Exception as e:
                    logger.error(f"Exception provisión real: {e}", exc_info=True)
                    try:
                        rev = await _attempt_payment_reversal(request, calculation, payment_ref)
                        if rev.get('success'):
                            payment_status = 'Refunded' if rev.get('cancel_id') else 'Reversed'
                            purchase_status = 'Failed'
                            reversal_ref = rev.get('reversal_ref') or rev.get('cancel_id')
                        else:
                            payment_status, purchase_status = 'Success', 'Failed'
                            requires_manual_intervention = True
                    except:
                        payment_status, purchase_status = 'Success', 'Failed'
                        requires_manual_intervention = True

        elif request.payment_method == 'barcode':
            purchase_status, payment_status = 'Pending', 'Pending'

        # PASO 6: ACTUALIZAR BALANCE
        vendor_initial_balance = available_balance
        vendor_final_balance = available_balance
        if purchase_status == 'Success':
            vendor_final_balance = vendor_initial_balance - amount_to_deduct
            if balance_to_use_type == 'usd':
                vendor.vendor_usd_balance = float(vendor_final_balance)
                vendor.vendor_usd_date_balance = datetime.now()
            else:
                vendor.vendor_local_balance = float(vendor_final_balance)
                vendor.vendor_local_date_balance = datetime.now()
            vendor.last_update_date = datetime.now()

        # PASO 7: GRABAR
        timestamp = datetime.now()
        reference = f"REF-{timestamp.strftime('%Y%m%d%H%M%S')}"
        purchase = Purchase(
            purchase_reference=reference, purchase_user_id=request.user_id,
            purchase_product_id=product.product_id, purchase_service_name=product.service.service_name,
            purchase_product_name=product.product_name, purchase_product_type=request.product_type,
            purchase_phone_number=request.phone_number, purchase_account_number=request.account_number,
            purchase_base_price=float(calculation.purchase_base_price),
            purchase_discount=float(calculation.purchase_discount),
            purchase_fee=float(calculation.purchase_fee),
            purchase_total_amount=float(calculation.purchase_total_amount),
            purchase_currency=calculation.purchase_currency,
            purchase_vendor_code=vendor.vendor_code,
            purchase_vendor_amount=float(calculation.purchase_vendor_amount),
            purchase_vendor_currency=calculation.purchase_vendor_currency,
            purchase_exch_rate=float(calculation.purchase_exch_rate) if calculation.purchase_exch_rate else None,
            purchase_vendpro_code=vendor_product.vp_code, purchase_vendor_skuid=vendor_product.vp_skuid,
            purchase_vendpro_country=vendor_product.vp_country, purchase_vendpro_operator=vendor_product.vp_operator,
            purchase_vendpro_product_type=request.purchase_vendpro_product_type or vendor_product.vp_product_type,
            purchase_vendpro_amount_type=request.purchase_vendpro_amount_type or vendor_product.vp_amount_type,
            purchase_vendpro_maximum_amount=float(request.purchase_vendpro_maximum_amount) if request.purchase_vendpro_maximum_amount else (float(vendor_product.vp_maximum_amount) if vendor_product.vp_maximum_amount else None),
            vendor_name=vendor.vendor_name, purchase_payment_method=request.payment_method,
            purchase_payment_status=payment_status, purchase_payment_ref=payment_ref,
            purchase_status=purchase_status, purchase_delivery_status=delivery_status,
            purchase_provision_ref=provision_ref, purchase_reversal_ref=reversal_ref,
            purchase_delivery_name=request.delivery_name, purchase_delivery_phone=request.delivery_phone,
            purchase_delivery_address=request.delivery_address,
            purchase_barcode_code=barcode, purchase_barcode_image=barcode_image,
            purchase_balance_currency=balance_currency,
            purchase_initial_balance=float(vendor_initial_balance),
            purchase_final_balance=float(vendor_final_balance),
            vendor_trans_id=vendor_trans_id, vendor_provider_trans_id=vendor_provider_trans_id,
            vendor_request=vendor_request_json, vendor_response=vendor_response_json,
            requires_manual_intervention=requires_manual_intervention,
            purchase_ip_petition=request.ip_address,
            created_by=f"user_{request.user_id}" if request.user_id else "anonymous",
            last_update_date=timestamp)

        db.add(purchase)
        await db.commit()
        await db.refresh(purchase)
        logger.info(f"Purchase saved: ID={purchase.purchase_id}, REF={reference}, status={purchase_status}")

        if request.payment_method == 'card' and izipay_order_code:
            purchase.izipay_order_code = izipay_order_code
            purchase.izipay_form_token = izipay_form_token

        return _map_purchase_to_response(purchase)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating purchase: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating purchase: {str(e)}")


# VALIDACIÓN ENDPOINTS

@router.post("/validate-phone")
async def validate_phone(product_id: int, phone_number: str, db: AsyncSession = Depends(get_db)):
    try:
        if ops_config.is_fase1('val_telefono'):
            sim = ops_config.simulate_response('val_telefono', {'phone_number': phone_number})
            return {"status": 200, "data": {"valid": sim.get('valid', False), "phone_number": phone_number, "message": sim.get('error_message', '')}, "message": "Phone validation (simulado)"}

        product = (await db.execute(select(Product).where(Product.product_id == product_id))).scalar_one_or_none()
        if not product: raise HTTPException(status_code=404, detail="Product not found")
        vp = (await db.execute(select(VendorProduct).where(and_(VendorProduct.vendor_code == product.product_vendor_code, VendorProduct.vp_code == product.product_vendpro_code, VendorProduct.vp_skuid == product.product_vendpro_skuid)))).scalar_one_or_none()
        if not vp: raise HTTPException(status_code=404, detail="VendorProduct not found")

        if vp.api_group_code:
            from app.services.universal_vendor_service import validate_vendor_phone
            result = await validate_vendor_phone(db=db, vendor_code=product.product_vendor_code, api_group_code=vp.api_group_code, phone_number=phone_number, additional_data={'vp_operator': vp.vp_operator, 'vp_country': vp.vp_country, 'vp_code': vp.vp_code})

            # Si el vendor no tiene mapping de validación → ejecutar validación local de prefijos
            if result.get('message') == 'Validation not required by vendor':
                from app.services.phone_validation_service import validate_phone_local
                local_result = validate_phone_local(
                    phone_number=phone_number,
                    country=vp.vp_country or '',
                    operator=vp.vp_operator or ''
                )
                return {"status": 200, "data": {"valid": local_result.get('valid', False), "phone_number": phone_number, "message": local_result.get('message', '')}, "message": "Phone validation via local rules"}

            return {"status": 200, "data": {"valid": result.get('valid', False), "phone_number": phone_number, "message": result.get('message', '')}, "message": "Phone validation via API mapping"}
        else:
            sim = ops_config.simulate_response('val_telefono', {'phone_number': phone_number})
            return {"status": 200, "data": {"valid": sim.get('valid', True), "phone_number": phone_number}, "message": "Phone validation (fase2 sin mapping)"}
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Error validate_phone: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


@router.post("/validate-account")
async def validate_account(product_id: int, account_number: str, db: AsyncSession = Depends(get_db)):
    try:
        if ops_config.is_fase1('val_cuenta'):
            sim = ops_config.simulate_response('val_cuenta', {'account_number': account_number})
            is_valid = sim.get('valid', False)
            return {"status": 200 if is_valid else 400, "data": {"valid": is_valid, "account_number": account_number, "monto_base": sim.get('monto_base', 0.0), "indicador": sim.get('indicador', 'T'), "account_holder": sim.get('account_holder', '')}, "message": "Account validation (simulado)"}

        product = (await db.execute(select(Product).where(Product.product_id == product_id))).scalar_one_or_none()
        if not product: raise HTTPException(status_code=404, detail="Product not found")
        vp = (await db.execute(select(VendorProduct).where(and_(VendorProduct.vendor_code == product.product_vendor_code, VendorProduct.vp_code == product.product_vendpro_code, VendorProduct.vp_skuid == product.product_vendpro_skuid)))).scalar_one_or_none()
        if not vp: raise HTTPException(status_code=404, detail="VendorProduct not found")

        if vp.api_group_code:
            vs = UniversalVendorService(db)
            result = await vs.execute_vendor_request(vendor_code=product.product_vendor_code, api_group_code=vp.api_group_code, operation_type='validation', data={'purchase_account_number': account_number, 'vp_operator': vp.vp_operator, 'vp_country': vp.vp_country, 'vp_code': vp.vp_code})
            is_valid = result.get('status') == 'success'
            return {"status": 200 if is_valid else 400, "data": {"valid": is_valid, "account_number": account_number, "monto_base": result.get('monto_base', 0.0), "indicador": result.get('indicador', 'T'), "account_holder": result.get('account_holder', '')}, "message": "Account validation via API mapping"}
        else:
            sim = ops_config.simulate_response('val_cuenta', {'account_number': account_number})
            return {"status": 200, "data": {"valid": True, "account_number": account_number, "monto_base": sim.get('monto_base', 85.50), "indicador": sim.get('indicador', 'T'), "account_holder": sim.get('account_holder', '')}, "message": "Account validation (fase2 sin mapping)"}
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Error validate_account: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


@router.post("/check-balance")
async def check_balance(product_id: int, product_type: Optional[str] = None,
                        user_selected_amount: Optional[float] = None,
                        bill_total_debt: Optional[float] = None, bill_currency: Optional[str] = None,
                        payment_type: Optional[str] = None, exchange_rate: Optional[float] = None,
                        db: AsyncSession = Depends(get_db)):
    """
    Verifica si el vendor tiene balance suficiente para ejecutar la venta.
    Debe llamarse antes de pasar al paso de selección de método de pago.
    Usa vendor_usd_balance o vendor_local_balance según la moneda del vendor_product.
    """
    try:
        product = (await db.execute(
            select(Product).where(Product.product_id == product_id)
        )).scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=400, detail="Producto no encontrado")

        vendor_product = (await db.execute(
            select(VendorProduct).where(and_(
                VendorProduct.vendor_code == product.product_vendor_code,
                VendorProduct.vp_code == product.product_vendpro_code,
                VendorProduct.vp_skuid == product.product_vendpro_skuid
            ))
        )).scalar_one_or_none()
        if not vendor_product:
            raise HTTPException(status_code=400, detail="VendorProduct no encontrado")

        vendor = (await db.execute(
            select(Vendor).where(Vendor.vendor_code == product.product_vendor_code)
        )).scalar_one_or_none()
        if not vendor:
            raise HTTPException(status_code=400, detail="Vendor no encontrado")

        # Calcular montos (misma lógica que create)
        user_data = {
            'product_type': product_type or product.product_vendpro_product_type or 'topup',
            'user_selected_amount': user_selected_amount,
            'bill_total_debt': bill_total_debt,
            'bill_currency': bill_currency,
            'payment_type': payment_type or 'full',
        }
        calculation = await purchase_calculator_service.calculate(
            product=product, vendor_product=vendor_product, vendor=vendor,
            user_data=user_data,
            exchange_rate_override=Decimal(str(exchange_rate)) if exchange_rate else None,
            db=db
        )

        # Validar balance según moneda del vendor_product (misma lógica que create)
        if vendor_product.vp_currency == 'USD':
            balance_currency = 'USD'
            available_balance = Decimal(str(vendor.vendor_usd_balance or 0))
            amount_to_deduct = calculation.purchase_vendor_amount
        else:
            if calculation.purchase_vendor_currency == 'USD':
                balance_currency = 'USD'
                available_balance = Decimal(str(vendor.vendor_usd_balance or 0))
                rate = await exchange_rate_service.get_exchange_rate(
                    vendor_product.vp_currency, 'USD', margin_type='conciliation', db=db)
                amount_to_deduct = calculation.purchase_vendor_amount / Decimal(str(rate))
            else:
                balance_currency = vendor.vendor_local_currency
                available_balance = Decimal(str(vendor.vendor_local_balance or 0))
                amount_to_deduct = calculation.purchase_vendor_amount

        if amount_to_deduct > 0 and available_balance < amount_to_deduct:
            raise HTTPException(
                status_code=400,
                detail=f"Lo sentimos, este producto no está disponible en este momento. (Balance insuficiente)"
            )

        return {"ok": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error check_balance: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error verificando disponibilidad: {str(e)}")


# ✅ ENDPOINT MEJORADO: GET /{purchase_id} con verificación de ownership
@router.get("/{purchase_id}", response_model=PurchaseResponse)
async def get_purchase(
    purchase_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Obtiene una compra por su ID.
    
    - Usuario autenticado: solo puede ver sus propias compras
    - Admin/Superadmin: puede ver cualquier compra
    - Usuario anónimo: NO puede ver compras
    """
    result = await db.execute(select(Purchase).where(Purchase.purchase_id == purchase_id))
    purchase = result.scalar_one_or_none()
    
    if not purchase:
        raise HTTPException(status_code=404, detail=f"Purchase {purchase_id} not found")
    
    # ✅ Verificar ownership
    if current_user:
        await verify_ownership(purchase.purchase_user_id, current_user, "compra")
    else:
        # Usuario no autenticado: no puede ver compras
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe iniciar sesión para ver el detalle de una compra"
        )
    
    return _map_purchase_to_response(purchase)


# ✅ ENDPOINT MEJORADO: GET / con restricción de filtro user_id
@router.get("/", response_model=list[PurchaseResponse])
async def list_purchases(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    purchase_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Lista compras con filtros.
    
    - Admin/Superadmin: puede listar todas las compras y filtrar por cualquier user_id
    - Usuario autenticado NO admin: solo puede listar sus propias compras (ignora user_id si lo envía)
    - Usuario anónimo: no puede listar compras
    """
    # ✅ Usuario no autenticado no puede listar compras
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe iniciar sesión para ver el historial de compras"
        )
    
    query = select(Purchase)
    
    # ✅ Admin puede ver todo y filtrar por cualquier user_id
    if current_user.user_role in ["admin", "superadmin"]:
        if user_id:
            query = query.where(Purchase.purchase_user_id == user_id)
    else:
        # ✅ Usuario normal solo puede ver sus propias compras
        query = query.where(Purchase.purchase_user_id == current_user.user_id)
        # Si intentó filtrar por otro user_id, lo logueamos como intento sospechoso
        if user_id and user_id != current_user.user_id:
            logger.warning(f"Intento de acceso no autorizado: Usuario {current_user.user_id} intentó filtrar compras de usuario {user_id}")
    
    if purchase_status:
        query = query.where(Purchase.purchase_status == purchase_status)
    
    query = query.offset(skip).limit(limit).order_by(Purchase.purchase_date.desc())
    result = await db.execute(query)
    return [_map_purchase_to_response(p) for p in result.scalars().all()]
