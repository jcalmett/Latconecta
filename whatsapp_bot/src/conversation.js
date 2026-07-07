import { getOrCreateSession, setSession, deleteSession } from './utils/sessionStore.js';
import * as welcome from './states/welcome.js';
import * as selectCountry from './states/selectCountry.js';
import * as selectService from './states/selectService.js';
import * as selectCompany from './states/selectCompany.js';
import * as selectProduct from './states/selectProduct.js';
import * as askDelivery from './states/askDelivery.js';
import * as confirmOrder from './states/confirmOrder.js';

const handlers = {
  welcome,
  selectCountry,
  selectService,
  selectCompany,
  selectProduct,
  askDelivery,
  confirmOrder
};

/**
 * Extrae código de país + número desde un JID de WhatsApp.
 * JID típico: "51987654321@s.whatsapp.net"
 * Nota: esta separación es aproximada (no valida contra una tabla real de
 * prefijos de país) — suficiente para el MVP de pruebas con el equipo.
 */
function parseJid(jid) {
  const raw = jid.split('@')[0];
  const countryCode = raw.substring(0, 2);
  const phoneNumber = raw.substring(2);
  return { countryCode, phoneNumber, fullNumber: raw };
}

/**
 * Punto de entrada único: procesa un mensaje entrante y devuelve el
 * resultado completo (texto y, opcionalmente, una imagen a enviar antes
 * del texto — ej. el logo en welcome). Agnóstico al transporte.
 */
export async function processIncomingMessage(jid, text) {
  const clean = (text || '').trim().toLowerCase();
  const { countryCode, phoneNumber } = parseJid(jid);

  if (clean === 'menu' || clean === 'inicio') {
    deleteSession(jid);
  }

  const session = getOrCreateSession(jid, phoneNumber, countryCode);
  const handler = handlers[session.state] || handlers.welcome;

  let result;
  try {
    result = await handler.handle(session, text);
  } catch (err) {
    console.error(`Error en estado ${session.state}:`, err);
    result = { text: 'Ocurrió un error inesperado. Escribe *menu* para reiniciar.', nextState: 'welcome' };
  }

  session.state = result.nextState || 'welcome';
  setSession(jid, session);

  return result;
}

export default { processIncomingMessage };
