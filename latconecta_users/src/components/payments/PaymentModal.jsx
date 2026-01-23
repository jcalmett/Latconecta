import { useEffect, useState } from "react";
import { createPayment } from "./paymentService";
import PaymentHeader from "./PaymentHeader";
import IzipayCheckout from "./IzipayCheckout";

export default function PaymentModal({ amount, description, onClose }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    createPayment(amount, description)
      .then((data) => {
        setOrder(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [amount, description]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[420px] p-6">
        <PaymentHeader amount={amount} />

        {status === "loading" && (
          <p className="text-sm text-gray-500">
            Preparando pago…
          </p>
        )}

        {status === "error" && (
          <p className="text-sm text-red-600">
            No se pudo iniciar el pago. Intenta nuevamente.
          </p>
        )}

        {status === "ready" && order && (
          <IzipayCheckout
            order={order}
            onSuccess={() => setStatus("success")}
            onError={() => setStatus("error")}
          />
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Cancelar pago
        </button>
      </div>
    </div>
  );
}
