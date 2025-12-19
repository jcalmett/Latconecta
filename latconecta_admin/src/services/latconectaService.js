import apiClient from '../config/api';

const latconectaService = {
  /**
   * Obtener información de Latconecta
   */
  get: async () => {
    try {
      console.log('🔵 Obteniendo información de Latconecta...');
      const response = await apiClient.get('/latconecta');
      console.log('✅ Latconecta obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener Latconecta:', error);
      throw error;
    }
  },

  /**
   * Actualizar información de Latconecta
   */
  update: async (latconectaData) => {
    try {
      console.log('🔵 Actualizando información de Latconecta:', latconectaData);
      const response = await apiClient.put('/latconecta', latconectaData);
      console.log('✅ Latconecta actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar Latconecta:', error);
      throw error;
    }
  }
};

export default latconectaService;