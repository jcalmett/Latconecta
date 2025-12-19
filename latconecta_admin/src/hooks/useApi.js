import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar llamadas API con estados de carga y error
 * @returns {Object} Estados y funciones para API calls
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Ejecutar una función API
   * @param {Function} apiFunc - Función del servicio a ejecutar
   * @param {Object} options - Opciones de configuración
   * @returns {Promise} Resultado de la operación
   */
  const execute = useCallback(async (apiFunc, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      showLoading = true,
      resetData = true 
    } = options;

    try {
      if (showLoading) setLoading(true);
      if (resetData) setData(null);
      setError(null);

      const result = await apiFunc();
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Error en la operación';
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  /**
   * Resetear todos los estados
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    setData,
    setError,
    setLoading,
  };
};

export default useApi;
