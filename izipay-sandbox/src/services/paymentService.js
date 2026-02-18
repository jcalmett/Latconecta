// frontend/src/services/paymentService.js
/**
 * Payment Service
 * Comunicación con el backend para token, validación y anulación
 * ✅ ACTUALIZADO: Soporte para anulación de transacciones
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Solicita un token de sesión al backend.
 * El backend llama a Izipay API y retorna el JWT.
 */
export async function requestSessionToken(orderNumber, amount, currency = "PEN") {
  const response = await fetch(`${API_URL}/payments/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_number: orderNumber,
      amount: amount,
      currency: currency,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Valida la firma HMAC del resultado de pago.
 * El backend verifica con la Clave HASH de Izipay.
 * ✅ ACTUALIZADO: Ahora retorna datos necesarios para anulación
 * (unique_id, authorization_code, transaction_datetime, pay_method, channel)
 */
export async function validatePayment(orderNumber, payloadHttp, signature, transactionId) {
  const response = await fetch(`${API_URL}/payments/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_number: orderNumber,
      payload_http: payloadHttp,
      signature: signature,
      transaction_id: transactionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * ✅ NUEVO: Anula/cancela una transacción de pago.
 * Usa los datos retornados por validatePayment().
 *
 * @param {Object} cancelData - Datos de la transacción a anular
 * @param {string} cancelData.gateway - Gateway ('izipay', 'conekta', 'stripe')
 * @param {string} cancelData.transaction_id - ID de la transacción original
 * @param {string} cancelData.order_number - Número de orden original
 * @param {string} cancelData.amount - Monto (ej: "15.00")
 * @param {string} cancelData.currency - Moneda (PEN/USD)
 * @param {string} cancelData.unique_id - uniqueId del pago original (IZIPAY)
 * @param {string} cancelData.authorization_code - Código de autorización (IZIPAY)
 * @param {string} cancelData.transaction_datetime - Fecha/hora transacción (IZIPAY)
 * @param {string} cancelData.pay_method - Método de pago (CARD/YAPE_CODE/PAGO_PUSH)
 * @param {string} cancelData.channel - Canal (ecommerce)
 * @returns {Object} Resultado de la anulación
 */
export async function cancelPayment(cancelData) {
  const response = await fetch(`${API_URL}/payments/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cancelData),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene la configuración pública de Izipay (merchantCode, keyRSA, sdkUrl).
 */
export async function getPaymentConfig() {
  const response = await fetch(`${API_URL}/payments/config`);
  if (!response.ok) {
    throw new Error("Error obteniendo configuración de pago");
  }
  return response.json();
}

/**
 * ✅ NUEVO: Lista los gateways de pago disponibles.
 */
export async function getAvailableGateways() {
  const response = await fetch(`${API_URL}/payments/gateways`);
  if (!response.ok) {
    throw new Error("Error obteniendo gateways disponibles");
  }
  return response.json();
}