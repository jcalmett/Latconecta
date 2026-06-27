// src/services/vendorProductsService.js
import apiClient from './apiClient';

const vendorProductsService = {
  /**
   * Obtener vendor_product por sus claves únicas
   * @param {string} vendorCode - Código del vendor (ej: "DTONE")
   * @param {string} vpCode - Código del producto vendor (ej: "TP001")
   * @param {string} vpSkuid - SKU del producto vendor (ej: "SKU001")
   * @returns {Promise} Vendor product completo con vp_currency, rangos, etc.
   */
  getByKeys: async (vendorCode, vpCode, vpSkuid) => {
    try {
      console.log(`🔍 Buscando vendor_product: ${vendorCode}/${vpCode}/${vpSkuid}`);
      
      // Construir query string manualmente
      const queryString = `?vendor_code=${vendorCode}&vp_code=${vpCode}&vp_skuid=${vpSkuid}`;
      const response = await apiClient.get(`/vendor-products/by-keys${queryString}`);
      
      // El endpoint retorna un objeto directo, no un array
      console.log('✅ Vendor product encontrado:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error obteniendo vendor product:', error);
      throw error;
    }
  },

  /**
   * Listar todos los vendor products (opcional, para debug/admin)
   */
  getAll: async () => {
    try {
      const response = await apiClient.get('/vendor-products');
      return response;
    } catch (error) {
      console.error('Error obteniendo vendor products:', error);
      throw error;
    }
  },

  /**
   * Obtener vendor products por vendor
   */
  getByVendor: async (vendorCode) => {
    try {
      const response = await apiClient.get('/vendor-products', {
        params: {
          vendor_code: vendorCode
        }
      });
      return response;
    } catch (error) {
      console.error('Error obteniendo vendor products por vendor:', error);
      throw error;
    }
  }
};

export default vendorProductsService;