/**
 * Cliente HTTP hacia el backend Latconecta.
 * El bot NO tiene base de datos propia — toda la información
 * (países, servicios, productos, compras) viene siempre en vivo de aquí.
 */
import axios from 'axios';
import 'dotenv/config';

const api = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://77.42.92.151:8100/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Header de servicio solo para los endpoints exclusivos del bot (/whatsapp/*)
const botAuthHeaders = {
  headers: { 'X-Bot-Service-Token': process.env.BOT_SERVICE_TOKEN }
};

export const latconectaApi = {
  /**
   * Identifica a un cliente por teléfono. Devuelve { status: 'found'|'not_found', ... }
   */
  identify: async (countryCode, phoneNumber) => {
    const { data } = await api.post(
      '/whatsapp/identify',
      { country_code: countryCode, phone_number: phoneNumber },
      botAuthHeaders
    );
    return data;
  },

  /**
   * Últimas compras de un cliente por teléfono (compra anónima).
   */
  purchasesByPhone: async (phoneNumber, limit = 5) => {
    const { data } = await api.get('/whatsapp/purchases/by-phone', {
      params: { phone_number: phoneNumber, limit },
      ...botAuthHeaders
    });
    return data;
  },

  /**
   * Países registrados en el sistema (todos los que vende el canal,
   * sin importar en qué país esté instalado el número del bot).
   */
  getCountries: async () => {
    const { data } = await api.get('/countries');
    return Array.isArray(data) ? data : [];
  },

  /**
   * Servicios activos. Filtro de estado replicado igual que ShopView.jsx
   * (el endpoint /services no filtra por defecto — hay que hacerlo aquí).
   */
  getActiveServices: async () => {
    const { data } = await api.get('/services');
    const services = Array.isArray(data) ? data : [];
    return services.filter((s) => s.status === 'active');
  },

  /**
   * Compañías de un país+servicio dado. NOTA: existe un bug conocido —
   * el backend no filtra por company_status. Se deja pendiente de corregir
   * a nivel backend; por ahora el bot no depende de una única "compañía activa",
   * sino que lista todas las que matchean país+servicio y deja elegir.
   */
  getCompanies: async (countryCode, serviceName) => {
    const { data } = await api.get('/companies/', {
      params: { country: countryCode, service: serviceName }
    });
    return Array.isArray(data) ? data : [];
  },

  /**
   * Productos activos de un servicio. Igual que en ShopView.jsx:
   * el endpoint devuelve todo, se filtra product_status==='active' aquí.
   */
  getActiveProducts: async (serviceId, companyId) => {
    const { data } = await api.get('/products', { params: { service_id: serviceId } });
    const products = Array.isArray(data) ? data : [];
    return products.filter(
      (p) => p.product_status === 'active' && (!companyId || p.company_id === companyId)
    );
  },

  /**
   * Info corporativa (logo, lemas). Mismo endpoint que usa WelcomeView.jsx
   * en la web (GET /latconecta). Devuelve la URL completa del logo lista
   * para enviar como imagen, o null si no hay logo configurado.
   */
  getLogoUrl: async () => {
    try {
      const { data } = await api.get('/latconecta');
      if (!data?.latconecta_logo) return null;
      const origin = new URL(api.defaults.baseURL).origin; // ej: http://77.42.92.151:8100
      return `${origin}${data.latconecta_logo}`;
    } catch (err) {
      console.error('Error getLogoUrl:', err.message);
      return null;
    }
  }
};

export default latconectaApi;
