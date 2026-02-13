// latconecta_users/src/components/payment/IzipayCheckout.jsx
/**
 * Izipay Checkout Component (Nuevo SDK - Modo Pop-up)
 * Adaptado del sandbox probado. Cambios vs sandbox:
 *   - Imports apuntan a paymentService de latconecta_users
 *   - Billing usa datos del usuario autenticado (prop user)
 *   - onResult incluye datos para reversión (transactionUuid, referenceNumber)
 *   - Prop onCancel para volver al paso 4
 * 
 * Flujo:
 * 1. Recibe token de sesión del backend
 * 2. Configura iziConfig con datos de la orden
 * 3. Instancia new Izipay({config})
 * 4. Llama checkout.LoadForm({authorization, keyRSA, callbackResponse})
 * 5. El SDK abre el pop-up de pago
 * 6. callbackResponse recibe el resultado
 * 7. Se valida firma en backend
 */
import { useState, useCallback } from "react";
import paymentService from "../../services/paymentService";

export default function IzipayCheckout({ amount, currency, orderNumber, user, onResult, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | processing | success | error

  const startPayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatus("loading");

    try {
      // --- PASO 1: Obtener configuración pública ---
      const config = await paymentService.getConfig();
      console.log("📋 Config obtenida:", config);

      // --- PASO 2: Solicitar token de sesión al backend ---
      setStatus("processing");
      const tokenData = await paymentService.getToken({
        amount: parseFloat(amount).toFixed(2),
        currency: currency,
        order_number: orderNumber,
      });
      console.log("🔑 Token response:", tokenData);

      if (!tokenData.success || !tokenData.token) {
        throw new Error(tokenData.error || "No se pudo obtener el token de sesión");
      }

      // --- PASO 3: Generar transactionId y dateTimeTransaction ---
      const now = new Date();
      const transactionId = tokenData.transaction_id || `${Date.now()}`;
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
          amount: amount,
          processType: "AT",
          merchantBuyerId: user?.user_id?.toString() || `BUYER_${Date.now()}`,
          dateTimeTransaction: dateTimeTransaction,
        },
        appearance: {
          customize: {
            elements: [
              { paymentMethod: 'YAPE_CODE', order: 1 },
              { paymentMethod: 'PAGO_PUSH', order: 2 },
              { paymentMethod: 'CARD', order: 3 },
            ]
          }
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
              // --- Extraer datos para reversión ---
              const orderData = response.response?.order?.[0] || {};
              const transactionUuid = orderData.uniqueId || null;
              const referenceNumber = orderData.referenceNumber || null;
              const payMethod = response.response?.payMethod || "UNKNOWN";
              const codeAuth = orderData.codeAuth || null;

              console.log("✅ Pago exitoso. Datos para reversión:", {
                transactionUuid,
                referenceNumber,
                payMethod,
                codeAuth,
              });

              setStatus("success");
              onResult?.({
                success: true,
                provider: "izipay",
                // --- Datos CRÍTICOS para reversión ---
                transactionUuid: transactionUuid,
                referenceNumber: referenceNumber,
                // --- Datos de la transacción ---
                transactionId: transactionId,
                orderNumber: orderNumber,
                amount: amount,
                currency: currency,
                payMethod: payMethod,
                codeAuth: codeAuth,
                // --- Mensaje ---
                code: response.code,
                message: response.messageUser || "Operación exitosa",
                paymentStatus: validation.payment_status,
                rawResponse: response,
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
  }, [amount, currency, orderNumber, user, onResult]);

  return (
    <div style={{ textAlign: "center", padding: "16px" }}>
      {/* Info de la orden */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
        <p><strong>Orden:</strong> {orderNumber}</p>
        <p><strong>Monto:</strong> {currency} {amount}</p>
      </div>

      {/* Botón de pago */}
      {status === "idle" && (
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

      {/* Loading */}
      {(status === "loading" || status === "processing") && (
        <div style={{ color: "#2563eb" }}>
          <p>{status === "loading" ? "Conectando con Izipay..." : "Procesando pago..."}</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div style={{ color: "#dc2626", marginTop: "12px" }}>
          <p>❌ {error}</p>
          <button
            onClick={() => { setStatus("idle"); setError(null); }}
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

      {/* Success */}
      {status === "success" && (
        <div style={{ color: "#16a34a", marginTop: "12px" }}>
          <p>✅ Pago exitoso</p>
        </div>
      )}
    </div>
  );
}