/**
 * SISTEMA DE IMAGENES FALLBACK - LATCONECTA
 * ==========================================
 *
 * Este modulo maneja las imagenes fallback para todas las entidades del sistema.
 * Las imagenes fallback estan ubicadas en: public/assets/
 *
 * USO:
 * import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
 *
 * const imageUrl = getImageUrl(entity.photo_url, 'product');
 */

// Rutas de las imagenes fallback en public/assets
export const FALLBACK_IMAGES = {
  company: '/assets/fallback-company.jpg',
  country: '/assets/fallback-country.jpg',
  logo: '/assets/fallback-logo.jpg',
  product: '/assets/fallback-product.jpg',
  service: '/assets/fallback-service.jpg',
  user: '/assets/fallback-user.jpg',
  default: '/assets/fallback-nonty.jpg',
};

/**
 * Obtiene la URL de imagen correcta, usando fallback si es necesario
 *
 * @param {string|null|undefined} imageUrl - URL de la imagen del backend o null
 * @param {string} entityType - Tipo de entidad: 'company', 'country', 'product', 'service', 'user', 'logo'
 * @returns {string} URL de la imagen (original o fallback)
 */
export const getImageUrl = (imageUrl, entityType = 'default') => {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  return FALLBACK_IMAGES[entityType] || FALLBACK_IMAGES.default;
};

/**
 * Obtiene la URL de imagen con prefijo del backend si es necesario
 *
 * @param {string|null|undefined} imageUrl - URL de la imagen del backend
 * @param {string} entityType - Tipo de entidad
 * @param {string} backendUrl - URL base del backend
 * @returns {string} URL completa de la imagen
 */
export const getImageUrlWithBackend = (imageUrl, entityType = 'default', backendUrl = 'http://127.0.0.1:8100') => {
  if (!imageUrl || imageUrl.trim() === '') {
    return FALLBACK_IMAGES[entityType] || FALLBACK_IMAGES.default;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/assets/')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/uploads/')) {
    return `${backendUrl}${imageUrl}`;
  }

  return `${backendUrl}${imageUrl}`;
};

/**
 * Hook para manejar errores de carga de imagenes
 * Retorna una funcion para usar en el atributo onError de img
 *
 * @param {string} entityType - Tipo de entidad
 * @returns {function} Funcion onError
 */
export const useImageFallback = (entityType = 'default') => {
  return (event) => {
    event.target.src = FALLBACK_IMAGES[entityType] || FALLBACK_IMAGES.default;
    event.target.onerror = null;
  };
};

/**
 * Valida si una URL de imagen es valida
 *
 * @param {string} imageUrl - URL a validar
 * @returns {boolean} true si es valida, false si no
 */
export const isValidImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }

  const url = imageUrl.trim();

  if (url === '') {
    return false;
  }

  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = validExtensions.some(ext => url.toLowerCase().endsWith(ext));

  return hasValidExtension;
};

/**
 * Mapeo de campos de foto por tipo de entidad
 */
export const ENTITY_PHOTO_FIELDS = {
  country: {
    main: 'country_flag_photo',
    secondary: 'country_photo'
  },
  company: {
    main: 'company_logo',
    secondary: 'company_Photo',
    marketing: ['company_Photo_Mkt1', 'company_Photo_Mkt2', 'company_Photo_Mkt3', 'company_Photo_Mkt4']
  },
  service: {
    main: 'service_photo',
    marketing: 'service_photo_MKT'
  },
  product: {
    main: 'product_photo'
  },
  user: {
    main: 'user_photo'
  }
};

/**
 * Obtiene la foto principal de una entidad
 *
 * @param {object} entity - Objeto de la entidad
 * @param {string} entityType - Tipo de entidad
 * @returns {string} URL de la foto principal
 */
export const getEntityMainPhoto = (entity, entityType) => {
  if (!entity) {
    return FALLBACK_IMAGES[entityType] || FALLBACK_IMAGES.default;
  }

  const photoField = ENTITY_PHOTO_FIELDS[entityType]?.main;

  if (!photoField) {
    return FALLBACK_IMAGES[entityType] || FALLBACK_IMAGES.default;
  }

  const photoUrl = entity[photoField];
  return getImageUrl(photoUrl, entityType);
};

export default {
  FALLBACK_IMAGES,
  getImageUrl,
  getImageUrlWithBackend,
  useImageFallback,
  isValidImageUrl,
  ENTITY_PHOTO_FIELDS,
  getEntityMainPhoto
};