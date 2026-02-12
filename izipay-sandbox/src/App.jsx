// frontend/src/App.jsx
/**
 * Izipay Sandbox - App Principal
 * Permite probar el flujo completo de pago con Izipay
 */
import { useState } from "react";
import IzipayCheckout from "./components/IzipayCheckout";

export default function App() {
  const [amount, setAmount] = useState("15.00");
  const [currency, setCurrency] = useState("PEN");
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Genera un orderNumber único cada vez que se inicia un pago
  const handleStartPayment = () => {
    const newOrder = `ORD${Date.now().toString().slice(-10)}`;
    setOrderNumber(newOrder);
    setResult(null);
    setShowCheckout(true);
  };

  const handleResult = (paymentResult) => {
    console.log("📦 Payment result:", paymentResult);
    setResult(paymentResult);
    // No cerramos el checkout automáticamente para que se vea el resultado
  };

  return (
    <div style={{ 
      maxWidth: "500px", 
      margin: "40px auto", 
      padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
        Izipay Sandbox
      </h1>
      <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
        Prueba de integración con SDK Izipay (modo pop-up)
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
            onClick={() => { setShowCheckout(false); setResult(null); }}
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

      {/* Resultado */}
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
        <p style={{ marginTop: "4px", color: "#666" }}>
          Más tarjetas en docs de Izipay
        </p>
      </div>
    </div>
  );
}
