import apiClient from './apiClient';

const companiesService = {
  /**
   * Obtener información de la compañía activa
   */
  getActive: async () => {
    try {
      console.log('🔵 Obteniendo información de la compañía...');
      const data = await apiClient.get('/companies');
      console.log('✅ Compañía obtenida:', data);
      return data;  // SIN .data
    } catch (error) {
      console.error('❌ Error al obtener compañía:', error);
      throw error;
    }
  },

  /**
   * Obtener información de la compañía (alias de getActive)
   */
  get: async () => {
    try {
      console.log('🔵 Obteniendo información de la compañía...');
      const data = await apiClient.get('/companies');
      console.log('✅ Compañía obtenida:', data);
      return data;  // SIN .data
    } catch (error) {
      console.error('❌ Error al obtener compañía:', error);
      throw error;
    }
  },

  /**
   * Actualizar información de la compañía
   */
  update: async (companyData) => {
    try {
      console.log('🔵 Actualizando información de la compañía:', companyData);
      const data = await apiClient.put('/companies', companyData);
      console.log('✅ Compañía actualizada:', data);
      return data;  // SIN .data
    } catch (error) {
      console.error('❌ Error al actualizar compañía:', error);
      throw error;
    }
  }
};

export default companiesService;