// frontend/src/components/IzipayCheckout.jsx
/**
 * Izipay Checkout Component (Nuevo SDK - Modo Pop-up)
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
import { requestSessionToken, validatePayment, getPaymentConfig } from "../services/paymentService";

export default function IzipayCheckout({ amount, currency, orderNumber, onResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | processing | success | error

  const startPayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatus("loading");

    try {
      // --- PASO 1: Obtener configuración pública ---
      const config = await getPaymentConfig();
      console.log("📋 Config obtenida:", config);

      // --- PASO 2: Solicitar token de sesión al backend ---
      setStatus("processing");
      const tokenData = await requestSessionToken(orderNumber, amount, currency);
      console.log("🔑 Token response:", tokenData);

      if (!tokenData.success || !tokenData.token) {
        throw new Error(tokenData.error || "No se pudo obtener el token de sesión");
      }

      // --- PASO 3: Generar transactionId y dateTimeTransaction ---
      const now = new Date();
      const transactionId = tokenData.transaction_id || `${Date.now()}`;
      const dateTimeTransaction = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);

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
           merchantBuyerId: `BUYER_${Date.now()}`,
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
          firstName: "Cliente",
          lastName: "Latconecta",
          email: "cliente@latconecta.com",
          phoneNumber: "999999999",
          street: "Av. Principal 123",
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
          "SDK de Izipay no cargado. Verifica que index.html incluya el script de sandboxcheckout.izipay.pe"
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
            const validation = await validatePayment(
              orderNumber,
              response.payloadHttp,
              response.signature,
              transactionId
            );

            console.log("🔐 Validation result:", validation);

            if (validation.valid_signature) {
              setStatus("success");
              onResult?.({
                success: true,
                code: response.code,
                message: response.messageUser || "Operación exitosa",
                paymentStatus: validation.payment_status,
                orderNumber: orderNumber,
                transactionId: transactionId,
                response: response,
              });
            } else {
              setStatus("error");
              setError("Firma inválida - posible alteración de datos");
              onResult?.({
                success: false,
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
              code: response.code,
              message: msg,
              response: response,
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
  }, [amount, currency, orderNumber, onResult]);

  return (
    <div style={{ textAlign: "center", padding: "16px" }}>
      {/* Info de la orden */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
        <p><strong>Orden:</strong> {orderNumber}</p>
        <p><strong>Monto:</strong> {currency} {amount}</p>
      </div>

      {/* Botón de pago */}
      {status === "idle" && (
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
          }}
        >
          Pagar con Izipay
        </button>
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
            }}
          >
            Reintentar
          </button>
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
