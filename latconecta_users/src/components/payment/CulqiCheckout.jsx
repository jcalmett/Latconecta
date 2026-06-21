// src/components/payment/CulqiCheckout.jsx
/**
 * Culqi Checkout V4 Component
 *
 * Comportamiento:
 *   - Pago exitoso (tarjeta o Yape): cierra → onResult(success:true)
 *   - Cargo rechazado 1ra/2da vez: cierra Culqi → onRetry(mensaje, retryFn)
 *   - Cargo rechazado 3ra vez: cierra → onAbort('max_retries')
 *   - Usuario cierra con X: cierra → onAbort('user_cancel')
 *   - Error técnico Culqi: cierra → onAbort('technical_error')
 *
 * Props:
 *   amount      {number}    Monto en moneda del producto (ej: 15.00)
 *   currency    {string}    Código de moneda ('PEN')
 *   orderNumber {string}    Número de orden único
 *   user        {object}    Usuario autenticado (null si anónimo)
 *   onResult    {function}  Callback SOLO cuando el pago es exitoso
 *   onRetry     {function}  Callback con (message, retryFn) cuando cargo rechazado y quedan intentos
 *   onAbort     {function}  Callback sin pago: reason = 'user_cancel' | 'max_retries' | 'technical_error'
 *   autoStart   {boolean}   Si true, abre al montarse (default: true)
 *
 * Email:
 *   - Usuario registrado: se prefija su email en el checkout de Culqi
 *   - Usuario anónimo:    campo email vacío — Culqi lo solicita obligatoriamente;
 *                         si el usuario no lo ingresa y cierra, cancela la transacción
 */
import { useCallback, useEffect, useRef } from "react";
import paymentService from "../../services/paymentService";

const MAX_RETRIES = 3;

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
  const retryCount = useRef(0);
  const amountCentsRef = useRef(0);

  const openCulqi = useCallback(async () => {
    try {
      const config = await paymentService.getConfig();
      const publicKey = config.public_key;
      if (!publicKey) throw new Error("No se obtuvo la llave pública de Culqi");

      if (typeof window.CulqiCheckout === "undefined") {
        throw new Error("SDK de Culqi no disponible");
      }

      const amountCents = Math.round(parseFloat(amount) * 100);
      amountCentsRef.current = amountCents;

      const culqiSettings = {
        title:    "Latconecta",
        currency: currency,
        amount:   amountCents,
      };

      if (config.rsa_id && config.rsa_public_key) {
        culqiSettings.xculqirsaid  = config.rsa_id;
        culqiSettings.rsapublickey = config.rsa_public_key;
      }

      const culqiConfig = {
        settings: culqiSettings,
        client: {
          // Usuario registrado: se prefija su email
          // Usuario anónimo: campo vacío — Culqi lo solicita obligatoriamente
          ...(user?.user_email && { email: user.user_email }),
        },
        options: {
          lang:               "auto",
          installments:       false,
          modal:              true,
          paymentMethods:     { yape: true, tarjeta: true, billetera: false, bancaMovil: false, agente: false, cuotealo: false },
          paymentMethodsSort: ["yape", "tarjeta"],
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

      culqiRef.current.culqi = async () => {
        const culqi = culqiRef.current;
        const ac    = amountCentsRef.current;

        // ── Tarjeta: token recibido ───────────────────────────────
        if (culqi.token) {
          const token = culqi.token;

          try {
            const chargeResp = await paymentService.createCharge({
              token_id:      token.id,
              amount:        ac,
              currency_code: currency,
              // Registrado: email del perfil; anónimo: email ingresado en el checkout de Culqi
              email:         user?.user_email || token.email,
              description:   `Latconecta — ${orderNumber}`,
              order_number:  orderNumber,
            });

            if (chargeResp.success) {
              // PAGO EXITOSO
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
              // CARGO RECHAZADO
              retryCount.current += 1;
              const errorMessage = chargeResp.message || "Pago rechazado";

              if (retryCount.current >= MAX_RETRIES) {
                culqi.close();
                onAbort?.("max_retries");
              } else {
                // Quedan intentos — notificar con mensaje y función para reabrir
                culqi.close();
                onRetry?.(errorMessage, openCulqi);
              }
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
      retryCount.current = 0;
      openCulqi();
    }
  }, [autoStart, openCulqi]);

  return null;
}
