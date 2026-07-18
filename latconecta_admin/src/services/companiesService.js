import apiClient from '../config/api';

const companiesService = {
  /**
   * Obtener todas las compañías (activas e inactivas — vista de gestión admin).
   * IMPORTANTE (17/07/2026): antes el backend nunca filtraba por estado
   * (bug real, sin relación con esto), así que "todas" ya venía por defecto.
   * Corregido el backend para filtrar solo 'active' por defecto (para que
   * web/mobile/WhatsApp no vean inactivas) — el admin ahora debe pedir
   * explícitamente company_status=all para conservar el mismo comportamiento
   * de gestión completa que ya tenía.
   */
  getAll: async () => {
    try {
      console.log('🔵 Obteniendo todas las compañías...');
      const response = await apiClient.get('/companies/', { params: { company_status: 'all' } });
      console.log('✅ Compañías obtenidas:', response.data);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error('❌ Error al obtener compañías:', error);
      throw error;
    }
  },

  /**
   * Obtener información de la compañía activa (primera compañía)
   * Mantiene compatibilidad con código legacy
   */
  getActive: async () => {
    try {
      console.log('🔵 Obteniendo información de la compañía activa...');
      const response = await apiClient.get('/companies/', { params: { company_status: 'all' } });
      console.log('✅ Compañía obtenida:', response.data);
      // Retornar el primer elemento si es array, o el objeto directamente
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.error('❌ Error al obtener compañía:', error);
      throw error;
    }
  },

  /**
   * Obtener información de la compañía (alias de getActive)
   * Mantiene compatibilidad con código legacy
   */
  get: async () => {
    try {
      console.log('🔵 Obteniendo información de la compañía...');
      const response = await apiClient.get('/companies/', { params: { company_status: 'all' } });
      console.log('✅ Compañía obtenida:', response.data);
      // Retornar el primer elemento si es array, o el objeto directamente
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.error('❌ Error al obtener compañía:', error);
      throw error;
    }
  },

  /**
   * Obtener una compañía por ID
   */
  getById: async (companyId) => {
    try {
      console.log(`🔵 Obteniendo compañía ID ${companyId}...`);
      const response = await apiClient.get(`/companies/${companyId}`);
      console.log('✅ Compañía obtenida:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener compañía:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva compañía
   * LATCONECTA: Requiere country_id y service_id
   */
  create: async (companyData) => {
    try {
      console.log('🔵 Creando nueva compañía:', companyData);

      // Validaciones Latconecta
      if (!companyData.country_id) {
        throw new Error('country_id es requerido');
      }
      if (!companyData.service_id) {
        throw new Error('service_id es requerido');
      }

      const response = await apiClient.post('/companies/', companyData);
      console.log('✅ Compañía creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear compañía:', error);
      throw error;
    }
  },

  /**
   * Actualizar información de la compañía
   */
  update: async (companyId, companyData) => {
    try {
      console.log(`🔵 Actualizando compañía ID ${companyId}:`, companyData);

      // Validar company_id
      if (!companyId) {
        throw new Error('company_id es requerido para actualizar');
      }

      const response = await apiClient.put(`/companies/${companyId}`, companyData);
      console.log('✅ Compañía actualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar compañía:', error);
      throw error;
    }
  },

  /**
   * Eliminar una compañía
   */
  delete: async (companyId) => {
    try {
      console.log(`🔵 Eliminando compañía ID ${companyId}...`);
      
      if (!companyId) {
        throw new Error('company_id es requerido para eliminar');
      }

      await apiClient.delete(`/companies/${companyId}`);
      console.log('✅ Compañía eliminada');
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar compañía:', error);
      throw error;
    }
  },

  /**
   * Obtener compañías por país
   * NUEVO: Filtro específico de Latconecta
   */
  getByCountry: async (countryId) => {
    try {
      console.log(`🔵 Obteniendo compañías del país ${countryId}...`);
      const response = await apiClient.get('/companies/', {
        params: { country_id: countryId, company_status: 'all' }
      });
      console.log('✅ Compañías obtenidas:', response.data);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error('❌ Error al obtener compañías por país:', error);
      throw error;
    }
  },

  /**
   * Obtener compañías por servicio
   * NUEVO: Filtro específico de Latconecta
   */
  getByService: async (serviceId) => {
    try {
      console.log(`🔵 Obteniendo compañías del servicio ${serviceId}...`);
      const response = await apiClient.get('/companies/', {
        params: { service_id: serviceId, company_status: 'all' }
      });
      console.log('✅ Compañías obtenidas:', response.data);
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error('❌ Error al obtener compañías por servicio:', error);
      throw error;
    }
  }
};

export default companiesService;