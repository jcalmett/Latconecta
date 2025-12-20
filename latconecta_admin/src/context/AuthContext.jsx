import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();

    if (currentUser && token) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const { user: loggedUser } = await authService.login(email, password);
      setUser(loggedUser);
      setIsAuthenticated(true);
      return { success: true, user: loggedUser };
    } catch (error) {
      return {
        success: false,
        error: error.detail || 'Error al iniciar sesión'
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('latconecta_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ ESTE ERA EL FALTANTE
export const useAuth = () => {
  return useContext(AuthContext);
};