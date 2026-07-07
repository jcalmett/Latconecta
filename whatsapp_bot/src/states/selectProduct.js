import { isPhysicalService } from '../utils/productType.js';
import { keycap } from '../utils/formatting.js';

export async function handle(session, text) {
  const clean = (text || '').trim().toLowerCase();

  if (clean === 'atras') {
    const opciones = session.data.companyOptions || [];
    const lista = opciones.map((c, i) => `${keycap(i + 1)} *${c.company_name}*`).join('\n');
    return { text: `Compañías disponibles 📋\n${lista}\n\n(Escribe *atras* para elegir otro servicio)`, nextState: 'selectCompany' };
  }

  const opciones = session.data.productOptions || [];
  const index = parseInt(clean, 10) - 1;

  if (isNaN(index) || index < 0 || index >= opciones.length) {
    const lista = opciones.map((p, i) => `${keycap(i + 1)} *${p.product_name}*`).join('\n');
    return { text: `No entendí tu respuesta 🤔 Elige una opción de la lista:\n${lista}`, nextState: 'selectProduct' };
  }

  session.data.selectedProduct = opciones[index];

  if (isPhysicalService(session.data.selectedService)) {
    session.data.deliveryStep = 'name';
    return { text: '¡Genial elección! 😊 ¿A qué nombre está el pedido?', nextState: 'askDelivery' };
  }

  session.data.deliveryStep = 'account';
  return { text: '¡Genial elección! 😊 ¿Cuál es el número o cuenta a la que va este producto?', nextState: 'askDelivery' };
}

export default { handle };
