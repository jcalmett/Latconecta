/**
 * Pricing Service - Latconecta Admin
 * Reporte diario de márgenes y ajuste de precio base de productos.
 * Endpoints: /pricing/* (solo admin / superadmin)
 */
import apiClient from '../config/api';

const pricingService = {
  /**
   * GET /pricing/margin-report
   * @param {Object} filters - { vendor_code, country_id, service_id, only_below, include_inactive }
   */
  getMarginReport: async (filters = {}) => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined && value !== false) {
        params[key] = value;
      }
    });
    const response = await apiClient.get('/pricing/margin-report', { params });
    return response.data;
  },

  /**
   * PUT /pricing/products/{productId}/base-price
   * Ajusta solo el precio base; el backend recalcula descuento y total.
   */
  updateBasePrice: async (productId, productBasePrice) => {
    const response = await apiClient.put(`/pricing/products/${productId}/base-price`, {
      product_base_price: productBasePrice,
    });
    return response.data;
  },
};

export default pricingService;
