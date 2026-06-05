import apiClient from '../config/api';

const complaintsAdminService = {
  async listar(params = {}) {
    const res = await apiClient.get('/admin/reclamaciones', { params });
    return res.data;
  },
  async detalle(id) {
    const res = await apiClient.get(`/admin/reclamaciones/${id}`);
    return res.data;
  },
  async actualizar(id, data) {
    const res = await apiClient.put(`/admin/reclamaciones/${id}`, data);
    return res.data;
  },
  async exportarCSV() {
    const res = await apiClient.get('/admin/reclamaciones/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reclamaciones_latconecta.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default complaintsAdminService;
