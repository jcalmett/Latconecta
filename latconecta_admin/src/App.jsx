import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WelcomeView from './pages/WelcomeView';
import LatconectaAdmin from './pages/LatconectaAdmin';
import { useState, useEffect } from 'react';
import latconectaService from './services/latconectaService';

function App() {
  const [latconectaData, setLatconectaData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos de Latconecta
  useEffect(() => {
    const loadLatconecta = async () => {
      try {
        const data = await latconectaService.get();
        setLatconectaData(data);
      } catch (error) {
        console.error('Error cargando Latconecta:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLatconecta();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008C96] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta pública - Welcome */}
            <Route
              path="/"
              element={<WelcomeView latconectaData={latconectaData} />}
            />

            {/* Ruta protegida - Admin Panel */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <LatconectaAdmin />
                </ProtectedRoute>
              }
            />

            {/* Redireccionar rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;