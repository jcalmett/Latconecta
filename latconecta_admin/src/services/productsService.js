import apiClient from '../config/api';

const productsService = {
  /**
   * Obtener todos los productos
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/products/', { params });
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
   * Crear un nuevo producto
   */
  create: async (productData) => {
    try {
      const response = await apiClient.post('/products/', productData);
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  /**
   * Actualizar un producto existente
   */
  update: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un producto
   */
  delete: async (id) => {
    try {
      await apiClient.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener productos por servicio
   */
  getByService: async (serviceId) => {
    try {
      const response = await apiClient.get(`/products/service/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener productos del servicio ${serviceId}:`, error);
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