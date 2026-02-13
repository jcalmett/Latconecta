// =============================================================================
// izipayProvider.js
// Proveedor específico de Izipay para el Payment Gateway Service
//
// Ubicación: latconecta_users/src/services/providers/izipayProvider.js
//
// Implementa la interfaz de proveedor:
//   - getCheckoutComponent() → componente React para el checkout
//   - reversePayment(transactionData) → reversión vía API REST V4
//
// Los datos de transacción que Izipay retorna y que son CRÍTICOS para reversión:
//   - transactionUuid: UUID de la transacción (campo uuid en response.transactions[0])
//   - referenceNumber: número del adquirente (para seguimiento de devoluciones)
//   - orderNumber: número de orden generado por Latconecta
//   - amount: monto cobrado
//   - currency: moneda
// =============================================================================

import IzipayCheckout from '../../components/payment/IzipayCheckout';
import paymentService from '../paymentService';

export const izipayProvider = {
  
  /**
   * Retorna el componente React para mostrar el checkout de Izipay.
   * PurchasePopup lo renderizará con las props necesarias:
   *   <Component
   *     amount={...}
   *     currency={...}
   *     orderNumber={...}
   *     user={...}
   *     onResult={(result) => ...}
   *     onCancel={() => ...}
   *   />
   * 
   * El componente retorna en onResult un objeto estandarizado:
   *   {
   *     success: boolean,
   *     provider: 'izipay',
   *     transactionUuid: string,     // CRÍTICO para CancelOrRefund
   *     transactionId: string,       // ID de transacción del comercio
   *     referenceNumber: string,     // Ref del adquirente
   *     orderNumber: string,
   *     amount: number,
   *     currency: string,
   *     payMethod: string,           // YAPE_CODE, CARD, PLIN, etc.
   *     rawResponse: object,         // Response completo de Izipay (para logging)
   *     message: string,
   *   }
   */
  getCheckoutComponent() {
    return IzipayCheckout;
  },

  /**
   * Revierte una transacción ya cobrada por Izipay.
   * Usa la API REST V4 de Lyra: POST /Transaction/CancelOrRefund
   * 
   * El comportamiento es automático:
   *   - Si la transacción NO fue capturada (mismo día, antes cierre lote) → CANCELA
   *   - Si la transacción YA fue capturada → REEMBOLSA
   * 
   * Cierre de lote en Perú: 1:00 PM y 9:00 PM
   *
   * @param {object} transactionData - Datos necesarios para la reversión
   * @returns {Promise<{success, message, reversalRef}>}
   */
  async reversePayment(transactionData) {
    try {
      console.log('🔄 Izipay: Iniciando reversión de transacción:', {
        uuid: transactionData.transactionUuid,
        amount: transactionData.amount,
        currency: transactionData.currency,
      });

      // Llama al endpoint del backend que se comunica con la API REST V4
      const result = await paymentService.reverseTransaction({
        transactionUuid: transactionData.transactionUuid,
        amount: transactionData.amount,
        currency: transactionData.currency,
        orderNumber: transactionData.orderNumber,
      });

      if (result.success) {
        console.log('✅ Izipay: Reversión exitosa:', result);
        return {
          success: true,
          message: result.message || 'Transacción revertida exitosamente',
          reversalRef: result.reversalRef || result.transactionUuid,
        };
      } else {
        console.error('❌ Izipay: Reversión fallida:', result);
        return {
          success: false,
          message: result.message || 'Error al revertir la transacción',
          reversalRef: null,
        };
      }
    } catch (error) {
      console.error('❌ Izipay: Error en reversión:', error);
      return {
        success: false,
        message: error.message || 'Error de comunicación al revertir',
        reversalRef: null,
      };
    }
  },
};

export default izipayProvider;