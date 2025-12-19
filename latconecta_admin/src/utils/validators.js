/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar contraseña
 * @param {string} password - Contraseña a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
  } = options;

  const errors = [];

  if (password.length < minLength) {
    errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validar teléfono peruano
 * @param {string} phone - Número de teléfono
 * @returns {boolean}
 */
export const isValidPeruvianPhone = (phone) => {
  // Formato: 9 dígitos comenzando con 9
  const phoneRegex = /^9\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validar DNI peruano
 * @param {string} dni - DNI a validar
 * @returns {boolean}
 */
export const isValidDNI = (dni) => {
  // DNI peruano: 8 dígitos
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni);
};

/**
 * Validar RUC peruano
 * @param {string} ruc - RUC a validar
 * @returns {boolean}
 */
export const isValidRUC = (ruc) => {
  // RUC peruano: 11 dígitos
  const rucRegex = /^\d{11}$/;
  return rucRegex.test(ruc);
};

/**
 * Validar URL
 * @param {string} url - URL a validar
 * @returns {boolean}
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validar número positivo
 * @param {number} value - Valor a validar
 * @returns {boolean}
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validar que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

/**
 * Validar longitud mínima
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @returns {boolean}
 */
export const hasMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

/**
 * Validar longitud máxima
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean}
 */
export const hasMaxLength = (value, maxLength) => {
  return value && value.toString().length <= maxLength;
};

/**
 * Validar rango de fecha
 * @param {Date} date - Fecha a validar
 * @param {Date} minDate - Fecha mínima
 * @param {Date} maxDate - Fecha máxima
 * @returns {boolean}
 */
export const isDateInRange = (date, minDate, maxDate) => {
  const d = new Date(date);
  return d >= new Date(minDate) && d <= new Date(maxDate);
};

export default {
  isValidEmail,
  validatePassword,
  isValidPeruvianPhone,
  isValidDNI,
  isValidRUC,
  isValidURL,
  isPositiveNumber,
  isNotEmpty,
  hasMinLength,
  hasMaxLength,
  isDateInRange,
};
