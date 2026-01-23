import MockPaymentForm from "./MockPaymentForm.jsx";
import IzipayCheckout from "./IzipayCheckout.jsx";

const PAYMENT_MODE = import.meta.env.VITE_PAYMENT_MODE;
const API_URL = import.meta.env.VITE_API_URL;

export default function PaymentModal({ order, onClose }) {

  // 🔒 Guard clause: aún no hay orden
  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-[400px] p-6 shadow-lg text-center">
          <p className="text-gray-600 text-sm">
            Generando orden de pago…
          </p>
        </div>
      </div>
    );
  }

  const handleResult = async (result) => {
    alert(result.message);

    try {
      await fetch(`${API_URL}/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_code: order.order_code,
          success: result.success,
        }),
      });
    } catch (err) {
      console.error("Error confirmando pago:", err);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] p-6 shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Pago electrónico
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Info orden */}
        <div className="text-sm text-gray-700 mb-4">
          <p><strong>Orden:</strong> {order.order_code}</p>
          <p><strong>Monto:</strong> S/ {order.amount}</p>
        </div>

        {/* Contenido */}
        {PAYMENT_MODE === "mock" ? (
          <MockPaymentForm onResult={handleResult} />
        ) : (
          <IzipayCheckout formToken={order.formToken} />
        )}
      </div>
    </div>
  );
}
