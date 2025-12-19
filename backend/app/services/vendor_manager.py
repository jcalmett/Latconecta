"""
Vendor Manager - Actualizado para usar vendor_products
Orquestador de integración con vendors
"""
import json
from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .vendor_factory import VendorFactory
from ..models import Purchase, Product, Vendor, VendorProduct
from ..config import settings


class VendorManager:
    """
    Orquestador de integración con vendors
    
    - Usa VendorInterface (no sabe si es mock o real)
    - Busca vendor_product asociado al product
    - Construye requests desde vendor_product
    - Maneja errores y excepciones
    - Retorna resultado estandarizado
    """
    
    def __init__(self):
        self.vendor_service = None
        self.current_vendor_code = None
    
    async def _get_vendor_service(self, vendor_code: str, db: AsyncSession):
        """
        Obtener servicio del vendor (con cache)
        """
        # Si ya tenemos el servicio para este vendor, reutilizar
        if self.vendor_service and self.current_vendor_code == vendor_code:
            return self.vendor_service
        
        # Obtener vendor de BD
        result = await db.execute(
            select(Vendor).where(Vendor.vendor_code == vendor_code)
        )
        vendor = result.scalar_one_or_none()
        
        if not vendor:
            raise ValueError(f"Vendor {vendor_code} no encontrado")
        
        if not vendor.is_active:
            raise ValueError(f"Vendor {vendor_code} está inactivo")
        
        # Configurar servicio
        config = {
            'mode': settings.VENDOR_MODE,
            'url': vendor.url,
            'username': vendor.vendor_username,
            'password': vendor.vendor_password,
            'api_key': vendor.vendor_api_key,
            'user_uid': vendor.vendor_user_uid,
            'timeout': vendor.vendor_timeout,
            
            # Mock configuration
            'mock_mode': settings.MOCK_MODE,
            'mock_delay': settings.MOCK_DELAY
        }
        
        # Factory crea la instancia correcta (mock o real)
        self.vendor_service = VendorFactory.create_latcom_service(config)
        self.current_vendor_code = vendor_code
        
        return self.vendor_service
    
    async def _get_vendor_product(
        self,
        product: Product,
        db: AsyncSession
    ) -> Optional[VendorProduct]:
        """
        Obtener vendor_product asociado al product
        
        Busca por la relación:
        - vendor_code
        - vp_code (product_vendpro_code)
        - vp_skuid (product_vendpro_skuid)
        """
        if not product.has_vendor:
            return None
        
        result = await db.execute(
            select(VendorProduct)
            .where(VendorProduct.vendor_code == product.product_vendor_code)
            .where(VendorProduct.vp_code == product.product_vendpro_code)
            .where(VendorProduct.vp_skuid == (product.product_vendpro_skuid or ''))
        )
        vendor_product = result.scalar_one_or_none()
        
        if not vendor_product:
            raise ValueError(
                f"Vendor product no encontrado para: "
                f"{product.product_vendor_code}/{product.product_vendpro_code}"
            )
        
        if not vendor_product.is_active:
            raise ValueError(
                f"Vendor product {vendor_product.vp_code} está inactivo"
            )
        
        return vendor_product
    
    async def process_delivery(
        self,
        purchase: Purchase,
        product: Product,
        db: AsyncSession
    ) -> Dict:
        """
        Procesar entrega del servicio con vendor
        
        IMPORTANTE: Esta función asume que el pago YA fue procesado
        y purchase.purchase_payment_status == 'paid'
        
        Args:
            purchase: Registro de compra (ya con pago procesado)
            product: Producto a entregar
            db: Sesión de base de datos
        
        Returns:
            Dict con resultado de la operación
        """
        
        print("═══════════════════════════════════════")
        print(f"🚀 Procesando delivery")
        print(f"📦 Purchase ID: {purchase.purchase_id}")
        print(f"📦 Product: {product.product_code}")
        print(f"💰 Monto: {purchase.purchase_total}")
        print("═══════════════════════════════════════")
        
        try:
            # Verificar que el producto tiene vendor
            if not product.has_vendor:
                return {
                    'success': False,
                    'delivery_status': 'not_delivered',
                    'vendor_name': None,
                    'vendor_trans_id': None,
                    'vendor_provider_trans_id': None,
                    'vendor_response_code': 'NO_VENDOR',
                    'vendor_response_description': 'Producto no tiene vendor asociado',
                    'vendor_request': None,
                    'vendor_response': None,
                    'requires_manual_intervention': False
                }
            
            # Obtener vendor_product
            vendor_product = await self._get_vendor_product(product, db)
            
            print(f"✅ Vendor product encontrado: {vendor_product.vp_code}")
            print(f"   Vendor: {vendor_product.vendor_code}")
            print(f"   Operador: {vendor_product.vp_operator}")
            print(f"   País: {vendor_product.vp_country}")
            
            # Obtener servicio del vendor
            vendor_service = await self._get_vendor_service(
                vendor_product.vendor_code,
                db
            )
            
            # Autenticar si es necesario
            if not vendor_service.access_token:
                print("🔐 Autenticando con vendor...")
                await vendor_service.login()
            
            # Construir request usando vendor_product
            vendor_request = vendor_product.build_vendor_request_data(
                phone=purchase.purchase_phone,
                amount=float(purchase.purchase_total)
            )
            
            print("📤 Enviando request a vendor...")
            print(f"   Phone: {vendor_request['phone']}")
            print(f"   Amount: {vendor_request['amount']} {vendor_request['currency']}")
            print(f"   Product ID: {vendor_request['product_id']}")
            
            # Llamar a vendor
            vendor_response = await vendor_service.purchase(
                phone=vendor_request['phone'],
                operator=vendor_request['operator'],
                country=vendor_request['country'],
                currency=vendor_request['currency'],
                amount=vendor_request['amount'],
                product_id=vendor_request['product_id'],
                sku_id=vendor_request['sku_id'],
                service_type=vendor_request['service_type']
            )
            
            print("📥 Respuesta recibida de vendor")
            
            # Procesar respuesta
            response_code = vendor_response.get('response_code', 'UNKNOWN')
            
            if response_code == '1':
                # ✅ ÉXITO
                print("✅ Delivery exitoso")
                return {
                    'success': True,
                    'delivery_status': 'delivered',
                    'vendor_name': vendor_product.vendor_code,
                    'vendor_trans_id': vendor_response.get('trans_id'),
                    'vendor_provider_trans_id': vendor_response.get('ven_transid'),
                    'vendor_response_code': response_code,
                    'vendor_response_description': vendor_response.get('response_message', 'Success'),
                    'vendor_request': json.dumps(vendor_request),
                    'vendor_response': json.dumps(vendor_response),
                    'requires_manual_intervention': False
                }
            
            else:
                # ❌ ERROR DE NEGOCIO
                print(f"❌ Vendor rechazó: {response_code}")
                return {
                    'success': False,
                    'delivery_status': 'not_delivered',
                    'vendor_name': vendor_product.vendor_code,
                    'vendor_trans_id': vendor_response.get('trans_id'),
                    'vendor_provider_trans_id': vendor_response.get('ven_transid'),
                    'vendor_response_code': response_code,
                    'vendor_response_description': vendor_response.get('response_message', 'Unknown error'),
                    'vendor_request': json.dumps(vendor_request),
                    'vendor_response': json.dumps(vendor_response),
                    'requires_manual_intervention': False
                }
        
        except TimeoutError as e:
            # ⏱️ TIMEOUT
            print(f"⏱️ Timeout esperando vendor: {e}")
            return {
                'success': False,
                'delivery_status': 'not_delivered',
                'vendor_name': product.product_vendor_code,
                'vendor_trans_id': None,
                'vendor_provider_trans_id': None,
                'vendor_response_code': 'TIMEOUT',
                'vendor_response_description': str(e),
                'vendor_request': json.dumps(vendor_request) if 'vendor_request' in locals() else None,
                'vendor_response': None,
                'requires_manual_intervention': True
            }
        
        except ConnectionError as e:
            # 🌐 ERROR DE RED
            print(f"🌐 Error de conexión: {e}")
            return {
                'success': False,
                'delivery_status': 'not_delivered',
                'vendor_name': product.product_vendor_code,
                'vendor_trans_id': None,
                'vendor_provider_trans_id': None,
                'vendor_response_code': 'NETWORK_ERROR',
                'vendor_response_description': str(e),
                'vendor_request': json.dumps(vendor_request) if 'vendor_request' in locals() else None,
                'vendor_response': None,
                'requires_manual_intervention': True
            }
        
        except ValueError as e:
            # ❌ ERROR DE VALIDACIÓN (vendor no encontrado, inactivo, etc)
            print(f"❌ Error de validación: {e}")
            return {
                'success': False,
                'delivery_status': 'not_delivered',
                'vendor_name': product.product_vendor_code,
                'vendor_trans_id': None,
                'vendor_provider_trans_id': None,
                'vendor_response_code': 'VALIDATION_ERROR',
                'vendor_response_description': str(e),
                'vendor_request': None,
                'vendor_response': None,
                'requires_manual_intervention': False
            }
        
        except Exception as e:
            # ❌ ERROR INESPERADO
            print(f"❌ Error inesperado: {e}")
            return {
                'success': False,
                'delivery_status': 'not_delivered',
                'vendor_name': product.product_vendor_code if product.has_vendor else None,
                'vendor_trans_id': None,
                'vendor_provider_trans_id': None,
                'vendor_response_code': 'UNEXPECTED_ERROR',
                'vendor_response_description': str(e),
                'vendor_request': json.dumps(vendor_request) if 'vendor_request' in locals() else None,
                'vendor_response': None,
                'requires_manual_intervention': True
            }
    
    async def verify_transaction_status(
        self,
        purchase: Purchase,
        db: AsyncSession
    ) -> Dict:
        """
        Verificar estado de una transacción con vendor
        """
        print(f"🔍 Verificando estado de purchase {purchase.purchase_id}")
        
        if not purchase.vendor_name:
            return {
                'verified': False,
                'status': 'error',
                'error': 'Purchase no tiene vendor asociado'
            }
        
        try:
            vendor_service = await self._get_vendor_service(
                purchase.vendor_name,
                db
            )
            
            if not vendor_service.access_token:
                await vendor_service.login()
            
            result = await vendor_service.get_transaction_status(
                msisdn=purchase.purchase_phone,
                trans_id=purchase.vendor_trans_id or 'unknown',
                date=purchase.created_at.strftime('%Y-%m-%d')
            )
            
            status = result.get('status', 'UNKNOWN')
            
            if status == 'SUCCESS':
                print("✅ Vendor confirma: transacción exitosa")
                return {
                    'verified': True,
                    'status': 'delivered',
                    'vendor_trans_id': result.get('trans_id'),
                    'vendor_provider_trans_id': result.get('ven_transid')
                }
            
            elif status == 'FAIL':
                print("❌ Vendor confirma: transacción fallida")
                return {
                    'verified': True,
                    'status': 'not_delivered'
                }
            
            else:
                print("⚠️ No se pudo verificar estado")
                return {
                    'verified': False,
                    'status': 'unknown'
                }
        
        except Exception as e:
            print(f"❌ Error verificando estado: {e}")
            return {
                'verified': False,
                'status': 'error',
                'error': str(e)
            }
