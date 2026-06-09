import apiClient from './apiClient';

const complaintsService = {
  async registrar(data) {
    return await apiClient.post('/reclamaciones', data);
  },

  // ✅ FIX: El backend expone POST /reclamaciones/consultar con body
  // {numero_correlativo, consumidor_nro_doc} — no un GET con path param.
  // ConsultaReclamo.jsx ya llama a apiClient.post directamente (correcto).
  // Este método queda alineado por consistencia y para uso futuro.
  async consultarEstado(numero_correlativo, consumidor_nro_doc) {
    return await apiClient.post('/reclamaciones/consultar', {
      numero_correlativo,
      consumidor_nro_doc,
    });
  },

  async responderOferta(data) {
    return await apiClient.post('/reclamaciones/oferta/respuesta', data);
  },

  async misReclamaciones() {
    return await apiClient.get('/reclamaciones/mis-reclamaciones');
  },
};

export default complaintsService;
