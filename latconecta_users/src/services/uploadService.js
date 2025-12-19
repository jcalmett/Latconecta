import apiClient from './apiClient';

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
  uploadImage: async (file, category = 'users') => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Usar fetch directo porque apiClient no maneja bien multipart/form-data
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8100/api/v1';

      // ✅ CORREGIDO: Usar /{category} en lugar de /image?category=
      const response = await fetch(`${baseURL}/upload/${category}`, {
        method: 'POST',
        body: formData,
        headers: {
          // NO incluir Content-Type, el browser lo setea automáticamente con boundary
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.detail || 'Error al subir imagen');
      }

      const data = await response.json();

      // El backend devuelve { success: true, url: "/uploads/..." }
      if (data.success && data.url) {
        // Convertir la ruta relativa a URL completa
        const apiBase = baseURL.replace('/api/v1', '');
        return apiBase + data.url;
      }

      throw new Error('Respuesta inválida del servidor');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
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
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8100/api/v1';

      const response = await fetch(`${baseURL}/upload/${category}/${filename}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al eliminar imagen');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw error;
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