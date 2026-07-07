import { keycap } from '../utils/formatting.js';

/**
 * CONFIRM ORDER — entrega el enlace a la página dedicada /wsp-checkout,
 * que invoca el checkout real de Culqi automáticamente al abrir (no es
 * el catálogo general — va directo al producto exacto ya elegido).
 *
 * El pedido recién se registra en el backend (POST /purchases/create)
 * desde esa página, cuando el pago con Culqi ya se completó — nunca desde
 * el bot directamente, porque el pago requiere el modal de Culqi (no es
 * posible dentro del chat de WhatsApp).
 *
 * Opciones por número, igual que el resto del bot:
 *   1. Confirmar → genera el link de pago
 *   2. Cambiar producto → vuelve a la lista de productos de la misma
 *      compañía, sin perder país/servicio/compañía ya elegidos
 * Si el cliente simplemente no responde, no se fuerza nada — la sesión
 * expira sola por el timeout ya existente (sessionStore.js).
 */
export async function handle(session, text) {
  const clean = (text || '').trim().toLowerCase();

  if (clean === '1') {
    const product = session.data.selectedProduct;
    const base = process.env.CHECKOUT_BASE_URL || 'https://peruse.latconecta.com/wsp-checkout';

    const params = new URLSearchParams();
    params.append('product_id', product.product_id);
    params.append('jid', session.data.jid);
    if (session.data.accountOrPhone) {
      params.append('phone_number', session.data.accountOrPhone);
      params.append('account_number', session.data.accountOrPhone);
    }
    if (session.data.deliveryName) {
      params.append('delivery_name', session.data.deliveryName);
      params.append('delivery_phone', session.data.deliveryPhone);
      params.append('delivery_address', session.data.deliveryAddress);
    }

    const link = `${base}?${params.toString()}`;

    const respuesta =
      `👉 Toca para pagar tu *${product.product_name}*:\n${link}\n\n` +
      'Apenas termines el pago te aviso aquí mismo con el resultado y tu recibo 🧾 — no hace falta que escribas nada.';

    resetOrderData(session);
    return { text: respuesta, nextState: 'welcome' };
  }

  if (clean === '2') {
    const opciones = session.data.productOptions || [];
    const company = session.data.selectedCompany;
    const lista = opciones
      .map((p, i) => `${keycap(i + 1)} *${p.product_name}* — ${p.purchase_currency || p.product_currency || ''} ${p.product_total_price ?? p.product_price ?? ''}`)
      .join('\n');

    resetOrderData(session);
    return {
      text: `Productos de *${company?.company_name || ''}* 🛍️\n${lista}\n\n(Escribe *atras* para elegir otra compañía)`,
      nextState: 'selectProduct'
    };
  }

  return { text: `¿Confirmamos tu pedido? 😊\n${keycap(1)} Confirmar\n${keycap(2)} Cambiar producto`, nextState: 'confirmOrder' };
}

function resetOrderData(session) {
  session.data.selectedProduct = null;
  session.data.deliveryName = '';
  session.data.deliveryPhone = '';
  session.data.deliveryAddress = '';
  session.data.accountOrPhone = '';
  session.data.deliveryStep = null;
}

export default { handle };
