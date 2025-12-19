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


const BitelAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados principales
  const [currentView, setCurrentView] = useState('admin'); // 'admin' o 'profile'
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

 // Estado para formularios de tabs (evita pérdida de datos en re-renders)
 const [productsFormData, setProductsFormData] = useState({
  // Información Básica (Columna 1)
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

  // Datos Vendor (Columna 2)
  product_vendor_code: '',
  product_vendpro_code: '',
  product_vendpro_skuid: '',
  product_vendpro_country: '',
  product_vendpro_operator: '',
  product_vendpro_currency: 'PEN',

  // Datos VendPro (Columna 3)
  product_vendpro_product_type: '',
  product_vendpro_amount_type: 'F',
  product_vendpro_amount: 0,
  product_vendpro_maximun_amount: 0,
  product_vendpro_comission: 0
});

 // Envolver setProductsFormData con useCallback para evitar re-renders
 const setProductsFormDataCallback = useCallback((newData) => {
  setProductsFormData(newData);
 }, []);

 // ===== AGREGAR ESTOS 5 NUEVOS ESTADOS =====

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

  // ==================== DATOS MOCK ====================

  // ✅ CAMBIADO: De country (singular) a countries (plural array)
  const [countries, setCountries] = useState([]);

  const [company, setCompany] = useState({
  company_id: 1,
  company_name: 'Bitel',
  company_logo: '/assets/fallback-logo.jpg',
  company_photo: '/assets/fallback-company.jpg',
  company_photo_mkt1: '/assets/fallback-company.jpg',
  company_photo_mkt2: '/assets/fallback-company.jpg',
  company_photo_mkt3: '/assets/fallback-company.jpg',
  company_photo_mkt4: '/assets/fallback-company.jpg',
  company_description5: 'Bitel es una empresa de telecomunicaciones que ofrece servicios de telefonía móvil en Perú',
  company_lema_1: 'Telefonía móvil para todos',
  company_lema_2: 'Conectando al Perú',
  company_status: 'active',
  created_by: 'System',
  updated_by: 'System',
  last_update_date: '2025-01-15'
});

  const [services, setServices] = useState([]);

  // MODIFICADO: Estado de productos ahora se carga desde la API
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  // Estado de servicios (carga desde API)
  const [loadingServices, setLoadingServices] = useState(false);
  // Estado de usuarios (carga desde API)
  const [loadingUsers, setLoadingUsers] = useState(false);
  // ✅ CAMBIADO: loadingCountry -> loadingCountries
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [sales, setSales] = useState([
    {
      purchase_id: 1,
      user_id: 3,
      product_id: 1,
      country_id: 1,
      service_id: 1,
      company_id: 1,
      purchase_date: '2025-10-25',
      product: 'Recarga $10',
      service: 'Top Ups',
      company: 'Bitel',
      country: 'Perú',
      purchase_total_amount: 11.00,
      payment_status: 'completed',
      delivery_status: null,
      user_email: 'user@example.com',
      payment_method: 'Credit Card',
      recipient_name: 'Juan Pérez',
      recipient_phone: '+51999999999'
    },
    {
      purchase_id: 2,
      user_id: 1,
      product_id: 2,
      country_id: 1,
      service_id: 1,
      company_id: 1,
      purchase_date: '2025-10-26',
      product: 'Recarga $20',
      service: 'Top Ups',
      company: 'Bitel',
      country: 'Perú',
      purchase_total_amount: 20.50,
      payment_status: 'completed',
      delivery_status: 'enviado',
      user_email: 'admin@bitel.com.pe',
      payment_method: 'PayPal',
      recipient_name: 'María López',
      recipient_phone: '+51888888888',
      recipient_address: 'Av. Principal 123, Lima'
    }
  ]);

  const [users, setUsers] = useState([]);

  // ==================== CARGAR DATOS DESDE API ====================


  // ==================== FUNCIONES HELPER ====================

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

// ✅ CAMBIADO: loadCountry -> loadCountries (plural) usando getAll()
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

const loadCompany = useCallback(async () => {
  try {
    const data = await companiesService.getActive();
    setCompany(data);
  } catch (error) {
    console.error('Error cargando compañía:', error);
    showNotification('Error al cargar compañía', 'error');
  }
}, [showNotification]);

  const handleImageUpload = useCallback(async (e, callback, category = 'general') => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('🔵 1. Archivo seleccionado:', file.name);

    const validation = uploadService.validateImage(file);
    if (!validation.valid) {
      showNotification(validation.error, 'error');
      return;
    }

    console.log('🔵 2. Validación OK');

    try {
      showNotification('Subiendo imagen...', 'info');
      console.log('🔵 3. Iniciando upload...');

      const imageUrl = await uploadService.uploadImage(file, category);
      console.log('🔵 4. URL recibida del servidor:', imageUrl);

      callback(imageUrl);
      console.log('🔵 5. Callback ejecutado');
    } catch (error) {
      console.error('🔴 Error al subir imagen:', error);
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

  // ==================== CARGAR DATOS DESDE API ====================

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
  loadServices();
  }, [loadServices]);

  useEffect(() => {
  loadUsers();
   }, [loadUsers]);

  // ✅ CAMBIADO: loadCountry -> loadCountries
  useEffect(() => {
  loadCountries();
   }, [loadCountries]);

   useEffect(() => {
  loadCompany();
}, [loadCompany]);

  // ==================== COMPONENTES UI ====================

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

  // HEADER - Amarillo con botones Admin/Profile

  const Header = () => {
    const handleLogout = () => {
      logout();
      navigate('/');
    };

    return (
      <div className="bg-[#FFE709] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* ✅ LOGO GRANDE (h-20) + PANEL ADMINISTRACIÓN */}
            <div className="flex items-center space-x-4">
              <img
                src={getImageUrl(company?.company_logo, 'company')}
                alt="Logo Bitel"
                onError={(e) => e.target.src = FALLBACK_IMAGES.company}
                className="h-20 w-auto object-contain"
              />
              <span className="text-lg font-semibold text-gray-700">Panel Administración</span>
            </div>

            {/* BOTONES DERECHA */}
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


  // FOOTER - Amarillo con 4 columnas

  const Footer = () => (
    <div className="bg-[#FFE709] text-gray-900 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ✅ COLUMNA 1 - LOGO PEQUEÑO (h-12) */}
          <div>
            <img
              src={getImageUrl(company?.company_logo, 'company')}
              alt="Logo Bitel"
              onError={(e) => e.target.src = FALLBACK_IMAGES.company}
              className="h-12 w-auto object-contain mb-3"
            />
            <p className="text-sm text-gray-800">
              Plataforma de Servicios Digitales - Telefonía móvil para todos
            </p>
          </div>

          {/* COLUMNA 2 - CONTACTO */}
          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Contacto</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@bitel.com.pe</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+51 999 999 999</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Lima, Perú</span>
              </div>
            </div>
          </div>

          {/* COLUMNA 3 - HISTORIA */}
          <div>
            <h4 className="font-semibold mb-3 text-[#008C96]">Historia</h4>
            <p className="text-sm text-gray-800">
              Bitel es líder en servicios de telecomunicaciones en el Perú.
            </p>
          </div>

          {/* COLUMNA 4 - ENLACES */}
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

        {/* COPYRIGHT */}
        <div className="border-t border-gray-300 mt-6 pt-4 text-center text-sm text-gray-700">
          © 2025 Bitel. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );

  // ==================== RENDER PRINCIPAL ====================

  const tabs = [
    { id: 'latconecta', label: 'Latconecta' },
    { id: 'countries', label: 'País' },
    { id: 'services', label: 'Servicios' },
    { id: 'companies', label: 'Compañía' },
    { id: 'products', label: 'Productos' },
    { id: 'sales', label: 'Ventas' },
    { id: 'users', label: 'Usuarios' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'vendor-products', label: 'Productos Vendor' }
  ];

  const renderTabContent = () => {
  switch (activeTab) {

    case 'latconecta':
      return <LatconectaTab 
        showNotification={showNotification}
        handleImageUpload={handleImageUpload}
      />;

    // ✅ CAMBIADO: Ahora usa countries (plural) y todas las props necesarias
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
  company={company}
  setCompany={setCompany}
  user={user}
  handleImageUpload={handleImageUpload}
  showNotification={showNotification}
  loadCompany={loadCompany}
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
    />

    case 'vendors':
      return <VendorsTab userRole={user?.user_role} />;

    case 'vendor-products':
      return <VendorProductsTab userRole={user?.user_role} />;

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

export default BitelAdmin;