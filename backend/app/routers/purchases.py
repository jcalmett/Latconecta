"""
Purchases Router - REFACTORIZADO
Backend calcula todos los montos y procesa las compras

CAMBIO PRINCIPAL:
- Frontend envía REQUEST mínimo (product_id, user_data, payment_method)
- Backend calcula, valida, procesa y graba
- Frontend recibe RESPONSE completo
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

logger = logging.getLogger(__name__)

router = APIRouter()


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
    purchase_vendpro_product_type: Optional[str] = None
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

        # Cargar vendor_product
        if not product.product_vendpro_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {request.product_id} has no vendor_product associated"
            )

        vendor_product_query = await db.execute(
            select(VendorProduct)
            .where(
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
                detail=f"VendorProduct not found for product {request.product_id}"
            )

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

        # Cargar company (solo para referencia, NO para balance)
        company = product.company
        if not company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Company not found for product {request.product_id}"
            )

        logger.info(
            f"Loaded: Product={product.product_name}, "
            f"VendorProduct={vendor_product.vp_code}, "
            f"Vendor={vendor.vendor_name}"
        )

        # ==================== PASO 2: CALCULAR MONTOS ====================

        user_data = {
            'product_type': request.product_type,
            'user_selected_amount': request.user_selected_amount,
            'bill_total_debt': request.bill_total_debt,
            'bill_currency': request.bill_currency,
            'payment_type': request.payment_type
        }

        # ✅ NUEVO: Pasar exchange_rate_override si el frontend lo envió
        exchange_rate_override = None
        if request.exchange_rate:
            exchange_rate_override = Decimal(str(request.exchange_rate))
            logger.info(f"Using exchange rate from frontend: {exchange_rate_override}")

        calculation = await purchase_calculator_service.calculate(
            product=product,
            vendor_product=vendor_product,
            vendor=vendor,
            user_data=user_data,
            exchange_rate_override=exchange_rate_override,  # ✅ NUEVO
            db=db
        )

        logger.info(
            f"Calculated: Total={calculation.purchase_total_amount} {calculation.purchase_currency}, "
            f"Vendor={calculation.purchase_vendor_amount} {calculation.purchase_vendor_currency}, "
            f"Margin={calculation.margin_type}"
        )

        # ==================== PASO 3: VALIDAR BALANCE ====================

        # ✅ NUEVO: Determinar qué balance usar y cuánto descontar
        balance_to_use_type = None  # 'usd' o 'local'
        balance_currency = None
        available_balance = Decimal('0')
        amount_to_deduct = Decimal('0')

        # Determinar según moneda del vendor_product
        if vendor_product.vp_currency == 'USD':
            # Vendor cobra en USD → usar balance USD
            balance_to_use_type = 'usd'
            balance_currency = 'USD'
            available_balance = Decimal(str(vendor.vendor_usd_balance or 0))
            amount_to_deduct = calculation.purchase_vendor_amount

            logger.info(f"Using USD balance: {available_balance} USD")

        else:
            # Vendor cobra en moneda local
            if calculation.purchase_vendor_currency == 'USD':
                # Caso b) y 3): Vendor local vendido en USD → descontar de USD con TC
                balance_to_use_type = 'usd'
                balance_currency = 'USD'
                available_balance = Decimal(str(vendor.vendor_usd_balance or 0))

                # Monto ya está en moneda local, convertir a USD con margen +5%
                # purchase_vendor_amount está en moneda local del vendor
                # Necesitamos dividir entre (X + 5%) para descontar menos USD
                rate_conciliation = await exchange_rate_service.get_exchange_rate(
                    vendor_product.vp_currency,  # Moneda local del vendor
                    'USD',
                    margin_type='conciliation',  # +5% a favor Latconecta
                    db=db
                )
                amount_to_deduct = calculation.purchase_vendor_amount / Decimal(str(rate_conciliation))

                logger.info(
                    f"Using USD balance for local vendor: {available_balance} USD, "
                    f"deducting {amount_to_deduct} USD (from {calculation.purchase_vendor_amount} {vendor_product.vp_currency} "
                    f"at rate {rate_conciliation})"
                )

            else:
                # Caso c) y 2): Vendor local vendido en local → descontar de local directo
                balance_to_use_type = 'local'
                balance_currency = vendor.vendor_local_currency
                available_balance = Decimal(str(vendor.vendor_local_balance or 0))
                amount_to_deduct = calculation.purchase_vendor_amount

                logger.info(f"Using local balance: {available_balance} {balance_currency}")

        # Validar balance suficiente
        if amount_to_deduct > 0:
            if available_balance < amount_to_deduct:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient vendor balance: "
                           f"Available {available_balance} {balance_currency}, "
                           f"Required {amount_to_deduct} {balance_currency}"
                )

        # Validar datos completos
        if request.product_type in ['topup', 'transfer'] and not request.phone_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="phone_number is required for topup/transfer"
            )

        if request.product_type == 'bill_payment' and not request.account_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="account_number is required for bill_payment"
            )

        if request.product_type == 'smartphone':
            if not all([request.delivery_name, request.delivery_phone, request.delivery_address]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="delivery data is required for smartphone"
                )

        # ==================== PASO 4: PROCESAR PAGO ====================

        # ✅ USANDO MOCK API SERVICE
        payment_ref = None
        payment_status = 'Pending'
        barcode = None
        barcode_image = None

        if request.payment_method == 'card':
            # Llamar mock de tarjeta
            payment_result = mock_api_service.process_card_payment(
                amount=float(calculation.purchase_total_amount)
            )

            if payment_result['success']:
                payment_ref = payment_result['payment_ref']
                payment_status = 'Success'
                logger.info(f"✅ Payment Successful: {payment_ref}")
            else:
                payment_status = 'Failed'
                logger.error(f"❌ Payment Failed: {payment_result.get('error_message')}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Payment failed: {payment_result.get('error_message')}"
                )

        elif request.payment_method == 'barcode':
            # Llamar mock de barcode
            barcode_result = mock_api_service.generate_barcode(
                amount=float(calculation.purchase_total_amount)
            )

            if barcode_result['success']:
                barcode = barcode_result['barcode']
                barcode_image = barcode_result['barcode_image']
                payment_status = 'Pending'
                logger.info(f"✅ Barcode generated: {barcode}")
            else:
                logger.error(f"❌ Barcode failed: {barcode_result.get('error_message')}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Barcode generation failed: {barcode_result.get('error_message')}"
                )

        # Generar referencia única (necesaria para vendor service)
        timestamp = datetime.now()
        reference = f"REF-{timestamp.strftime('%Y%m%d%H%M%S')}"

        # ==================== PASO 5: PROCESAR PROVISIÓN ====================

        # ✅ USANDO UNIVERSAL VENDOR SERVICE (con vendor simulado o real)
        provision_ref = None
        delivery_status = 'Pending'
        reversal_ref = None
        requires_manual_intervention = False
        vendor_trans_id = None
        vendor_provider_trans_id = None
        vendor_request_json = None
        vendor_response_json = None

        if payment_status == 'Success':
            # Solo provisionar si pago fue exitoso
            
            # Verificar que vendor_product tenga api_group_code
            if not vendor_product.api_group_code:
                logger.error(f"❌ VendorProduct {vendor_product.vp_code} no tiene api_group_code")
                delivery_status = 'Failed'
                requires_manual_intervention = True
            else:
                try:
                    # Crear servicio universal
                    vendor_service = UniversalVendorService(db)

                    # Preparar datos para el vendor
                    provision_data = {
                        'purchase_phone_number': request.phone_number,
                        'purchase_account_number': request.account_number,
                        'purchase_vendor_amount': float(calculation.purchase_vendor_amount),
                        'purchase_vendor_currency': calculation.purchase_vendor_currency,
                        'purchase_reference': reference,
                        'vp_code': vendor_product.vp_code,
                        'vp_skuid': vendor_product.vp_skuid,
                        'vp_operator': vendor_product.vp_operator,
                        'vp_country': vendor_product.vp_country,
                        'vp_product_type': vendor_product.vp_product_type
                    }

                    # Ejecutar provisión con vendor (real o simulado)
                    provision_result = await vendor_service.execute_vendor_request(
                        vendor_code=vendor.vendor_code,
                        api_group_code=vendor_product.api_group_code,  # ← CLAVE
                        operation_type='provision',
                        data=provision_data
                    )

                    # Guardar request/response para auditoría
                    vendor_request_json = json.dumps(provision_data)
                    vendor_response_json = json.dumps(provision_result.get('raw_response', {}))

                    # Procesar resultado
                    if provision_result.get('status') == 'success':
                        # ✅ Provisión exitosa
                        provision_ref = provision_result.get('purchase_provision_ref') or provision_result.get('transaction_id')
                        vendor_trans_id = provision_result.get('purchase_vendor_purchase_id') or provision_result.get('transaction_id')
                        vendor_provider_trans_id = provision_result.get('vendor_provider_trans_id')
                        
                        # Normalizar delivery_status
                        delivery_status_raw = provision_result.get('purchase_delivery_status', 'Success')
                        if delivery_status_raw in ['completed', 'SUCCESS', 'success']:
                            delivery_status = 'Success'
                        elif delivery_status_raw == 'ordered':
                            delivery_status = 'Ordered'
                        else:
                            delivery_status = delivery_status_raw

                        logger.info(f"✅ Provision successful via vendor service: {provision_ref}, status={delivery_status}")

                    else:
                        # ❌ Provisión falló → Intentar reversión
                        logger.error(f"❌ Provision failed: {provision_result.get('error_message')}")
                        delivery_status = 'Failed'

                        # Intentar reversar el pago (usando mock por ahora)
                        reversal_result = mock_api_service.reverse_payment(
                            payment_ref=payment_ref,
                            amount=float(calculation.purchase_total_amount)
                        )

                        if reversal_result['success']:
                            reversal_ref = reversal_result['reversal_ref']
                            payment_status = 'Reversed'
                            logger.info(f"✅ Payment reversed: {reversal_ref}")
                        else:
                            # ⚠️ Reversión también falló → Intervención manual requerida
                            requires_manual_intervention = True
                            logger.critical(f"⚠️ REVERSAL FAILED - Manual intervention required!")
                            logger.critical(f"Payment Ref: {payment_ref}, Amount: {calculation.purchase_total_amount}")

                except Exception as e:
                    # ❌ Error inesperado en provisión
                    logger.error(f"❌ Error in vendor provision: {str(e)}", exc_info=True)
                    delivery_status = 'Failed'
                    requires_manual_intervention = True

        # ==================== PASO 5.5: CALCULAR purchase_status ====================

        # ✅ NUEVO: purchase_status basado en provisión
        if request.payment_method == 'barcode':
            purchase_status = 'Pending'
        elif delivery_status in ['Success', 'Ordered']:
            purchase_status = 'Success'
        else:
            purchase_status = 'Failed'

        logger.info(f"Purchase status determined: {purchase_status}")

        # ==================== PASO 6: ACTUALIZAR BALANCE DEL VENDOR ====================

        # ✅ CORREGIDO: Balance dual USD + Local
        vendor_initial_balance = available_balance
        vendor_final_balance = available_balance

        if purchase_status == 'Success':
            # Descontar del balance correspondiente
            vendor_final_balance = vendor_initial_balance - amount_to_deduct

            # Actualizar en BD según el tipo de balance usado
            if balance_to_use_type == 'usd':
                vendor.vendor_usd_balance = float(vendor_final_balance)
                vendor.vendor_usd_date_balance = datetime.now()
                logger.info(
                    f"Vendor USD balance updated: {vendor_initial_balance} → {vendor_final_balance} USD "
                    f"({amount_to_deduct} USD deducted)"
                )
            else:  # local
                vendor.vendor_local_balance = float(vendor_final_balance)
                vendor.vendor_local_date_balance = datetime.now()
                logger.info(
                    f"Vendor local balance updated: {vendor_initial_balance} → {vendor_final_balance} {balance_currency} "
                    f"({amount_to_deduct} {balance_currency} deducted)"
                )

            vendor.last_update_date = datetime.now()

        # ==================== PASO 7: GRABAR EN BD ====================

        # Crear registro de compra
        purchase = Purchase(
            # Referencia
            purchase_reference=reference,
            purchase_date=timestamp,

            # Producto
            purchase_product_id=product.product_id,
            purchase_service_name=product.service.service_name if product.service else None,
            purchase_product_name=product.product_name,
            purchase_product_type=request.product_type,

            # Usuario
            purchase_user_id=request.user_id,
            purchase_phone_number=request.phone_number,
            purchase_account_number=request.account_number,

            # Montos calculados
            purchase_base_price=float(calculation.purchase_base_price),
            purchase_discount=float(calculation.purchase_discount),
            purchase_fee=float(calculation.purchase_fee),
            purchase_total_amount=float(calculation.purchase_total_amount),
            purchase_currency=calculation.purchase_currency,

            # Vendor amounts
            purchase_vendor_code=vendor.vendor_code,
            purchase_vendpro_code=vendor_product.vp_code,
            purchase_vendor_skuid=vendor_product.vp_skuid,
            purchase_vendpro_country=vendor_product.vp_country,
            purchase_vendpro_operator=vendor_product.vp_operator,
            purchase_vendpro_product_type=str(vendor_product.vp_product_type) if vendor_product.vp_product_type is not None else None,
            purchase_vendor_currency=calculation.purchase_vendor_currency,
            purchase_vendor_amount=float(calculation.purchase_vendor_amount),
            purchase_exch_rate=float(calculation.purchase_exch_rate),

            # Pago
            purchase_payment_method=request.payment_method,
            purchase_payment_status=payment_status,
            purchase_payment_ref=payment_ref,

            # Provisión y Estado General
            purchase_delivery_status=delivery_status,
            purchase_status=purchase_status,  # ✅ NUEVO
            purchase_provision_ref=provision_ref,
            purchase_reversal_ref=reversal_ref,

            # Delivery (smartphones)
            purchase_delivery_name=request.delivery_name,
            purchase_delivery_phone=request.delivery_phone,
            purchase_delivery_address=request.delivery_address,

            # Barcode
            purchase_barcode_code=barcode,
            purchase_barcode_image=barcode_image,

            # Balance del VENDOR (guardamos el que se usó)
            purchase_balance_currency=balance_currency,
            purchase_initial_balance=float(vendor_initial_balance),
            purchase_final_balance=float(vendor_final_balance),

            # Vendor transactions (de universal vendor service)
            vendor_trans_id=vendor_trans_id,
            vendor_provider_trans_id=vendor_provider_trans_id,
            vendor_request=vendor_request_json,
            vendor_response=vendor_response_json,

            # Control
            requires_manual_intervention=requires_manual_intervention,
            purchase_ip_petition=request.ip_address,
            created_by=f"user_{request.user_id}" if request.user_id else "anonymous",

            # Timestamps
            last_update_date=timestamp
        )

        db.add(purchase)
        await db.commit()
        await db.refresh(purchase)

        logger.info(f"Purchase saved: ID={purchase.purchase_id}, REF={purchase.purchase_reference}")

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