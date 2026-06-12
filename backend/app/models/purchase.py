"""
Modelo Purchase - SINCRONIZADO CON TABLA REAL
Basado en estructura actual de PostgreSQL
✅ MODIFICADO: Agregados purchase_vendor_cost y purchase_status (FASE 2)
✅ CORREGIDO C-03: purchase_phone_number nullable=True (sincronizado con BD)
   Bill Payment no tiene phone_number — usar account_number en su lugar.
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, Numeric, Boolean, Text, func, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Purchase(Base):
    """
    Modelo de compras/transacciones
    ✅ SINCRONIZADO con tabla purchases de PostgreSQL
    ✅ NUEVOS CAMPOS: purchase_vendor_cost, purchase_status
    ✅ CORREGIDO: purchase_phone_number nullable=True
    """
    __tablename__ = "purchases"

    # =========================================================================
    # PRIMARY KEY
    # =========================================================================
    purchase_id = Column(Integer, primary_key=True, index=True)

    # =========================================================================
    # FOREIGN KEYS
    # =========================================================================
    purchase_user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True, index=True)
    purchase_product_id = Column(Integer, ForeignKey("products.product_id"), nullable=True, index=True)

    # =========================================================================
    # INFORMACIÓN BÁSICA DE COMPRA
    # =========================================================================
    purchase_reference = Column(String(50), nullable=False)
    purchase_date = Column(TIMESTAMP, nullable=False, default=func.current_timestamp())
    purchase_phone_number = Column(String(15), nullable=True)   # ✅ C-03: nullable=True
                                                                # TopUp/Package/Transfer/Smartphone: teléfono destino
                                                                # Bill Payment: None (usa purchase_account_number)

    # Información del producto/servicio
    purchase_service_name = Column(String(100), nullable=False)
    purchase_product_name = Column(String(100), nullable=False)
    purchase_product_type = Column(String(50))

    # =========================================================================
    # MONTOS Y PRICING
    # =========================================================================
    purchase_base_price = Column(Numeric(10, 2), nullable=False)
    purchase_discount = Column(Numeric(12, 2), nullable=False, default=0)
    purchase_fee = Column(Numeric(12, 2), nullable=False, default=0)
    purchase_total_amount = Column(Numeric(10, 2), nullable=False)
    purchase_currency = Column(String(10), default='USD')
    purchase_exch_rate = Column(Numeric(10, 4))

    # =========================================================================
    # INFORMACIÓN DE PAGO
    # =========================================================================
    purchase_payment_method = Column(String(50), nullable=False)
    purchase_payment_status = Column(String(30), nullable=False, default='pending')
    purchase_credit_card_last_digits = Column(String(4))
    purchase_payment_ref = Column(String(255))

    # =========================================================================
    # INFORMACIÓN DE ENTREGA/DELIVERY
    # =========================================================================
    purchase_delivery_status = Column(String(100))
    purchase_delivery_phone = Column(String(20))
    purchase_delivery_name = Column(String(50))
    purchase_delivery_address = Column(String(100))
    purchase_provision_ref = Column(String(255))

    # =========================================================================
    # CÓDIGOS DE BARRAS Y RECIBOS
    # =========================================================================
    purchase_barcode_code = Column(String(50))
    purchase_barcode_image = Column(String(255))
    purchase_receip_url = Column(String(255))

    # =========================================================================
    # INFORMACIÓN DEL VENDOR (Original)
    # =========================================================================
    purchase_vendor_code = Column(String(50))
    purchase_vendor_amount = Column(Numeric(10, 2))
    purchase_vendor_cost = Column(Numeric(10, 2))  # ✅✅✅ NUEVO - FASE 2
    purchase_vendor_json = Column(Text)
    purchase_vendor_date_petition = Column(TIMESTAMP)
    purchase_vendor_date_response = Column(TIMESTAMP)
    purchase_vendor_response_code = Column(String(50))
    purchase_vendor_response_description = Column(String(255))
    purchase_vendor_purchase_id = Column(String(50))
    purchase_vendor_skuid = Column(String(50))
    purchase_vendor_currency = Column(String(10))

    # =========================================================================
    # VENDOR PRO (Nueva integración)
    # =========================================================================
    purchase_vendpro_code = Column(String(50))
    purchase_vendpro_country = Column(String(50))
    purchase_vendpro_operator = Column(String(50))
    purchase_vendpro_product_type = Column(String(1))
    purchase_vendpro_amount_type = Column(String(20))
    purchase_vendpro_maximum_amount = Column(Numeric(10, 2))
    vendor_name = Column(String(50))
    vendor_trans_id = Column(String(100))
    vendor_provider_trans_id = Column(String(100))
    vendor_request = Column(Text)
    vendor_response = Column(Text)

    # =========================================================================
    # BALANCE DEL VENDOR
    # =========================================================================
    purchase_balance_currency = Column(String(10))
    purchase_initial_balance = Column(Numeric(10, 2))
    purchase_final_balance = Column(Numeric(10, 2))

    # =========================================================================
    # CONTROL DE TRANSACCIONES
    # =========================================================================
    purchase_status = Column(String(30), nullable=False, default='Pending')  # ✅✅✅ NUEVO - FASE 2
    purchase_reversal_ref = Column(String(255))
    purchase_account_number = Column(String(100))       # Bill Payment: número de cuenta del servicio
    requires_manual_intervention = Column(Boolean, nullable=False, default=False)

    # =========================================================================
    # INFORMACIÓN DE PETICIÓN
    # =========================================================================
    purchase_date_sent_to_conciliation = Column(TIMESTAMP)
    purchase_ip_petition = Column(String(50))

    # =========================================================================
    # AUDITORÍA
    # =========================================================================
    created_by = Column(String(100), nullable=False, default='System')
    updated_by = Column(String(100), nullable=False, default='System')
    last_update_date = Column(TIMESTAMP, nullable=False, default=func.current_timestamp())

    # =========================================================================
    # RELACIONES
    # =========================================================================
    user = relationship("User", foreign_keys=[purchase_user_id], back_populates="purchases")
    product = relationship("Product", foreign_keys=[purchase_product_id])

    def __repr__(self):
        return (
            f"<Purchase("
            f"id={self.purchase_id}, "
            f"ref={self.purchase_reference}, "
            f"user_id={self.purchase_user_id}, "
            f"product={self.purchase_product_name}, "
            f"payment={self.purchase_payment_status}, "
            f"delivery={self.purchase_delivery_status}, "
            f"status={self.purchase_status}"
            f")>"
        )


# =============================================================================
# HISTORIAL DE CAMBIOS:
# =============================================================================
# FASE 2:
#   LÍNEA 81:  Agregado purchase_vendor_cost después de purchase_vendor_amount
#   LÍNEA 116: Agregado purchase_status en sección CONTROL DE TRANSACCIONES
#   LÍNEA 143: Modificado __repr__ para incluir purchase_status
#
# C-03 (corrección de consolidación):
#   LÍNEA 35:  purchase_phone_number nullable=False → nullable=True
#              Sincroniza el modelo con la tabla real de PostgreSQL.
#              Bill Payment no tiene número de teléfono — el identificador
#              del servicio va en purchase_account_number.
#
# INSTRUCCIONES DE DESPLIEGUE:
#   1. git add backend/app/models/purchase.py
#   2. git commit -m "fix C-03: purchase_phone_number nullable=True"
#   3. git push
#   4. En CalmetServer: git pull && sudo systemctl restart latconecta-backend
#   No requiere cambios en BD (tabla ya tiene nullable=YES en PostgreSQL).
# =============================================================================
