/**
 * API Client - Latconecta Admin
 * Fecha: 2025-12-19
 * Correcciones:
 * - baseURL incluye /v1
 * - Búsqueda flexible de token (latconecta_token o token)
 * - Logs de debugging eliminados de request interceptor (seguridad)
 */

import axios from 'axios';

// Configuración base del cliente API
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8100/api/v1', // ✅ CORREGIDO: Agregado /v1
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// Interceptor para agregar token en cada petición
apiClient.interceptors.request.use(
  (config) => {
    // ✅ MEJORADO: Buscar token en ambos lugares
    const token = localStorage.getItem('latconecta_token') || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log de errores
    console.error('🔴 API Error:', error.response?.status, error.message);

    // Manejar errores específicos
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o inválido - limpiar todo
          localStorage.removeItem('latconecta_token');
          localStorage.removeItem('token');
          localStorage.removeItem('latconecta_user');
          localStorage.removeItem('user');

          // Redirigir solo si no estamos en login
          if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            alert('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
            window.location.href = '/';
          }
          break;

        case 403:
          console.error('❌ 403 - Acceso denegado. Usuario no tiene permisos.');
          alert('No tienes permisos para realizar esta acción.');
          break;

        case 404:
          console.error('❌ 404 - Recurso no encontrado');
          break;

        case 500:
          console.error('❌ 500 - Error del servidor');
          alert('Error del servidor. Por favor, contacta al administrador.');
          break;

        default:
          console.error('❌ Error en la petición:', data?.detail || error.message);
      }
    } else if (error.request) {
      console.error('❌ No se recibió respuesta del servidor. ¿Está corriendo el backend?');
    } else {
      console.error('❌ Error al configurar la petición:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
