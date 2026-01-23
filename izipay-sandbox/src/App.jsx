import { useState } from "react";
import PaymentButton from "./components/PaymentButton.jsx";
import PaymentModal from "./components/PaymentModal.jsx";
import IzipayCheckout from "./components/IzipayCheckout.jsx";
import { createPayment } from "./components/paymentService";

export default function App() {
  const [open, setOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handlePay = async () => {
    try {
      const data = await createPayment(50);
      setPaymentData(data);
      setOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Izipay Sandbox</h1>

      <PaymentButton onClick={handlePay} />

      <PaymentModal open={open} onClose={() => setOpen(false)}>
        {paymentData && <IzipayCheckout paymentData={paymentData} />}
      </PaymentModal>
    </div>
  );
}
