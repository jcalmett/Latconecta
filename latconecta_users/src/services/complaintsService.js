import apiClient from './apiClient';

const complaintsService = {
  async registrar(data) {
    return await apiClient.post('/reclamaciones', data);
  },
  async consultarEstado(numero) {
    return await apiClient.get(`/reclamaciones/estado/${numero}`);
  },
  async responderOferta(data) {
    return await apiClient.post('/reclamaciones/oferta/respuesta', data);
  },
  async misReclamaciones() {
    return await apiClient.get('/reclamaciones/mis-reclamaciones');
  },
};

export default complaintsService;
