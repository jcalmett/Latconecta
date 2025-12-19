/**
 * Purchases Service - Bitel Admin
 * CORREGIDO: Agregados slashes finales en líneas 42 y 93
 */

import apiClient from '../config/api';

const purchasesService = {
  getAll: async (filters = {}) => {
    try {
      console.log('🔵 Obteniendo compras con filtros:', filters);
      const params = new URLSearchParams();
      if (filters.skip !== undefined) params.append('skip', filters.skip);
      if (filters.limit !== undefined) params.append('limit', filters.limit);
      if (filters.purchase_type) params.append('purchase_type', filters.purchase_type);
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.delivery_status) params.append('delivery_status', filters.delivery_status);
      if (filters.requires_manual_intervention !== undefined) {
        params.append('requires_manual_intervention', filters.requires_manual_intervention);
      }

      const queryString = params.toString();
      const url = queryString ? `/purchases/?${queryString}` : '/purchases/';

      const response = await apiClient.get(url);
      console.log('✅ Compras obtenidas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener compras:', error);
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      console.log('🔵 Obteniendo compra por ID:', id);
      const response = await apiClient.get(`/purchases/${id}`);
      console.log('✅ Compra obtenida:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener compra:', error);
      throw error.response?.data || error;
    }
  },

  getMyPurchases: async () => {
    try {
      console.log('🔵 Obteniendo mis compras...');
      const response = await apiClient.get('/purchases/my-purchases');
      console.log('✅ Mis compras obtenidas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener mis compras:', error);
      throw error.response?.data || error;
    }
  },

  create: async (purchaseData) => {
    try {
      console.log('🔵 Creando compra:', purchaseData);
      const response = await apiClient.post('/purchases/', purchaseData);
      console.log('✅ Compra creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear compra:', error);
      throw error.response?.data || error;
    }
  },

  processPurchase: async (purchaseData) => {
    try {
      console.log('🔵 Procesando compra:', purchaseData);
      const response = await apiClient.post('/purchases/process', purchaseData);
      console.log('✅ Compra procesada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al procesar compra:', error);
      throw error.response?.data || error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      console.log('🔵 Actualizando estado de compra:', id, status);
      const response = await apiClient.patch(`/purchases/${id}/status`, { status });
      console.log('✅ Estado actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      throw error.response?.data || error;
    }
  },

  cancel: async (id) => {
    try {
      console.log('🔵 Cancelando compra:', id);
      const response = await apiClient.post(`/purchases/${id}/cancel`);
      console.log('✅ Compra cancelada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al cancelar compra:', error);
      throw error.response?.data || error;
    }
  },

  getStats: async (filters = {}) => {
    try {
      console.log('🔵 Obteniendo estadísticas de ventas...');
      const response = await apiClient.get('/purchases/stats', { params: filters });
      console.log('✅ Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error.response?.data || error;
    }
  },

  getByReference: async (reference) => {
    try {
      console.log('🔵 Obteniendo compra por referencia:', reference);
      const response = await apiClient.get(`/purchases/reference/${reference}`);
      console.log('✅ Compra obtenida:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener compra por referencia:', error);
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      console.log('🔵 Actualizando compra completa:', id, data);
      const response = await apiClient.put(`/purchases/${id}`, data);
      console.log('✅ Compra actualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar compra:', error);
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      console.log('🔵 Eliminando compra:', id);
      await apiClient.delete(`/purchases/${id}`);
      console.log('✅ Compra eliminada');
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar compra:', error);
      throw error.response?.data || error;
    }
  },

  getAdminStats: async () => {
    try {
      console.log('🔵 Obteniendo estadísticas administrativas...');
      const response = await apiClient.get('/purchases/stats/summary');
      console.log('✅ Estadísticas administrativas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas administrativas:', error);
      throw error.response?.data || error;
    }
  },

  filterPurchases: (purchases, filters) => {
    let filtered = [...purchases];
    if (filters.reference_from || filters.reference_to) {
      filtered = filtered.filter(p => {
        const ref = p.purchase_reference || '';
        const matchFrom = !filters.reference_from || ref >= filters.reference_from;
        const matchTo = !filters.reference_to || ref <= filters.reference_to;
        return matchFrom && matchTo;
      });
    }
    if (filters.date_from || filters.date_to) {
      filtered = filtered.filter(p => {
        const date = new Date(p.purchase_date);
        const matchFrom = !filters.date_from || date >= new Date(filters.date_from);
        const matchTo = !filters.date_to || date <= new Date(filters.date_to);
        return matchFrom && matchTo;
      });
    }
    if (filters.phone_search) {
      filtered = filtered.filter(p => {
        const phone = p.purchase_phone_number || '';
        return phone.includes(filters.phone_search);
      });
    }
    if (filters.payment_status) {
      filtered = filtered.filter(p => p.purchase_payment_status === filters.payment_status);
    }
    if (filters.delivery_status) {
      filtered = filtered.filter(p => p.purchase_delivery_status === filters.delivery_status);
    }
    if (filters.requires_manual_intervention !== undefined && filters.requires_manual_intervention !== '') {
      const requiresIntervention = filters.requires_manual_intervention === 'true' || filters.requires_manual_intervention === true;
      filtered = filtered.filter(p => p.requires_manual_intervention === requiresIntervention);
    }
    return filtered;
  }
};

export default purchasesService;