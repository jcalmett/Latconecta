/**
 * Upload Helper - Latconecta Admin
 * Construye URLs de archivos según ambiente (desarrollo/producción)
 * Fecha: 2026-01-30
 */

/**
 * Construye URL completa de archivo según ambiente
 * @param {string} relativePath - Ruta relativa ej: /uploads/countries/file.jpg
 * @returns {string} URL completa
 */
export const getUploadUrl = (relativePath) => {
  if (!relativePath) return '';
  
  // Si ya es URL completa, devolverla tal cual (retrocompatibilidad con datos antiguos)
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Si es imagen local de assets, devolverla tal cual
  if (relativePath.startsWith('/assets/')) {
    return relativePath;
  }
  
  // Construir URL según ambiente
  const uploadBaseUrl = import.meta.env.VITE_UPLOAD_URL || 
                        import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 
                        'http://127.0.0.1:8100';
  
  // Asegurar que la ruta relativa empiece con /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${uploadBaseUrl}${path}`;
};

export default {
  getUploadUrl
};