/**
 * Auth Service - Latconecta Admin
 * Versión: CORREGIDA CON TRAILING SLASHES
 * Fecha: 2025-12-19
 *
 * Servicio de autenticación con logs extensivos para debugging
 * ✅ TODOS LOS ENDPOINTS CON TRAILING SLASH
 */

import apiClient from '../config/api';

const authService = {
  /**
   * Login de usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} Token y datos del usuario
   */
  login: async (email, password) => {
    try {
      console.log('🔵 Iniciando login para:', email);

      // ✅ TRAILING SLASH AGREGADO
      const response = await apiClient.post('/auth/login', {
        email: email,
        password: password
      });

      console.log('═══════════════════════════════════════════');
      console.log('🔍 RESPUESTA COMPLETA DEL BACKEND:');
      console.log(response.data);
      console.log('═══════════════════════════════════════════');
      console.log('🔍 CAMPOS RECIBIDOS:', Object.keys(response.data));
      console.log('═══════════════════════════════════════════');

      // Extraer datos con validación
      const {
        access_token,
        token_type,
        user_id,
        user_email,
        user_name,
        user_role,
        user_photo,
        user_phone_country_code,
        user_phone_number
      } = response.data;

      // Validar que existan los campos críticos
      if (!access_token) {
        console.error('❌ ERROR: No se recibió access_token del backend');
        throw new Error('No se recibió token de acceso');
      }

      if (!user_role) {
        console.error('❌ ERROR: No se recibió user_role del backend');
        throw new Error('No se recibió rol de usuario');
      }

      console.log('🔍 DATOS EXTRAÍDOS:');
      console.log('  - access_token:', access_token ? `${access_token.substring(0, 20)}...` : 'NO EXISTE');
      console.log('  - token_type:', token_type);
      console.log('  - user_id:', user_id);
      console.log('  - user_email:', user_email);
      console.log('  - user_name:', user_name);
      console.log('  - user_role:', user_role, user_role === 'admin' ? '✅ ES ADMIN' : '⚠️ NO ES ADMIN');
      console.log('  - user_photo:', user_photo);
      console.log('  - user_phone_country_code:', user_phone_country_code);
      console.log('  - user_phone_number:', user_phone_number);

      // Construir objeto de usuario
      const user = {
        id: user_id,
        email: user_email,
        name: user_name,
        role: user_role,
        user_photo: user_photo,
        user_phone_country_code: user_phone_country_code,
        user_phone_number: user_phone_number
      };

      console.log('🔍 OBJETO USUARIO CONSTRUIDO:');
      console.log(user);

      // Guardar en localStorage
      console.log('💾 Guardando token en localStorage con key: "latconecta_token"');
      localStorage.setItem('latconecta_token', access_token);

      console.log('💾 Guardando usuario en localStorage con key: "latconecta_user"');
      localStorage.setItem('latconecta_user', JSON.stringify(user));

      // Verificar que se guardaron correctamente
      const tokenGuardado = localStorage.getItem('latconecta_token');
      const userGuardado = localStorage.getItem('latconecta_user');

      console.log('═══════════════════════════════════════════');
      console.log('✅ VERIFICACIÓN POST-GUARDADO:');
      console.log('  - Token guardado existe:', tokenGuardado ? 'SÍ' : 'NO');
      console.log('  - Token guardado:', tokenGuardado ? `${tokenGuardado.substring(0, 20)}...` : 'NO EXISTE');
      console.log('  - Usuario guardado existe:', userGuardado ? 'SÍ' : 'NO');
      console.log('  - Usuario guardado:', userGuardado ? JSON.parse(userGuardado) : 'NO EXISTE');
      console.log('═══════════════════════════════════════════');

      // Verificar si el token y el guardado son iguales
      if (tokenGuardado === access_token) {
        console.log('✅ Token guardado coincide con token recibido');
      } else {
        console.error('❌ ERROR: Token guardado NO coincide con token recibido');
        console.error('   Token recibido:', access_token.substring(0, 50));
        console.error('   Token guardado:', tokenGuardado ? tokenGuardado.substring(0, 50) : 'NO EXISTE');
      }

      console.log('✅ LOGIN EXITOSO');

      return { token: access_token, user };
    } catch (error) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ ERROR EN LOGIN:');
      console.error('   Tipo:', error.name);
      console.error('   Mensaje:', error.message);
      console.error('   Response:', error.response?.data);
      console.error('   Status:', error.response?.status);
      console.error('═══════════════════════════════════════════');
      throw error.response?.data || error;
    }
  },

  /**
   * Logout - Limpiar sesión
   */
  logout: () => {
    console.log('🔵 Ejecutando logout...');
    localStorage.removeItem('latconecta_token');
    localStorage.removeItem('latconecta_user');
    console.log('✅ Token y usuario eliminados de localStorage');
  },

  /**
   * Obtener usuario actual desde localStorage
   * @returns {Object|null} Usuario actual o null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('latconecta_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔍 Usuario actual desde localStorage:', user);
        return user;
      } catch (error) {
        console.error('❌ Error al parsear usuario desde localStorage:', error);
        return null;
      }
    }
    console.log('⚠️ No hay usuario en localStorage');
    return null;
  },

  /**
   * Obtener token desde localStorage
   * @returns {string|null} Token o null
   */
  getToken: () => {
    const token = localStorage.getItem('latconecta_token');
    if (token) {
      console.log('🔍 Token desde localStorage:', token ? `${token.substring(0, 20)}...` : 'NO EXISTE');
    } else {
      console.log('⚠️ No hay token en localStorage');
    }
    return token;
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} True si hay token
   */
  isAuthenticated: () => {
    const hasToken = !!localStorage.getItem('latconecta_token');
    console.log('🔍 ¿Usuario autenticado?', hasToken ? 'SÍ' : 'NO');
    return hasToken;
  },

  /**
   * Verificar token con el backend
   * @returns {Promise} Respuesta de verificación
   */
  verifyToken: async () => {
    try {
      console.log('🔵 Verificando token con el backend...');
      // ✅ TRAILING SLASH AGREGADO
      const response = await apiClient.get('/auth/verify/');
      console.log('✅ Token verificado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Token inválido o expirado');
      authService.logout();
      throw error;
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise} Usuario creado
   */
  register: async (userData) => {
    try {
      console.log('🔵 Registrando nuevo usuario:', userData.email);
      // ✅ TRAILING SLASH AGREGADO
      const response = await apiClient.post('/auth/register/', userData);
      console.log('✅ Usuario registrado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al registrar usuario:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Actualizar perfil del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise} Usuario actualizado
   */
  updateProfile: async (userData) => {
    try {
      console.log('🔵 Actualizando perfil de usuario...');
      // ✅ TRAILING SLASH AGREGADO
      const response = await apiClient.put('/auth/profile/', userData);

      const currentUser = authService.getCurrentUser();
      const updatedUser = { ...currentUser, ...response.data };

      localStorage.setItem('latconecta_user', JSON.stringify(updatedUser));
      console.log('✅ Perfil actualizado:', updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Cambiar contraseña
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @param {string} confirmPassword - Confirmación de nueva contraseña
   * @returns {Promise} Resultado del cambio
   */
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      console.log('🔵 Cambiando contraseña...');
      // ✅ TRAILING SLASH AGREGADO
      const response = await apiClient.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      console.log('✅ Contraseña cambiada exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      throw error.response?.data || error;
    }
  },

  // ===========================================================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ===========================================================================

  /**
   * Solicitar código de recuperación de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise} Respuesta del backend
   */
  forgotPassword: async (email) => {
    try {
      console.log('🔵 Solicitando código de recuperación para:', email);
      const response = await apiClient.post('/auth/forgot-password', { email });
      console.log('✅ Código enviado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al solicitar código:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Restablecer contraseña con código de verificación
   * @param {string} email - Email del usuario
   * @param {string} code - Código de 6 dígitos recibido por email
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise} Respuesta del backend
   */
  resetPassword: async (email, code, newPassword) => {
    try {
      console.log('🔵 Restableciendo contraseña para:', email);
      const response = await apiClient.post('/auth/reset-password', {
        email,
        code,
        new_password: newPassword
      });
      console.log('✅ Contraseña restablecida exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al restablecer contraseña:', error);
      throw error.response?.data || error;
    }
  },
};

export default authService;
