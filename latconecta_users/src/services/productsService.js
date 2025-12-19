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
    const allProducts = await apiClient.get('/products/');
    console.log('🔍 TODOS los productos:', allProducts); // ← AGREGAR ESTA LÍNEA
    const filteredProducts = Array.isArray(allProducts) 
      ? allProducts.filter(p => p.service_id === serviceId)
      : [];
    console.log(`✅ Productos del servicio ${serviceId}:`, filteredProducts);
    return filteredProducts;
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