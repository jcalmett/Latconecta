import apiClient from '../config/api';

/**
 * Servicio para gestionar subida y eliminación de archivos
 */
const uploadService = {
  /**
   * Sube una imagen al servidor
   * @param {File} file - Archivo a subir
   * @param {string} category - Categoría (products, services, companies, users, countries, receipts)
   * @returns {Promise<string>} URL de la imagen subida
   */
  uploadImage: async (file, category = 'general') => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // ✅ CORREGIDO: Usar /{category} en lugar de /image
      const response = await apiClient.post(`/upload/${category}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // El backend devuelve { success: true, url: "/uploads/..." }
      if (response.data.success && response.data.url) {
        // Convertir la ruta relativa a URL completa
        const baseURL = apiClient.defaults.baseURL.replace('/api/v1', '');
        return baseURL + response.data.url;
      }

      throw new Error('Respuesta inválida del servidor');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Elimina una imagen del servidor
   * @param {string} fileUrl - URL de la imagen a eliminar
   * @param {string} category - Categoría del archivo
   */
  deleteImage: async (fileUrl, category) => {
    try {
      // Extraer el filename de la URL
      const filename = fileUrl.split('/').pop();

      // ✅ CORREGIDO: Usar /{category}/{filename}
      const response = await apiClient.delete(`/upload/${category}/${filename}`);

      return response.data;
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Valida que el archivo sea una imagen válida
   * @param {File} file - Archivo a validar
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateImage: (file) => {
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no permitido. Use JPG, PNG, GIF o WEBP.'
      };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Máximo 5MB.'
      };
    }

    return { valid: true };
  }
};

export default uploadService;