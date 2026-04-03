// latconecta_users/src/components/payment/IzipayCheckout.jsx
/**
 * Izipay Checkout Component (Nuevo SDK - Modo Pop-up)
 *
 * Cambios v2 respecto a v1:
 *   - Nueva prop `autoStart` (boolean, default false):
 *       Si true, el componente llama a LoadForm() inmediatamente al montarse,
 *       sin mostrar el botón "Pagar con Izipay". Esto elimina el click redundante.
 *   - Nueva prop `prefetchedToken` (string | null):
 *       Token JWT ya obtenido por el componente padre (PurchasePopup).
 *       Si viene, se omite la llamada a paymentService.getToken().
 *   - Nueva prop `prefetchedConfig` (object | null):
 *       Config pública ya obtenida por el componente padre.
 *       Si viene, se omite la llamada a paymentService.getConfig().
 *   - Nueva prop `prefetchedTransactionId` (string | null):
 *       transactionId generado por el backend junto con el token.
 *       Se usa en lugar de generar uno local con Date.now().
 *
 * Retrocompatibilidad:
 *   - Si autoStart=false (o no se pasa), el comportamiento es idéntico a v1:
 *     muestra el botón "Pagar con Izipay" y el usuario hace click.
 *   - Todas las props anteriores (amount, currency, orderNumber, user,
 *     onResult, onCancel) funcionan igual.
 *
 * Flujo con autoStart=true (Opción A implementada):
 *   1. PurchasePopup pre-fetcha config + token al entrar al Step 4 (background).
 *   2. Al hacer click en "Procesar Compra", PurchasePopup monta este componente
 *      pasando autoStart=true + prefetchedToken + prefetchedConfig.
 *   3. Este componente llama a LoadForm() en el useEffect de montaje —
 *      dentro de la cadena de eventos del click original del usuario.
 *   4. El popup de Izipay abre directamente, sin botón intermedio.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import paymentService from "../../services/paymentService";

export default function IzipayCheckout({
  // Props existentes
  amount,
  currency,
  orderNumber,
  user,
  onResult,
  onCancel,
  // Props nuevas para Opción A
  autoStart = false,
  prefetchedToken = null,
  prefetchedConfig = null,
  prefetchedTransactionId = null,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | processing | success | error

  // Ref para evitar doble ejecución en StrictMode de React (doble montaje en desarrollo)
  const hasStarted = useRef(false);

  /**
   * Núcleo del flujo de pago.
   * Reutilizado tanto por el click del botón (autoStart=false)
   * como por el useEffect de montaje (autoStart=true).
   */
  const startPayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatus("loading");

    try {
      // --- PASO 1: Obtener configuración pública ---
      // Si viene pre-fetchada del padre, usarla directamente (sin llamada extra)
      let config;
      if (prefetchedConfig) {
        config = prefetchedConfig;
        console.log("📋 Config pre-fetchada recibida:", config);
      } else {
        config = await paymentService.getConfig();
        console.log("📋 Config obtenida:", config);
      }

      // --- PASO 2: Solicitar token de sesión al backend ---
      // Si viene pre-fetchado del padre, usarlo directamente
      setStatus("processing");
      let tokenData;
      let transactionId;

      if (prefetchedToken) {
        // Token pre-fetchado disponible — no hay llamada al backend aquí
        tokenData = { success: true, token: prefetchedToken };
        transactionId = prefetchedTransactionId || `${Date.now()}`;
        console.log("🔑 Token pre-fetchado recibido, transactionId:", transactionId);
      } else {
        // Fallback: obtener token aquí (comportamiento v1)
        tokenData = await paymentService.getToken({
          amount: parseFloat(amount).toFixed(2),
          currency: currency,
          order_number: orderNumber,
        });
        console.log("🔑 Token response:", tokenData);
        transactionId = tokenData.transaction_id || `${Date.now()}`;
      }

      if (!tokenData.success || !tokenData.token) {
        throw new Error(tokenData.error || "No se pudo obtener el token de sesión");
      }

      // --- PASO 3: Generar dateTimeTransaction ---
      const now = new Date();
      const dateTimeTransaction = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);

      // --- Datos del comprador (del usuario autenticado) ---
      const buyerFirstName = user?.user_first_name || user?.user_name || "Cliente";
      const buyerLastName = user?.user_last_name || "Latconecta";
      const buyerEmail = user?.user_email || "cliente@latconecta.com";
      const buyerPhone = user?.user_phone || "999999999";

      // --- PASO 4: Configurar iziConfig para pop-up ---
      const iziConfig = {
        transactionId: transactionId,
        action: "pay",
        merchantCode: config.merchantCode,
        order: {
          orderNumber: orderNumber,
          currency: currency,
          amount: parseFloat(amount).toFixed(2),
          processType: "AT",
          merchantBuyerId: user?.user_id?.toString() || `BUYER_${Date.now()}`,
          dateTimeTransaction: dateTimeTransaction,
        },
        appearance: {
          customize: {
            elements: [
              { paymentMethod: "YAPE_CODE", order: 1 },
              { paymentMethod: "PAGO_PUSH", order: 2 },
              { paymentMethod: "CARD", order: 3 },
            ],
          },
        },
        billing: {
          firstName: buyerFirstName,
          lastName: buyerLastName,
          email: buyerEmail,
          phoneNumber: buyerPhone,
          street: "N/A",
          city: "Lima",
          state: "Lima",
          country: "PE",
          postalCode: "15000",
          documentType: "DNI",
          document: "00000000",
        },
        render: {
          typeForm: "pop-up",
        },
      };

      console.log("⚙️ iziConfig:", iziConfig);

      // --- PASO 5: Verificar que el SDK esté cargado ---
      if (typeof window.Izipay === "undefined") {
        throw new Error(
          "SDK de Izipay no cargado. Verifica que index.html incluya el script de sandbox-checkout.izipay.pe"
        );
      }

      // --- PASO 6: Instanciar Izipay y cargar formulario ---
      const checkout = new window.Izipay({ config: iziConfig });

      // Callback que recibe la respuesta del pago
      const callbackResponsePayment = async (response) => {
        console.log("💰 Izipay response:", response);

        try {
          // --- PASO 7: Validar firma en backend ---
          if (response.code === "00" && response.payloadHttp && response.signature) {
            const validation = await paymentService.validatePayment({
              order_number: orderNumber,
              payload_http: response.payloadHttp,
              signature: response.signature,
              transaction_id: transactionId,
            });

            console.log("🔐 Validation result:", validation);

            if (validation.valid_signature) {
              // --- Preparar cancelData para reversión automática ---
              const cancelData = {
                gateway: "izipay",
                transaction_id: transactionId,
                order_number: orderNumber,
                amount: validation.amount || String(amount),
                currency: validation.currency || currency,
                unique_id: validation.unique_id,
                authorization_code: validation.authorization_code,
                transaction_datetime: validation.transaction_datetime,
                pay_method: validation.pay_method || "CARD",
                channel: validation.channel || "ecommerce",
              };

              console.log("📋 Cancel data prepared:", cancelData);

              setStatus("success");
              onResult?.({
                success: true,
                provider: "izipay",
                code: response.code,
                message: response.messageUser || "Operación exitosa",
                paymentStatus: validation.payment_status,
                orderNumber: orderNumber,
                transactionId: transactionId,
                rawResponse: response,
                // Datos para reversión automática
                cancelData: cancelData,
              });
            } else {
              setStatus("error");
              setError("Firma inválida - posible alteración de datos");
              onResult?.({
                success: false,
                provider: "izipay",
                message: "Firma inválida",
              });
            }
          } else {
            // Pago rechazado o error
            setStatus("error");
            const msg = response.messageUser || response.message || "Pago no completado";
            setError(msg);
            onResult?.({
              success: false,
              provider: "izipay",
              code: response.code,
              message: msg,
              rawResponse: response,
            });
          }
        } catch (valError) {
          console.error("❌ Error validando:", valError);
          setStatus("error");
          setError("Error al validar el pago");
        }

        setLoading(false);
      };

      // --- Cargar el formulario pop-up ---
      checkout.LoadForm({
        authorization: tokenData.token,
        keyRSA: config.keyRSA,
        callbackResponse: callbackResponsePayment,
      });

    } catch (err) {
      console.error("❌ Error en checkout:", err);
      setError(err.message);
      setStatus("error");
      setLoading(false);
    }
  }, [amount, currency, orderNumber, user, onResult, prefetchedToken, prefetchedConfig, prefetchedTransactionId]);

  /**
   * Modo autoStart: ejecutar LoadForm() al montarse el componente.
   *
   * Nota de seguridad del SDK:
   * LoadForm() debe estar en la cadena de un evento de usuario (click).
   * Con autoStart=true, PurchasePopup monta este componente DENTRO del
   * handler onClick del botón "Procesar Compra", por lo que el navegador
   * considera que la llamada sigue dentro del evento de usuario original.
   * Esto es correcto y no genera bloqueo de popup.
   *
   * El ref hasStarted evita doble ejecución en React StrictMode (desarrollo),
   * donde los efectos se ejecutan dos veces intencionalmente.
   */
  useEffect(() => {
    if (autoStart && !hasStarted.current) {
      hasStarted.current = true;
      startPayment();
    }
  }, [autoStart, startPayment]);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div style={{ textAlign: "center", padding: "16px" }}>
      {/* Info de la orden */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
        <p><strong>Orden:</strong> {orderNumber}</p>
        <p><strong>Monto:</strong> {currency} {amount}</p>
      </div>

      {/*
        Botón "Pagar con Izipay":
        Solo se muestra si autoStart=false (modo manual / retrocompatible).
        Con autoStart=true nunca aparece — LoadForm() ya se disparó solo.
      */}
      {!autoStart && status === "idle" && (
        <div>
          <button
            onClick={startPayment}
            disabled={loading}
            style={{
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              marginBottom: "8px",
            }}
          >
            Pagar con Izipay
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* Loading / Procesando */}
      {(status === "loading" || status === "processing") && (
        <div style={{ color: "#2563eb" }}>
          <p>{status === "loading" ? "Conectando con Izipay..." : "Abriendo formulario de pago..."}</p>
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

      {/* Éxito (estado transitorio antes de que onResult cierre el componente) */}
      {status === "success" && (
        <div style={{ color: "#16a34a", marginTop: "12px" }}>
          <p>✅ Pago exitoso</p>
        </div>
      )}
    </div>
  );
}
