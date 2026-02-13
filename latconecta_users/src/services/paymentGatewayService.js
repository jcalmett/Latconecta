// =============================================================================
// paymentGatewayService.js
// Servicio genérico de pasarela de pagos para latconecta_users
// 
// Ubicación: latconecta_users/src/services/paymentGatewayService.js
//
// Lee VITE_CARD_PAYMENT_PROVIDER y VITE_BARCODE_PAYMENT_PROVIDER del .env
// para determinar qué proveedor usar en cada método de pago.
// El PROVIDER_REGISTRY mapea cada nombre de proveedor a su implementación.
// =============================================================================

import { izipayProvider } from './providers/izipayProvider';
// Futuros proveedores:
// import { stripeProvider } from './providers/stripeProvider';
// import { conektaProvider } from './providers/conektaProvider';
// import { barcodeLocalProvider } from './providers/barcodeLocalProvider';

// ---------------------------------------------------------------------------
// PROVIDER REGISTRY
// Cada proveedor implementa: { getCheckoutComponent(), reversePayment() }
// ---------------------------------------------------------------------------
const PROVIDER_REGISTRY = {
  izipay: izipayProvider,
  // stripe: stripeProvider,
  // conekta: conektaProvider,
  // barcode_local: barcodeLocalProvider,
};

// ---------------------------------------------------------------------------
// Configuración leída del .env (una sola vez al importar el módulo)
// ---------------------------------------------------------------------------
const CARD_PROVIDER_NAME = import.meta.env.VITE_CARD_PAYMENT_PROVIDER || 'none';
const BARCODE_PROVIDER_NAME = import.meta.env.VITE_BARCODE_PAYMENT_PROVIDER || 'none';
const PAYMENT_COUNTRY = import.meta.env.VITE_PAYMENT_COUNTRY || 'US';

// ---------------------------------------------------------------------------
// API PÚBLICA
// ---------------------------------------------------------------------------

/** true si el pago con tarjeta está habilitado */
export const isCardPaymentEnabled = () => {
  return CARD_PROVIDER_NAME !== 'none' && PROVIDER_REGISTRY[CARD_PROVIDER_NAME] != null;
};

/** true si el pago con barcode está habilitado */
export const isBarcodePaymentEnabled = () => {
  return BARCODE_PROVIDER_NAME !== 'none' && PROVIDER_REGISTRY[BARCODE_PROVIDER_NAME] != null;
};

/** Nombre del proveedor de tarjeta activo */
export const getCardProviderName = () => CARD_PROVIDER_NAME;

/** Nombre del proveedor de barcode activo */
export const getBarcodeProviderName = () => BARCODE_PROVIDER_NAME;

/** País configurado para esta instalación */
export const getPaymentCountry = () => PAYMENT_COUNTRY;

/**
 * Obtiene el proveedor por método de pago ('card' o 'barcode')
 * @returns {object|null}
 */
export const getProvider = (paymentMethod) => {
  const providerName = paymentMethod === 'card' ? CARD_PROVIDER_NAME : BARCODE_PROVIDER_NAME;
  if (providerName === 'none') return null;
  return PROVIDER_REGISTRY[providerName] || null;
};

/**
 * Obtiene el componente React de checkout para el método de pago.
 * PurchasePopup renderiza este componente cuando el usuario elige 'card'.
 * @returns {React.Component|null}
 */
export const getCheckoutComponent = (paymentMethod) => {
  const provider = getProvider(paymentMethod);
  if (!provider) return null;
  return provider.getCheckoutComponent();
};

/**
 * Revierte/reembolsa una transacción.
 * 
 * @param {string} paymentMethod - 'card' o 'barcode'
 * @param {object} transactionData - {
 *   transactionUuid: string,  // UUID de la transacción en el gateway
 *   amount: number,           // Monto en unidad monetaria (no centavos)
 *   currency: string,         // PEN, USD, MXN, etc.
 *   orderNumber: string,
 *   provider: string,         // Nombre del proveedor que procesó
 * }
 * @returns {Promise<{success, message, reversalRef}>}
 */
export const reversePayment = async (paymentMethod, transactionData) => {
  const provider = getProvider(paymentMethod);
  if (!provider || !provider.reversePayment) {
    return { 
      success: false, 
      message: 'Proveedor no soporta reversiones',
      reversalRef: null 
    };
  }
  return provider.reversePayment(transactionData);
};

/** Info de configuración para diagnóstico */
export const getGatewayConfig = () => ({
  country: PAYMENT_COUNTRY,
  cardProvider: CARD_PROVIDER_NAME,
  barcodeProvider: BARCODE_PROVIDER_NAME,
  cardEnabled: isCardPaymentEnabled(),
  barcodeEnabled: isBarcodePaymentEnabled(),
});

export default {
  isCardPaymentEnabled,
  isBarcodePaymentEnabled,
  getCardProviderName,
  getBarcodeProviderName,
  getPaymentCountry,
  getProvider,
  getCheckoutComponent,
  reversePayment,
  getGatewayConfig,
};