import apiClient from '../config/api';

/**
 * ✅ Función helper para normalizar nomenclatura de campos
 * Convierte service_photo_MKT (mayúsculas) a service_photo_mkt (minúsculas)
 * para mantener consistencia con la base de datos PostgreSQL
 */
const normalizeServiceData = (data) => {
  const normalized = {
    ...data,
    // Convertir service_photo_MKT (mayúsculas) a service_photo_mkt (minúsculas)
    service_photo_mkt: data.service_photo_MKT || data.service_photo_mkt,
  };
  
  // Eliminar la versión con mayúsculas para evitar confusión
  delete normalized.service_photo_MKT;
  
  return normalized;
};

const servicesService = {
  /**
   * Obtener todos los servicios
   */
  getAll: async () => {
    try {
      console.log('🔵 Obteniendo todos los servicios...');
      const response = await apiClient.get('/services/');
      console.log('✅ Servicios obtenidos:', response.data);
      return response.data;
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
      const response = await apiClient.get('/services/');
      const activeServices = response.data.filter(service => service.status === 'active');
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
      const response = await apiClient.get(`/services/${id}`);
      console.log('✅ Servicio obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener servicio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo servicio
   * ✅ Normaliza nomenclatura antes de enviar al backend
   */
  create: async (serviceData) => {
    try {
      console.log('🔵 Creando nuevo servicio:', serviceData);
      
      // ✅ NORMALIZAR nomenclatura antes de enviar
      const normalizedData = normalizeServiceData(serviceData);
      console.log('🔵 Datos normalizados para envío:', normalizedData);
      
      const response = await apiClient.post('/services/', normalizedData);
      console.log('✅ Servicio creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear servicio:', error);
      throw error;
    }
  },

  /**
   * Actualizar servicio existente
   * ✅ Normaliza nomenclatura antes de enviar al backend
   */
  update: async (id, serviceData) => {
    try {
      console.log(`🔵 Actualizando servicio ID: ${id}`, serviceData);
      
      // ✅ NORMALIZAR nomenclatura antes de enviar
      const normalizedData = normalizeServiceData(serviceData);
      console.log('🔵 Datos normalizados para envío:', normalizedData);
      
      const response = await apiClient.put(`/services/${id}`, normalizedData);
      console.log('✅ Servicio actualizado:', response.data);
      return response.data;
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
      const response = await apiClient.delete(`/services/${id}`);
      console.log('✅ Servicio eliminado');
      return response.data;
    } catch (error) {
      console.error(`❌ Error al eliminar servicio ${id}:`, error);
      throw error;
    }
  }
};

export default servicesService;