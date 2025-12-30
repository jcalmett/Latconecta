// src/services/vendorApiMappingsService.js

import apiClient from '../config/api';

const vendorApiMappingsService = {
  /**
   * Obtener todos los mappings
   */
  getAll: async () => {
    try {
      console.log('🔵 Obteniendo todos los API mappings...');
      const response = await apiClient.get('/vendor-api-mappings/');
      console.log('✅ API Mappings obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener API mappings:', error);
      throw error;
    }
  },

  /**
   * Obtener mapping por código
   */
  getById: async (code) => {
    try {
      console.log(`🔵 Obteniendo API mapping: ${code}...`);
      const response = await apiClient.get(`/vendor-api-mappings/${code}`);
      console.log('✅ API Mapping obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener API mapping ${code}:`, error);
      throw error;
    }
  },

  /**
   * Obtener mappings por vendor
   */
  getByVendor: async (vendorCode) => {
    try {
      console.log(`🔵 Obteniendo API mappings para vendor: ${vendorCode}...`);
      const response = await apiClient.get(`/vendor-api-mappings/vendor/${vendorCode}`);
      console.log('✅ API Mappings del vendor obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener API mappings del vendor ${vendorCode}:`, error);
      throw error;
    }
  },

  /**
   * Obtener campos disponibles para mapping
   */
  getAvailableFields: async () => {
    try {
      console.log('🔵 Obteniendo campos disponibles...');
      const response = await apiClient.get('/vendor-api-mappings/available-fields');
      console.log('✅ Campos disponibles obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener campos disponibles:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo mapping
   */
  create: async (mappingData) => {
    try {
      console.log('🔵 Creando nuevo API mapping:', mappingData);
      const response = await apiClient.post('/vendor-api-mappings/', mappingData);
      console.log('✅ API Mapping creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear API mapping:', error);
      throw error;
    }
  },

  /**
   * Actualizar mapping existente
   */
  update: async (code, mappingData) => {
    try {
      console.log(`🔵 Actualizando API mapping ${code}:`, mappingData);
      const response = await apiClient.put(`/vendor-api-mappings/${code}`, mappingData);
      console.log('✅ API Mapping actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar API mapping ${code}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar mapping
   */
  delete: async (code) => {
    try {
      console.log(`🔵 Eliminando API mapping ${code}...`);
      const response = await apiClient.delete(`/vendor-api-mappings/${code}`);
      console.log('✅ API Mapping eliminado');
      return response.data;
    } catch (error) {
      console.error(`❌ Error al eliminar API mapping ${code}:`, error);
      throw error;
    }
  },

  /**
   * Probar mapping con datos de ejemplo
   */
  test: async (code, testData) => {
    try {
      console.log(`🔵 Probando API mapping ${code} con datos:`, testData);
      const response = await apiClient.post(`/vendor-api-mappings/${code}/test`, testData);
      console.log('✅ Test de API Mapping completado:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al probar API mapping ${code}:`, error);
      throw error;
    }
  }
};

export default vendorApiMappingsService;