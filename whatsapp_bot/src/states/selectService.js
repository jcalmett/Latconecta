import latconectaApi from '../services/latconectaApi.js';
import { keycap } from '../utils/formatting.js';

/**
 * SELECT SERVICE — sigue la jerarquía real de Latconecta:
 * País → Servicio → Compañía → Producto (a diferencia de ISAMEDIC,
 * que va directo de Servicio a Producto por ser mono-compañía).
 */
export async function handle(session, text) {
  const clean = (text || '').trim().toLowerCase();

  if (clean === 'atras') {
    session.data.selectedService = null;
    return { text: '¿Para qué país deseas comprar? 🌎', nextState: 'welcome' };
  }

  const opciones = session.data.serviceOptions || [];
  const index = parseInt(clean, 10) - 1;

  if (isNaN(index) || index < 0 || index >= opciones.length) {
    const lista = opciones.map((s, i) => `${keycap(i + 1)} *${s.service_name}*`).join('\n');
    return { text: `No entendí tu respuesta 🤔 Elige una opción de la lista:\n${lista}`, nextState: 'selectService' };
  }

  const service = opciones[index];
  session.data.selectedService = service;

  const country = session.data.selectedCountry;
  let companies = [];
  try {
    companies = await latconectaApi.getCompanies(country?.country_code, service.service_name);
  } catch (err) {
    console.error('Error getCompanies:', err.message);
    return { text: 'Estamos con problemitas técnicos ahora mismo 🙏 Intenta de nuevo en unos minutos.', nextState: 'selectService' };
  }

  if (companies.length === 0) {
    return {
      text: `Uy, no tenemos compañías de *${service.service_name}* disponibles en *${country?.country_name}* por ahora 😕\n\nEscribe *atras* para elegir otro servicio.`,
      nextState: 'selectService'
    };
  }

  session.data.companyOptions = companies;
  const lista = companies.map((c, i) => `${keycap(i + 1)} *${c.company_name}*`).join('\n');

  return {
    text: `Compañías disponibles de *${service.service_name}* 📋\n${lista}\n\n(Escribe *atras* para elegir otro servicio)`,
    nextState: 'selectCompany'
  };
}

export default { handle };
