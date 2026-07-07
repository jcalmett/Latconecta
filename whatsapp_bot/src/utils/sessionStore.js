/**
 * Sesiones de conversación en memoria.
 *
 * NOTA (pendiente de decisión, no resuelto aún): esto se pierde si el proceso
 * reinicia, igual que en ISAMEDIC. Latconecta ya tiene Redis soportado pero
 * deshabilitado (REDIS_URL vacío) — es candidato natural para persistir esto
 * si se decide que es necesario. No se implementa aquí hasta que se defina.
 */

const sessions = {};
const TIMEOUT_MS = (parseInt(process.env.SESSION_TIMEOUT_MINUTES || '15', 10)) * 60 * 1000;

export const getSession = (jid) => {
  const s = sessions[jid];
  if (!s) return null;
  if (Date.now() - s.updatedAt > TIMEOUT_MS) {
    delete sessions[jid];
    return null;
  }
  return s;
};

export const setSession = (jid, sessionData) => {
  sessions[jid] = { ...sessionData, updatedAt: Date.now() };
};

export const deleteSession = (jid) => {
  delete sessions[jid];
};

/**
 * Devuelve la sesión existente o crea una nueva en estado 'welcome'.
 */
export const getOrCreateSession = (jid, phoneNumber, countryCode) => {
  const existing = getSession(jid);
  if (existing) return existing;

  const fresh = {
    state: 'welcome',
    data: {
      jid,
      user: null,
      phoneNumber,
      countryCode,
      selectedCountry: null,
      selectedService: null,
      selectedCompany: null,
      selectedProduct: null,
      deliveryName: '',
      deliveryPhone: '',
      deliveryAddress: ''
    }
  };
  setSession(jid, fresh);
  return fresh;
};

export default { getSession, setSession, deleteSession, getOrCreateSession };
