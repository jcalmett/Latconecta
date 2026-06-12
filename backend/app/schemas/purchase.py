# backend/app/schemas/purchases.py
"""
Schemas de Purchases con soporte para montos variables
Actualizado para Sistema Universal de Vendors
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


# ═══════════════════════════════════════════════════════════════
# VALIDADORES PERSONALIZADOS
# ═══════════════════════════════════════════════════════════════

class PurchaseBaseSchema(BaseModel):
    """
    Base con validadores comunes
    """

    @field_validator(
        'purchase_date_sent_to_conciliation', 
        'purchase_vendor_date_petition', 
        'purchase_vendor_date_response', 
        mode='before',
        check_fields=False  # ✅ AGREGADO: Permite validar campos que pueden no existir
    )
    def remove_timezone(cls, v):
        """Remover timezone de campos datetime antes de guardar"""
        if v is not None:
            if hasattr(v, 'tzinfo') and v.tzinfo:
                return v.replace(tzinfo=None)
        return v

    @field_validator(
        'purchase_credit_card_last_digits', 
        mode='before',
        check_fields=False  # ✅ AGREGADO: Permite validar campos que pueden no existir
    )
    def validate_credit_card_digits(cls, v):
        """
        Validar últimos 4 dígitos de tarjeta
        - Convierte "string" a None
        - Valida que sean exactamente 4 dígitos
        - Toma solo últimos 4 caracteres si hay más
        """
        if v is None or v == "string" or v == "":
            return None

        v_str = str(v).strip()

        # Si tiene más de 4 caracteres, tomar últimos 4
        if len(v_str) > 4:
            v_str = v_str[-4:]

        # Validar que sean dígitos
        if not v_str.isdigit():
            return None

        # Validar exactamente 4 dígitos
        if len(v_str) != 4:
            return None

        return v_str


# ═══════════════════════════════════════════════════════════════
# PURCHASE CREATE
# ═══════════════════════════════════════════════════════════════

class PurchaseCreate(PurchaseBaseSchema):
    """
    Schema para crear purchase

    ✅ NUEVO: Soporte para montos variables
    - user_selected_amount: Para productos con monto variable/rango
    - purchase_product_id: ID del producto (nuevo)
    """

    # ────────────────────────────────────────────────────────────
    # CAMPOS BÁSICOS (REQUERIDOS)
    # ────────────────────────────────────────────────────────────

    purchase_phone_number: str = Field(..., min_length=9, max_length=20)
    purchase_total_amount: Decimal = Field(..., ge=0)

    # ────────────────────────────────────────────────────────────
    # ✅ NUEVOS CAMPOS PARA SISTEMA UNIVERSAL
    # ────────────────────────────────────────────────────────────

    purchase_product_id: Optional[int] = Field(
        None,
        description="ID del producto (requerido para integración con vendors)"
    )

    user_selected_amount: Optional[Decimal] = Field(
        None,
        ge=0,
        description="Monto seleccionado por usuario (para productos variables/rango)"
    )

    # ────────────────────────────────────────────────────────────
    # CAMPOS OPCIONALES CON VALORES POR DEFECTO
    # ────────────────────────────────────────────────────────────

    # Identificación
    purchase_reference: Optional[str] = None
    purchase_date: Optional[datetime] = None

    # Servicio y Producto
    purchase_service_name: Optional[str] = None
    purchase_product_name: Optional[str] = None

    # Montos
    purchase_currency: Optional[str] = "PEN"
    purchase_discount: Optional[Decimal] = 0
    purchase_fee: Optional[Decimal] = 0
    purchase_vendor_currency: Optional[str] = None
    purchase_vendor_amount: Optional[Decimal] = None

    # Pago
    purchase_payment_method: Optional[str] = None
    purchase_payment_status: Optional[str] = "Pending"
    purchase_payment_ref: Optional[str] = None
    purchase_credit_card_last_digits: Optional[str] = None

    # Código de barras
    purchase_barcode_code: Optional[str] = None
    purchase_barcode_image: Optional[str] = None

    # Entrega
    purchase_delivery_status: Optional[str] = "Pending"
    purchase_delivery_phone: Optional[str] = None
    purchase_delivery_name: Optional[str] = None
    purchase_delivery_address: Optional[str] = None
    purchase_account_number: Optional[str] = None
    purchase_provision_ref: Optional[str] = None

    # Vendor
    purchase_vendor_code: Optional[str] = None
    purchase_product_type: Optional[str] = None
    purchase_vendpro_code: Optional[str] = None
    purchase_vendor_skuid: Optional[str] = None
    purchase_vendpro_country: Optional[str] = None
    purchase_vendpro_operator: Optional[str] = None
    purchase_vendpro_product_type: Optional[str] = Field(None, max_length=1)
    purchase_vendpro_amount_type: Optional[str] = None  # u2190 NUEVO: F/R/V (Fixed/Range/Variable)
    purchase_vendpro_maximum_amount: Optional[Decimal] = None  # u2190 NUEVO: Monto maximo permitido
    purchase_vendor_json: Optional[dict] = None
    purchase_vendor_date_petition: Optional[datetime] = None
    purchase_vendor_date_response: Optional[datetime] = None
    purchase_vendor_response_code: Optional[str] = None
    purchase_vendor_response_description: Optional[str] = None
    purchase_vendor_purchase_id: Optional[str] = None
    purchase_exch_rate: Optional[Decimal] = None
    purchase_reversal_ref: Optional[str] = None

    # Balance
    purchase_balance_currency: Optional[str] = None
    purchase_initial_balance: Optional[Decimal] = None
    purchase_final_balance: Optional[Decimal] = None

    # Control
    requires_manual_intervention: Optional[bool] = False
    purchase_receip_url: Optional[str] = None
    purchase_date_sent_to_conciliation: Optional[datetime] = None

    # ────────────────────────────────────────────────────────────
    # ✅ NUEVOS CAMPOS PARA PAGOS DE RECIBOS
    # ────────────────────────────────────────────────────────────

    purchase_bill_number: Optional[str] = Field(
        None,
        description="Número de recibo para pagos"
    )

    purchase_bill_total: Optional[Decimal] = Field(
        None,
        ge=0,
        description="Monto total del recibo"
    )

    purchase_bill_paid_amount: Optional[Decimal] = Field(
        None,
        ge=0,
        description="Monto pagado del recibo (puede ser parcial)"
    )

    purchase_bill_remaining: Optional[Decimal] = Field(
        None,
        ge=0,
        description="Monto restante del recibo"
    )

    class Config:
        from_attributes = True  # ✅ ACTUALIZADO: Pydantic v2
        json_schema_extra = {
            "example": {
                "purchase_phone_number": "999888777",
                "purchase_product_id": 123,
                "user_selected_amount": 75.00,  # Para productos variables
                "purchase_total_amount": 78.75,
                "purchase_payment_method": "balance",
                "purchase_currency": "PEN"
            }
        }


# ═══════════════════════════════════════════════════════════════
# PURCHASE UPDATE
# ═══════════════════════════════════════════════════════════════

class PurchaseUpdate(PurchaseBaseSchema):
    """
    Schema para actualizar purchase
    Todos los campos opcionales
    """

    # Servicio y Producto
    purchase_service_name: Optional[str] = None
    purchase_product_name: Optional[str] = None

    # Montos
    purchase_currency: Optional[str] = None
    purchase_discount: Optional[Decimal] = None
    purchase_fee: Optional[Decimal] = None
    purchase_total_amount: Optional[Decimal] = None
    purchase_vendor_currency: Optional[str] = None
    purchase_vendor_amount: Optional[Decimal] = None

    # Pago
    purchase_payment_method: Optional[str] = None
    purchase_payment_status: Optional[str] = None
    purchase_payment_ref: Optional[str] = None
    purchase_credit_card_last_digits: Optional[str] = None

    # Entrega
    purchase_delivery_status: Optional[str] = None
    purchase_delivery_phone: Optional[str] = None
    purchase_delivery_name: Optional[str] = None
    purchase_delivery_address: Optional[str] = None
    purchase_account_number: Optional[str] = None
    purchase_provision_ref: Optional[str] = None

    # Vendor
    purchase_vendor_response_code: Optional[str] = None
    purchase_vendor_response_description: Optional[str] = None
    purchase_vendor_purchase_id: Optional[str] = None
    purchase_vendor_date_response: Optional[datetime] = None

    # Control
    requires_manual_intervention: Optional[bool] = None

    class Config:
        from_attributes = True  # ✅ ACTUALIZADO: Pydantic v2


# ═══════════════════════════════════════════════════════════════
# PURCHASE IN DB (Respuesta completa)
# ═══════════════════════════════════════════════════════════════

class PurchaseInDB(BaseModel):
    """
    Schema de purchase completo (todos los campos)
    Se usa para respuestas GET
    """

    # Identificación
    purchase_id: int
    purchase_reference: str
    purchase_user_id: Optional[int] = None
    purchase_date: datetime

    # Servicio y Producto
    purchase_phone_number: str
    purchase_service_name: Optional[str] = None
    purchase_product_name: Optional[str] = None

    # Montos
    purchase_currency: Optional[str] = None
    purchase_discount: Optional[Decimal] = None
    purchase_fee: Optional[Decimal] = None
    purchase_total_amount: Decimal
    purchase_vendor_currency: Optional[str] = None
    purchase_vendor_amount: Optional[Decimal] = None

    # Pago
    purchase_payment_method: Optional[str] = None
    purchase_payment_status: Optional[str] = None
    purchase_payment_ref: Optional[str] = None
    purchase_credit_card_last_digits: Optional[str] = None

    # Código de barras
    purchase_barcode_code: Optional[str] = None
    purchase_barcode_image: Optional[str] = None

    # Entrega
    purchase_delivery_status: Optional[str] = None
    purchase_delivery_phone: Optional[str] = None
    purchase_delivery_name: Optional[str] = None
    purchase_delivery_address: Optional[str] = None
    purchase_account_number: Optional[str] = None
    purchase_provision_ref: Optional[str] = None

    # Vendor
    purchase_vendor_code: Optional[str] = None
    purchase_product_type: Optional[str] = None
    purchase_vendpro_code: Optional[str] = None
    purchase_vendor_skuid: Optional[str] = None
    purchase_vendpro_country: Optional[str] = None
    purchase_vendpro_operator: Optional[str] = None
    purchase_vendpro_product_type: Optional[str] = Field(None, max_length=1)
    purchase_vendpro_amount_type: Optional[str] = None  # u2190 NUEVO: F/R/V (Fixed/Range/Variable)
    purchase_vendpro_maximum_amount: Optional[Decimal] = None  # u2190 NUEVO: Monto maximo permitido
    purchase_vendor_json: Optional[dict] = None
    purchase_vendor_date_petition: Optional[datetime] = None
    purchase_vendor_date_response: Optional[datetime] = None
    purchase_vendor_response_code: Optional[str] = None
    purchase_vendor_response_description: Optional[str] = None
    purchase_vendor_purchase_id: Optional[str] = None
    purchase_ip_petition: Optional[str] = None
    purchase_exch_rate: Optional[Decimal] = None
    purchase_reversal_ref: Optional[str] = None

    # Balance
    purchase_balance_currency: Optional[str] = None
    purchase_initial_balance: Optional[Decimal] = None
    purchase_final_balance: Optional[Decimal] = None

    # Control y Auditoría
    requires_manual_intervention: Optional[bool] = None
    purchase_receip_url: Optional[str] = None
    purchase_date_sent_to_conciliation: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_update_date: Optional[datetime] = None

    # Recibos
    purchase_bill_number: Optional[str] = None
    purchase_bill_total: Optional[Decimal] = None
    purchase_bill_paid_amount: Optional[Decimal] = None
    purchase_bill_remaining: Optional[Decimal] = None

    class Config:
        from_attributes = True  # ✅ ACTUALIZADO: Pydantic v2


# ═══════════════════════════════════════════════════════════════
# PURCHASE LIST RESPONSE (Lista resumida)
# ═══════════════════════════════════════════════════════════════

class PurchaseListResponse(BaseModel):
    """
    Schema resumido para listar purchases
    Solo campos relevantes para la tabla
    """

    purchase_id: int
    purchase_reference: str
    purchase_date: datetime
    purchase_phone_number: str
    purchase_service_name: Optional[str] = None
    purchase_product_name: Optional[str] = None
    purchase_total_amount: Decimal
    purchase_currency: Optional[str] = None
    purchase_payment_status: Optional[str] = None
    purchase_delivery_status: Optional[str] = None
    requires_manual_intervention: Optional[bool] = None
    purchase_user_id: Optional[int] = None

    class Config:
        from_attributes = True  # ✅ ACTUALIZADO: Pydantic v2


# ═══════════════════════════════════════════════════════════════
# PURCHASE STATS RESPONSE
# ═══════════════════════════════════════════════════════════════

class AmountByCurrency(BaseModel):
    currency: str
    amount: float


class PurchaseStatsResponse(BaseModel):
    """
    Schema para estadísticas de purchases
    """
    total_purchases: int
    registered_purchases: int
    anonymous_purchases: int
    total_amounts: list[AmountByCurrency]

    class Config:
        from_attributes = True  # ✅ ACTUALIZADO: Pydantic v2