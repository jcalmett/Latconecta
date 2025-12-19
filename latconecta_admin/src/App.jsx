import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import WelcomeView from './pages/WelcomeView';
import BitelAdmin from './pages/BitelAdmin';
import { useState, useEffect } from 'react';
import companiesService from './services/companiesService';

function App() {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos de la compañía
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const data = await companiesService.getActive();
        setCompanyData(data);
      } catch (error) {
        console.error('Error cargando compañía:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
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
              element={<WelcomeView companyData={companyData} />} 
            />

            {/* Ruta protegida - Admin Panel */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <BitelAdmin />
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