import { createContext, useState, useEffect } from 'react';
import companiesService from '../services/companiesService';
import servicesService from '../services/servicesService';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success', // success, error, warning, info
  });

  // Cargar datos iniciales de la compañía y servicios
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar datos de la compañía
      const companyData = await companiesService.getActive();
      setCompany(companyData);

      // Cargar servicios activos
      const servicesData = await servicesService.getActive();
      setServices(servicesData);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      hideNotification();
    }, 5000);
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  const refreshServices = async () => {
    try {
      const servicesData = await servicesService.getActive();
      setServices(servicesData);
    } catch (error) {
      console.error('Error al refrescar servicios:', error);
    }
  };

  const refreshCompany = async () => {
    try {
      const companyData = await companiesService.getActive();
      setCompany(companyData);
    } catch (error) {
      console.error('Error al refrescar compañía:', error);
    }
  };

  const value = {
    company,
    services,
    loading,
    notification,
    showNotification,
    hideNotification,
    refreshServices,
    refreshCompany,
    setCompany,
    setServices,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
