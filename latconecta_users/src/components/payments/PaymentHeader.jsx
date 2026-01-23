export default function PaymentHeader({ amount }) {
  return (
    <div className="flex items-center justify-between border-b pb-3 mb-4">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Latconecta" className="h-8" />
        <span className="font-semibold text-gray-700">
          Pago seguro
        </span>
      </div>
      <span className="font-bold text-lg text-gray-900">
        S/ {amount}
      </span>
    </div>
  );
}
