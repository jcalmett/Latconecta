import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

/**
 * Hook personalizado para mostrar notificaciones
 * @returns {Object} Funciones de notificación
 */
export const useNotification = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un AppProvider');
  }

  const { showNotification, hideNotification, notification } = context;

  const success = (message) => showNotification(message, 'success');
  const error = (message) => showNotification(message, 'error');
  const warning = (message) => showNotification(message, 'warning');
  const info = (message) => showNotification(message, 'info');

  return {
    success,
    error,
    warning,
    info,
    hide: hideNotification,
    notification,
  };
};

export default useNotification;
