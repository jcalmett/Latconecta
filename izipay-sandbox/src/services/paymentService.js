// frontend/src/services/paymentService.js
/**
 * Izipay Payment Service
 * Comunicación con el backend para token y validación
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
 * Obtiene la configuración pública de Izipay (merchantCode, keyRSA, sdkUrl).
 */
export async function getPaymentConfig() {
  const response = await fetch(`${API_URL}/payments/config`);
  if (!response.ok) {
    throw new Error("Error obteniendo configuración de pago");
  }
  return response.json();
}
