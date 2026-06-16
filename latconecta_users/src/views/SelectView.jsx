import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Building2, Globe, Tag } from 'lucide-react';
import countriesService from '../services/countriesService';
import servicesService from '../services/servicesService';
import companiesService from '../services/companiesService';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';

const SelectView = () => {
  const navigate = useNavigate();

  // Estados de datos
  const [countries, setCountries] = useState([]);
  const [allServices, setAllServices] = useState([]); // Todos los servicios activos
  const [services, setServices] = useState([]); // Servicios disponibles en el país seleccionado
  const [companies, setCompanies] = useState([]);

  // Estados de selección
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // Estados de loading
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingAllServices, setLoadingAllServices] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // 1️⃣ CARGAR PAÍSES ACTIVOS al montar
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        const data = await countriesService.get();
        const countriesArray = Array.isArray(data) ? data : [data];
        
        // Solo países con status = 'active'
        const activeCountries = countriesArray.filter(
          country => country.status === 'active'
        );
        
        setCountries(activeCountries);
        console.log('📍 Países activos:', activeCountries.length);
      } catch (error) {
        console.error('❌ Error al cargar países:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  // 2️⃣ CARGAR TODOS LOS SERVICIOS ACTIVOS al montar
  useEffect(() => {
    const loadAllServices = async () => {
      try {
        setLoadingAllServices(true);
        const data = await servicesService.getAll();
        const servicesArray = Array.isArray(data) ? data : [data];
        
        // Solo servicios con status = 'active'
        const activeServices = servicesArray.filter(
          service => service.status === 'active'
        );
        
        setAllServices(activeServices);
        console.log('🔧 Total servicios activos en sistema:', activeServices.length);
      } catch (error) {
        console.error('❌ Error al cargar servicios:', error);
      } finally {
        setLoadingAllServices(false);
      }
    };

    loadAllServices();
  }, []);

  // 3️⃣ FILTRAR SERVICIOS DEL PAÍS cuando se selecciona un país
  useEffect(() => {
    if (!selectedCountry || allServices.length === 0) {
      setServices([]);
      setSelectedService(null);
      setCompanies([]);
      return;
    }

    const loadServicesForCountry = async () => {
      try {
        setLoadingServices(true);
        
        // Obtener TODAS las compañías del país (sin filtrar por status)
        const allCompaniesInCountry = await companiesService.getFiltered(
          selectedCountry.country_code,
          null  // Sin filtrar por servicio
        );

        console.log('📦 Compañías del país:', allCompaniesInCountry);

        // Extraer service_id únicos de esas compañías
        const serviceIdsInCountry = new Set();
        allCompaniesInCountry.forEach(company => {
          if (company.service_id) {
            serviceIdsInCountry.add(company.service_id);
          }
        });

        console.log('🔑 Service IDs en país:', Array.from(serviceIdsInCountry));

        // Filtrar servicios activos que tengan compañías en este país
        const servicesInCountry = allServices.filter(service => 
          serviceIdsInCountry.has(service.service_id)
        );

        setServices(servicesInCountry);
        console.log(`🔧 Servicios activos en ${selectedCountry.country_name}:`, servicesInCountry.length);
        console.log('   Servicios:', servicesInCountry.map(s => s.service_name));
      } catch (error) {
        console.error('❌ Error al cargar servicios del país:', error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServicesForCountry();
  }, [selectedCountry, allServices]);

  // 4️⃣ CARGAR COMPAÑÍAS ACTIVAS cuando se selecciona país Y servicio
  useEffect(() => {
    if (!selectedCountry || !selectedService) {
      setCompanies([]);
      return;
    }

    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        
        // Obtener compañías del país y servicio seleccionados
        const data = await companiesService.getFiltered(
          selectedCountry.country_code,
          selectedService.service_name
        );

        // Filtrar solo compañías con company_status = 'active'
        const activeCompanies = data.filter(
          company => company.company_status === 'active'
        );
        
        setCompanies(activeCompanies);
        console.log('🏢 Compañías activas:', activeCompanies.length);
      } catch (error) {
        console.error('❌ Error al cargar compañías:', error);
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [selectedCountry, selectedService]);

  // Handlers
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    const country = countries.find(c => c.country_code === countryCode);
    setSelectedCountry(country || null);
    setSelectedService(null); // Reset servicio al cambiar país
  };

  const handleServiceChange = (e) => {
    const serviceName = e.target.value;
    const service = services.find(s => s.service_name === serviceName);
    setSelectedService(service || null);
  };

  const handleCompanyClick = (company) => {
    // Navegar a ShopView con parámetros
    navigate(`/shop?country=${selectedCountry.country_code}&service=${encodeURIComponent(selectedService.service_name)}&company=${encodeURIComponent(company.company_name)}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* TÍTULO */}
      <div className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-bitel-blue text-center">
            Seleccione País y Servicio
          </h1>
        </div>
      </div>

      {/* BANDA DE SELECCIÓN */}
      <div className="bg-white shadow-md py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* DROPDOWN PAÍS */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Globe className="inline w-4 h-4 mr-1" />
                País
              </label>
              <div className="relative">
                <select
                  value={selectedCountry?.country_code || ''}
                  onChange={handleCountryChange}
                  disabled={loadingCountries}
                  className="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-bitel-blue transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccione un país...</option>
                  {countries.map((country) => (
                    <option key={country.country_code} value={country.country_code}>
                      {country.country_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {/* Previsualización de bandera */}
              {selectedCountry && (
                <div className="mt-3 flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <img
                    src={getImageUrl(selectedCountry.country_flag_photo, 'country')}
                    alt={`Bandera ${selectedCountry.country_name}`}
                    onError={(e) => e.target.src = FALLBACK_IMAGES.country}
                    className="w-12 h-8 object-contain rounded shadow"
                  />
                  <span className="font-semibold text-bitel-blue">
                    {selectedCountry.country_name}
                  </span>
                </div>
              )}
            </div>

            {/* DROPDOWN SERVICIO */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
                Servicio
              </label>
              <div className="relative">
                <select
                  value={selectedService?.service_name || ''}
                  onChange={handleServiceChange}
                  disabled={!selectedCountry || loadingServices || loadingAllServices}
                  className="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-bitel-blue transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedCountry 
                      ? 'Primero seleccione un país...' 
                      : loadingServices || loadingAllServices
                      ? 'Cargando servicios...'
                      : services.length === 0
                      ? 'No hay servicios activos disponibles'
                      : 'Seleccione un servicio...'}
                  </option>
                  {services.map((service) => (
                    <option key={service.service_name} value={service.service_name}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {/* Previsualización de servicio */}
              {selectedService && (
                <div className="mt-3 flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <img
                    src={getImageUrl(selectedService.service_photo, 'service')}
                    alt={selectedService.service_name}
                    onError={(e) => e.target.src = FALLBACK_IMAGES.service}
                    className="w-12 h-12 object-contain rounded shadow"
                  />
                  <span className="font-semibold text-bitel-blue">
                    {selectedService.service_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ZONA DE COMPAÑÍAS */}
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Loading */}
          {loadingCompanies && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bitel-blue mb-4"></div>
              <p className="text-gray-600">Cargando compañías...</p>
            </div>
          )}

          {/* Sin selección */}
          {!selectedCountry && !loadingCompanies && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Comience seleccionando un país
              </h3>
              <p className="text-gray-500">
                Elija un país para ver los servicios disponibles
              </p>
            </div>
          )}

          {/* País seleccionado pero no servicio */}
          {selectedCountry && !selectedService && !loadingCompanies && (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Ahora seleccione un servicio
              </h3>
              <p className="text-gray-500">
                Elija el tipo de servicio que desea adquirir en {selectedCountry.country_name}
              </p>
            </div>
          )}

          {/* Compañías disponibles */}
          {selectedCountry && selectedService && !loadingCompanies && companies.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Compañías que nos ofrecen el servicio <span className="text-bitel-blue">{selectedService.service_name}</span> en <span className="text-bitel-blue">{selectedCountry.country_name}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {companies.map((company) => (
                  <div
                    key={company.company_name}
                    onClick={() => handleCompanyClick(company)}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-bitel-blue p-6"
                  >
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-4 h-24">
                      <img
                        src={getImageUrl(company.company_logo, 'company')}
                        alt={company.company_name}
                        onError={(e) => e.target.src = FALLBACK_IMAGES.company}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Nombre */}
                    <h3 className="text-xl font-bold text-bitel-blue text-center mb-2">
                      {company.company_name}
                    </h3>

                    {/* Info adicional */}
                    <div className="text-center text-sm text-gray-600 space-y-1">
                      <p className="flex items-center justify-center">
                        <Globe className="w-4 h-4 mr-1" />
                        {selectedCountry.country_name}
                      </p>
                      <p className="flex items-center justify-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {selectedService.service_name}
                      </p>
                    </div>

                    {/* Botón */}
                    <div className="mt-4">
                      <button className="w-full bg-bitel-yellow text-bitel-blue py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                        Ver Productos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin compañías */}
          {selectedCountry && selectedService && !loadingCompanies && companies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay compañías activas disponibles
              </h3>
              <p className="text-gray-500">
                No encontramos compañías activas que ofrezcan <strong>{selectedService.service_name}</strong> en <strong>{selectedCountry.country_name}</strong>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Intente con otro país o servicio
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectView;