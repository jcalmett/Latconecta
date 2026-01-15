"""
Tests para Purchase Calculator Service
Tests para los 3 casos de cálculo
"""

import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.purchase_calculator_service import PurchaseCalculatorService
from app.models.product import Product              # ← Singular
from app.models.vendor_product import VendorProduct # ← Singular
from app.models.vendor import Vendor                # ← Singular


@pytest.fixture
def mock_db():
    """Mock de sesión de base de datos"""
    return AsyncMock()


@pytest.fixture
def mock_product_fixed():
    """Mock de producto con precio fijo"""
    product = MagicMock(spec=Product)
    product.product_id = 1
    product.product_name = "Recarga Claro 20"
    product.product_base_price = Decimal('20.00')
    product.product_fee = Decimal('1.50')
    product.product_discount_percentage = Decimal('0')
    product.product_currency = "PEN"
    product.product_amount_type = "F"
    product.product_vendor_code = "DTONE"
    product.product_vendpro_skuid = "SKU123"
    return product


@pytest.fixture
def mock_vendor_product_fixed():
    """Mock de vendor_product con precio fijo"""
    vp = MagicMock(spec=VendorProduct)
    vp.vp_code = "VP_DTONE_001"
    vp.vp_skuid = "SKU123"
    vp.vp_amount = Decimal('20.00')
    vp.vp_currency = "PEN"
    vp.vp_product_type = "topup"
    vp.vp_country = "PE"
    vp.vp_operator = "Claro"
    return vp


@pytest.fixture
def mock_vendor():
    """Mock de vendor"""
    vendor = MagicMock(spec=Vendor)
    vendor.vendor_code = "DTONE"
    vendor.vendor_name = "DTONE"
    vendor.vendor_balance_currency = "USD"
    vendor.vendor_balance_amount = Decimal('1000.00')
    return vendor


@pytest.mark.asyncio
class TestCaso1PrecioFijo:
    """Tests para CASO 1: Precio Fijo"""
    
    async def test_fixed_price_same_currency(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Precio fijo con misma moneda"""
        
        user_data = {'product_type': 'topup'}
        
        result = await PurchaseCalculatorService.calculate(
            product=mock_product_fixed,
            vendor_product=mock_vendor_product_fixed,
            vendor=mock_vendor,
            user_data=user_data,
            db=mock_db
        )
        
        # Cliente paga
        assert result.purchase_base_price == Decimal('20.00')
        assert result.purchase_fee == Decimal('1.50')
        assert result.purchase_total_amount == Decimal('21.50')
        assert result.purchase_currency == "PEN"
        
        # Vendor recibe
        assert result.purchase_vendor_amount == Decimal('20.00')
        assert result.purchase_vendor_currency == "PEN"
        
        # Sin conversión
        assert result.purchase_exch_rate == Decimal('1.0')
        assert result.conversion_applied is False
        assert result.margin_type == 'none'
    
    async def test_fixed_price_different_currency(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Precio fijo con diferente moneda"""
        
        # Cambiar moneda del producto
        mock_product_fixed.product_currency = "USD"
        mock_product_fixed.product_base_price = Decimal('5.50')
        mock_product_fixed.product_fee = Decimal('0.50')
        
        # Vendor_product sigue en PEN
        mock_vendor_product_fixed.vp_currency = "PEN"
        mock_vendor_product_fixed.vp_amount = Decimal('20.00')
        
        user_data = {'product_type': 'topup'}
        
        # Mock exchange rate (USD → PEN = 3.75, sin margen)
        with patch(
            'app.services.purchase_calculator_service.exchange_rate_service.get_exchange_rate',
            new=AsyncMock(return_value=3.75)
        ):
            result = await PurchaseCalculatorService.calculate(
                product=mock_product_fixed,
                vendor_product=mock_vendor_product_fixed,
                vendor=mock_vendor,
                user_data=user_data,
                db=mock_db
            )
        
        # Cliente paga en USD
        assert result.purchase_base_price == Decimal('5.50')
        assert result.purchase_fee == Decimal('0.50')
        assert result.purchase_total_amount == Decimal('6.00')
        assert result.purchase_currency == "USD"
        
        # Vendor recibe en PEN (monto fijo, no cambia)
        assert result.purchase_vendor_amount == Decimal('20.00')
        assert result.purchase_vendor_currency == "PEN"
        
        # Con conversión registrada (pero vendor_amount no se convierte)
        assert result.purchase_exch_rate == Decimal('3.75')
        assert result.conversion_applied is True
        assert result.margin_type == 'none'
    
    async def test_fixed_price_with_discount(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Precio fijo con descuento"""
        
        mock_product_fixed.product_discount_percentage = Decimal('10')  # 10%
        
        user_data = {'product_type': 'topup'}
        
        result = await PurchaseCalculatorService.calculate(
            product=mock_product_fixed,
            vendor_product=mock_vendor_product_fixed,
            vendor=mock_vendor,
            user_data=user_data,
            db=mock_db
        )
        
        # Descuento: 20.00 × 10% = 2.00
        assert result.purchase_discount == Decimal('2.00')
        # Total: 20.00 - 2.00 + 1.50 = 19.50
        assert result.purchase_total_amount == Decimal('19.50')


@pytest.mark.asyncio
class TestCaso2MontoVariable:
    """Tests para CASO 2: Monto Variable"""
    
    async def test_variable_amount_same_currency(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Monto variable con misma moneda"""
        
        # Cambiar a tipo variable
        mock_product_fixed.product_amount_type = "V"
        
        user_data = {
            'product_type': 'transfer',
            'user_selected_amount': Decimal('50.00')
        }
        
        result = await PurchaseCalculatorService.calculate(
            product=mock_product_fixed,
            vendor_product=mock_vendor_product_fixed,
            vendor=mock_vendor,
            user_data=user_data,
            db=mock_db
        )
        
        # Cliente paga
        assert result.purchase_base_price == Decimal('50.00')
        assert result.purchase_fee == Decimal('1.50')
        assert result.purchase_total_amount == Decimal('51.50')
        
        # Vendor recibe (mismo monto, sin conversión)
        assert result.purchase_vendor_amount == Decimal('50.00')
        assert result.conversion_applied is False
        assert result.info_message is None
    
    async def test_variable_amount_with_conversion_inverse_margin(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Monto variable con conversión y margen -5%"""
        
        # Usuario paga en USD
        mock_product_fixed.product_currency = "USD"
        mock_product_fixed.product_amount_type = "V"
        mock_product_fixed.product_fee = Decimal('1.00')
        mock_product_fixed.product_discount_percentage = Decimal('0')
        
        # Vendor recibe en MXN
        mock_vendor_product_fixed.vp_currency = "MXN"
        
        user_data = {
            'product_type': 'transfer',
            'user_selected_amount': Decimal('50.00')  # USD
        }
        
        # Mock exchange rate con margen -5%
        # Oficial: 20.00, con margen inverse: 19.00
        with patch(
            'app.services.purchase_calculator_service.exchange_rate_service.get_exchange_rate',
            new=AsyncMock(return_value=19.00)
        ):
            result = await PurchaseCalculatorService.calculate(
                product=mock_product_fixed,
                vendor_product=mock_vendor_product_fixed,
                vendor=mock_vendor,
                user_data=user_data,
                db=mock_db
            )
        
        # Cliente paga en USD
        assert result.purchase_base_price == Decimal('50.00')
        assert result.purchase_total_amount == Decimal('51.00')  # 50 + 1 fee
        assert result.purchase_currency == "USD"
        
        # Vendor recibe en MXN (50 × 19.00 = 950 MXN)
        assert result.purchase_vendor_amount == Decimal('950.00')
        assert result.purchase_vendor_currency == "MXN"
        assert result.purchase_exch_rate == Decimal('19.00')
        
        # Con conversión y margen inverse
        assert result.conversion_applied is True
        assert result.margin_type == 'pricing'
        
        # Mensaje informativo
        assert "950.00 MXN" in result.info_message
        assert "19.00" in result.info_message
    
    async def test_variable_amount_range_validation(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Validación de rango para tipo R"""
        
        mock_product_fixed.product_amount_type = "R"
        mock_product_fixed.product_min_amount = Decimal('10.00')
        mock_product_fixed.product_max_amount = Decimal('100.00')
        
        # Monto fuera de rango
        user_data = {
            'product_type': 'topup',
            'user_selected_amount': Decimal('150.00')  # Excede máximo
        }
        
        with pytest.raises(ValueError, match="outside valid range"):
            await PurchaseCalculatorService.calculate(
                product=mock_product_fixed,
                vendor_product=mock_vendor_product_fixed,
                vendor=mock_vendor,
                user_data=user_data,
                db=mock_db
            )


@pytest.mark.asyncio
class TestCaso3BillPayment:
    """Tests para CASO 3: Bill Payment"""
    
    async def test_bill_payment_full_same_currency(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Pago total con misma moneda"""
        
        user_data = {
            'product_type': 'bill_payment',
            'bill_total_debt': Decimal('100.00'),
            'bill_currency': 'PEN',
            'payment_type': 'full'
        }
        
        result = await PurchaseCalculatorService.calculate(
            product=mock_product_fixed,
            vendor_product=mock_vendor_product_fixed,
            vendor=mock_vendor,
            user_data=user_data,
            db=mock_db
        )
        
        # Cliente paga
        assert result.purchase_base_price == Decimal('100.00')
        assert result.purchase_total_amount == Decimal('101.50')  # 100 + 1.50 fee
        
        # Vendor recibe MONTO EXACTO ORIGINAL
        assert result.purchase_vendor_amount == Decimal('100.00')
        assert result.purchase_vendor_currency == "PEN"
        
        # Sin conversión
        assert result.conversion_applied is False
    
    async def test_bill_payment_full_with_conversion(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Pago total con conversión (NO reconvertir)"""
        
        # Usuario paga en USD
        mock_product_fixed.product_currency = "USD"
        mock_product_fixed.product_fee = Decimal('1.00')
        
        # Deuda en MXN
        user_data = {
            'product_type': 'bill_payment',
            'bill_total_debt': Decimal('1000.00'),  # MXN
            'bill_currency': 'MXN',
            'payment_type': 'full'
        }
        
        # Mock exchange rate con margen -5%
        # 1000 MXN ÷ 19.00 = 52.63 USD
        with patch(
            'app.services.purchase_calculator_service.exchange_rate_service.get_exchange_rate',
            new=AsyncMock(return_value=19.00)
        ):
            result = await PurchaseCalculatorService.calculate(
                product=mock_product_fixed,
                vendor_product=mock_vendor_product_fixed,
                vendor=mock_vendor,
                user_data=user_data,
                db=mock_db
            )
        
        # Cliente paga en USD (convertido con -5%)
        assert result.purchase_currency == "USD"
        assert result.purchase_base_price == Decimal('1000.00') / Decimal('19.00')
        
        # ⚠️ CRÍTICO: Vendor recibe MONTO EXACTO ORIGINAL (sin reconvertir)
        assert result.purchase_vendor_amount == Decimal('1000.00')
        assert result.purchase_vendor_currency == "MXN"
        
        # Con conversión
        assert result.conversion_applied is True
        assert result.margin_type == 'pricing'
        
        # Mensaje informativo
        assert "1000.00 MXN" in result.info_message
    
    async def test_bill_payment_partial_with_conversion(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Pago parcial con conversión"""
        
        # Usuario paga en USD
        mock_product_fixed.product_currency = "USD"
        mock_product_fixed.product_fee = Decimal('1.00')
        
        # Deuda en MXN
        user_data = {
            'product_type': 'bill_payment',
            'bill_total_debt': Decimal('1000.00'),  # MXN (deuda total)
            'bill_currency': 'MXN',
            'payment_type': 'partial',
            'user_selected_amount': Decimal('30.00')  # USD (pago parcial)
        }
        
        # Mock exchange rate con margen -5%
        # 30 USD × 19.00 = 570 MXN
        with patch(
            'app.services.purchase_calculator_service.exchange_rate_service.get_exchange_rate',
            new=AsyncMock(return_value=19.00)
        ):
            result = await PurchaseCalculatorService.calculate(
                product=mock_product_fixed,
                vendor_product=mock_vendor_product_fixed,
                vendor=mock_vendor,
                user_data=user_data,
                db=mock_db
            )
        
        # Cliente paga en USD
        assert result.purchase_base_price == Decimal('30.00')
        assert result.purchase_total_amount == Decimal('31.00')  # 30 + 1 fee
        assert result.purchase_currency == "USD"
        
        # Vendor recibe en MXN (convertido con -5%)
        assert result.purchase_vendor_amount == Decimal('570.00')
        assert result.purchase_vendor_currency == "MXN"
        
        # Mensaje debe mostrar deuda restante
        assert "570.00 MXN" in result.info_message
        assert "430.00 MXN" in result.info_message  # 1000 - 570


@pytest.mark.asyncio
class TestErrorHandling:
    """Tests de manejo de errores"""
    
    async def test_missing_user_selected_amount_for_variable(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Error si falta user_selected_amount para tipo variable"""
        
        mock_product_fixed.product_amount_type = "V"
        
        user_data = {
            'product_type': 'transfer'
            # Falta user_selected_amount
        }
        
        with pytest.raises(ValueError, match="user_selected_amount is required"):
            await PurchaseCalculatorService.calculate(
                product=mock_product_fixed,
                vendor_product=mock_vendor_product_fixed,
                vendor=mock_vendor,
                user_data=user_data,
                db=mock_db
            )
    
    async def test_missing_bill_data_for_bill_payment(
        self,
        mock_product_fixed,
        mock_vendor_product_fixed,
        mock_vendor,
        mock_db
    ):
        """Test: Error si falta bill_total_debt para bill payment"""
        
        user_data = {
            'product_type': 'bill_payment'
            # Falta bill_total_debt y bill_currency
        }
        
        with pytest.raises(ValueError, match="bill_total_debt and bill_currency required"):
            await PurchaseCalculatorService.calculate(
                product=mock_product_fixed,
                vendor_product=mock_vendor_product_fixed,
                vendor=mock_vendor,
                user_data=user_data,
                db=mock_db
            )
