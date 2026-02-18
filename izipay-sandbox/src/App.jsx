// frontend/src/App.jsx
/**
 * Izipay Sandbox - App Principal
 * ✅ ACTUALIZADO: Soporte para probar anulación de transacciones
 *
 * Flujo de prueba:
 * 1. Hacer pago → capturar datos del validate response
 * 2. Mostrar datos de anulación extraídos
 * 3. Botón "Anular Transacción" para probar cancel
 */
import { useState } from "react";
import IzipayCheckout from "./components/IzipayCheckout";
import { cancelPayment } from "./services/paymentService";

export default function App() {
  const [amount, setAmount] = useState("15.00");
  const [currency, setCurrency] = useState("PEN");
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // ✅ NUEVO: Estado para anulación
  const [cancelData, setCancelData] = useState(null);
  const [cancelResult, setCancelResult] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Genera un orderNumber único cada vez que se inicia un pago
  const handleStartPayment = () => {
    const newOrder = `ORD${Date.now().toString().slice(-10)}`;
    setOrderNumber(newOrder);
    setResult(null);
    setCancelData(null);
    setCancelResult(null);
    setShowCheckout(true);
  };

  const handleResult = (paymentResult) => {
    console.log("📦 Payment result:", paymentResult);
    setResult(paymentResult);

    // ✅ NUEVO: Si el pago fue exitoso, guardar datos para anulación
    if (paymentResult.success && paymentResult.cancelData) {
      setCancelData(paymentResult.cancelData);
      console.log("📋 Cancel data saved:", paymentResult.cancelData);
    }
  };

  // ✅ NUEVO: Handler para anulación
  const handleCancel = async () => {
    if (!cancelData) return;

    setCancelling(true);
    setCancelResult(null);

    try {
      const response = await cancelPayment(cancelData);
      console.log("🔄 Cancel result:", response);
      setCancelResult(response);
    } catch (err) {
      console.error("❌ Cancel error:", err);
      setCancelResult({
        success: false,
        message: err.message,
      });
    } finally {
      setCancelling(false);
    }
  };

  // ✅ NUEVO: Reset completo
  const handleReset = () => {
    setShowCheckout(false);
    setResult(null);
    setCancelData(null);
    setCancelResult(null);
  };

  return (
    <div style={{
      maxWidth: "550px",
      margin: "40px auto",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
        Izipay Sandbox
      </h1>
      <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
        Prueba de integración: Pago + Anulación
      </p>

      {/* Formulario de prueba */}
      <div style={{
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        marginBottom: "16px"
      }}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
            Monto:
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={showCheckout}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
            Moneda:
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={showCheckout}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          >
            <option value="PEN">PEN - Soles</option>
            <option value="USD">USD - Dólares</option>
          </select>
        </div>
      </div>

      {/* Botón iniciar o componente checkout */}
      {!showCheckout ? (
        <button
          onClick={handleStartPayment}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "16px",
            fontWeight: "bold",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Iniciar Pago
        </button>
      ) : (
        <>
          <IzipayCheckout
            amount={amount}
            currency={currency}
            orderNumber={orderNumber}
            onResult={handleResult}
          />

          <button
            onClick={handleReset}
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Nueva prueba
          </button>
        </>
      )}

      {/* Resultado del pago */}
      {result && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          borderRadius: "8px",
          backgroundColor: result.success ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${result.success ? "#bbf7d0" : "#fecaca"}`,
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: result.success ? "#16a34a" : "#dc2626",
            marginBottom: "8px",
          }}>
            {result.success ? "✅ Pago Exitoso" : "❌ Pago No Completado"}
          </h3>
          <pre style={{
            fontSize: "12px",
            overflow: "auto",
            maxHeight: "200px",
            backgroundColor: "#fff",
            padding: "8px",
            borderRadius: "4px",
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* ✅ NUEVO: Sección de Anulación */}
      {cancelData && !cancelResult && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          borderRadius: "8px",
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#d97706", marginBottom: "12px" }}>
            🔄 Datos para Anulación
          </h3>

          <div style={{ fontSize: "13px", marginBottom: "12px" }}>
            <p><strong>Order:</strong> {cancelData.order_number}</p>
            <p><strong>Monto:</strong> {cancelData.amount} {cancelData.currency}</p>
            <p><strong>UniqueId:</strong> {cancelData.unique_id || "N/A"}</p>
            <p><strong>AuthCode:</strong> {cancelData.authorization_code || "N/A"}</p>
            <p><strong>DateTime:</strong> {cancelData.transaction_datetime || "N/A"}</p>
            <p><strong>PayMethod:</strong> {cancelData.pay_method || "N/A"}</p>
            <p><strong>Channel:</strong> {cancelData.channel || "N/A"}</p>
          </div>

          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "15px",
              fontWeight: "bold",
              backgroundColor: cancelling ? "#9ca3af" : "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: cancelling ? "not-allowed" : "pointer",
            }}
          >
            {cancelling ? "Procesando anulación..." : "🔄 Anular Transacción"}
          </button>

          <p style={{ fontSize: "12px", color: "#666", marginTop: "8px", textAlign: "center" }}>
            Esto llamará a POST /payments/cancel con los datos de arriba
          </p>
        </div>
      )}

      {/* ✅ NUEVO: Resultado de la anulación */}
      {cancelResult && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          borderRadius: "8px",
          backgroundColor: cancelResult.success ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${cancelResult.success ? "#bbf7d0" : "#fecaca"}`,
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: cancelResult.success ? "#16a34a" : "#dc2626",
            marginBottom: "8px",
          }}>
            {cancelResult.success ? "✅ Anulación Exitosa" : "❌ Anulación Fallida"}
          </h3>

          {cancelResult.cancel_id && (
            <p style={{ fontSize: "13px" }}>
              <strong>Cancel ID:</strong> {cancelResult.cancel_id}
            </p>
          )}
          {cancelResult.authorization_code_cancel && (
            <p style={{ fontSize: "13px" }}>
              <strong>Auth Code Cancel:</strong> {cancelResult.authorization_code_cancel}
            </p>
          )}

          <pre style={{
            fontSize: "12px",
            overflow: "auto",
            maxHeight: "200px",
            backgroundColor: "#fff",
            padding: "8px",
            borderRadius: "4px",
            marginTop: "8px",
          }}>
            {JSON.stringify(cancelResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Tarjetas de prueba */}
      <div style={{
        marginTop: "24px",
        padding: "16px",
        backgroundColor: "#eff6ff",
        borderRadius: "8px",
        fontSize: "13px",
      }}>
        <h4 style={{ fontWeight: "bold", marginBottom: "8px" }}>Tarjetas de prueba:</h4>
        <p><strong>Visa OK:</strong> 4970 1000 0000 0014 | Exp: 12/34 | CVV: 123</p>
        <p><strong>Visa Fail:</strong> 4970 1000 0000 0048 | Exp: 12/34 | CVV: 123</p>
        <p style={{ marginTop: "8px" }}><strong>Flujo de prueba anulación:</strong></p>
        <p>1. Pagar con Visa OK → 2. Ver datos extraídos → 3. Click "Anular"</p>
      </div>
    </div>
  );
}