"""
Tests para Exchange Rate Service
"""

import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.exchange_rate_service import ExchangeRateService


@pytest.mark.asyncio
class TestExchangeRateService:
    """Tests para obtención de tasas de cambio"""
    
    async def test_same_currency_returns_1(self):
        """Test: Misma moneda retorna 1.0"""
        rate = await ExchangeRateService.get_exchange_rate("USD", "USD", "none")
        assert rate == 1.0
    
    async def test_conciliation_margin_adds_5_percent(self):
        """Test: Margen conciliation agrega +5%"""
        # Mock API
        with patch.object(
            ExchangeRateService,
            '_get_official_rate',
            new=AsyncMock(return_value=20.0)
        ):
            rate = await ExchangeRateService.get_exchange_rate(
                "USD", "MXN", "conciliation"
            )
            
            # 20.0 × 1.05 = 21.0
            assert rate == 21.0
    
    async def test_pricing_margin_subtracts_5_percent(self):
        """Test: Margen pricing resta -5%"""
        with patch.object(
            ExchangeRateService,
            '_get_official_rate',
            new=AsyncMock(return_value=20.0)
        ):
            rate = await ExchangeRateService.get_exchange_rate(
                "USD", "MXN", "pricing"
            )
            
            # 20.0 × 0.95 = 19.0
            assert rate == 19.0
    
    async def test_none_margin_returns_official(self):
        """Test: Sin margen retorna tasa oficial"""
        with patch.object(
            ExchangeRateService,
            '_get_official_rate',
            new=AsyncMock(return_value=3.75)
        ):
            rate = await ExchangeRateService.get_exchange_rate(
                "USD", "PEN", "none"
            )
            
            assert rate == 3.75
    
    async def test_primary_api_success(self):
        """Test: API primaria funciona correctamente"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "rates": {
                "PEN": 3.75,
                "MXN": 20.00
            }
        }
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
            
            rate = await ExchangeRateService._fetch_from_primary_api("USD", "PEN")
            assert rate == 3.75
    
    async def test_backup_api_on_primary_failure(self):
        """Test: API backup se usa cuando primaria falla"""
        # Primary falla
        with patch.object(
            ExchangeRateService,
            '_fetch_from_primary_api',
            new=AsyncMock(side_effect=Exception("Primary failed"))
        ):
            # Backup funciona
            with patch.object(
                ExchangeRateService,
                '_fetch_from_backup_api',
                new=AsyncMock(return_value=3.75)
            ):
                rate = await ExchangeRateService._get_official_rate("USD", "PEN")
                assert rate == 3.75
    
    async def test_database_fallback(self):
        """Test: Base de datos se usa como último recurso"""
        mock_db = MagicMock()
        
        # APIs fallan
        with patch.object(
            ExchangeRateService,
            '_fetch_from_primary_api',
            new=AsyncMock(side_effect=Exception("Failed"))
        ):
            with patch.object(
                ExchangeRateService,
                '_fetch_from_backup_api',
                new=AsyncMock(side_effect=Exception("Failed"))
            ):
                # Database funciona
                with patch.object(
                    ExchangeRateService,
                    '_fetch_from_database',
                    new=AsyncMock(return_value=3.75)
                ):
                    rate = await ExchangeRateService._get_official_rate(
                        "USD", "PEN", mock_db
                    )
                    assert rate == 3.75
    
    async def test_cache_is_used(self):
        """Test: Caché evita llamadas repetidas"""
        # Primera llamada
        with patch.object(
            ExchangeRateService,
            '_fetch_from_primary_api',
            new=AsyncMock(return_value=20.0)
        ) as mock_api:
            rate1 = await ExchangeRateService._get_official_rate("USD", "MXN")
            assert rate1 == 20.0
            assert mock_api.call_count == 1
            
            # Segunda llamada (debe usar caché)
            rate2 = await ExchangeRateService._get_official_rate("USD", "MXN")
            assert rate2 == 20.0
            assert mock_api.call_count == 1  # No llamó de nuevo
        
        # Limpiar caché
        ExchangeRateService.clear_cache()
    
    async def test_default_rate_when_all_fail(self):
        """Test: Tasa por defecto cuando todo falla"""
        # Todas las fuentes fallan
        with patch.object(
            ExchangeRateService,
            '_fetch_from_primary_api',
            new=AsyncMock(side_effect=Exception("Failed"))
        ):
            with patch.object(
                ExchangeRateService,
                '_fetch_from_backup_api',
                new=AsyncMock(side_effect=Exception("Failed"))
            ):
                with patch.object(
                    ExchangeRateService,
                    '_fetch_from_database',
                    new=AsyncMock(return_value=None)
                ):
                    rate = await ExchangeRateService._get_official_rate("USD", "PEN")
                    # Debe retornar default (3.75)
                    assert rate == 3.75


@pytest.mark.asyncio
class TestExchangeRateEdgeCases:
    """Tests de casos extremos"""
    
    async def test_very_small_amounts(self):
        """Test: Manejo de montos muy pequeños"""
        with patch.object(
            ExchangeRateService,
            '_get_official_rate',
            new=AsyncMock(return_value=0.00001)
        ):
            rate = await ExchangeRateService.get_exchange_rate(
                "XXX", "YYY", "normal"
            )
            assert rate > 0
    
    async def test_very_large_amounts(self):
        """Test: Manejo de montos muy grandes"""
        with patch.object(
            ExchangeRateService,
            '_get_official_rate',
            new=AsyncMock(return_value=1000000.0)
        ):
            rate = await ExchangeRateService.get_exchange_rate(
                "XXX", "YYY", "inverse"
            )
            assert rate == 950000.0  # 1M × 0.95
    
    async def test_precision_6_decimals(self):
        """Test: Precisión de 6 decimales"""
        with patch.object(
            ExchangeRateService,
            '_get_official_rate',
            new=AsyncMock(return_value=3.123456789)
        ):
            rate = await ExchangeRateService.get_exchange_rate(
                "USD", "PEN", "none"
            )
            # Debe redondear a 6 decimales
            assert rate == 3.123457
