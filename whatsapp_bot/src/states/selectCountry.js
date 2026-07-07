import latconectaApi from '../services/latconectaApi.js';
import { flagEmoji, keycap } from '../utils/formatting.js';

/**
 * SELECT COUNTRY — paso adicional respecto a ISAMEDIC (mono-país).
 * Latconecta vende servicios de todos los países registrados, sin importar
 * en qué país esté instalado el número del bot.
 */
export async function handle(session, text) {
  const clean = (text || '').trim().toLowerCase();

  const opciones = session.data.countryOptions || [];
  const index = parseInt(clean, 10) - 1;

  if (isNaN(index) || index < 0 || index >= opciones.length) {
    const lista = opciones.map((c, i) => `${keycap(i + 1)} ${flagEmoji(c.country_code)} *${c.country_name}*`).join('\n');
    return { text: `No entendí tu respuesta 🤔 Elige una opción de la lista:\n${lista}`, nextState: 'selectCountry' };
  }

  const country = opciones[index];
  session.data.selectedCountry = country;

  let services = [];
  try {
    services = await latconectaApi.getActiveServices();
  } catch (err) {
    console.error('Error getActiveServices:', err.message);
    return { text: 'Estamos con problemitas técnicos ahora mismo 🙏 Intenta de nuevo en unos minutos.', nextState: 'selectCountry' };
  }

  if (services.length === 0) {
    return { text: 'No tenemos servicios disponibles en este momento 😕', nextState: 'selectCountry' };
  }

  session.data.serviceOptions = services;
  const lista = services.map((s, i) => `${keycap(i + 1)} *${s.service_name}*`).join('\n');

  return {
    text: `¡Perfecto! Elegiste ${flagEmoji(country.country_code)} *${country.country_name}* 🙌\n\n¿Qué servicio buscas?\n${lista}\n\n(Escribe *atras* para elegir otro país)`,
    nextState: 'selectService'
  };
}

export default { handle };
