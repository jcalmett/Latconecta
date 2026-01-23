import { useEffect } from "react";
import { confirmPayment } from "./paymentService";

export default function IzipayCheckout({ order, onSuccess, onError }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
    script.async = true;

    script.onload = () => {
      window.KR?.setFormConfig({
        formToken: order.formToken || "TEST_FORM_TOKEN",
        callback: async (response) => {
          try {
            await confirmPayment(
              order.order_code,
              response.success
            );
            response.success ? onSuccess() : onError();
          } catch {
            onError();
          }
        },
      });
    };

    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, [order, onSuccess, onError]);

  return (
    <div className="mt-2">
      <div id="kr-payment-form" />
    </div>
  );
}
