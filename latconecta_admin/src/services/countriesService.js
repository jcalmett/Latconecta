import apiClient from '../config/api';

const countriesService = {
  /**
   * Obtener todos los países
   */
  getAll: async () => {
    try {
      console.log('🔵 Obteniendo todos los países...');
      const response = await apiClient.get('/countries/');
      console.log('✅ Países obtenidos:', response.data);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error('❌ Error al obtener países:', error);
      throw error;
    }
  },

  /**
   * Obtener información del país activo (primer país)
   * Mantiene compatibilidad con código legacy
   */
  get: async () => {
    try {
      console.log('🔵 Obteniendo información del país...');
      const response = await apiClient.get('/countries/');
      console.log('✅ País obtenido:', response.data);
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.error('❌ Error al obtener país:', error);
      throw error;
    }
  },

  /**
   * Obtener información del país activo (alias de get)
   */
  getActive: async () => {
    try {
      console.log('🔵 Obteniendo información del país activo...');
      const response = await apiClient.get('/countries/');
      console.log('✅ País activo obtenido:', response.data);
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.error('❌ Error al obtener país activo:', error);
      throw error;
    }
  },

  /**
   * Obtener un país por ID
   */
  getById: async (countryId) => {
    try {
      console.log(`🔵 Obteniendo país ID ${countryId}...`);
      const response = await apiClient.get(`/countries/${countryId}`);
      console.log('✅ País obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener país:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo país
   */
  create: async (countryData) => {
    try {
      console.log('🔵 Creando nuevo país:', countryData);
      const response = await apiClient.post('/countries/', countryData);
      console.log('✅ País creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear país:', error);
      throw error;
    }
  },

  /**
   * Actualizar información del país
   */
  update: async (countryId, countryData) => {
    try {
      console.log(`🔵 Actualizando país ID ${countryId}:`, countryData);
      
      if (!countryId) {
        throw new Error('country_id es requerido para actualizar');
      }

      const response = await apiClient.put(`/countries/${countryId}`, countryData);
      console.log('✅ País actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar país:', error);
      throw error;
    }
  },

  /**
   * Eliminar un país
   */
  delete: async (countryId) => {
    try {
      console.log(`🔵 Eliminando país ID ${countryId}...`);
      
      if (!countryId) {
        throw new Error('country_id es requerido para eliminar');
      }

      await apiClient.delete(`/countries/${countryId}`);
      console.log('✅ País eliminado');
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar país:', error);
      throw error;
    }
  }
};

export default countriesService;