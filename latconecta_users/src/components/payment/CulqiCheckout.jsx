// src/components/payment/CulqiCheckout.jsx
/**
 * Culqi Custom Checkout Component
 * Versión: Custom Checkout multipago v1.0 + Culqi3DS
 * SDK: window.CulqiCheckout (new CulqiCheckout(publicKey, config))
 *      window.Culqi3DS (autenticación 3DS)
 *
 * ── Soporte 3DS agregado el 21/07/2026, validado el 24/07/2026 ──────────
 * antifraud_details usa datos fijos de prueba (ver TEST_ANTIFRAUD_DETAILS)
 * porque Latconecta acepta compras sin registro de usuario y hoy no
 * captura estos datos del comprador real. customFields.card se muestra
 * dentro del formulario de tarjeta para capturar nombre/dirección/
 * teléfono, pero Culqi tiene un bug confirmado que impide ingresar
 * dígitos en esos campos (reportado a Culqi el 21/07/2026) — por eso los
 * valores capturados se descartan y se sustituyen por los de prueba.
 * Quitar TEST_ANTIFRAUD_DETAILS y conectar datos reales del comprador
 * cuando se resuelva con Culqi o se decida otra estrategia de captura.
 *
 * Fix clave (24/07/2026): el checkout de Culqi se cierra (`culqi.close()`)
 * apenas se detecta que la transacción requiere 3DS, ANTES de llamar a
 * Culqi3DS.initAuthentication() — no después. Sin este orden, el
 * formulario de desafío del banco (iframe de Cardinal) queda invisible
 * indefinidamente, con el modal de Culqi encima. Confirmado con pruebas
 * reales en los 3 escenarios (con desafío, sin desafío, y fallido).
 * ──────────────────────────────────────────────────────────────────────
 *
 * Comportamiento:
 *   - Pago exitoso (tarjeta o Yape): cierra → onResult(success:true)
 *   - Si Culqi pide 3DS: se resuelve automáticamente (con o sin desafío
 *     visible al cliente, según decida el banco emisor) antes de resolver
 *     éxito/fallo
 *   - Cargo rechazado (o 3DS fallido): cierra Culqi → onRetry(mensaje, retryFn)
 *     — SIEMPRE, sin importar cuántas veces — el límite de reintentos
 *     (y la decisión de cuándo cortar el flujo con onAbort('max_retries'))
 *     vive en el componente padre (PurchasePopup.jsx), no aquí, porque
 *     este componente se desmonta y remonta en cada reintento (cualquier
 *     contador interno se perdería en cada ciclo)
 *   - Usuario cierra con X: cierra → onAbort('user_cancel')
 *   - Error técnico Culqi: cierra → onAbort('technical_error')
 *
 * Props:
 *   amount      {number}    Monto en moneda del producto (ej: 15.00)
 *   currency    {string}    Código de moneda ('PEN')
 *   orderNumber {string}    Número de orden único
 *   user        {object}    Usuario autenticado
 *   onResult    {function}  Callback SOLO cuando el pago es exitoso
 *   onRetry     {function}  Callback con (message, retryFn) en CADA cargo rechazado — el padre decide si ofrece reintentar o corta el flujo
 *   onAbort     {function}  Callback sin pago: reason = 'user_cancel' | 'technical_error' (el padre dispara 'max_retries' por su cuenta, no este componente)
 *   autoStart   {boolean}   Si true, abre al montarse (default: true)
 */
import { useCallback, useEffect, useRef } from "react";
import paymentService from "../../services/paymentService";

// El límite de reintentos (3) ahora vive en PurchasePopup.jsx, no aquí —
// ver nota en resolveChargeOutcome().

// TEMPORAL — datos fijos de prueba para antifraud_details (ver nota arriba).
// Latconecta acepta compras sin registro; sin estos datos, Culqi no evalúa
// riesgo de fraude ni puede activar 3DS (documentado por Culqi).
const TEST_ANTIFRAUD_DETAILS = {
  first_name:   "Jorge",
  last_name:    "Calmett",
  phone_number: "999888777",
  address:      "AV Brasil 321",
  address_city: "Breña",
  country_code: "PE",
};

// Tiempo máximo de espera por los parametros3DS antes de darlo por fallido.
const CULQI3DS_TIMEOUT_MS = 120000;

// ── Culqi3DS: estado de la espera de parameters3DS vía postMessage ────
// A nivel de módulo (no dentro del componente) — si viviera en un useRef,
// un remontaje de CulqiCheckout a mitad del desafío 3DS (ej. por un
// re-render del PurchasePopup padre) crearía un listener nuevo y vacío,
// perdiendo la espera activa.
let culqi3dsWaiter = null; // { resolve, reject } de la promesa pendiente

if (typeof window !== "undefined" && !window.__culqi3dsListenerAttached) {
  window.__culqi3dsListenerAttached = true;
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object" || !("parameters3DS" in data)) return;
    if (!culqi3dsWaiter) return; // mensaje fuera de una espera activa — ignorar

    if (data.parameters3DS) {
      const waiter = culqi3dsWaiter;
      culqi3dsWaiter = null;
      waiter.resolve(data.parameters3DS);
    } else if (data.error) {
      const waiter = culqi3dsWaiter;
      culqi3dsWaiter = null;
      waiter.reject(new Error(data.error));
    }
    // Si parameters3DS y error son null (ej. { loading: true }), seguimos
    // esperando — no es el mensaje final todavía.
  });
}

function waitForCulqi3DSParameters() {
  return new Promise((resolve, reject) => {
    culqi3dsWaiter = { resolve, reject };
    setTimeout(() => {
      if (culqi3dsWaiter) {
        culqi3dsWaiter = null;
        reject(new Error("Tiempo de espera agotado en la autenticación 3DS"));
      }
    }, CULQI3DS_TIMEOUT_MS);
  });
}

export default function CulqiCheckout({
  amount,
  currency = "PEN",
  orderNumber,
  user,
  onResult,
  onRetry,
  onAbort,
  autoStart = true,
}) {
  const hasStarted = useRef(false);
  const culqiRef   = useRef(null);
  const amountCentsRef = useRef(0);

  const openCulqi = useCallback(async () => {
    try {
      // Cerrar y limpiar cualquier instancia anterior de Culqi antes de
      // crear una nueva — necesario al reintentar (2do/3er intento).
      // Sin esto, la instancia vieja queda "viva" en el DOM/memoria
      // mientras se crea una nueva, causando errores internos del SDK de
      // Culqi (confirmado con evidencia real: error "CCKT-408" en el 2do
      // intento, con el formulario regresando con los datos del intento
      // anterior aún cargados — señal de estado interno corrupto).
      if (culqiRef.current) {
        try { culqiRef.current.close(); } catch (e) {}
        culqiRef.current = null;
      }

      const config = await paymentService.getConfig();
      const publicKey = config.public_key;
      if (!publicKey) throw new Error("No se obtuvo la llave pública de Culqi");

      if (typeof window.CulqiCheckout === "undefined") {
        throw new Error("SDK de Culqi no disponible");
      }

      const amountCents = Math.round(parseFloat(amount) * 100);
      amountCentsRef.current = amountCents;

      // Configurar Culqi3DS.publicKey desde ya (generateDevice() lo
      // necesita). settings (con el email real) se configura más abajo,
      // justo antes de initAuthentication() — recién ahí se conoce el
      // email real que el cliente escribió en el checkout de Culqi
      // (token.email), no el del usuario logueado (casi siempre vacío en
      // compras anónimas).
      if (typeof window.Culqi3DS !== "undefined") {
        window.Culqi3DS.publicKey = publicKey;
      }

      const culqiSettings = {
        title:    "Latconecta",
        currency: currency,
        amount:   amountCents,
      };

      if (config.rsa_id && config.rsa_public_key) {
        culqiSettings.xculqirsaid  = config.rsa_id;
        culqiSettings.rsapublickey = config.rsa_public_key;
      }

      // TEMPORAL — solo para acelerar pruebas manuales, pedido por Jorge
      // el 29/07/2026. Genera un correo único por cada apertura del
      // checkout (formato JP<HHMMSS>@...) — evita el límite diario de
      // intentos por correo de Culqi durante rondas de prueba seguidas.
      // Solo se usa si no hay un usuario real logueado (mismo criterio
      // que antes, "cliente@latconecta.com" como último recurso).
      function generarCorreoDePrueba() {
        const ahora = new Date();
        const hhmmss = [ahora.getHours(), ahora.getMinutes(), ahora.getSeconds()]
          .map(n => String(n).padStart(2, "0")).join("");
        return `JP${hhmmss}@test.latconecta.com`;
      }

      const culqiConfig = {
        settings: culqiSettings,
        client: {
          email: user?.user_email || generarCorreoDePrueba(),
        },
        options: {
          lang:               "auto",
          installments:       false,
          modal:              true,
          paymentMethods:     { yape: true, tarjeta: true, billetera: false, bancaMovil: false, agente: false, cuotealo: false },
          paymentMethodsSort: ["yape", "tarjeta"],
          // customFields.card — solo visible si el cliente elige tarjeta,
          // nunca con Yape. SIN "regex" — confirmado que rompe la
          // validación interna de Culqi (TypeError: o.test is not a
          // function). El "id" debe ser solo letras, sin guiones ni
          // números; "placeholder" es obligatorio. Los valores capturados
          // se descartan y sustituyen más abajo (ver TEST_ANTIFRAUD_DETAILS)
          // por el bug de Culqi que impide ingresar dígitos en estos campos.
          //
          // NOTA — se intentó agregar "value" aquí el 29/07/2026 para
          // precargar nombre/dirección durante pruebas manuales (pedido
          // por Jorge) — CONFIRMADO que Culqi lo rechaza por completo:
          // ValidationError: "customFields.card[0].value" is not allowed,
          // y esto bloqueaba TODO el checkout (ni siquiera abría el
          // formulario). Revertido el mismo día. No volver a intentar
          // "value" en customFields — no es un parámetro soportado.
          customFields: {
            card: [
              { label: "Nombre y apellido", placeholder: "Ej: Juan Pérez",   id: "nombrecompleto",  minLength: 5, maxLength: 100, doubleSpan: true },
              { label: "Dirección",         placeholder: "Ej: Av. Larco 123", id: "direccion",       minLength: 5, maxLength: 100, doubleSpan: true },
              { label: "Teléfono",           placeholder: "Ej: 999888777",    id: "telefonocliente", minLength: 6, maxLength: 15,  doubleSpan: true },
            ],
          },
        },
        appearance: {
          theme:               "default",
          hiddenCulqiLogo:     false,
          hiddenBanner:        false,
          hiddenToolBarAmount: false,
          menuType:            "sidebar",
          buttonCardPayText:   "Pagar",
          defaultStyle: {
            bannerColor:      "#1e3a5f",
            buttonBackground: "#2563eb",
            menuColor:        "#2563eb",
            linksColor:       "#2563eb",
            buttonTextColor:  "#ffffff",
            priceColor:       "#1e3a5f",
          },
        },
      };

      culqiRef.current = new window.CulqiCheckout(publicKey, culqiConfig);

      // Resuelve éxito/fallo de un resultado de cargo ya definitivo
      // (sin importar si pasó o no por 3DS antes de llegar aquí).
      const resolveChargeOutcome = (culqi, ac, chargeResp) => {
        if (chargeResp.success) {
          culqi.close();
          onResult?.({
            success:      true,
            provider:     "culqi",
            charge_id:    chargeResp.charge_id,
            outcome_type: chargeResp.outcome_type,
            amount:       chargeResp.amount,
            currency:     chargeResp.currency_code,
            orderNumber:  orderNumber,
            message:      chargeResp.message || "Pago exitoso",
            cancelData: {
              gateway:   "culqi",
              charge_id: chargeResp.charge_id,
              amount:    ac,
              currency:  currency,
              reason:    "solicitud_comprador",
            },
          });
        } else {
          // El conteo de intentos ya NO vive aquí — CulqiCheckout se
          // desmonta y remonta en cada reintento (PurchasePopup solo lo
          // renderiza cuando paymentPhase==='open'), así que cualquier
          // contador interno se reiniciaría a 0 en cada intento. El
          // conteo real vive en PurchasePopup, que sí permanece montado
          // durante todo el ciclo. Aquí siempre se informa el rechazo;
          // el padre decide si ofrece reintentar o corta el flujo.
          const errorMessage = chargeResp.message || "Pago rechazado";
          culqi.close();
          onRetry?.(errorMessage, openCulqi);
        }
      };

      culqiRef.current.culqi = async () => {
        const culqi = culqiRef.current;
        const ac    = amountCentsRef.current;

        // ── Tarjeta: token recibido ───────────────────────────────
        if (culqi.token) {
          const token = culqi.token;

          try {
            // device_finger_print_id — ayuda a la evaluación de riesgo de
            // Culqi, va dentro de antifraud_details desde el primer intento.
            let deviceFingerPrintId = null;
            if (typeof window.Culqi3DS !== "undefined") {
              try {
                deviceFingerPrintId = await window.Culqi3DS.generateDevice();
              } catch {
                deviceFingerPrintId = null;
              }
            }

            const antifraudDetails = {
              ...TEST_ANTIFRAUD_DETAILS,
              ...(deviceFingerPrintId ? { device_finger_print_id: deviceFingerPrintId } : {}),
            };

            const chargeResp = await paymentService.createCharge({
              token_id:      token.id,
              amount:        ac,
              currency_code: currency,
              email:         user?.user_email || token.email || "cliente@latconecta.com",
              description:   `Latconecta — ${orderNumber}`,
              order_number:  orderNumber,
              antifraud_details: antifraudDetails,
            });

            if (chargeResp.requires_3ds) {
              // ── Culqi pide autenticación 3DS antes de aprobar ───────
              try {
                // Cerrar el checkout de Culqi ANTES de iniciar 3DS — no
                // esperar a que algo falle para cerrarlo. Ver nota de
                // cabecera (24/07/2026).
                culqi.close();

                // Configurar settings con el email real del token (lo que
                // el cliente escribió en el checkout), no con
                // user?.user_email (casi siempre vacío en compras anónimas).
                const realEmail = token.email || user?.user_email || "cliente@latconecta.com";
                window.Culqi3DS.settings = {
                  charge: { totalAmount: ac, returnUrl: window.location.origin },
                  card:   { email: realEmail },
                };

                await window.Culqi3DS.initAuthentication(token.id);
                const parameters3DS = await waitForCulqi3DSParameters();

                const chargeResp3ds = await paymentService.createCharge({
                  token_id:      token.id,
                  amount:        ac,
                  currency_code: currency,
                  email:         user?.user_email || token.email || "cliente@latconecta.com",
                  description:   `Latconecta — ${orderNumber}`,
                  order_number:  orderNumber,
                  antifraud_details:  antifraudDetails,
                  authentication_3DS: parameters3DS,
                });

                if (typeof window.Culqi3DS.reset === "function") window.Culqi3DS.reset();
                resolveChargeOutcome(culqi, ac, chargeResp3ds);

              } catch (e3ds) {
                // 3DS falló, dio time-out, o el banco no pudo completarlo.
                // El checkout ya se cerró antes de iniciar 3DS (ver arriba),
                // así que aquí solo notificamos el resultado.
                resolveChargeOutcome(culqi, ac, {
                  success: false,
                  message: e3ds?.message || "No se pudo completar la autenticación 3DS",
                });
              }

            } else {
              // Aprobado o rechazado directo, sin pasar por 3DS
              resolveChargeOutcome(culqi, ac, chargeResp);
            }

          } catch {
            culqi.close();
            onAbort?.("technical_error");
          }

        // ── Yape / billetera confirmado ───────────────────────────
        } else if (culqi.order) {
          culqi.close();
          const order = culqi.order;
          onResult?.({
            success:      true,
            provider:     "culqi",
            charge_id:    order.id,
            outcome_type: "order",
            amount:       amountCentsRef.current,
            currency:     currency,
            orderNumber:  orderNumber,
            message:      "Pago confirmado",
            cancelData: {
              gateway:   "culqi",
              charge_id: order.id,
              amount:    amountCentsRef.current,
              currency:  currency,
              reason:    "solicitud_comprador",
            },
          });

        // ── Sin token ni order: cierre manual o error SDK ─────────
        } else {
          const err = culqi.error;
          culqi.close();
          onAbort?.(err ? "technical_error" : "user_cancel");
        }
      };

      culqiRef.current.open();

    } catch {
      onAbort?.("technical_error");
    }
  }, [amount, currency, orderNumber, user, onResult, onRetry, onAbort]);

  useEffect(() => {
    if (autoStart && !hasStarted.current) {
      hasStarted.current = true;
      openCulqi();
    }
  }, [autoStart, openCulqi]);

  return null;
}
