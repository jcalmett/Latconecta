import apiClient from './apiClient';

const latconectaService = {
  /**
   * Obtener información corporativa de Latconecta
   * Retorna el único registro de la empresa matriz
   */
  get: async () => {
    try {
      console.log('🔵 Obteniendo información de Latconecta...');
      const data = await apiClient.get('/latconecta/');
      console.log('✅ Latconecta obtenida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener Latconecta:', error);
      throw error;
    }
  },

  /**
   * Actualizar información corporativa de Latconecta
   */
  update: async (latconectaData) => {
    try {
      console.log('🔵 Actualizando información de Latconecta:', latconectaData);
      const data = await apiClient.put('/latconecta/', latconectaData);
      console.log('✅ Latconecta actualizada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar Latconecta:', error);
      throw error;
    }
  }
};

export default latconectaService;