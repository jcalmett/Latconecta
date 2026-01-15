import apiClient from './apiClient';

const exchangeRateService = {
  async get(fromCurrency, toCurrency, marginType = 'pricing') {
    // Construir query string manualmente
    const queryString = `?from_currency=${fromCurrency}&to_currency=${toCurrency}&margin_type=${marginType}`;
    const response = await apiClient.get(`/exchange-rate${queryString}`);
    return response;
  },

  async getForPricing(fromCurrency, toCurrency) {
    return this.get(fromCurrency, toCurrency, 'pricing');
  },

  async getForConciliation(fromCurrency, toCurrency) {
    return this.get(fromCurrency, toCurrency, 'conciliation');
  },

  async getForConversion(fromCurrency, toCurrency) {
    return this.get(fromCurrency, toCurrency, 'conversion');
  }
};

export default exchangeRateService;