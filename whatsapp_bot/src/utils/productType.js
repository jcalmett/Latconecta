/**
 * Determina si un servicio requiere entrega física (nombre + teléfono + dirección)
 * o solo un número/cuenta destino (topup, paquete, pago de servicio, transferencia).
 *
 * Basado en la regla de negocio real documentada en app/schemas/product.py del
 * backend: el único servicio físico es "Smartphones" (service_id=4). Todo lo
 * demás (Paquetes, Bill Payment, TopUps, Transfers) es digital.
 *
 * Corrección: la versión anterior de este bot usaba un campo de producto
 * inexistente (product_vendpro_product_type) para esta decisión.
 */
export function isPhysicalService(service) {
  if (!service) return false;
  const name = (service.service_name || '').toLowerCase();
  return service.service_id === 4 || name.includes('smartphone');
}

export default { isPhysicalService };
