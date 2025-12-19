import apiClient from './apiClient';

const servicesService = {
  /**
   * Obtener todos los servicios
   */
  getAll: async () => {
    try {
      console.log('🔵 Obteniendo todos los servicios...');
      const data = await apiClient.get('/services/');
      console.log('✅ Servicios obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener servicios:', error);
      throw error;
    }
  },

  /**
   * Obtener solo servicios activos
   */
  getActive: async () => {
    try {
      console.log('🔵 Obteniendo servicios activos...');
      const data = await apiClient.get('/services/');
      const activeServices = Array.isArray(data) 
        ? data.filter(service => service.status === 'active')
        : [];
      console.log('✅ Servicios activos obtenidos:', activeServices);
      return activeServices;
    } catch (error) {
      console.error('❌ Error al obtener servicios activos:', error);
      throw error;
    }
  },

  /**
   * Obtener un servicio por ID
   */
  getById: async (id) => {
    try {
      console.log(`🔵 Obteniendo servicio ID: ${id}...`);
      const data = await apiClient.get(`/services/${id}`);
      console.log('✅ Servicio obtenido:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener servicio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo servicio
   */
  create: async (serviceData) => {
    try {
      console.log('🔵 Creando nuevo servicio:', serviceData);
      const data = await apiClient.post('/services/', serviceData);
      console.log('✅ Servicio creado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al crear servicio:', error);
      throw error;
    }
  },

  /**
   * Actualizar servicio existente
   */
  update: async (id, serviceData) => {
    try {
      console.log(`🔵 Actualizando servicio ID: ${id}`, serviceData);
      const data = await apiClient.put(`/services/${id}`, serviceData);
      console.log('✅ Servicio actualizado:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al actualizar servicio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar servicio
   */
  delete: async (id) => {
    try {
      console.log(`🔵 Eliminando servicio ID: ${id}...`);
      const data = await apiClient.delete(`/services/${id}`);
      console.log('✅ Servicio eliminado');
      return data;
    } catch (error) {
      console.error(`❌ Error al eliminar servicio ${id}:`, error);
      throw error;
    }
  }
};

export default servicesService;