"""
Purchases Router - REFACTORIZADO
Backend calcula todos los montos y procesa las compras

CAMBIO PRINCIPAL:
- Frontend envía REQUEST mínimo (product_id, user_data, payment_method)
- Backend calcula, valida, procesa y graba
- Frontend recibe RESPONSE completo

✅ ACTUALIZACIÓN: Agregados endpoints validate-phone y validate-account
✅ ACTUALIZACIÓN: NIVEL 2 usa anulación real via PaymentGatewayService
   cuando el pago fue con tarjeta y hay datos del gateway
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
import json  # ← AGREGADO para vendor_request/vendor_response

from app.database import get_db
from app.models.purchase import Purchase
from app.models.product import Product
from app.models.vendor_product import VendorProduct
from app.models.vendor import Vendor
from app.models.company import Company
from app.services.purchase_calculator_service import purchase_calculator_service
from app.services.exchange_rate_service import exchange_rate_service
from app.services.mock_api_service import mock_api_service
from app.services.universal_vendor_service import UniversalVendorService  # ← AGREGADO para vendor simulator
from app.barcode import barcode_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ==================== HELPER: ANULACIÓN DE PAGO ====================

async def _attempt_payment_reversal(
    request: 'PurchaseCreateRequest',
    calculation,
    payment_ref: str
) -> Dict[str, Any]:
    """
    Intenta revertir/anular un pago cuando la provisión falla.

    Lógica:
    - Si payment_method='card' Y hay datos reales del gateway (payment_gateway, unique_id):
        → Verificar mock config ANULACION_GATEWAY
        → Si 'success': llamar al gateway real (IZIPAY/Conekta/Stripe)
        → Si 'error': simular fallo (controlado desde MockControlPanel)
    - En cualquier otro caso:
        → mock_api_service.reverse_payment() (NIVEL 1 / sin datos de gateway)

    Returns:
        dict con:
        {
            'success': bool,
            'reversal_ref': str | None,
            'cancel_id': str | None,
            'message': str
        }
    """
    has_gateway_data = (
        request.payment_method == 'card'
        and request.payment_gateway
        and request.payment_transaction_id
        and getattr(request, 'payment_transaction_uuid', None)  # uniqueId de IZIPAY
        and getattr(request, 'payment_code_auth', None)         # authorizationCode
    )

    if has_gateway_data:
        # ==================== ANULACIÓN REAL VIA GATEWAY (NIVEL 2) ====================
        logger.info(
            f"🔄 NIVEL 2: Attempting real gateway cancel via {request.payment_gateway}"
        )

        # Verificar mock config
        if not mock_api_service.should_call_real_gateway_cancel():
            # MockControlPanel dice ANULACION_GATEWAY='error' → simular fallo
            logger.warning("🎭 MOCK: ANULACION_GATEWAY='error' - Simulando fallo de anulación")
            mock_result = mock_api_service.simulate_gateway_cancel_failure(
                payment_ref=payment_ref,
                amount=float(calculation.purchase_total_amount)
            )
            return {
                'success': False,
                'reversal_ref': None,
                'cancel_id': None,
                'message': mock_result.get('message', 'Anulación fallida (mock)')
            }

        # MockControlPanel dice ANULACION_GATEWAY='success' → llamar gateway real
        try:
            from app.payments.gateway import payment_gateway_service

            cancel_data = {
                'gateway': request.payment_gateway,
                'transaction_id': request.payment_transaction_id,
                'order_number': request.payment_order_number,
                'amount': str(calculation.purchase_total_amount),
                'currency': request.payment_currency or calculation.purchase_currency,
                'unique_id': request.payment_transaction_uuid,
                'authorization_code': request.payment_code_auth,
                'transaction_datetime': getattr(request, 'payment_transaction_datetime', None),
                'pay_method': request.payment_method_detail or 'CARD',
                'channel': 'ecommerce',
            }

            logger.info(f"📤 Gateway cancel request: {cancel_data}")

            result = await payment_gateway_service.cancel_transaction(
                cancel_data=cancel_data
            )

            logger.info(f"📥 Gateway cancel result: success={result.get('success')}")

            return {
                'success': result.get('success', False),
                'reversal_ref': result.get('cancel_id'),
                'cancel_id': result.get('cancel_id'),
                'authorization_code_cancel': result.get('authorization_code_cancel'),
                'message': result.get('message', ''),
                'raw_response': result.get('raw_response', {})
            }

        except Exception as e:
            logger.error(f"❌ Gateway cancel exception: {str(e)}")
            return {
                'success': False,
                'reversal_ref': None,
                'cancel_id': None,
                'message': f'Error en anulación de gateway: {str(e)}'
            }

    else:
        # ==================== REVERSIÓN MOCK (NIVEL 1) ====================
        logger.info("🎭 NIVEL 1: Using mock reverse_payment")

        mock_result = mock_api_service.reverse_payment(
            payment_ref=payment_ref,
            amount=float(calculation.purchase_total_amount)
        )

        return {
            'success': mock_result.get('success', False),
            'reversal_ref': mock_result.get('reversal_ref'),
            'cancel_id': None,
            'message': mock_result.get('error_message', '')
        }


def _map_purchase_to_response(purchase: Purchase) -> 'PurchaseResponse':
    """Mapea modelo Purchase a PurchaseResponse con TODOS los campos"""
    return PurchaseResponse(
        purchase_id=purchase.purchase_id,
        purchase_reference=purchase.purchase_reference,
        purchase_user_id=purchase.purchase_user_id,
        purchase_phone_number=purchase.purchase_phone_number,
        purchase_account_number=purchase.purchase_account_number,
        purchase_product_id=purchase.purchase_product_id,
        purchase_service_name=purchase.purchase_service_name,
        purchase_product_name=purchase.purchase_product_name,
        purchase_product_type=purchase.purchase_product_type,
        purchase_base_price=Decimal(str(purchase.purchase_base_price)),
        purchase_discount=Decimal(str(purchase.purchase_discount or 0)),
        purchase_fee=Decimal(str(purchase.purchase_fee or 0)),
        purchase_total_amount=Decimal(str(purchase.purchase_total_amount)),
        purchase_currency=purchase.purchase_currency,
        purchase_vendor_code=purchase.purchase_vendor_code,
        purchase_vendor_amount=Decimal(str(purchase.purchase_vendor_amount)) if purchase.purchase_vendor_amount else None,
        purchase_vendor_currency=purchase.purchase_vendor_currency,
        purchase_exch_rate=Decimal(str(purchase.purchase_exch_rate)) if purchase.purchase_exch_rate else None,
        purchase_vendpro_code=purchase.purchase_vendpro_code,
        purchase_vendor_skuid=purchase.purchase_vendor_skuid,
        purchase_vendpro_country=purchase.purchase_vendpro_country,
        purchase_vendpro_operator=purchase.purchase_vendpro_operator,
        purchase_vendpro_product_type=purchase.purchase_vendpro_product_type,
        purchase_vendpro_amount_type=purchase.purchase_vendpro_amount_type,
        purchase_vendpro_maximum_amount=Decimal(str(purchase.purchase_vendpro_maximum_amount)) if purchase.purchase_vendpro_maximum_amount else None,
        vendor_name=purchase.vendor_name,
        purchase_payment_method=purchase.purchase_payment_method,
        purchase_payment_status=purchase.purchase_payment_status,
        purchase_credit_card_last_digits=purchase.purchase_credit_card_last_digits,
        purchase_payment_ref=purchase.purchase_payment_ref,
        purchase_delivery_status=purchase.purchase_delivery_status,
        purchase_delivery_phone=purchase.purchase_delivery_phone,
        purchase_delivery_name=purchase.purchase_delivery_name,
        purchase_delivery_address=purchase.purchase_delivery_address,
        purchase_status=purchase.purchase_status,
        purchase_provision_ref=purchase.purchase_provision_ref,
        purchase_reversal_ref=purchase.purchase_reversal_ref,
        purchase_barcode_code=purchase.purchase_barcode_code,
        purchase_barcode_image=purchase.purchase_barcode_image,
        purchase_receip_image=purchase.purchase_receip_image,
        izipay_order_code=getattr(purchase, 'izipay_order_code', None),
        izipay_form_token=getattr(purchase, 'izipay_form_token', None),
        purchase_balance_currency=purchase.purchase_balance_currency,
        purchase_initial_balance=Decimal(str(purchase.purchase_initial_balance)) if purchase.purchase_initial_balance else None,
        purchase_final_balance=Decimal(str(purchase.purchase_final_balance)) if purchase.purchase_final_balance else None,
        vendor_trans_id=purchase.vendor_trans_id,
        vendor_provider_trans_id=purchase.vendor_provider_trans_id,
        purchase_vendor_cost=Decimal(str(purchase.purchase_vendor_cost)) if purchase.purchase_vendor_cost else None,
        purchase_vendor_json=purchase.purchase_vendor_json,
        purchase_vendor_date_petition=purchase.purchase_vendor_date_petition,
        purchase_vendor_date_response=purchase.purchase_vendor_date_response,
        purchase_vendor_response_code=purchase.purchase_vendor_response_code,
        purchase_vendor_response_description=purchase.purchase_vendor_response_description,
        purchase_vendor_purchase_id=purchase.purchase_vendor_purchase_id,
        vendor_request=purchase.vendor_request,
        vendor_response=purchase.vendor_response,
        requires_manual_intervention=purchase.requires_manual_intervention or False,
        purchase_ip_petition=purchase.purchase_ip_petition,
        purchase_date_sent_to_conciliation=purchase.purchase_date_sent_to_conciliation,
        created_by=purchase.created_by,
        updated_by=purchase.updated_by,
        purchase_date=purchase.purchase_date,
        last_update_date=purchase.last_update_date,
        company_initial_balance=Decimal(str(purchase.purchase_initial_balance)) if purchase.purchase_initial_balance else None,
        company_final_balance=Decimal(str(purchase.purchase_final_balance)) if purchase.purchase_final_balance else None,
        payment_status=purchase.purchase_payment_status,
        delivery_status=purchase.purchase_delivery_status,
        payment_ref=purchase.purchase_payment_ref,
        provision_ref=purchase.purchase_provision_ref,
        reversal_ref=purchase.purchase_reversal_ref,
        barcode=purchase.purchase_barcode_code,
        barcode_image=purchase.purchase_barcode_image,
    )



# ==================== SCHEMAS ====================

class PurchaseCreateRequest(BaseModel):
    """Request mínimo del frontend para crear compra"""

    # Identificadores
    product_id: int
    user_id: Optional[int] = None

    # Tipo de producto
    product_type: Literal['topup', 'smartphone', 'transfer', 'bill_payment', 'package']

    # Validación (común)
    phone_number: Optional[str] = None
    account_number: Optional[str] = None
    validation_data: Optional[Dict[str, Any]] = None

    # ✅ Exchange rate fijo (frontend lo envía)
    exchange_rate: Optional[float] = None

    # ✅ Montos variables
    user_selected_amount: Optional[Decimal] = None

    # ✅ NUEVO: Vendor product snapshot (pueden ser modificados por validación)
    purchase_vendpro_product_type: Optional[str] = None
    purchase_vendpro_amount_type: Optional[str] = None
    purchase_vendpro_maximum_amount: Optional[Decimal] = None



    # ✅ Bill payment
    payment_type: Optional[Literal['full', 'partial']] = 'full'
    bill_total_debt: Optional[Decimal] = None
    bill_currency: Optional[str] = None

    # ✅ Delivery (smartphones)
    delivery_name: Optional[str] = None
    delivery_phone: Optional[str] = None
    delivery_address: Optional[str] = None

    # Método de pago
    payment_method: Literal['card', 'barcode']

    # Payment Gateway Data (datos de la transacción del proveedor de pago)
    # Estos campos llegan cuando el frontend ya procesó el pago con Izipay/Stripe/etc.
    payment_gateway: Optional[str] = None                  # 'izipay', 'stripe', etc.
    payment_transaction_uuid: Optional[str] = None         # uniqueId para anulación
    payment_transaction_id: Optional[str] = None           # transactionId generado
    payment_reference_number: Optional[str] = None         # Ref del adquirente
    payment_order_number: Optional[str] = None             # orderNumber
    payment_method_detail: Optional[str] = None            # YAPE_CODE, CARD, PLIN
    payment_code_auth: Optional[str] = None                # Código autorización (codeAuth)
    payment_amount: Optional[Decimal] = None               # Monto cobrado
    payment_currency: Optional[str] = None                 # Moneda del cobro
    payment_transaction_datetime: Optional[str] = None     # ✅ NUEVO: Fecha/hora transacción para anulación

    # Metadatos
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class PurchaseResponse(BaseModel):
    """Response completo al frontend - TODOS los campos de la tabla"""

    # IDs básicos
    purchase_id: int
    purchase_reference: str
    purchase_user_id: Optional[int] = None
    purchase_phone_number: Optional[str] = None
    purchase_account_number: Optional[str] = None
    purchase_product_id: Optional[int] = None
    purchase_service_name: str
    purchase_product_name: str
    purchase_product_type: Optional[str] = None

    # Montos calculados
    purchase_base_price: Decimal
    purchase_discount: Decimal
    purchase_fee: Decimal
    purchase_total_amount: Decimal
    purchase_currency: str

    # Vendor amounts
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

    # Pago
    purchase_payment_method: str
    purchase_payment_status: str
    purchase_credit_card_last_digits: Optional[str] = None
    purchase_payment_ref: Optional[str] = None

    # Delivery
    purchase_delivery_status: Optional[str] = None
    purchase_delivery_phone: Optional[str] = None
    purchase_delivery_name: Optional[str] = None
    purchase_delivery_address: Optional[str] = None

    # Provisión y Estado General
    purchase_status: Optional[str] = None
    purchase_provision_ref: Optional[str] = None
    purchase_reversal_ref: Optional[str] = None

    # Barcode
    purchase_barcode_code: Optional[str] = None
    purchase_barcode_image: Optional[str] = None
    purchase_receip_image: Optional[str] = None

    # IZIPAY (pagos con tarjeta)
    izipay_order_code: Optional[str] = None
    izipay_form_token: Optional[str] = None

    # Balance del VENDOR
    purchase_balance_currency: Optional[str] = None
    purchase_initial_balance: Optional[Decimal] = None
    purchase_final_balance: Optional[Decimal] = None

    # Vendor técnico
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

    # Control
    requires_manual_intervention: bool = False
    purchase_ip_petition: Optional[str] = None
    purchase_date_sent_to_conciliation: Optional[datetime] = None

    # Auditoría
    created_by: str = "System"
    updated_by: str = "System"

    # Timestamps
    purchase_date: datetime
    last_update_date: datetime

    # Mensajes informativos
    info_message: Optional[str] = None
    amount_breakdown: Optional[Dict[str, Any]] = None

    # Legacy fields
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


# ==================== ENDPOINTS ====================

@router.post("/create", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase(
    request: PurchaseCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Crear nueva compra - Backend hace TODOS los cálculos

    Flujo:
    1. Cargar datos (product, vendor_product, vendor, company)
    2. Calcular montos (purchase_calculator_service)
    3. Validar (balance, datos completos)
    4. Procesar pago (mock o real)
    5. Procesar provisión (mock o real)
    6. Actualizar balance del VENDOR (USD o Local según corresponda)
    7. Grabar en BD
    8. Retornar response completo
    """

    try:
        logger.info(f"Creating purchase for product_id={request.product_id}")

        # ==================== PASO 1: CARGAR DATOS ====================

        # Cargar product con JOINs
        product_query = await db.execute(
            select(Product)
            .options(
                joinedload(Product.company),
                joinedload(Product.service)
            )
            .where(Product.product_id == request.product_id)
        )
        product = product_query.scalar_one_or_none()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {request.product_id} not found"
            )

        logger.info(f"Product loaded: {product.product_name}")

        # Cargar vendor_product
        vendor_product_query = await db.execute(
            select(VendorProduct).where(
                and_(
                    VendorProduct.vendor_code == product.product_vendor_code,
                    VendorProduct.vp_code == product.product_vendpro_code,
                    VendorProduct.vp_skuid == product.product_vendpro_skuid
                )
            )
        )
        vendor_product = vendor_product_query.scalar_one_or_none()

        if not vendor_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"VendorProduct not found for product_id={request.product_id}"
            )

        logger.info(f"VendorProduct loaded: {vendor_product.vp_code}")

        # Cargar vendor
        vendor_query = await db.execute(
            select(Vendor).where(Vendor.vendor_code == product.product_vendor_code)
        )
        vendor = vendor_query.scalar_one_or_none()

        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vendor {product.product_vendor_code} not found"
            )

        logger.info(f"Vendor loaded: {vendor.vendor_name}")

        # Cargar company
        company = product.company

        if not company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Company not found for product_id={request.product_id}"
            )

        logger.info(f"Company loaded: {company.company_name}")

        # ==================== PASO 2: CALCULAR MONTOS ====================

        user_data = {
            'product_type': request.product_type,
            'user_selected_amount': request.user_selected_amount,
            'bill_total_debt': request.bill_total_debt,
            'bill_currency': request.bill_currency,
            'payment_type': request.payment_type
        }

        calculation = await purchase_calculator_service.calculate(
            product=product,
            vendor_product=vendor_product,
            vendor=vendor,
            user_data=user_data,
            exchange_rate_override=Decimal(str(request.exchange_rate)) if request.exchange_rate else None,
            db=db
        )

        logger.info(f"Calculation done: total={calculation.purchase_total_amount}, vendor_amount={calculation.purchase_vendor_amount}")

        # ==================== PASO 3: VALIDAR BALANCE ====================

        # Determinar qué balance usar según vendor_product.vp_currency
        if vendor_product.vp_currency == 'USD':
            balance_to_use_type = 'usd'
            balance_currency = 'USD'
            available_balance = Decimal(str(vendor.vendor_usd_balance or 0))
            amount_to_deduct = calculation.purchase_vendor_amount

            logger.info(f"Using USD balance: available={available_balance}, to_deduct={amount_to_deduct}")
        else:
            if calculation.purchase_vendor_currency == 'USD':
                balance_to_use_type = 'usd'
                balance_currency = 'USD'
                available_balance = Decimal(str(vendor.vendor_usd_balance or 0))

                rate_conciliation = await exchange_rate_service.get_exchange_rate(
                    vendor_product.vp_currency,
                    'USD',
                    margin_type='conciliation',
                    db=db
                )

                amount_to_deduct = calculation.purchase_vendor_amount / Decimal(str(rate_conciliation))

                logger.info(
                    f"Using USD balance with conversion: "
                    f"vendor_amount={calculation.purchase_vendor_amount} {vendor_product.vp_currency}, "
                    f"rate={rate_conciliation}, "
                    f"to_deduct={amount_to_deduct} USD"
                )
            else:
                balance_to_use_type = 'local'
                balance_currency = vendor.vendor_local_currency
                available_balance = Decimal(str(vendor.vendor_local_balance or 0))
                amount_to_deduct = calculation.purchase_vendor_amount

                logger.info(f"Using local balance: available={available_balance} {balance_currency}, to_deduct={amount_to_deduct}")

        # Validar que haya suficiente balance
        if amount_to_deduct > 0:
            if available_balance < amount_to_deduct:
                logger.error(f"Insufficient balance: available={available_balance}, required={amount_to_deduct}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient vendor balance. Available: {available_balance} {balance_currency}, Required: {amount_to_deduct} {balance_currency}"
                )

        # ==================== PASO 4: PROCESAR PAGO ====================

        payment_ref = None
        payment_status = 'Pending'
        barcode = None
        barcode_image = None
        izipay_order_code = None
        izipay_form_token = None

        if request.payment_method == 'card':
            payment_status = 'Success'
            payment_ref = getattr(request, 'payment_reference_number', None) or getattr(request, 'payment_transaction_id', None)
            izipay_order_code = getattr(request, 'payment_order_number', None)

            logger.info(f"💳 Card payment already processed by gateway: {getattr(request, 'payment_gateway', 'unknown')}")
            logger.info(f"   Transaction UUID: {getattr(request, 'payment_transaction_uuid', 'N/A')}")
            logger.info(f"   Reference: {payment_ref}")
            logger.info(f"   Method: {getattr(request, 'payment_method_detail', 'N/A')}")

        elif request.payment_method == 'barcode':
            barcode_result = barcode_service.generate_barcode(
                amount=calculation.purchase_total_amount,
            )

            if barcode_result['success']:
                barcode = barcode_result['barcode']
                barcode_image = barcode_result['barcode_image']
                payment_status = 'Pending'
                logger.info(f"✅ Barcode generated: {barcode}")
            else:
                logger.error(f"❌ Barcode generation failed: {barcode_result.get('error_message')}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Barcode generation failed: {barcode_result.get('error_message')}"
                )

        # ==================== PASO 5: PROCESAR PROVISIÓN ====================

        provision_ref = None
        reversal_ref = None
        vendor_trans_id = None
        vendor_provider_trans_id = None
        vendor_request_json = None
        vendor_response_json = None
        delivery_status = None
        purchase_status = 'Pending'
        requires_manual_intervention = False

        if payment_status == 'Success':

            # ✅ DECISIÓN CRÍTICA: ¿Tiene api_group_code?
            if not vendor_product.api_group_code:
                # ==================== NIVEL 1: Sin APIs externas (todo mock) ====================
                logger.info(f"NIVEL 1: Using mock provision for product_type={request.product_type}")

                try:
                    provision_result = mock_api_service.provision_service(
                        product_type=request.product_type,
                        provision_data={}
                    )

                    if provision_result.get('success'):
                        purchase_status = 'Success'
                        provision_ref = provision_result.get('provision_ref')
                        if request.product_type == 'smartphone':
                            delivery_status = provision_result.get('delivery_status', 'ordered')
                        logger.info(f"Mock provision successful: {provision_ref}")
                    else:
                        # ❌ Provisión falló → Reversión MOCK (NIVEL 1)
                        logger.warning("Mock provision failed - attempting mock reversal")

                        reversal_result = mock_api_service.reverse_payment(
                            payment_ref=payment_ref,
                            amount=float(calculation.purchase_total_amount)
                        )

                        if reversal_result.get('success'):
                            payment_status = 'Reversed'
                            purchase_status = 'Failed'
                            reversal_ref = reversal_result.get('reversal_ref')
                            requires_manual_intervention = False
                            logger.info(f"Mock reversal successful: {reversal_ref}")
                        else:
                            payment_status = 'Success'
                            purchase_status = 'Failed'
                            requires_manual_intervention = True
                            logger.error("CRITICAL: Mock provision failed AND mock reversal failed")

                except Exception as e:
                    logger.error(f"Error in mock provision: {str(e)}")
                    try:
                        reversal_result = mock_api_service.reverse_payment(
                            payment_ref=payment_ref,
                            amount=float(calculation.purchase_total_amount)
                        )
                        if reversal_result.get('success'):
                            payment_status = 'Reversed'
                            purchase_status = 'Failed'
                            reversal_ref = reversal_result.get('reversal_ref')
                            requires_manual_intervention = False
                        else:
                            payment_status = 'Success'
                            purchase_status = 'Failed'
                            requires_manual_intervention = True
                    except:
                        payment_status = 'Success'
                        purchase_status = 'Failed'
                        requires_manual_intervention = True

            else:
                # ==================== NIVEL 2: Con APIs reales ====================
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

                    logger.info(f"NIVEL 2: Calling vendor provision with api_group_code={vendor_product.api_group_code}")

                    provision_result = await vendor_service.execute_vendor_request(
                        vendor_code=vendor.vendor_code,
                        api_group_code=vendor_product.api_group_code,
                        operation_type='provision',
                        data=provision_data
                    )

                    vendor_request_json = json.dumps(provision_result.get('vendor_request', provision_data))
                    vendor_response_json = json.dumps(provision_result.get('vendor_response', {}))

                    logger.info(f"Vendor provision result: success={provision_result.get('success')}")

                    if provision_result.get('success'):
                        extracted_data = provision_result.get('extracted_data', {})
                        provision_ref = provision_result.get('provision_ref')
                        vendor_trans_id = extracted_data.get('vendor_trans_id')
                        vendor_provider_trans_id = extracted_data.get('vendor_provider_trans_id')

                        if request.product_type == 'smartphone':
                            delivery_status_raw = extracted_data.get('purchase_delivery_status', 'ordered')
                            if delivery_status_raw in ['completed', 'SUCCESS', 'success']:
                                delivery_status = 'Success'
                            elif delivery_status_raw == 'ordered':
                                delivery_status = 'Ordered'
                            else:
                                delivery_status = delivery_status_raw

                        purchase_status = 'Success'
                        logger.info(f"Provision successful: ref={provision_ref}, vendor_trans_id={vendor_trans_id}")

                    else:
                        # ❌ Provisión falló → ✅ ACTUALIZADO: Usar _attempt_payment_reversal
                        logger.warning(f"NIVEL 2: Provision failed: {provision_result.get('error')}")

                        reversal_result = await _attempt_payment_reversal(
                            request=request,
                            calculation=calculation,
                            payment_ref=payment_ref
                        )

                        if reversal_result.get('success'):
                            payment_status = 'Refunded' if reversal_result.get('cancel_id') else 'Reversed'
                            purchase_status = 'Failed'
                            reversal_ref = reversal_result.get('reversal_ref') or reversal_result.get('cancel_id')
                            requires_manual_intervention = False
                            logger.info(f"Payment reversal successful: {reversal_ref}")
                        else:
                            payment_status = 'Success'  # Se quedó cobrado
                            purchase_status = 'Failed'
                            requires_manual_intervention = True
                            logger.error(
                                f"CRITICAL NIVEL 2: Provision failed AND payment reversal failed - "
                                f"manual intervention required. Reason: {reversal_result.get('message')}"
                            )

                except Exception as e:
                    logger.error(f"Error in vendor provision: {str(e)}", exc_info=True)
                    # ✅ ACTUALIZADO: Usar _attempt_payment_reversal también en excepciones
                    try:
                        reversal_result = await _attempt_payment_reversal(
                            request=request,
                            calculation=calculation,
                            payment_ref=payment_ref
                        )
                        if reversal_result.get('success'):
                            payment_status = 'Refunded' if reversal_result.get('cancel_id') else 'Reversed'
                            purchase_status = 'Failed'
                            reversal_ref = reversal_result.get('reversal_ref') or reversal_result.get('cancel_id')
                            requires_manual_intervention = False
                        else:
                            payment_status = 'Success'
                            purchase_status = 'Failed'
                            requires_manual_intervention = True
                    except:
                        payment_status = 'Success'
                        purchase_status = 'Failed'
                        requires_manual_intervention = True

        elif request.payment_method == 'barcode':
            purchase_status = 'Pending'
            payment_status = 'Pending'
            logger.info("Barcode payment - purchase status set to Pending")

        # ==================== PASO 6: ACTUALIZAR BALANCE DEL VENDOR ====================

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

            logger.info(
                f"Vendor balance updated: {vendor_initial_balance} → {vendor_final_balance} {balance_currency} "
                f"({calculation.purchase_vendor_amount} deducted)"
            )

        # ==================== PASO 7: GRABAR EN BD ====================

        timestamp = datetime.now()
        reference = f"REF-{timestamp.strftime('%Y%m%d%H%M%S')}"

        purchase = Purchase(
            purchase_reference=reference,
            purchase_user_id=request.user_id,
            purchase_product_id=product.product_id,
            purchase_service_name=product.service.service_name,
            purchase_product_name=product.product_name,
            purchase_product_type=request.product_type,
            purchase_phone_number=request.phone_number,
            purchase_account_number=request.account_number,
            purchase_base_price=float(calculation.purchase_base_price),
            purchase_discount=float(calculation.purchase_discount),
            purchase_fee=float(calculation.purchase_fee),
            purchase_total_amount=float(calculation.purchase_total_amount),
            purchase_currency=calculation.purchase_currency,
            purchase_vendor_code=vendor.vendor_code,
            purchase_vendor_amount=float(calculation.purchase_vendor_amount),
            purchase_vendor_currency=calculation.purchase_vendor_currency,
            purchase_exch_rate=float(calculation.purchase_exch_rate) if calculation.purchase_exch_rate else None,
            purchase_vendpro_code=vendor_product.vp_code,
            purchase_vendor_skuid=vendor_product.vp_skuid,
            purchase_vendpro_country=vendor_product.vp_country,
            purchase_vendpro_operator=vendor_product.vp_operator,
            purchase_vendpro_product_type=request.purchase_vendpro_product_type or vendor_product.vp_product_type,
            purchase_vendpro_amount_type=request.purchase_vendpro_amount_type or vendor_product.vp_amount_type,
            purchase_vendpro_maximum_amount=float(request.purchase_vendpro_maximum_amount) if request.purchase_vendpro_maximum_amount else (float(vendor_product.vp_maximum_amount) if vendor_product.vp_maximum_amount else None),
            vendor_name=vendor.vendor_name,
            purchase_payment_method=request.payment_method,
            purchase_payment_status=payment_status,
            purchase_payment_ref=payment_ref,
            purchase_status=purchase_status,
            purchase_delivery_status=delivery_status,
            purchase_provision_ref=provision_ref,
            purchase_reversal_ref=reversal_ref,
            purchase_delivery_name=request.delivery_name,
            purchase_delivery_phone=request.delivery_phone,
            purchase_delivery_address=request.delivery_address,
            purchase_barcode_code=barcode,
            purchase_barcode_image=barcode_image,
            purchase_balance_currency=balance_currency,
            purchase_initial_balance=float(vendor_initial_balance),
            purchase_final_balance=float(vendor_final_balance),
            vendor_trans_id=vendor_trans_id,
            vendor_provider_trans_id=vendor_provider_trans_id,
            vendor_request=vendor_request_json,
            vendor_response=vendor_response_json,
            requires_manual_intervention=requires_manual_intervention,
            purchase_ip_petition=request.ip_address,
            created_by=f"user_{request.user_id}" if request.user_id else "anonymous",
            last_update_date=timestamp
        )

        db.add(purchase)
        await db.commit()
        await db.refresh(purchase)

        logger.info(f"Purchase saved: ID={purchase.purchase_id}, REF={purchase.purchase_reference}")

        # ==================== PASO 7.5: AGREGAR DATOS IZIPAY (temporales) ====================
        if request.payment_method == 'card' and izipay_order_code:
            purchase.izipay_order_code = izipay_order_code
            purchase.izipay_form_token = izipay_form_token
            logger.info(f"🔑 IZIPAY data added to response: order={izipay_order_code}")

        # ==================== PASO 8: RETORNAR RESPONSE ====================

        return _map_purchase_to_response(purchase)

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error creating purchase: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating purchase: {str(e)}"
        )


# ==================== ✅ NUEVOS ENDPOINTS DE VALIDACIÓN ====================

@router.post("/validate-phone")
async def validate_phone(
    product_id: int,
    phone_number: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Valida teléfono usando API Mappings si están disponibles.

    NO crea registro en BD, solo retorna si es válido o no.
    Solo registra en logs (vendor_simulator.log, app.log)
    """
    try:
        logger.info(f"Validating phone: {phone_number} for product_id: {product_id}")

        product_result = await db.execute(
            select(Product).where(Product.product_id == product_id)
        )
        product = product_result.scalar_one_or_none()

        if not product:
            logger.error(f"Product {product_id} not found")
            raise HTTPException(status_code=404, detail="Product not found")

        vendor_product_result = await db.execute(
            select(VendorProduct).where(
                and_(
                    VendorProduct.vendor_code == product.product_vendor_code,
                    VendorProduct.vp_code == product.product_vendpro_code,
                    VendorProduct.vp_skuid == product.product_vendpro_skuid
                )
            )
        )
        vendor_product = vendor_product_result.scalar_one_or_none()

        if not vendor_product:
            logger.error(f"VendorProduct not found for product {product_id}")
            raise HTTPException(status_code=404, detail="VendorProduct not found")

        if vendor_product.api_group_code:
            logger.info(f"Using API mapping for validation: api_group_code={vendor_product.api_group_code}")

            from app.services.universal_vendor_service import validate_vendor_phone

            result = await validate_vendor_phone(
                db=db,
                vendor_code=product.product_vendor_code,
                api_group_code=vendor_product.api_group_code,
                phone_number=phone_number,
                additional_data={
                    'vp_operator': vendor_product.vp_operator,
                    'vp_country': vendor_product.vp_country,
                    'vp_code': vendor_product.vp_code
                }
            )

            is_valid = result.get('valid', False)

            logger.info(f"Validation result via mapping: valid={is_valid}, result={result}")

            return {
                "status": 200,
                "data": {
                    "valid": is_valid,
                    "phone_number": phone_number,
                    "message": result.get('message', '')
                },
                "message": "Phone validation completed via API mapping"
            }
        else:
            logger.warning(f"No API mapping for product {product_id}, using mock validation")

            mock_result = mock_api_service.validate_phone(phone_number)

            return {
                "status": 200,
                "data": {
                    "valid": mock_result.get('valid', False),
                    "phone_number": phone_number
                },
                "message": "Phone validation completed (mock)"
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in validate_phone: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


@router.post("/validate-account")
async def validate_account(
    product_id: int,
    account_number: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Valida cuenta para bill_payment usando API Mappings si están disponibles.

    NO crea registro en BD, solo retorna si es válida o no.
    Solo registra en logs (vendor_simulator.log, app.log)
    """
    try:
        logger.info(f"Validating account: {account_number} for product_id: {product_id}")

        product_result = await db.execute(
            select(Product).where(Product.product_id == product_id)
        )
        product = product_result.scalar_one_or_none()

        if not product:
            logger.error(f"Product {product_id} not found")
            raise HTTPException(status_code=404, detail="Product not found")

        vendor_product_result = await db.execute(
            select(VendorProduct).where(
                and_(
                    VendorProduct.vendor_code == product.product_vendor_code,
                    VendorProduct.vp_code == product.product_vendpro_code,
                    VendorProduct.vp_skuid == product.product_vendpro_skuid
                )
            )
        )
        vendor_product = vendor_product_result.scalar_one_or_none()

        if not vendor_product:
            logger.error(f"VendorProduct not found for product {product_id}")
            raise HTTPException(status_code=404, detail="VendorProduct not found")

        if vendor_product.api_group_code:
            logger.info(f"Using API mapping for account validation: api_group_code={vendor_product.api_group_code}")

            vendor_service = UniversalVendorService(db)

            validation_data = {
                'purchase_account_number': account_number,
                'vp_operator': vendor_product.vp_operator,
                'vp_country': vendor_product.vp_country,
                'vp_code': vendor_product.vp_code
            }

            result = await vendor_service.execute_vendor_request(
                vendor_code=product.product_vendor_code,
                api_group_code=vendor_product.api_group_code,
                operation_type='validation',
                data=validation_data
            )

            is_valid = result.get('status') == 'success'

            monto_base = result.get('monto_base', 0.0)
            indicador = result.get('indicador', 'T')
            account_holder = result.get('account_holder', '')

            logger.info(f"Account validation result via mapping: valid={is_valid}, monto_base={monto_base}")

            return {
                "status": 200 if is_valid else 400,
                "data": {
                    "valid": is_valid,
                    "account_number": account_number,
                    "monto_base": monto_base,
                    "indicador": indicador,
                    "account_holder": account_holder
                },
                "message": "Account validation completed via API mapping"
            }
        else:
            logger.warning(f"No API mapping for product {product_id}, using mock validation")

            mock_result = mock_api_service.validate_account(account_number)

            return {
                "status": 200 if mock_result.get('valid') else 400,
                "data": {
                    "valid": mock_result.get('valid', False),
                    "account_number": account_number,
                    "monto_base": mock_result.get('monto_base', 0.0),
                    "indicador": mock_result.get('indicador', 'T'),
                    "account_holder": mock_result.get('account_holder', '')
                },
                "message": "Account validation completed (mock)"
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in validate_account: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


# ==================== ENDPOINTS ADICIONALES (mantener existentes) ====================

@router.get("/{purchase_id}", response_model=PurchaseResponse)
async def get_purchase(
    purchase_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtener compra por ID"""

    result = await db.execute(
        select(Purchase).where(Purchase.purchase_id == purchase_id)
    )
    purchase = result.scalar_one_or_none()

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase {purchase_id} not found"
        )

    return _map_purchase_to_response(purchase)


@router.get("/", response_model=list[PurchaseResponse])
async def list_purchases(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    purchase_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Listar compras con paginación"""

    query = select(Purchase)

    if user_id:
        query = query.where(Purchase.purchase_user_id == user_id)

    if purchase_status:
        query = query.where(Purchase.purchase_status == purchase_status)

    query = query.offset(skip).limit(limit).order_by(Purchase.purchase_date.desc())

    result = await db.execute(query)
    purchases = result.scalars().all()

    return [_map_purchase_to_response(p) for p in purchases]