import apiClient from '../config/api';

/**
 * Servicio para gestión de Vendors
 * IMPORTANTE: apiClient ya tiene baseURL configurado como 'http://127.0.0.1:8100/api/v1'
 * Por lo tanto, las rutas aquí son relativas y NO deben incluir /api/v1
 */
const vendorsService = {
  /**
   * Listar todos los vendors
   * GET /vendors/
   */
  getAll: async (params = {}) => {
    try {
      console.log('[Vendors Service] Fetching vendors:', params);
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.vendor_type) queryParams.append('vendor_type', params.vendor_type);
      if (params.skip !== undefined) queryParams.append('skip', params.skip);
      if (params.limit !== undefined) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const url = `/vendors/${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url);
      console.log('[Vendors Service] Vendors fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error fetching vendors:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener un vendor por código
   * GET /vendors/{vendor_code}
   */
  getByCode: async (vendorCode) => {
    try {
      console.log('[Vendors Service] Fetching vendor by code:', vendorCode);
      const response = await apiClient.get(`/vendors/${vendorCode}/`);
      console.log('[Vendors Service] Vendor fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error fetching vendor:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Crear un nuevo vendor
   * POST /vendors/
   */
  create: async (vendorData) => {
    try {
      console.log('[Vendors Service] Creating vendor:', vendorData);
      const response = await apiClient.post(`/vendors/`, vendorData);
      console.log('[Vendors Service] Vendor created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error creating vendor:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Actualizar un vendor existente
   * PUT /vendors/{vendor_code}
   */
  update: async (vendorCode, vendorData) => {
    try {
      console.log('[Vendors Service] Updating vendor:', vendorCode, vendorData);
      const response = await apiClient.put(`/vendors/${vendorCode}/`, vendorData);
      console.log('[Vendors Service] Vendor updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error updating vendor:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Eliminar un vendor (solo superadmin)
   * DELETE /vendors/{vendor_code}
   */
  delete: async (vendorCode) => {
    try {
      console.log('[Vendors Service] Deleting vendor:', vendorCode);
      const response = await apiClient.delete(`/vendors/${vendorCode}/`);
      console.log('[Vendors Service] Vendor deleted successfully');
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error deleting vendor:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener productos de un vendor
   * GET /vendors/{vendor_code}/products
   */
  getProducts: async (vendorCode, params = {}) => {
    try {
      console.log('[Vendors Service] Fetching products for vendor:', vendorCode);
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.product_type) queryParams.append('product_type', params.product_type);

      const queryString = queryParams.toString();
      const url = `/vendors/${vendorCode}/products/${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url);
      console.log('[Vendors Service] Products fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error fetching products:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Actualizar balance de un vendor manualmente
   * PUT /vendors/{vendor_code}/balance
   */
  updateBalance: async (vendorCode, balanceData) => {
    try {
      console.log('[Vendors Service] Updating balance for vendor:', vendorCode, balanceData);
      const response = await apiClient.put(`/vendors/${vendorCode}/balance/`, balanceData);
      console.log('[Vendors Service] Balance updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error updating balance:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Sincronizar balance con API del vendor
   * POST /vendors/{vendor_code}/sync-balance
   */
  syncBalance: async (vendorCode) => {
    try {
      console.log('[Vendors Service] Syncing balance for vendor:', vendorCode);
      const response = await apiClient.post(`/vendors/${vendorCode}/sync-balance/`);
      console.log('[Vendors Service] Balance synced successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error syncing balance:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener alertas de saldo bajo
   * GET /vendors/balance/low-alerts
   */
  getLowBalanceAlerts: async (threshold = null) => {
    try {
      console.log('[Vendors Service] Fetching low balance alerts');
      const queryParams = threshold ? `?threshold=${threshold}` : '';
      const response = await apiClient.get(`/vendors/balance/low-alerts/${queryParams}`);
      console.log('[Vendors Service] Alerts fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error fetching alerts:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Obtener resumen de balances de todos los vendors
   * GET /vendors/balance/summary
   */
  getBalanceSummary: async () => {
    try {
      console.log('[Vendors Service] Fetching balance summary');
      const response = await apiClient.get(`/vendors/balance/summary/`);
      console.log('[Vendors Service] Summary fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error fetching summary:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Probar conexión con API del vendor
   * POST /vendors/{vendor_code}/test-connection
   */
  testConnection: async (vendorCode) => {
    try {
      console.log('[Vendors Service] Testing connection for vendor:', vendorCode);
      const response = await apiClient.post(`/vendors/${vendorCode}/test-connection/`);
      console.log('[Vendors Service] Connection test result:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Vendors Service] Error testing connection:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default vendorsService;