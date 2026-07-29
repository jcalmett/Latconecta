/**
 * Entry point — capa de transporte (Baileys, no oficial, número de pruebas).
 *
 * Este es el ÚNICO archivo del bot que sabe que existe Baileys. Todo lo
 * demás (conversation.js, states/, services/) es agnóstico al transporte,
 * para poder migrar a la Cloud API de Meta más adelante reemplazando
 * solo este archivo.
 */
import 'dotenv/config';
import pino from 'pino';
import qrcodeTerminal from 'qrcode-terminal';
import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { processIncomingMessage } from './conversation.js';
import { startNotifyServer } from './notifyServer.js';

const logger = pino({ level: 'info' });
let notifyServerStarted = false;

// Fix 28/07/2026 — visto un bucle de reconexión cada 1-5 segundos en
// producción (logs solo mostraban "Conexión cerrada. Reconectar: true",
// sin motivo real, imposible de diagnosticar). Se agregan 2 cosas:
// (1) registrar el motivo real de cada cierre (statusCode + mensaje),
// (2) esperar unos segundos antes de reconectar, para evitar que varios
// sockets terminen compitiendo por la misma sesión de Baileys si el cierre
// se repite muy seguido (Baileys solo permite una conexión activa por
// sesión — reconectar sin pausa puede crear una condición de carrera).
const RECONNECT_DELAY_MS = 5000;

/**
 * Envía un mensaje genérico: texto solo, o imagen con texto (caption).
 * Punto único usado tanto por la conversación normal como por el
 * servidor de notificaciones (checkout avisando resultado + recibo).
 */
async function sendToWhatsapp(socket, jid, { text, imageUrl, imageBuffer, caption } = {}) {
  if (imageBuffer) {
    await socket.sendMessage(jid, { image: imageBuffer, caption: caption || text || '' });
    return;
  }
  if (imageUrl) {
    await socket.sendMessage(jid, { image: { url: imageUrl }, caption: caption || text || '' });
    return;
  }
  if (text) {
    await socket.sendMessage(jid, { text });
  }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const socket = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }) // silenciar el log interno de Baileys, usamos el propio
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info('📲 Escanea este QR desde WhatsApp Business (Dispositivos vinculados):');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const errorMessage = lastDisconnect?.error?.message || 'sin mensaje';
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      // Log completo del motivo real — antes solo se veía "Reconectar: true/false".
      logger.warn(
        { statusCode, errorMessage },
        `Conexión cerrada (código ${statusCode ?? 'desconocido'}: ${errorMessage}). Reconectar: ${shouldReconnect}`
      );

      if (shouldReconnect) {
        // Espera antes de reconectar — evita que sockets nuevos compitan
        // con uno anterior que Baileys todavía no terminó de cerrar del
        // todo, lo cual puede producir un ciclo de cierres cada vez más
        // seguido en vez de estabilizarse.
        logger.info(`Reintentando conexión en ${RECONNECT_DELAY_MS / 1000}s...`);
        setTimeout(() => {
          start().catch((err) => {
            logger.error({ err }, 'Error al reconectar');
          });
        }, RECONNECT_DELAY_MS);
      } else {
        logger.error('Sesión cerrada (logged out) — hay que volver a escanear el QR. Borra la carpeta auth/ y reinicia el servicio.');
      }
    } else if (connection === 'open') {
      logger.info('✅ Bot Latconecta conectado a WhatsApp');
      if (!notifyServerStarted) {
        notifyServerStarted = true;
        startNotifyServer((jid, payload) => sendToWhatsapp(socket, jid, payload));
      }
    }
  });

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue; // ignorar mensajes enviados por el propio bot
      if (msg.key.remoteJid?.endsWith('@g.us')) continue; // ignorar grupos, solo chats 1:1

      const jid = msg.key.remoteJid;
      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      if (!text) continue; // ignorar mensajes que no son texto (audio, imagen, etc por ahora)

      logger.info(`📩 ${jid}: ${text}`);

      try {
        const result = await processIncomingMessage(jid, text);
        if (result.imageUrl) {
          // Manda la imagen (ej. logo) con el texto como caption, en un solo mensaje.
          await sendToWhatsapp(socket, jid, { imageUrl: result.imageUrl, caption: result.text });
        } else {
          await sendToWhatsapp(socket, jid, { text: result.text });
        }
      } catch (err) {
        logger.error({ err }, 'Error procesando mensaje');
        await sendToWhatsapp(socket, jid, {
          text: 'Ocurrió un error inesperado. Intenta de nuevo escribiendo *menu*.'
        });
      }
    }
  });
}

start().catch((err) => {
  logger.error({ err }, 'Error fatal al iniciar el bot');
  process.exit(1);
});
