export default function IzipayCheckout({ paymentData }) {
  return (
    <div>
      <h3>Formulario de pago (Sandbox)</h3>

      <p><strong>Orden:</strong> {paymentData.order_code}</p>
      <p><strong>Monto:</strong> S/ {paymentData.amount}</p>

      <div style={{
        marginTop: "20px",
        padding: "16px",
        border: "1px dashed #999",
        textAlign: "center"
      }}>
        Aquí se cargará el formulario Izipay Web Core
      </div>
    </div>
  );
}
