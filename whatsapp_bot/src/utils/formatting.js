/**
 * Utilidades de formato visual para WhatsApp — sin colores de texto
 * (WhatsApp no lo permite), usando emoji nativos que ya se ven como
 * "cajitas de color con número" en la mayoría de teléfonos.
 */

// Mapeo alpha3 -> alpha2, solo para los países que Latconecta realmente
// opera hoy (ver memoria del proyecto). Fallback: bandera blanca genérica.
const ALPHA3_TO_ALPHA2 = {
  PER: 'PE',
  VEN: 'VE',
  MEX: 'MX',
  BOL: 'BO',
  USA: 'US',
  ECU: 'EC',
  COL: 'CO',
  CHL: 'CL',
  ARG: 'AR',
};

/**
 * Convierte un código de país (alpha2 o alpha3) a su emoji de bandera,
 * combinando "regional indicator symbols" (estándar Unicode).
 */
export function flagEmoji(countryCode) {
  if (!countryCode) return '🏳️';
  let code = countryCode.toUpperCase();
  if (code.length === 3) {
    code = ALPHA3_TO_ALPHA2[code] || null;
  }
  if (!code || code.length !== 2) return '🏳️';

  const codePoints = [...code].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

// Emoji "keycap" 1-10 — se ven como cajitas de color con el número adentro
// en WhatsApp/Android/iOS de forma nativa, sin generar ninguna imagen.
const KEYCAPS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export function keycap(n) {
  if (n >= 0 && n <= 10) return KEYCAPS[n];
  return `${n}.`; // fallback simple para listas más largas que 10
}

export default { flagEmoji, keycap };
