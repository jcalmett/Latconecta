import { isPhysicalService } from '../utils/productType.js';
import { keycap } from '../utils/formatting.js';

/**
 * ASK DELIVERY — a diferencia de ISAMEDIC (todo es entrega física),
 * Latconecta vende tipos de producto muy distintos entre sí:
 * - topup/paquete/bill_payment/transfer: necesitan el número/cuenta destino.
 * - smartphone: necesita nombre, teléfono de contacto y dirección de entrega.
 *
 * SIMPLIFICACIÓN CONOCIDA (MVP, pendiente de revisar contigo): no se valida
 * el número/cuenta contra el backend (/purchases/validate-phone o similar,
 * como sí hace PurchasePopup.jsx en la web) antes de continuar.
 */
export async function handle(session, text) {
  const value = (text || '').trim();
  const physical = isPhysicalService(session.data.selectedService);

  if (!physical) {
    if (!value) {
      return { text: '¿Cuál es el número o cuenta a la que va este producto? 📱', nextState: 'askDelivery' };
    }
    session.data.accountOrPhone = value;
    session.data.deliveryPhone = value; // también usado como contacto
    return goToConfirm(session);
  }

  switch (session.data.deliveryStep) {
    case 'name':
      if (!value) return { text: '¿A qué nombre está el pedido? 😊', nextState: 'askDelivery' };
      session.data.deliveryName = value;
      session.data.deliveryStep = 'phone';
      return { text: '¿Cuál es el teléfono de contacto? 📱', nextState: 'askDelivery' };

    case 'phone':
      if (!value) return { text: '¿Cuál es el teléfono de contacto? 📱', nextState: 'askDelivery' };
      session.data.deliveryPhone = value;
      session.data.deliveryStep = 'address';
      return { text: '¿Cuál es la dirección de entrega? 📍', nextState: 'askDelivery' };

    case 'address':
      if (!value) return { text: '¿Cuál es la dirección de entrega? 📍', nextState: 'askDelivery' };
      session.data.deliveryAddress = value;
      return goToConfirm(session);

    default:
      session.data.deliveryStep = 'name';
      return { text: '¿A qué nombre está el pedido? 😊', nextState: 'askDelivery' };
  }
}

function goToConfirm(session) {
  const p = session.data.selectedProduct;
  const precio = p.product_total_price ?? p.product_price ?? '';
  const moneda = p.purchase_currency || p.product_currency || '';

  let resumen = `📦 *Resumen de tu pedido*\n*Producto:* ${p.product_name}\n*Precio:* ${moneda} ${precio}`;
  if (session.data.accountOrPhone) {
    resumen += `\n*Número/cuenta destino:* ${session.data.accountOrPhone}`;
  }
  if (session.data.deliveryName) {
    resumen += `\n*Entrega:* ${session.data.deliveryName} — ${session.data.deliveryPhone}\n*Dirección:* ${session.data.deliveryAddress}`;
  }
  resumen += `\n\n${keycap(1)} Confirmar\n${keycap(2)} Cambiar producto`;

  return { text: resumen, nextState: 'confirmOrder' };
}

export default { handle };
