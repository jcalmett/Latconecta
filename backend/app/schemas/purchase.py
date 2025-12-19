"""
Schemas para Purchase
SINCRONIZADO: Solo campos que existen en la tabla purchases
MODIFICADO: purchase_user_id ahora es Optional para permitir compras anónimas
✅ FASE 2: Agregados purchase_vendor_cost y purchase_status
"""

from pydantic import BaseModel, validator, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


# ==========================================
# BASE SCHEMA
# ==========================================

class PurchaseBase(BaseModel):
    """
    Schema base con campos comunes
    """
    # ✅ MODIFICADO: Ahora es Optional
    purchase_user_id: Optional[int] = Field(None, description="ID del usuario (NULL = compra anónima)")

    purchase_phone_number: str = Field(..., description="Teléfono del destinatario o comprador")
    purchase_product_id: int
    purchase_service_name: Optional[str] = None
    purchase_product_name: Optional[str] = None
    purchase_base_price: Decimal
    purchase_discount: Optional[Decimal] = 0
    purchase_fee: Optional[Decimal] = 0
    purchase_total_amount: Decimal
    purchase_currency: Optional[str] = 'PEN'
    purchase_payment_method: str
    purchase_payment_status: Optional[str] = None
    purchase_delivery_status: Optional[str] = None
    purchase_delivery_name: Optional[str] = None
    purchase_delivery_phone: Optional[str] = None
    purchase_delivery_address: Optional[str] = None
    purchase_product_type: Optional[str] = None
    purchase_account_number: Optional[str] = None
   # CAMPOS VENDPRO
    purchase_vendpro_code: Optional[str] = Field(None, max_length=50)
    purchase_vendpro_country: Optional[str] = Field(None, max_length=50)
    purchase_vendpro_operator: Optional[str] = Field(None, max_length=50)
    purchase_vendpro_product_type: Optional[str] = Field(None, max_length=20)

# ==========================================
# CREATE SCHEMA
# ==========================================

class PurchaseCreate(PurchaseBase):
    """
    Schema para crear purchase
    Campos obligatorios mínimos para transacción
    """
    purchase_reference: str

    # Campos de pago
    purchase_credit_card_last_digits: Optional[str] = None
    purchase_payment_ref: Optional[str] = None
    purchase_provision_ref: Optional[str] = None
    purchase_reversal_ref: Optional[str] = None

    # Campos de barcode
    purchase_barcode_code: Optional[str] = None
    purchase_barcode_image: Optional[str] = None

    # Campos de recibo
    purchase_receip_image: Optional[str] = None

    # Vendor (campos originales)
    purchase_vendor_code: Optional[str] = None
    purchase_vendor_amount: Optional[Decimal] = None
    purchase_vendor_cost: Optional[Decimal] = None  # ✅✅✅ NUEVO - FASE 2

    # Balance
    purchase_balance_currency: Optional[str] = None
    purchase_initial_balance: Optional[Decimal] = None
    purchase_final_balance: Optional[Decimal] = None

    # Auditoría
    purchase_ip_petition: Optional[str] = None
    purchase_date_sent_to_conciliation: Optional[datetime] = None

    # Vendor LATCOM
    purchase_vendor_json: Optional[str] = None
    purchase_vendor_date_petition: Optional[datetime] = None
    purchase_vendor_date_response: Optional[datetime] = None
    purchase_vendor_response_code: Optional[str] = None
    purchase_vendor_response_description: Optional[str] = None
    purchase_vendor_purchase_id: Optional[str] = None
    purchase_vendor_skuid: Optional[str] = None
    purchase_vendor_currency: Optional[str] = None
    purchase_exch_rate: Optional[Decimal] = None

    # Flag crítico
    requires_manual_intervention: Optional[bool] = False
    
    # Estado de transacción
    purchase_status: Optional[str] = 'Pending'  # ✅✅✅ NUEVO - FASE 2

    # Control
    created_by: Optional[str] = 'system'

    @validator('purchase_phone_number')
    def validate_phone_number(cls, v):
        """
        Validar que el teléfono sea obligatorio
        Es el único dato que siempre necesitamos (destino de la recarga)
        """
        if not v or len(v) < 9:
            raise ValueError('Teléfono es obligatorio y debe tener al menos 9 dígitos')
        return v

    @validator('purchase_total_amount')
    def validate_total_amount(cls, v):
        """Validar que el monto sea positivo"""
        if v <= 0:
            raise ValueError('El monto total debe ser mayor a cero')
        return v

    @validator('created_by', always=True)
    def set_created_by(cls, v, values):
        """
        Establecer created_by basado en si hay usuario o no
        """
        if values.get('purchase_user_id'):
            # Si hay usuario, se debe establecer su email externamente
            return v
        else:
            # Compra anónima
            return 'anonymous'

    # ✅✅✅ AGREGAR ESTE VALIDATOR NUEVO ✅✅✅
    @validator('purchase_credit_card_last_digits', pre=True)
    def validate_card_digits(cls, v):
        """Validar y truncar últimos 4 dígitos de tarjeta"""
        if v is None or v == '':
            return None
        # Convertir a string y tomar solo últimos 4 caracteres
        v_str = str(v)
        # Si es "string" (valor por defecto de Swagger), retornar None
        if v_str.lower() == 'string':
            return None
        # Truncar a máximo 4 caracteres
        return v_str[-4:] if len(v_str) > 4 else v_str

    # ✅✅✅ AGREGAR ESTE VALIDATOR AQUÍ ✅✅✅
    @validator(
        'purchase_date_sent_to_conciliation',
        'purchase_vendor_date_petition',
        'purchase_vendor_date_response',
        pre=True
    )
    def remove_timezone(cls, v):
        """Eliminar timezone de datetime para evitar conflictos con PostgreSQL"""
        if v is not None and hasattr(v, 'tzinfo') and v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v

# ==========================================
# UPDATE SCHEMA
# ==========================================

class PurchaseUpdate(BaseModel):
    """
    Schema para actualizar purchase
    Todos los campos opcionales
    """
    purchase_payment_status: Optional[str] = None
    purchase_delivery_status: Optional[str] = None
    purchase_delivery_name: Optional[str] = None
    purchase_delivery_phone: Optional[str] = None
    purchase_delivery_address: Optional[str] = None
    requires_manual_intervention: Optional[bool] = None
    purchase_status: Optional[str] = None  # ✅✅✅ NUEVO - FASE 2

    # Vendor
    purchase_vendor_response_code: Optional[str] = None
    purchase_vendor_response_description: Optional[str] = None
    purchase_vendor_json: Optional[str] = None
    purchase_vendor_date_response: Optional[datetime] = None

    # Conciliación
    purchase_date_sent_to_conciliation: Optional[datetime] = None

    # Control
    updated_by: Optional[str] = None


# ==========================================
# RESPONSE SCHEMA
# ==========================================

class PurchaseInDB(PurchaseBase):
    """
    Schema para respuestas (incluye todos los campos)
    """
    purchase_id: int
    purchase_reference: str
    purchase_date: datetime

    # Campos de pago
    purchase_credit_card_last_digits: Optional[str] = None
    purchase_payment_ref: Optional[str] = None
    purchase_provision_ref: Optional[str] = None
    purchase_reversal_ref: Optional[str] = None

    # Campos de barcode
    purchase_barcode_code: Optional[str] = None
    purchase_barcode_image: Optional[str] = None

    # Campos de recibo
    purchase_receip_image: Optional[str] = None

    # Vendor (campos originales)
    purchase_vendor_code: Optional[str] = None
    purchase_vendor_amount: Optional[Decimal] = None
    purchase_vendor_cost: Optional[Decimal] = None  # ✅✅✅ NUEVO - FASE 2

    # Balance
    purchase_balance_currency: Optional[str] = None
    purchase_initial_balance: Optional[Decimal] = None
    purchase_final_balance: Optional[Decimal] = None

    # Auditoría
    purchase_ip_petition: Optional[str] = None
    purchase_date_sent_to_conciliation: Optional[datetime] = None

    # Vendor LATCOM
    purchase_vendor_json: Optional[str] = None
    purchase_vendor_date_petition: Optional[datetime] = None
    purchase_vendor_date_response: Optional[datetime] = None
    purchase_vendor_response_code: Optional[str] = None
    purchase_vendor_response_description: Optional[str] = None
    purchase_vendor_purchase_id: Optional[str] = None
    purchase_vendor_skuid: Optional[str] = None
    purchase_vendor_currency: Optional[str] = None
    purchase_exch_rate: Optional[Decimal] = None

    # Flag crítico
    requires_manual_intervention: Optional[bool] = False
    
    # Estado de transacción
    purchase_status: Optional[str] = None  # ✅✅✅ NUEVO - FASE 2

    # Control
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    last_update_date: Optional[datetime] = None


    class Config:
        from_attributes = True


# ==========================================
# SCHEMAS ADICIONALES
# ==========================================

class PurchaseListResponse(BaseModel):
    """
    Schema simplificado para listados
    """
    purchase_id: int
    purchase_reference: str
    purchase_date: datetime
    purchase_user_id: Optional[int] = None
    purchase_phone_number: str
    purchase_product_name: Optional[str] = None
    purchase_total_amount: Decimal
    purchase_currency: str
    purchase_payment_status: Optional[str] = None
    purchase_delivery_status: Optional[str] = None
    purchase_status: Optional[str] = None  # ✅✅✅ NUEVO - FASE 2
    is_anonymous: bool = False

    class Config:
        from_attributes = True

    @validator('is_anonymous', always=True)
    def set_is_anonymous(cls, v, values):
        """Establecer si es compra anónima"""
        return values.get('purchase_user_id') is None


class PurchaseStats(BaseModel):
    """
    Estadísticas de compras
    """
    total_purchases: int
    total_amount: Decimal
    registered_purchases: int
    anonymous_purchases: int
    registered_amount: Decimal
    anonymous_amount: Decimal


class PurchaseSummary(BaseModel):
    """
    Schema simplificado para resúmenes (compatibilidad con código legacy)
    """
    purchase_id: int
    purchase_reference: str
    purchase_date: datetime
    purchase_user_id: Optional[int] = None
    purchase_phone_number: str
    purchase_product_name: Optional[str] = None
    purchase_total_amount: Decimal
    purchase_currency: str
    purchase_payment_status: Optional[str] = None
    purchase_delivery_status: Optional[str] = None
    purchase_status: Optional[str] = None  # ✅✅✅ NUEVO - FASE 2

    class Config:
        from_attributes = True


# =============================================================================
# ✅✅✅ CAMBIOS REALIZADOS EN FASE 2:
# =============================================================================
# LÍNEA 79:  Agregado purchase_vendor_cost en PurchaseCreate
# LÍNEA 108: Agregado purchase_status en PurchaseCreate (default 'Pending')
# LÍNEA 185: Agregado purchase_status en PurchaseUpdate
# LÍNEA 220: Agregado purchase_vendor_cost en PurchaseInDB
# LÍNEA 237: Agregado purchase_status en PurchaseInDB
# LÍNEA 259: Agregado purchase_status en PurchaseListResponse
# LÍNEA 287: Agregado purchase_status en PurchaseSummary
#
# INSTRUCCIONES DE INSTALACIÓN:
# 1. Reemplazar archivo: backend/app/schemas/purchase.py
# 2. Reiniciar servidor backend
# =============================================================================