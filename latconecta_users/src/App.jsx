import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ApiSimulatorPanel from './components/ApiSimulatorPanel';
import { React, useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import WelcomeView from './views/WelcomeView';
import LoginModal from './components/auth/LoginModal';
import SignUpModal from './components/auth/SignUpModal';
import Notification from './components/common/Notification';
import { useAuth } from './hooks/useAuth';
import companiesService from './services/companiesService';
import ShopView from './views/ShopView';
import ProfileView from './views/ProfileView';


// Vistas temporales


function AppContent() {
  const { user, isAuthenticated, login, register, logout, updateUser } = useAuth();
  const navigate = useNavigate(); // ← AGREGAR
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Cargar datos de la compañía al montar el componente
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const data = await companiesService.get();
        console.log('📊 Datos de compañía cargados:', data);
        setCompanyData(data);
      } catch (error) {
        console.error('❌ Error al cargar datos de compañía:', error);
        showNotification('Error al cargar información de la empresa', 'error');
      } finally {
        setLoadingCompany(false);
      }
    };

    loadCompanyData();
  }, []);

  const handleLogin = async (email, password) => {
  const result = await login(email, password);

  if (result.success) {
    showNotification('¡Bienvenido! Sesión iniciada correctamente', 'success');
    setShowLoginModal(false); // ← AGREGAR
    navigate('/shop');        // ← AGREGAR
  }

  return result;
  };

  const handleRegister = async (userData) => {
  const result = await register(userData);

  if (result.success) {
    showNotification('¡Cuenta creada! Bienvenido a BITEL', 'success');
    setShowSignUpModal(false); // ← AGREGAR
    navigate('/shop');         // ← AGREGAR
  }

  return result;
  };


  const handleLogout = () => {
  logout();
  showNotification('Sesión cerrada correctamente', 'success');
  navigate('/'); // ← AGREGAR
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const switchToSignUp = () => {
    setShowLoginModal(false);
    setShowSignUpModal(true);
  };

  const switchToLogin = () => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  };

  // Mostrar loading mientras carga company data
  if (loadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-bitel-blue mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen flex flex-col">
        <Header
          user={user}
          onLogout={handleLogout}
          companyData={companyData}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenSignUp={() => setShowSignUpModal(true)}
        />

        <Routes>
          <Route path="/" element={<WelcomeView companyData={companyData} />} />
          <Route 
            path="/shop" 
            element={<ShopView user={user} showNotification={showNotification} />} 
        />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <ProfileView 
                  user={user} 
                  showNotification={showNotification}
                  onUserUpdate={updateUser}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                 <div className="text-center">
                   <h2 className="text-2xl font-bold text-gray-800 mb-4">
                     Debes iniciar sesión
                   </h2>
                   <button
                     onClick={() => setShowLoginModal(true)}
                     className="bg-bitel-blue text-white px-6 py-2 rounded-lg hover:opacity-90 transition-colors"
                   >
                     Iniciar Sesión
                   </button>
                 </div>
               </div>
               )
             }
          />
          <Route
            path="/login"
            element={
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-bitel-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            }
          />
        </Routes>

        <Footer companyData={companyData} />

        {/* Modales */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onSwitchToSignUp={switchToSignUp}
        />

        <SignUpModal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onRegister={handleRegister}
          onSwitchToLogin={switchToLogin}
        />

        {/* Notificaciones */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </div>
     );
}

function App() {
  return (
    <Router>
      <AppContent />
      
      {/* Agregar el simulador aquí */}
      {import.meta.env.VITE_API_SIMULATOR === 'true' && (
        <ApiSimulatorPanel />
      )}
    </Router>
  );
}

export default App;
