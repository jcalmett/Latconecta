import { createServer } from 'http';

/**
 * NOTIFY SERVER — puente entre la página de checkout y el bot.
 *
 * Resuelve el regreso automático a WhatsApp: la página de checkout, apenas
 * conoce el resultado final del pago, llama a este endpoint y el bot manda
 * el mensaje solo (texto, o imagen del recibo + texto como caption).
 *
 * LIMITACIÓN DE SEGURIDAD CONOCIDA (aceptada para este MVP, no resuelta):
 * el token compartido vive en el HTML/JS de la página de checkout, visible
 * para cualquiera que inspeccione el código fuente del navegador — no es
 * un secreto real, solo desalienta tráfico accidental/automatizado.
 *
 * Nginx debe tener client_max_body_size suficiente en /wsp-notify/ para
 * aceptar la imagen del recibo en base64 (configurado aparte).
 */
export function startNotifyServer(sendMessageFn) {
  const port = parseInt(process.env.NOTIFY_PORT || '3001', 10);
  const token = process.env.CHECKOUT_NOTIFY_TOKEN;

  const server = createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/notify-payment') {
      res.writeHead(404);
      res.end();
      return;
    }

    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        if (!token || req.headers['x-checkout-notify-token'] !== token) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'token inválido' }));
          return;
        }

        const { jid, message, imageBase64 } = JSON.parse(body || '{}');
        if (!jid || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'jid y message son requeridos' }));
          return;
        }

        if (imageBase64) {
          const buffer = Buffer.from(imageBase64, 'base64');
          await sendMessageFn(jid, { imageBuffer: buffer, caption: message });
        } else {
          await sendMessageFn(jid, { text: message });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Error en notify-payment:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'error interno' }));
      }
    });
  });

  // Cuerpos más grandes (imagen base64 del recibo) pueden tardar en llegar
  // por partes — sin límite artificial de tiempo de espera aquí.
  server.requestTimeout = 0;

  server.listen(port, '127.0.0.1', () => {
    console.log(`📡 Notify server escuchando en 127.0.0.1:${port}`);
  });

  return server;
}

export default { startNotifyServer };
