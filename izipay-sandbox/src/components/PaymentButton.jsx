import { useState } from "react";
import PaymentModal from "./PaymentModal";

const API_URL = import.meta.env.VITE_API_URL;

export default function PaymentButton() {
  const [order, setOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    setLoading(true);
    setShowModal(true);

    try {
      const response = await fetch(`${API_URL}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 50,
          description: "Pago de prueba",
        }),
      });

      const data = await response.json();
      console.log("Orden creada:", data);

      setOrder(data); // 🔑 CLAVE
    } catch (error) {
      console.error("Error creando orden:", error);
      alert("Error al iniciar el pago");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={startPayment}
        disabled={loading}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Procesando..." : "Pagar con Izipay"}
      </button>

      {showModal && (
        <PaymentModal
          order={order}
          onClose={() => {
            setShowModal(false);
            setOrder(null);
          }}
        />
      )}
    </>
  );
}
