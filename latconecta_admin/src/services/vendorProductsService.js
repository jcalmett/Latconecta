// ========================================
// VENDOR PRODUCTS SERVICE
// ========================================

import apiClient from '../config/api';

const vendorProductsService = {
  // Obtener todos los vendor products
  getAll: async () => {
    console.log('[VendorProducts Service] Fetching all vendor products...');
    const response = await apiClient.get('/vendor-products/');
    console.log('[VendorProducts Service] Response:', response);
    console.log('[VendorProducts Service] Response.data:', response.data);
    console.log('[VendorProducts Service] Is array?', Array.isArray(response.data));
    return response.data;
  },

  // Obtener vendor product por ID
  getById: async (vpId) => {
    console.log(`[VendorProducts Service] Fetching vendor product: ${vpId}`);
    const response = await apiClient.get(`/vendor-products/${vpId}/`);
    console.log('[VendorProducts Service] Vendor product fetched successfully');
    return response.data;
  },

  // Obtener vendor product por claves compuestas
  getByKeys: async (vendorCode, vpCode, vpSkuid) => {
    console.log(`[VendorProducts Service] Fetching by keys: ${vendorCode}/${vpCode}/${vpSkuid}`);
    const response = await apiClient.get('/vendor-products/by-keys/', {
      params: {
        vendor_code: vendorCode,
        vp_code: vpCode,
        vp_skuid: vpSkuid
      }
    });
    console.log('[VendorProducts Service] Vendor product found');
    return response.data;
  },

  // Crear nuevo vendor product
  create: async (vendorProductData) => {
    console.log('[VendorProducts Service] Creating vendor product:', vendorProductData);
    const response = await apiClient.post('/vendor-products/', vendorProductData);
    console.log('[VendorProducts Service] Vendor product created successfully:', response.data);
    return response.data;
  },

  // Actualizar vendor product
  update: async (vpId, vendorProductData) => {
    console.log(`[VendorProducts Service] Updating vendor product: ${vpId}`, vendorProductData);
    const response = await apiClient.put(`/vendor-products/${vpId}/`, vendorProductData);
    console.log('[VendorProducts Service] Vendor product updated successfully');
    return response.data;
  },

  // ✅ ELIMINAR vendor product
  delete: async (vpId) => {
    console.log(`[VendorProducts Service] Deleting vendor product: ${vpId}`);
    const response = await apiClient.delete(`/vendor-products/${vpId}/`);
    console.log('[VendorProducts Service] Vendor product deleted successfully');
    return response.data;
  },

  // Obtener vendor products por vendor
  getByVendor: async (vendorCode) => {
    console.log(`[VendorProducts Service] Fetching products for vendor: ${vendorCode}`);
    const response = await apiClient.get(`/vendors/${vendorCode}/products/`);
    console.log(`[VendorProducts Service] Found ${response.data.length} products`);
    return response.data;
  }
};

export default vendorProductsService;