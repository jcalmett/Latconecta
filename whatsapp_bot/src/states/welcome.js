import latconectaApi from '../services/latconectaApi.js';
import { flagEmoji, keycap } from '../utils/formatting.js';

/**
 * WELCOME — primer contacto o reinicio ("menu"/"inicio").
 * Identifica al cliente por teléfono contra el backend, manda el logo real
 * de Latconecta (GET /latconecta) y muestra el menú de países disponibles
 * con banderas — Latconecta vende todo lo activo, sin importar en qué país
 * esté instalado el número del bot.
 */
export async function handle(session) {
  const { phoneNumber, countryCode } = session.data;

  let saludo = '¡Hola! 👋 Bienvenido a *Latconecta* 🎉';
  try {
    const identify = await latconectaApi.identify(countryCode, phoneNumber);
    if (identify.status === 'found') {
      session.data.user = { user_id: identify.user_id, user_name: identify.user_name };
      saludo = `¡Hola ${identify.user_name}! 👋 Qué bueno tenerte de vuelta en *Latconecta* 🎉`;
    }
  } catch (err) {
    // Si falla la identificación, seguimos como cliente anónimo — no bloquea la venta.
    console.error('Error identify:', err.message);
  }

  let countries = [];
  try {
    countries = await latconectaApi.getCountries();
  } catch (err) {
    console.error('Error getCountries:', err.message);
    return { text: `${saludo}\n\nEstamos con problemitas técnicos ahora mismo 🙏 Intenta de nuevo en unos minutos.`, nextState: 'welcome' };
  }

  if (countries.length === 0) {
    return { text: `${saludo}\n\nNo tenemos países disponibles en este momento 😕`, nextState: 'welcome' };
  }

  session.data.countryOptions = countries;
  const lista = countries
    .map((c, i) => `${keycap(i + 1)} ${flagEmoji(c.country_code)} *${c.country_name}*`)
    .join('\n');

  const texto = `${saludo}\n\n¿Para qué país deseas comprar hoy? 🌎\n${lista}`;

  let imageUrl = null;
  try {
    imageUrl = await latconectaApi.getLogoUrl();
  } catch (err) {
    console.error('Error getLogoUrl:', err.message);
  }

  return { text: texto, nextState: 'selectCountry', imageUrl };
}

export default { handle };
