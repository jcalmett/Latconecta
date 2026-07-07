import latconectaApi from '../services/latconectaApi.js';
import { keycap } from '../utils/formatting.js';

/**
 * SELECT COMPANY — equivalente al paso "compañía/operador" que ya existe
 * en el frontend web (ShopView.jsx). Nota: existe un bug conocido y ya
 * reportado — el backend no filtra compañías por company_status. Se hereda
 * ese comportamiento aquí (se listan todas las que matchean país+servicio)
 * hasta que se corrija a nivel backend.
 */
export async function handle(session, text) {
  const clean = (text || '').trim().toLowerCase();

  if (clean === 'atras') {
    const servicios = session.data.serviceOptions || [];
    const lista = servicios.map((s, i) => `${keycap(i + 1)} *${s.service_name}*`).join('\n');
    return { text: `¿Qué servicio buscas?\n${lista}\n\n(Escribe *atras* para elegir otro país)`, nextState: 'selectService' };
  }

  const opciones = session.data.companyOptions || [];
  const index = parseInt(clean, 10) - 1;

  if (isNaN(index) || index < 0 || index >= opciones.length) {
    const lista = opciones.map((c, i) => `${keycap(i + 1)} *${c.company_name}*`).join('\n');
    return { text: `No entendí tu respuesta 🤔 Elige una opción de la lista:\n${lista}`, nextState: 'selectCompany' };
  }

  const company = opciones[index];
  session.data.selectedCompany = company;

  const service = session.data.selectedService;
  let products = [];
  try {
    products = await latconectaApi.getActiveProducts(service.service_id, company.company_id);
  } catch (err) {
    console.error('Error getActiveProducts:', err.message);
    return { text: 'Estamos con problemitas técnicos ahora mismo 🙏 Intenta de nuevo en unos minutos.', nextState: 'selectCompany' };
  }

  if (products.length === 0) {
    return {
      text: `Uy, no tenemos productos de *${company.company_name}* disponibles ahora 😕\n\nEscribe *atras* para elegir otra compañía.`,
      nextState: 'selectCompany'
    };
  }

  session.data.productOptions = products;
  const lista = products
    .map((p, i) => `${keycap(i + 1)} *${p.product_name}* — ${p.purchase_currency || p.product_currency || ''} ${p.product_total_price ?? p.product_price ?? ''}`)
    .join('\n');

  return {
    text: `Productos de *${company.company_name}* 🛍️\n${lista}\n\n(Escribe *atras* para elegir otra compañía)`,
    nextState: 'selectProduct'
  };
}

export default { handle };
