/**
 * Helper para manejo de imágenes - Latconecta Users
 * Construye URLs correctas para imágenes del backend
 * 
 * MIGRACIÓN UBUNTU 2026-01-30:
 * - Ahora usa uploadHelper para construcción dinámica de URLs
 * - Compatible con rutas relativas y URLs completas (retrocompatibilidad)
 */

import { getUploadUrl } from './uploadHelper';

/**
 * Obtiene la URL completa de una imagen
 * @param {string} imagePath - Ruta de la imagen desde el backend
 * @param {string} type - Tipo de entidad (product, service, company, user, country, general)
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imagePath, type = 'general') => {
  if (!imagePath) {
    return FALLBACK_IMAGES[type] || FALLBACK_IMAGES.general;
  }

  // ✅ MIGRACIÓN UBUNTU: Usar uploadHelper para construcción dinámica
  return getUploadUrl(imagePath);
};

/**
 * Imágenes de fallback por tipo de entidad (SVG embebidos)
 */
export const FALLBACK_IMAGES = {
  product: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EProducto%3C/text%3E%3C/svg%3E',
  
  service: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e3f2fd" width="200" height="200"/%3E%3Ctext fill="%230033A0" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EServicio%3C/text%3E%3C/svg%3E',
  
  company: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FFD100" width="200" height="200"/%3E%3Ctext fill="%230033A0" font-family="Arial" font-size="24" font-weight="bold" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EBITEL%3C/text%3E%3C/svg%3E',
  
  user: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e0e0e0" width="200" height="200"/%3E%3Ctext fill="%23616161" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EUsuario%3C/text%3E%3C/svg%3E',
  
  country: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23c8e6c9" width="200" height="200"/%3E%3Ctext fill="%232E7D32" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EPa%C3%ADs%3C/text%3E%3C/svg%3E',
  
  general: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f5f5f5" width="200" height="200"/%3E%3Ctext fill="%239e9e9e" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen%3C/text%3E%3C/svg%3E',
  
  // Alias para compatibilidad
  logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FFD100" width="200" height="200"/%3E%3Ctext fill="%230033A0" font-family="Arial" font-size="24" font-weight="bold" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EBITEL%3C/text%3E%3C/svg%3E',
  
  default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f5f5f5" width="200" height="200"/%3E%3Ctext fill="%239e9e9e" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen%3C/text%3E%3C/svg%3E'
};

/**
 * Valida si una URL de imagen es válida
 * @param {string} url - URL a validar
 * @returns {Promise<boolean>}
 */
export const isValidImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Hook para manejar errores de carga de imágenes
 */
export const useImageFallback = (entityType = 'general') => {
  return (event) => {
    event.target.src = FALLBACK_IMAGES[entityType] || FALLBACK_IMAGES.general;
    event.target.onerror = null;
  };
};

export default {
  getImageUrl,
  FALLBACK_IMAGES,
  isValidImageUrl,
  useImageFallback
};