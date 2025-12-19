import apiClient from './apiClient';

const countriesService = {
  /**
   * Obtener información del país (Perú - country_id=1)
   */
  get: async () => {
    try {
      console.log('🔵 Obteniendo información del país...');
      const data = await apiClient.get('/countries/');
      console.log('✅ País obtenido:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener país:', error);
      throw error;
    }
  },

  /**
   * Obtener información del país (alias de get)
   */
  getActive: async () => {
    try {
      console.log('🔵 Obteniendo información del país activo...');
      const data = await apiClient.get('/countries/');
      console.log('✅ País activo obtenido:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener país activo:', error);
      throw error;
    }
  },

  /**
   * Actualizar información del país
   */
  update: async (countryData) => {
    try {
      console.log('🔵 Actualizando información del país:', countryData);
      // ✅ CORREGIDO: Agregar /1 (country_id del único país)
      const data = await apiClient.put('/countries/1', countryData);
      console.log('✅ País actualizado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar país:', error);
      throw error;
    }
  }
};

export default countriesService;