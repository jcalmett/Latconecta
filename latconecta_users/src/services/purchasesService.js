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

  async validatePhone(phoneNumber, serviceId) {
    try {
      return await apiClient.post('/purchases/validate-phone', {
        phone_number: phoneNumber,
        service_id: serviceId
      });
    } catch (error) {
      throw new Error(error.message || 'Error al validar teléfono');
    }
  }

  async validateAccount(accountNumber, serviceId) {
    try {
      return await apiClient.post('/purchases/validate-account', {
        account_number: accountNumber,
        service_id: serviceId
      });
    } catch (error) {
      throw new Error(error.message || 'Error al validar cuenta');
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