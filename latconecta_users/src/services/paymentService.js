// =============================================================================
// paymentService.js
// Servicio de comunicación con el backend de pagos — Culqi
//
// Endpoints del backend que consume:
//   GET  /api/v1/payments/config   → Configuración pública (public_key, gateway, etc.)
//   POST /api/v1/payments/order    → Crea Order para Yape / billeteras / PagoEfectivo
//   POST /api/v1/payments/charge   → Crea cargo con token del Checkout V4
//   POST /api/v1/payments/refund   → Devuelve un cargo (parcial o total)
//   POST /api/v1/payments/cancel   → Cancela/revierte un cargo (usado por purchases.py)
// =============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8100/api/v1';

const paymentService = {

  /**
   * Obtiene la configuración pública del payment gateway.
   * Retorna public_key, gateway, rsa_id, card_available, yape_available, etc.
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
   * Crea una Order en Culqi.
   * Necesaria para habilitar Yape, billeteras y PagoEfectivo en el Checkout V4.
   * El order_id retornado (ord_live_XXX) se pasa a settings.order del CulqiCheckout.
   *
   * @param {object} orderData - {
   *   amount: number,         // en céntimos: S/15.00 = 1500
   *   currency_code: string,  // 'PEN'
   *   order_number: string,   // referencia única
   *   description: string,
   *   email: string,
   *   first_name: string,
   *   last_name: string,
   *   phone_number: string,
   * }
   * @returns {Promise<{success, order_id, order_number, message}>}
   */
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_URL}/payments/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} al crear order`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ paymentService.createOrder error:', error);
      throw error;
    }
  },

  /**
   * Crea un cargo en Culqi usando el token generado por el Checkout V4.
   *
   * @param {object} chargeData - {
   *   token_id: string,       // tkn_live_XXX — del Checkout V4
   *   amount: number,         // en céntimos: S/15.00 = 1500
   *   currency_code: string,  // 'PEN'
   *   email: string,
   *   description: string,
   *   order_number: string,
   *   first_name: string,
   *   last_name: string,
   *   phone_number: string,
   * }
   * @returns {Promise<{success, charge_id, outcome_type, amount, currency_code, message}>}
   */
  async createCharge(chargeData) {
    try {
      const response = await fetch(`${API_URL}/payments/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chargeData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} al crear cargo`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ paymentService.createCharge error:', error);
      throw error;
    }
  },

  /**
   * Crea una devolución (parcial o total) de un cargo en Culqi.
   *
   * @param {object} refundData - {
   *   charge_id: string,  // chr_live_XXX
   *   amount: number,     // en céntimos (puede ser parcial)
   *   reason: string,     // 'solicitud_comprador' | 'duplicado' | 'fraude'
   * }
   * @returns {Promise<{success, refund_id, amount, message}>}
   */
  async createRefund(refundData) {
    try {
      const response = await fetch(`${API_URL}/payments/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} al crear devolución`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ paymentService.createRefund error:', error);
      throw error;
    }
  },

  /**
   * Cancela/revierte un cargo (usado internamente por purchases cuando la provisión falla).
   *
   * @param {object} cancelData - {
   *   gateway: string,    // 'culqi'
   *   charge_id: string,  // chr_live_XXX
   *   amount: number,     // en céntimos
   *   currency: string,   // 'PEN'
   *   reason: string,
   * }
   * @returns {Promise<{success, cancel_id, message}>}
   */
  async cancelPayment(cancelData) {
    try {
      const response = await fetch(`${API_URL}/payments/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status} al cancelar pago`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ paymentService.cancelPayment error:', error);
      throw error;
    }
  },

};

export default paymentService;
