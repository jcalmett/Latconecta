import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { X, Plus, Edit2, Trash2, Eye, EyeOff, Save, Upload, LogOut, Mail, Phone, MapPin, Globe, AlertTriangle, User } from 'lucide-react';
import productsService from '../services/productsService';
import uploadService from '../services/uploadService';
import servicesService from '../services/servicesService';
import usersService from '../services/usersService';
import companiesService from '../services/companiesService';
import countriesService from '../services/countriesService';
import latconectaService from '../services/latconectaService';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
import ProductsTab from '../components/admin/ProductsTab';
import ServicesTab from '../components/admin/ServicesTab';
import CountriesTab from '../components/admin/CountriesTab';
import CompaniesTab from '../components/admin/CompaniesTab';
import UsersTab from '../components/admin/UsersTab';
import ProfileView from '../components/admin/ProfileView';
import SalesTab from '../components/admin/SalesTab';
import VendorsTab from '../components/admin/VendorsTab';
import VendorProductsTab from '../components/admin/VendorProductsTab';
import LatconectaTab from '../components/admin/LatconectaTab';
import APIMappingsTab from '../components/admin/APIMappingsTab';  // ✅ NUEVO


const LatconectaAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados principales
  const [currentView, setCurrentView] = useState('admin');
  const [activeTab, setActiveTab] = useState('countries');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [viewingSale, setViewingSale] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');

  // Estado para diálogos
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Estado para notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Estado para formularios de tabs
  const [productsFormData, setProductsFormData] = useState({
    product_code: '',
    product_name: '',
    product_description: '',
    product_photo: '',
    service_id: '',
    product_currency: 'PEN',
    product_base_price: 0,
    product_discount_percentage: 0,
    product_discount_amount: 0,
    product_fee: 0,
    product_total_price: 0,
    product_status: 'active',
    product_vendor_code: '',
    product_vendpro_code: '',
    product_vendpro_skuid: '',
    product_vendpro_country: '',
    product_vendpro_operator: '',
    product_vendpro_currency: 'PEN',
    product_vendpro_product_type: '',
    product_vendpro_amount_type: 'F',
    product_vendpro_amount: 0,
    product_vendpro_maximun_amount: 0,
    product_vendpro_comission: 0
  });

  const setProductsFormDataCallback = useCallback((newData) => {
    setProductsFormData(newData);
  }, []);

  // ServicesTab
  const [servicesFormData, setServicesFormData] = useState({
    service_name: '',
    service_photo: '',
    service_photo_MKT: '',
    service_description: '',
    status: 'active'
  });

  const setServicesFormDataCallback = useCallback((newData) => {
    setServicesFormData(newData);
  }, []);

  // UsersTab
  const [usersFormData, setUsersFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    user_phone_country_code: '+51',
    user_phone_number: '',
    user_role: 'user',
    user_status: 'active',
    user_photo: ''
  });

  const setUsersFormDataCallback = useCallback((newData) => {
    setUsersFormData(newData);
  }, []);

  // CountriesTab
  const [countriesFormData, setCountriesFormData] = useState({
    country_name: '',
    country_code: '',
    country_flag_photo: '',
    country_photo: '',
    country_description: '',
    country_er_usd_pen: 3.75,
    status: 'active'
  });

  const setCountriesFormDataCallback = useCallback((newData) => {
    setCountriesFormData(newData);
  }, []);

  // CompaniesTab
  const [companiesFormData, setCompaniesFormData] = useState({
    country_id: '',
    service_id: '',
    company_name: '',
    company_logo: '',
    company_photo: '',
    company_photo_mkt1: '',
    company_photo_mkt2: '',
    company_photo_mkt3: '',
    company_photo_mkt4: '',
    company_description5: '',
    company_lema_1: '',
    company_lema_2: '',
    company_credit_balance: 0,
    company_date_balance: '',
    company_barcode_available: 'No',
    company_mail_customer_support: '',
    company_mail_commercial_support: '',
    company_status: 'active'
  });

  const setCompaniesFormDataCallback = useCallback((newData) => {
    setCompaniesFormData(newData);
  }, []);

  // ProfileView
  const [profileFormData, setProfileFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    user_photo: '',
    user_current_password: '',
    user_new_password: '',
    user_confirm_password: ''
  });

  const setProfileFormDataCallback = useCallback((newData) => {
    setProfileFormData(newData);
  }, []);

  // Estados de datos
  const [countries, setCountries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [latconecta, setLatconecta] = useState(null);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  // Estados de carga
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [sales, setSales] = useState([]);

  // Funciones de carga
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await productsService.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      showNotification('Error al cargar productos', 'error');
    } finally {
      setLoadingProducts(false);
    }
  }, [showNotification]);

  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const data = await servicesService.getAll();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      showNotification('Error al cargar servicios', 'error');
    } finally {
      setLoadingServices(false);
    }
  }, [showNotification]);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await usersService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      showNotification('Error al cargar usuarios', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [showNotification]);

  const loadCountries = useCallback(async () => {
    try {
      setLoadingCountries(true);
      const data = await countriesService.getAll();
      setCountries(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Error cargando países:', error);
      showNotification('Error al cargar países', 'error');
    } finally {
      setLoadingCountries(false);
    }
  }, [showNotification]);

  const loadCompanies = useCallback(async () => {
    try {
      setLoadingCompanies(true);
      const data = await companiesService.getAll();
      setCompanies(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Error cargando compañías:', error);
      showNotification('Error al cargar compañías', 'error');
    } finally {
      setLoadingCompanies(false);
    }
  }, [showNotification]);

  const loadLatconecta = useCallback(async () => {
    try {
      const data = await latconectaService.get();
      setLatconecta(data);
    } catch (error) {
      console.error('Error cargando Latconecta:', error);
      showNotification('Error al cargar datos de Latconecta', 'error');
    }
  }, [showNotification]);

  const handleImageUpload = useCallback(async (e, callback, category = 'general') => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = uploadService.validateImage(file);
    if (!validation.valid) {
      showNotification(validation.error, 'error');
      return;
    }

    try {
      showNotification('Subiendo imagen...', 'info');
      const imageUrl = await uploadService.uploadImage(file, category);
      callback(imageUrl);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      showNotification('Error al subir la imagen', 'error');
    }
  }, [showNotification]);

  const calculateTotalPrice = useCallback((basePrice, discountPercentage, fee) => {
    const discount = (parseFloat(basePrice) * parseFloat(discountPercentage)) / 100;
    const total = parseFloat(basePrice) - discount + parseFloat(fee);
    return total.toFixed(2);
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  // Cargar datos al montar
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    loadLatconecta();
  }, [loadLatconecta]);

  // Componentes UI
  const ConfirmDialog = () => {
    if (!confirmDialog.show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-[#FFE709]" size={32} />
            <h3 className="text-xl font-bold text-[#008C96]">{confirmDialog.title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: null })}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ show: false, title: '', message: '', onConfirm: null });
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Notification = () => {
    if (!notification.show) return null;

    const bgColor =
      notification.type === 'success' ? 'bg-green-500' :
      notification.type === 'error' ? 'bg-red-500' :
      notification.type === 'info' ? 'bg-blue-500' : 'bg-gray-500';

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`px-6 py-3 rounded-lg shadow-lg ${bgColor} text-white font-semibold`}>
          {notification.message}
        </div>
      </div>
    );
  };

  const Header = () => {
    const handleLogout = () => {
      logout();
      navigate('/');
    };

    return (
      <div className="bg-[#FFE709] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                src={getImageUrl(latconecta?.latconecta_logo, 'companies')}
                alt="Logo Latconecta"
                onError={(e) => e.target.src = FALLBACK_IMAGES.company}
                className="h-20 w-auto object-contain"
              />
              <span className="text-lg font-semibold text-gray-700">Panel Administración</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  currentView === 'admin' ? 'bg-[#008C96] text-white' : 'bg-[#FFF34D] text-[#008C96] hover:bg-[#E6D008]'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  currentView === 'profile' ? 'bg-[#008C96] text-white' : 'bg-[#FFF34D] text-[#008C96] hover:bg-[#E6D008]'
                }`}
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-white font-semibold"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
              <div className="flex items-center space-x-2 bg-[#008C96] text-white px-4 py-2 rounded-lg">
                <img
                  src={getImageUrl(user?.user_photo, 'user')}
                  alt={user?.name}
                  onError={(e) => e.target.src = FALLBACK_IMAGES.user}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-semibold">{user?.name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <div className="bg-[#FFE709] text-gray-900 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* COLUMNA 1: Logo + Lema 1 */}
          <div>
            <img
              src={getImageUrl(latconecta?.latconecta_logo, 'companies')}
              alt="Logo Latconecta"
              onError={(e) => e.target.src = FALLBACK_IMAGES.company}
              className="h-12 w-auto object-contain mb-3"
            />
            <p className="text-sm text-gray-800 font-medium">
              {latconecta?.latconecta_lema_1 || 'Conectando el futuro'}
            </p>
          </div>

          {/* COLUMNA 2: Contacto */}
          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Contacto</h4>
            <div className="space-y-2 text-sm">
              {latconecta?.latconecta_mail_comercial && (
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>{latconecta.latconecta_mail_comercial}</span>
                </div>
              )}
              {latconecta?.latconecta_mail_support && (
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>{latconecta.latconecta_mail_support}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Miami, FL, USA</span>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: Historia */}
          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Historia</h4>
            <p className="text-sm text-gray-800">
              {latconecta?.latconecta_description || 'Plataforma de servicios digitales innovadora'}
            </p>
          </div>

          {/* COLUMNA 4: Enlaces */}
          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Enlaces</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 hover:text-[#008C96] cursor-pointer">
                <Globe size={16} />
                <span>Sobre Nosotros</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-[#008C96] cursor-pointer">
                <Globe size={16} />
                <span>Términos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-6 pt-4 text-center text-sm text-gray-700">
          © 2025 {latconecta?.latconecta_name || 'Latconecta'}. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'latconecta', label: 'Latconecta' },
    { id: 'countries', label: 'País' },
    { id: 'services', label: 'Servicios' },
    { id: 'companies', label: 'Compañía' },
    { id: 'products', label: 'Productos' },
    { id: 'sales', label: 'Ventas' },
    { id: 'users', label: 'Usuarios' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'vendor-products', label: 'Productos Vendor' },
    { id: 'api-mappings', label: '🗺️ API Mappings' }  // ✅ NUEVO
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'latconecta':
        return <LatconectaTab
          showNotification={showNotification}
          handleImageUpload={handleImageUpload}
        />;

      case 'countries':
        if (loadingCountries) {
          return (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008C96] mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando países...</p>
              </div>
            </div>
          );
        }
        return <CountriesTab
          formData={countriesFormData}
          setFormData={setCountriesFormDataCallback}
          countries={countries}
          setCountries={setCountries}
          loadingCountries={loadingCountries}
          showForm={showForm}
          setShowForm={setShowForm}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          user={user}
          handleImageUpload={handleImageUpload}
          showNotification={showNotification}
          resetForm={resetForm}
          setConfirmDialog={setConfirmDialog}
          loadCountries={loadCountries}
        />;

      case 'services':
        return <ServicesTab
          formData={servicesFormData}
          setFormData={setServicesFormDataCallback}
          services={services}
          setServices={setServices}
          loadingServices={loadingServices}
          showForm={showForm}
          setShowForm={setShowForm}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          user={user}
          handleImageUpload={handleImageUpload}
          showNotification={showNotification}
          resetForm={resetForm}
          setConfirmDialog={setConfirmDialog}
          loadServices={loadServices}
        />;

      case 'companies':
        return <CompaniesTab
          formData={companiesFormData}
          setFormData={setCompaniesFormDataCallback}
          companies={companies}
          setCompanies={setCompanies}
          loadingCompanies={loadingCompanies}
          countries={countries}
          services={services}
          showForm={showForm}
          setShowForm={setShowForm}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          user={user}
          handleImageUpload={handleImageUpload}
          showNotification={showNotification}
          resetForm={resetForm}
          setConfirmDialog={setConfirmDialog}
          loadCompanies={loadCompanies}
        />;

      case 'products':
        return <ProductsTab
          formData={productsFormData}
          setFormData={setProductsFormDataCallback}
          products={products}
          setProducts={setProducts}
          services={services}
          loadingProducts={loadingProducts}
          setLoadingProducts={setLoadingProducts}
          showForm={showForm}
          setShowForm={setShowForm}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          handleImageUpload={handleImageUpload}
          showNotification={showNotification}
          calculateTotalPrice={calculateTotalPrice}
          setConfirmDialog={setConfirmDialog}
          loadProducts={loadProducts}
        />;

      case 'sales':
        return <SalesTab showNotification={showNotification} />;

      case 'users':
        return <UsersTab
          formData={usersFormData}
          setFormData={setUsersFormDataCallback}
          users={users}
          setUsers={setUsers}
          loadingUsers={loadingUsers}
          showForm={showForm}
          setShowForm={setShowForm}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          handleImageUpload={handleImageUpload}
          showNotification={showNotification}
          resetForm={resetForm}
          setConfirmDialog={setConfirmDialog}
          loadUsers={loadUsers}
        />;

      case 'vendors':
        return <VendorsTab userRole={user?.user_role} />;

      case 'vendor-products':
        return <VendorProductsTab userRole={user?.user_role} />;

      case 'api-mappings':  // ✅ NUEVO
        return <APIMappingsTab
          showNotification={showNotification}
          setConfirmDialog={setConfirmDialog}
        />;

      default:
        return <CountriesTab
          formData={countriesFormData}
          setFormData={setCountriesFormDataCallback}
          countries={countries}
          setCountries={setCountries}
          loadingCountries={loadingCountries}
          showForm={showForm}
          setShowForm={setShowForm}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          user={user}
          handleImageUpload={handleImageUpload}
          showNotification={showNotification}
          resetForm={resetForm}
          setConfirmDialog={setConfirmDialog}
          loadCountries={loadCountries}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <ConfirmDialog />
      <Notification />

      <div className="flex-grow">
        {currentView === 'admin' ? (
          <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex border-b overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-semibold capitalize whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-[#008C96] border-b-4 border-[#FFE709] bg-yellow-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              {renderTabContent()}
            </div>
          </div>
        ) : (
          <ProfileView
            formData={profileFormData}
            setFormData={setProfileFormDataCallback}
            user={user}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            updateMessage={updateMessage}
            setUpdateMessage={setUpdateMessage}
            handleImageUpload={handleImageUpload}
            showNotification={showNotification}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LatconectaAdmin;