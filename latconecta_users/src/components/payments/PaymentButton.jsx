import { useState } from "react";
import PaymentModal from "./PaymentModal";

export default function PaymentButton({ amount, description }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-primary text-white px-6 py-2 rounded-md"
      >
        Pagar
      </button>

      {open && (
        <PaymentModal
          amount={amount}
          description={description}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
