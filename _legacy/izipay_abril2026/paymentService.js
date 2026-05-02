// =============================================================================
// paymentService.js
// Servicio de comunicación con el backend de pagos
//
// Ubicación: latconecta_users/src/services/paymentService.js
//
// Adaptado del izipay-sandbox. Usa la misma VITE_API_BASE_URL que el resto
// de latconecta_users (no una URL propia).
//
// Endpoints del backend que consume:
//   POST /api/v1/payments/token     → Genera token JWT para Izipay SDK
//   POST /api/v1/payments/validate  → Valida firma HMAC-SHA256 del response
//   GET  /api/v1/payments/config    → Obtiene config pública (merchantCode, etc.)
//   POST /api/v1/payments/reverse   → Revierte transacción vía API REST V4 (PENDIENTE)
// =============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8100/api/v1';

const paymentService = {

  /**
   * Genera un token de autorización para inicializar el SDK de Izipay.
   * El backend genera un JWT firmado con las credenciales del merchant.
   *
   * @param {object} orderData - Datos de la orden:
   *   { orderNumber, amount, currency, transactionId, email }
   * @returns {Promise<{token: string}>}
   */
  async getToken(orderData) {
    try {
      const response = await fetch(`${API_URL}/payments/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} al obtener token`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ paymentService.getToken error:', error);
      throw error;
    }
  },

  /**
   * Valida la firma HMAC-SHA256 del response de Izipay.
   * Confirma que la respuesta no fue manipulada.
   *
   * @param {object} validationData - { 'kr-hash': string, 'kr-hash-key': string, 'kr-answer': string }
   * @returns {Promise<{valid: boolean}>}
   */
  async validatePayment(validationData) {
    try {
      const response = await fetch(`${API_URL}/payments/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} al validar pago`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ paymentService.validatePayment error:', error);
      throw error;
    }
  },

  /**
   * Obtiene la configuración pública del payment gateway.
   * Retorna merchantCode, publicKey, environment, etc.
   *
   * @returns {Promise<object>}
   */
  async getConfig() {
    try {
      const response = await fetch(`${API_URL}/payments/config`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} al obtener config`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ paymentService.getConfig error:', error);
      throw error;
    }
  },

  /**
   * Revierte/reembolsa una transacción ya cobrada.
   * Llama al backend que se comunica con la API REST V4 de Lyra/Izipay.
   * 
   * NOTA: Este endpoint del backend está PENDIENTE de implementar.
   * Requiere credenciales del Back Office Vendedor (shopId + password de API REST).
   *
   * @param {object} reversalData - {
   *   transactionUuid: string,   // UUID de la transacción en Izipay
   *   amount: number,            // Monto en unidad monetaria (no centavos)
   *   currency: string,          // PEN, USD, etc.
   *   orderNumber: string,
   * }
   * @returns {Promise<{success, message, reversalRef}>}
   */
  async reverseTransaction(reversalData) {
    try {
      const response = await fetch(`${API_URL}/payments/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reversalData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} al revertir transacción`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ paymentService.reverseTransaction error:', error);
      throw error;
    }
  },
};

export default paymentService;