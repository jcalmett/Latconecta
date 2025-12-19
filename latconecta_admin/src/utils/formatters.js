import { CURRENCY_SYMBOLS } from './constants';

/**
 * Formatear precio con símbolo de moneda
 * @param {number} amount - Cantidad
 * @param {string} currency - Código de moneda
 * @returns {string}
 */
export const formatPrice = (amount, currency = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const formattedAmount = parseFloat(amount).toFixed(2);
  return `${symbol}${formattedAmount}`;
};

/**
 * Formatear fecha
 * @param {string|Date} date - Fecha
 * @param {string} format - Formato deseado
 * @returns {string}
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  switch (format) {
    case 'short':
      return `${day}/${month}/${year}`;
    case 'long':
      return `${day} de ${monthNames[d.getMonth()]} de ${year}`;
    case 'withTime':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'timeOnly':
      return `${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Formatear teléfono peruano
 * @param {string} phone - Número de teléfono
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Formatear nombre completo
 * @param {string} firstName - Nombre
 * @param {string} lastName - Apellido
 * @returns {string}
 */
export const formatFullName = (firstName, lastName) => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  return `${first} ${last}`.trim();
};

/**
 * Capitalizar primera letra de cada palabra
 * @param {string} str - String a formatear
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncar texto
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string}
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Formatear número con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return parseFloat(num).toLocaleString('es-PE');
};

/**
 * Formatear porcentaje
 * @param {number} value - Valor del porcentaje
 * @param {number} decimals - Decimales a mostrar
 * @returns {string}
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Formatear tamaño de archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatear tiempo relativo (hace X tiempo)
 * @param {string|Date} date - Fecha
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Hace un momento';
  if (diffMinutes < 60) return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  
  return formatDate(date);
};

export default {
  formatPrice,
  formatDate,
  formatPhone,
  formatFullName,
  capitalize,
  truncate,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatRelativeTime,
};
