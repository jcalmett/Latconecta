import apiClient from './apiClient';

class PurchasesService {
  async create(purchaseData) {
    try {
      return await apiClient.post('/purchases/create', purchaseData); 
    } catch (error) {
      throw new Error(error.message || 'Error al crear compra');
    }
  }

  async getByUser(userId) {
    try {
      return await apiClient.get(`/purchases/user/${userId}`);
    } catch (error) {
      throw new Error(error.message || 'Error al obtener compras');
    }
  }

  async getMyPurchases() {
    try {
      return await apiClient.get('/purchases/user/me');
    } catch (error) {
      throw new Error(error.message || 'Error al obtener mis compras');
    }
  }

  async getById(purchaseId) {
    try {
      return await apiClient.get(`/purchases/${purchaseId}`);
    } catch (error) {
      throw new Error(error.message || 'Error al obtener detalle');
    }
  }

  // ✅ ACTUALIZADO: Validación de teléfono con mejor manejo de errores
  async validatePhone(productId, phoneNumber) {
    try {
      console.log(`📞 Validating phone: ${phoneNumber} for product: ${productId}`);
      
      const response = await fetch(`${apiClient.baseURL}/purchases/validate-phone?product_id=${productId}&phone_number=${phoneNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Siempre intentar parsear como JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Error parsing JSON response:', parseError);
        return {
          status: 500,
          data: { valid: false },
          message: 'Error al procesar respuesta del servidor'
        };
      }

      console.log('📥 Validation response:', data);

      // Normalizar respuesta
      // El backend puede retornar diferentes formatos dependiendo del error
      if (response.ok && data) {
        return {
          status: data.status || 200,
          data: data.data || { valid: false },
          message: data.message || 'Validación completada'
        };
      } else {
        // Error HTTP
        console.error('❌ HTTP error:', response.status, data);
        return {
          status: response.status,
          data: { valid: false },
          message: data.detail || data.message || 'Error al validar teléfono'
        };
      }
    } catch (error) {
      console.error('❌ Network error in validatePhone:', error);
      
      // Error de red o conexión
      return {
        status: 500,
        data: { valid: false },
        message: 'No se pudo conectar con el servidor. Verifica tu conexión.'
      };
    }
  }

  // ✅ ACTUALIZADO: Validación de cuenta con mejor manejo de errores
  async validateAccount(productId, accountNumber) {
    try {
      console.log(`🏦 Validating account: ${accountNumber} for product: ${productId}`);
      
      const response = await fetch(`${apiClient.baseURL}/purchases/validate-account?product_id=${productId}&account_number=${accountNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Siempre intentar parsear como JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Error parsing JSON response:', parseError);
        return {
          status: 500,
          data: { valid: false },
          message: 'Error al procesar respuesta del servidor'
        };
      }

      console.log('📥 Validation response:', data);

      // Normalizar respuesta
      if (response.ok && data) {
        return {
          status: data.status || 200,
          data: data.data || { valid: false, monto_base: 0, indicador: 'T', account_holder: '' },
          message: data.message || 'Validación completada'
        };
      } else {
        // Error HTTP
        console.error('❌ HTTP error:', response.status, data);
        return {
          status: response.status,
          data: { valid: false, monto_base: 0, indicador: 'T', account_holder: '' },
          message: data.detail || data.message || 'Error al validar cuenta'
        };
      }
    } catch (error) {
      console.error('❌ Network error in validateAccount:', error);
      
      // Error de red o conexión
      return {
        status: 500,
        data: { valid: false, monto_base: 0, indicador: 'T', account_holder: '' },
        message: 'No se pudo conectar con el servidor. Verifica tu conexión.'
      };
    }
  }

  async processPayment(paymentData) {
    try {
      return await apiClient.post('/purchases/payment', paymentData);
    } catch (error) {
      throw new Error(error.message || 'Error al procesar pago');
    }
  }

  async generateBarcode(barcodeData) {
    try {
      return await apiClient.post('/purchases/barcode', barcodeData);
    } catch (error) {
      throw new Error(error.message || 'Error al generar barcode');
    }
  }

  async provisionService(purchaseId) {
    try {
      return await apiClient.post('/purchases/provision', { purchase_id: purchaseId });
    } catch (error) {
      throw new Error(error.message || 'Error al aprovisionar');
    }
  }

  async reverseTransaction(purchaseId, reason) {
    try {
      return await apiClient.post('/purchases/reversal', { 
        purchase_id: purchaseId,
        reason: reason 
      });
    } catch (error) {
      throw new Error(error.message || 'Error al revertir');
    }
  }
}

export default new PurchasesService();