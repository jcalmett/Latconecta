const API_URL = import.meta.env.VITE_API_URL;

export async function createPayment(amount) {
  const response = await fetch(`${API_URL}/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      description: "Pago sandbox Izipay"
    })
  });

  if (!response.ok) {
    throw new Error("Error creando el pago");
  }

  return response.json();
}
