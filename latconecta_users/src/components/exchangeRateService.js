import apiClient from './apiClient';

const exchangeRateService = {
  /**
   * Obtener tipo de cambio
   */
  async get(fromCurrency, toCurrency, marginType = 'pricing') {
    const response = await apiClient.get('/exchange-rate', {
      params: {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        margin_type: marginType
      }
    });
    return response.data;
  },

  /**
   * Obtener TC con margen -5% (para precios de productos)
   */
  async getForPricing(fromCurrency, toCurrency) {
    return this.get(fromCurrency, toCurrency, 'pricing');
  },

  /**
   * Obtener TC con margen +5% (para conciliación)
   */
  async getForConciliation(fromCurrency, toCurrency) {
    return this.get(fromCurrency, toCurrency, 'conciliation');
  },

  /**
   * Obtener TC sin margen
   */
  async getForConversion(fromCurrency, toCurrency) {
    return this.get(fromCurrency, toCurrency, 'conversion');
  }
};

export default exchangeRateService;