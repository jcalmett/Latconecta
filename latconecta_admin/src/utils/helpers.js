/**
 * Generar ID único
 * @returns {string}
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Delay asíncrono
 * @param {number} ms - Milisegundos
 * @returns {Promise}
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Debounce de función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone de objeto
 * @param {Object} obj - Objeto a clonar
 * @returns {Object}
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Ordenar array de objetos por propiedad
 * @param {Array} array - Array a ordenar
 * @param {string} key - Propiedad por la que ordenar
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array}
 */
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filtrar array de objetos por múltiples criterios
 * @param {Array} array - Array a filtrar
 * @param {Object} filters - Objeto con filtros
 * @returns {Array}
 */
export const filterByMultipleCriteria = (array, filters) => {
  return array.filter(item => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      
      const itemValue = item[key];
      const filterValue = filters[key];
      
      if (typeof filterValue === 'string') {
        return itemValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
      }
      
      return itemValue === filterValue;
    });
  });
};

/**
 * Agrupar array de objetos por propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} key - Propiedad por la que agrupar
 * @returns {Object}
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    result[group] = result[group] || [];
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Obtener valores únicos de un array
 * @param {Array} array - Array
 * @returns {Array}
 */
export const getUniqueValues = (array) => {
  return [...new Set(array)];
};

/**
 * Comparar dos objetos por igualdad profunda
 * @param {Object} obj1 - Primer objeto
 * @param {Object} obj2 - Segundo objeto
 * @returns {boolean}
 */
export const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Obtener parámetros de URL
 * @param {string} url - URL
 * @returns {Object}
 */
export const getUrlParams = (url) => {
  const params = {};
  const searchParams = new URLSearchParams(new URL(url).search);
  
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  
  return params;
};

/**
 * Construir query string desde objeto
 * @param {Object} params - Parámetros
 * @returns {string}
 */
export const buildQueryString = (params) => {
  const query = Object.keys(params)
    .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  return query ? `?${query}` : '';
};

/**
 * Verificar si es objeto vacío
 * @param {Object} obj - Objeto
 * @returns {boolean}
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Generar rango de números
 * @param {number} start - Inicio
 * @param {number} end - Fin
 * @returns {Array}
 */
export const range = (start, end) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

/**
 * Calcular porcentaje
 * @param {number} value - Valor
 * @param {number} total - Total
 * @param {number} decimals - Decimales
 * @returns {number}
 */
export const calculatePercentage = (value, total, decimals = 2) => {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
};

/**
 * Parsear JSON seguro
 * @param {string} str - String JSON
 * @param {*} fallback - Valor por defecto
 * @returns {*}
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export default {
  generateId,
  delay,
  debounce,
  deepClone,
  sortByKey,
  filterByMultipleCriteria,
  groupBy,
  getUniqueValues,
  isEqual,
  getUrlParams,
  buildQueryString,
  isEmptyObject,
  range,
  calculatePercentage,
  safeJsonParse,
};
