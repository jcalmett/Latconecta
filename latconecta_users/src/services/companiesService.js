import apiClient from './apiClient';

const companiesService = {
  /**
   * Obtener información de la compañía activa (legacy)
   */
  getActive: async () => {
    try {
      console.log('🔵 Obteniendo información de la compañía...');
      const data = await apiClient.get('/companies/');
      console.log('✅ Compañía obtenida:', data);
      return Array.isArray(data) ? data[0] : data;
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
      const data = await apiClient.get('/companies/');
      console.log('✅ Compañía obtenida:', data);
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('❌ Error al obtener compañía:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las compañías
   */
  getAll: async () => {
    try {
      console.log('🔵 Obteniendo todas las compañías...');
      const data = await apiClient.get('/companies/');
      console.log('✅ Compañías obtenidas:', data);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('❌ Error al obtener compañías:', error);
      throw error;
    }
  },

  /**
   * Obtener compañías filtradas por país y servicio
   * @param {string} countryCode - Código del país (ej: "PE")
   * @param {string} serviceName - Nombre del servicio (ej: "TopUps")
   */
  getFiltered: async (countryCode = null, serviceName = null) => {
    try {
      console.log(`🔵 Obteniendo compañías filtradas - País: ${countryCode}, Servicio: ${serviceName}`);
      
      // Construir query params
      const params = new URLSearchParams();
      if (countryCode) params.append('country', countryCode);
      if (serviceName) params.append('service', serviceName);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/companies/?${queryString}` : '/companies/';
      
      const data = await apiClient.get(endpoint);
      console.log('✅ Compañías filtradas obtenidas:', data);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('❌ Error al obtener compañías filtradas:', error);
      throw error;
    }
  },

  /**
   * Actualizar información de la compañía
   */
  update: async (companyData) => {
    try {
      console.log('🔵 Actualizando información de la compañía:', companyData);

      // Validar company_id
      const companyId = companyData.company_id;
      if (!companyId) {
        throw new Error('company_id es requerido para actualizar');
      }

      const data = await apiClient.put(`/companies/${companyId}`, companyData);
      console.log('✅ Compañía actualizada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar compañía:', error);
      throw error;
    }
  }
};

export default companiesService;