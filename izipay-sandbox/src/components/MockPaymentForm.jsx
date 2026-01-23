export default function MockPaymentForm({ onResult }) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-gray-600">
        Simulación de pago (UX Sandbox)
      </p>

      <button
        className="w-full bg-green-600 text-white py-2 rounded"
        onClick={() =>
          onResult({
            success: true,
            message: "Transacción aprobada",
          })
        }
      >
        Simular pago aprobado
      </button>

      <button
        className="w-full bg-red-600 text-white py-2 rounded"
        onClick={() =>
          onResult({
            success: false,
            message: "Transacción rechazada",
          })
        }
      >
        Simular pago rechazada
      </button>
    </div>
  );
}
