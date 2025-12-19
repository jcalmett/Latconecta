import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return <Loading message="Verificando autenticación..." />;
  }

  // Si no está autenticado, redirigir a WelcomeView
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si requiere admin y no es admin, mostrar mensaje de acceso denegado
  if (requireAdmin && user?.role !== 'admin' && user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos de administrador para acceder a esta página.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#008C96] text-white py-2 rounded-lg hover:bg-[#007580] transition-colors font-semibold"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Si todo está OK, renderizar children
  return children;
};

export default ProtectedRoute;