// src/components/payments/paymentService.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export async function createPayment(amount, description) {
  const res = await axios.post(`${API}/payments/create`, {
    amount,
    description,
  });
  return res.data;
}

export async function confirmPayment(orderCode, success) {
  await axios.post(`${API}/payments/confirm`, {
    order_code: orderCode,
    success,
  });
}
