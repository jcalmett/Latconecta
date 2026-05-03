// latconecta_users/src/components/payment/CulqiCheckout.jsx
/**
 * Culqi Checkout V4 Component
 *
 * Flujo completo:
 *   1. Al montarse con autoStart=true:
 *      a. Llama al backend POST /payments/order → obtiene ord_live_XXX
 *      b. Inicializa CulqiCheckout con el order_id (habilita Yape + billeteras)
 *      c. Abre el formulario automáticamente (dentro del evento click del padre)
 *   2. El usuario paga (tarjeta, Yape o billetera)
 *   3. handleCulqiAction recibe el token o la order confirmada
 *   4. Si es token (tarjeta): llama al backend POST /payments/charge
 *   5. Retorna onResult con charge_id para que PurchasePopup procese la provisión
 *
 * Props:
 *   amount        {number}   Monto en la moneda del producto (ej: 15.00)
 *   currency      {string}   Código de moneda ('PEN')
 *   orderNumber   {string}   Número de orden único para esta compra
 *   user          {object}   Usuario autenticado (email, nombre, teléfono)
 *   onResult      {function} Callback con resultado del pago
 *   onCancel      {function} Callback si el usuario cancela
 *   autoStart     {boolean}  Si true, abre el checkout al montarse (default: true)
 */
import { useState, useCallback, useEffect, useRef } from "react";
import paymentService from "../../services/paymentService";

export default function CulqiCheckout({
  amount,
  currency = "PEN",
  orderNumber,
  user,
  onResult,
  onCancel,
  autoStart = true,
}) {
  const [status, setStatus] = useState("idle"); // idle | loading | processing | success | error
  const [error, setError] = useState(null);
  const hasStarted = useRef(false);
  const culqiRef = useRef(null);

  const startPayment = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      // ── PASO 1: Obtener config pública del backend ──────────────────
      const config = await paymentService.getConfig();
      console.log("📋 Culqi config:", config);

      const publicKey = config.public_key;
      if (!publicKey) throw new Error("No se obtuvo la llave pública de Culqi");

      // ── PASO 2: Calcular monto y verificar SDK ────────────────────
      setStatus("processing");
      const amountCents = Math.round(parseFloat(amount) * 100);

      // ── PASO 3: Verificar SDK ───────────────────────────────────────
      if (typeof window.CulqiCheckout === "undefined") {
        throw new Error(
          "SDK de Culqi no cargado. Verificar que index.html incluya el script de js.culqi.com/checkout-js"
        );
      }

      // ── PASO 4: Configurar y abrir el Checkout V4 ──────────────────
      // Sin order — solo Yape + Tarjeta (sincrónicos)
      const culqiSettings = {
        title:    "Latconecta",
        currency: currency,
        amount:   amountCents,
      };

      // RSA opcional
      if (config.rsa_id && config.rsa_public_key) {
        culqiSettings.xculqirsaid  = config.rsa_id;
        culqiSettings.rsapublickey = config.rsa_public_key;
      }

      // Yape primero, luego tarjeta — sin billetera ni PagoEfectivo
      const paymentMethods = {
        yape:       true,
        tarjeta:    true,
        billetera:  false,
        bancaMovil: false,
        agente:     false,
        cuotealo:   false,
      };

      const options = {
        lang:               "auto",
        installments:       false,
        modal:              true,
        paymentMethods:     paymentMethods,
        paymentMethodsSort: Object.keys(paymentMethods),
      };

      const clientConfig = {
        email: user?.user_email || "cliente@latconecta.com",
      };

      const appearance = {
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
      };

      const culqiConfig = {
        settings:   culqiSettings,
        client:     clientConfig,
        options,
        appearance,
      };

      culqiRef.current = new window.CulqiCheckout(publicKey, culqiConfig);

      // ── PASO 5: Handler de respuesta del Checkout ───────────────────
      culqiRef.current.culqi = async () => {
        const culqi = culqiRef.current;

        if (culqi.token) {
          // Tarjeta tokenizada → crear cargo en backend
          const token = culqi.token;
          culqi.close();
          console.log("🔑 Token recibido:", token.id);

          try {
            const chargeResp = await paymentService.createCharge({
              token_id:     token.id,
              amount:       amountCents,
              currency_code: currency,
              email:        user?.user_email || token.email || "cliente@latconecta.com",
              description:  `Latconecta — ${orderNumber}`,
              order_number: orderNumber,
              first_name:   user?.user_first_name || user?.user_name || "Cliente",
              last_name:    user?.user_last_name || "Latconecta",
              phone_number: user?.user_phone || "999999999",
            });

            console.log("💳 Charge response:", chargeResp);

            if (chargeResp.success) {
              setStatus("success");
              onResult?.({
                success:      true,
                provider:     "culqi",
                charge_id:    chargeResp.charge_id,
                outcome_type: chargeResp.outcome_type,
                amount:       chargeResp.amount,
                currency:     chargeResp.currency_code,
                orderNumber:  orderNumber,
                message:      chargeResp.message || "Pago exitoso",
                // Datos para reversión automática si la provisión falla
                cancelData: {
                  gateway:   "culqi",
                  charge_id: chargeResp.charge_id,
                  amount:    amountCents,
                  currency:  currency,
                  reason:    "solicitud_comprador",
                },
              });
            } else {
              setStatus("error");
              setError(chargeResp.message || "El cargo fue rechazado");
              onResult?.({
                success:  false,
                provider: "culqi",
                message:  chargeResp.message || "El cargo fue rechazado",
              });
            }
          } catch (chargeErr) {
            console.error("❌ Error creando cargo:", chargeErr);
            setStatus("error");
            setError("Error al procesar el cargo");
            onResult?.({
              success:  false,
              provider: "culqi",
              message:  chargeErr.message || "Error al procesar el cargo",
            });
          }

        } else if (culqi.order) {
          // Pago con Yape / billetera / PagoEfectivo confirmado
          culqi.close();
          const order = culqi.order;
          console.log("📋 Order confirmada:", order);

          setStatus("success");
          onResult?.({
            success:      true,
            provider:     "culqi",
            charge_id:    order.id,
            outcome_type: "order",
            amount:       amountCents,
            currency:     currency,
            orderNumber:  orderNumber,
            message:      "Pago confirmado",
            cancelData: {
              gateway:   "culqi",
              charge_id: order.id,
              amount:    amountCents,
              currency:  currency,
              reason:    "solicitud_comprador",
            },
          });

        } else {
          // Error o cancelación del usuario
          const err = culqi.error;
          culqi.close();

          if (err) {
            console.error("❌ Culqi error:", err);
            setStatus("error");
            const msg = err.user_message || err.merchant_message || "Error en el pago";
            setError(msg);
            onResult?.({ success: false, provider: "culqi", message: msg });
          } else {
            // Usuario cerró el checkout
            console.log("🚫 Usuario cerró el checkout");
            setStatus("idle");
            onCancel?.();
          }
        }
      };

      console.log("🚀 Abriendo Culqi Checkout...");
      culqiRef.current.open();

    } catch (err) {
      console.error("❌ Error en CulqiCheckout:", err);
      setError(err.message);
      setStatus("error");
    }
  }, [amount, currency, orderNumber, user, onResult, onCancel]);

  // autoStart: ejecutar al montarse (dentro del evento click del padre)
  useEffect(() => {
    if (autoStart && !hasStarted.current) {
      hasStarted.current = true;
      startPayment();
    }
  }, [autoStart, startPayment]);

  // ── RENDER ──────────────────────────────────────────────────────────
  return (
    <div style={{ textAlign: "center", padding: "16px" }}>
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
        <p><strong>Orden:</strong> {orderNumber}</p>
        <p><strong>Monto:</strong> {currency} {parseFloat(amount).toFixed(2)}</p>
      </div>

      {/* Cargando / Procesando */}
      {(status === "loading" || status === "processing") && (
        <div style={{ color: "#2563eb" }}>
          <p>{status === "loading" ? "Preparando pago..." : "Abriendo formulario de pago..."}</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div style={{ color: "#dc2626", marginTop: "12px" }}>
          <p>❌ {error}</p>
          <button
            onClick={() => {
              setStatus("idle");
              setError(null);
              hasStarted.current = false;
            }}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            Reintentar
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                marginTop: "8px",
                padding: "8px 16px",
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Volver
            </button>
          )}
        </div>
      )}

      {/* Éxito */}
      {status === "success" && (
        <div style={{ color: "#16a34a", marginTop: "12px" }}>
          <p>✅ Pago exitoso</p>
        </div>
      )}
    </div>
  );
}
