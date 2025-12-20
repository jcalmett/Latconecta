/**
 * Servicio para gestión de Vendor Products
 * Comunicación con API /vendor-products
 * ✅ FASE 3: Agregado método getByKeys() para búsqueda por claves de relación
 */

import apiClient from '../config/api';

const vendorProductsService = {
  /**
   * Obtener todos los vendor products con filtros
   * GET /vendor-products?skip=0&limit=100&vendor_code=X&vp_status=active...
   */
  getAll: async (filters = {}) => {
    try {
      console.log('[VendorProducts Service] Fetching all with filters:', filters);
      
      const params = new URLSearchParams();
      
      if (filters.skip !== undefined) params.append('skip', filters.skip);
      if (filters.limit !== undefined) params.append('limit', filters.limit);
      if (filters.vendor_code) params.append('vendor_code', filters.vendor_code);
      if (filters.vp_status) params.append('vp_status', filters.vp_status);
      if (filters.vp_product_type !== undefined) params.append('vp_product_type', filters.vp_product_type);
      if (filters.vp_operator) params.append('vp_operator', filters.vp_operator);
      if (filters.vp_country) params.append('vp_country', filters.vp_country);
      if (filters.search) params.append('search', filters.search);
      
      const response = await apiClient.get(`/vendor-products/?${params.toString()}`);
      console.log('[VendorProducts Service] All products fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[VendorProducts Service] Error fetching all:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener vendor product por ID
   * GET /vendor-products/{vp_id}
   */
  getById: async (vpId) => {
    try {
      console.log('[VendorProducts Service] Fetching by ID:', vpId);
      const response = await apiClient.get(`/vendor-products/${vpId}/`);
      console.log('[VendorProducts Service] Product fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[VendorProducts Service] Error fetching by ID:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener vendor product por código
   * GET /vendor-products/by-code/{vp_code}?vendor_code=X
   */
  getByCode: async (vpCode, vendorCode = null) => {
    try {
      console.log('[VendorProducts Service] Fetching by code:', vpCode, vendorCode);
      const params = vendorCode ? `?vendor_code=${vendorCode}` : '';
      const response = await apiClient.get(`/vendor-products/by-code/${vpCode}/${params}`);
      console.log('[VendorProducts Service] Product fetched by code:', response.data);
      return response.data;
    } catch (error) {
      console.error('[VendorProducts Service] Error fetching by code:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * ✅✅✅ NUEVO - FASE 3: Obtener vendor product por claves de relación
   * GET /vendor-products/by-keys?vendor_code=X&vp_code=Y&vp_skuid=Z
   * 
   * @param {string} vendorCode - Código del vendor (de products.product_vendor_code)
   * @param {string} vpCode - Código del producto vendor (de products.product_vendpro_code)
   * @param {string} vpSkuid - SKU del producto vendor (de products.product_vendpro_skuid)
   * @returns {Promise} Vendor product completo
   * 
   * Uso: Cuando tienes un product y necesitas obtener el vendor_product asociado
   */
  getByKeys: async (vendorCode, vpCode, vpSkuid) => {
    try {
      console.log('[VendorProducts Service] Fetching by keys:', { vendorCode, vpCode, vpSkuid });
      
      const params = new URLSearchParams({
        vendor_code: vendorCode,
        vp_code: vpCode,
        vp_skuid: vpSkuid
      });
      
      const response = await apiClient.get(`/vendor-products/by-keys/?${params.toString()}`);
      console.log('[VendorProducts Service] Product fetched by keys:', response.data);
      return response.data;
    } catch (error) {
      console.error('[VendorProducts Service] Error fetching by keys:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Crear nuevo vendor product
   * POST /vendor-products
   */
  create: async (vendorProductData) => {
    try {
      console.log('[VendorProducts Service] Creating vendor product:', vendorProductData);
      const response = await apiClient.post('/vendor-products/', vendorProductData);
      console.log('[VendorProducts Service] Product created:', response.data);
      return response.data;
    } catch (error) {
      console.error('[VendorProducts Service] Error creating:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Actualizar vendor product
   * PUT /vendor-products/{vp_id}
   */
  update: async (vpId, vendorProductData) => {
    try {
      console.log('[VendorProducts Service] Updating vendor product:', vpId, vendorProductData);
      const response = await apiClient.put(`/vendor-products/${vpId}/`, vendorProductData);
      console.log('[VendorProducts Service] Product updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('[VendorProducts Service] Error updating:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Eliminar vendor product
   * DELETE /vendor-products/{vp_id}
   */
  delete: async (vpId) => {
    try {
      console.log('[VendorProducts Service] Deleting vendor product:', vpId);
      await apiClient.delete(`/vendor-products/${vpId}/`);
      console.log('[VendorProducts Service] Product deleted successfully');
      return true;
    } catch (error) {
      console.error('[VendorProducts Service] Error deleting:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Actualización masiva de estado
   * PUT /vendor-products/bulk-status
   */
  bulkUpdateStatus: async (vpIds, vpStatus) => {
    try {
      console.log('[VendorProducts Service] Bulk update status:', vpIds, vpStatus);
      const response = await apiClient.put('/vendor-products/bulk-status/', {
        vp_ids: vpIds,
        vp_status: vpStatus
      });
      console.log('[VendorProducts Service] Bulk update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('[VendorProducts Service] Error bulk updating:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener resumen/estadísticas
   * GET /vendor-products/summary
   */
  getSummary: async () => {
    try {
      console.log('[VendorProducts Service] Fetching summary');
      const response = await apiClient.get('/vendor-products/summary/');
      console.log('[VendorProducts Service] Summary fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[VendorProducts Service] Error fetching summary:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default vendorProductsService;