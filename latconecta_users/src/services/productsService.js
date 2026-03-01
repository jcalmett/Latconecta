import apiClient from './apiClient';

const productsService = {
  /**
   * Obtener todos los productos
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  /**
   * Obtener un producto por ID
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener productos por servicio
   */
  getByService: async (serviceId) => {
  try {
    console.log(`🔵 Obteniendo productos del servicio ${serviceId}...`);
    const response = await apiClient.get('/products', { params: { service_id: serviceId } });
    const products = Array.isArray(response.data) ? response.data : response;
    console.log(`✅ Productos del servicio ${serviceId}:`, products);
    return products;
  } catch (error) {
    console.error(`❌ Error al obtener productos del servicio ${serviceId}:`, error);
    throw error;
  }
},

  /**
   * Obtener productos por código de vendor
   */
  getByVendor: async (vendorCode) => {
    try {
      const response = await apiClient.get(`/products/vendor/${vendorCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener productos del vendor ${vendorCode}:`, error);
      throw error;
    }
  }
};

export default productsService;
