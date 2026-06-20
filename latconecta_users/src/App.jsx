import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { React, useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import WelcomeView from './views/WelcomeView';
import SelectView from './views/SelectView';
import LoginModal from './components/auth/LoginModal';
import SignUpModal from './components/auth/SignUpModal';
import Notification from './components/common/Notification';
import OperationsPanel from './components/OperationsPanel';
import { useAuth } from './hooks/useAuth';
import latconectaService from './services/latconectaService';
import ShopView from './views/ShopView';
import ProfileView from './views/ProfileView';
import LibroReclamaciones from './components/complaints/LibroReclamaciones';
import RespuestaOferta from './components/complaints/RespuestaOferta';
import AvisoLegalView from './views/AvisoLegalView';
import TerminosView from './views/TerminosView';
import PrivacidadView from './views/PrivacidadView';


function AppContent() {
  const { user, isAuthenticated, login, register, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [latconectaData, setLatconectaData] = useState(null);
  const [loadingLatconecta, setLoadingLatconecta] = useState(true);

  // Cargar datos corporativos de Latconecta al montar el componente
  useEffect(() => {
    const loadLatconectaData = async () => {
      try {
        const data = await latconectaService.get();
        console.log('📊 Datos de Latconecta cargados:', data);
        setLatconectaData(data);
      } catch (error) {
        console.error('❌ Error al cargar datos de Latconecta:', error);
        showNotification('Error al cargar información de la empresa', 'error');
      } finally {
        setLoadingLatconecta(false);
      }
    };

    loadLatconectaData();
  }, []);

  const handleLogin = async (email, password) => {
    const result = await login(email, password);

    if (result.success) {
      showNotification('¡Bienvenido! Sesión iniciada correctamente', 'success');
      setShowLoginModal(false);
      navigate('/select');
    }

    return result;
  };

  const handleRegister = async (userData) => {
    const result = await register(userData);

    if (result.success) {
      showNotification('¡Cuenta creada! Bienvenido a Latconecta', 'success');
      setShowSignUpModal(false);
      navigate('/select');
    }

    return result;
  };

  const handleLogout = () => {
    logout();
    showNotification('Sesión cerrada correctamente', 'success');
    navigate('/');
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

  // Mostrar loading mientras carga datos de Latconecta
  if (loadingLatconecta) {
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
        latconectaData={latconectaData}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenSignUp={() => setShowSignUpModal(true)}
      />

      <Routes>
        <Route path="/" element={<WelcomeView latconectaData={latconectaData} />} />
        <Route path="/select" element={<SelectView />} />
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
        {/* Libro de Reclamaciones Virtual — LR-001 (público, sin auth) */}
        <Route path="/reclamaciones" element={<LibroReclamaciones showNotification={showNotification} />} />
        <Route path="/reclamaciones/oferta/:numero" element={<RespuestaOferta showNotification={showNotification} />} />
        {/* Páginas legales — públicas, sin auth */}
        <Route path="/aviso-legal" element={<AvisoLegalView />} />
        <Route path="/terminos" element={<TerminosView />} />
        <Route path="/privacidad" element={<PrivacidadView />} />
      </Routes>

      {/* OperationsPanel — solo en desarrollo/UAT, nunca en producción */}
      {import.meta.env.VITE_SHOW_OPS_PANEL === 'true' && <OperationsPanel />}

      <Footer latconectaData={latconectaData} />

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
    </Router>
  );
}

export default App;