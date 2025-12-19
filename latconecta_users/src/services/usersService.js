import apiClient from './apiClient';

const usersService = {
  /**
   * Obtener perfil del usuario actual
   */
  getMe: async () => {
    try {
      console.log('🔵 Obteniendo perfil del usuario...');
      const data = await apiClient.get('/users/me');
      console.log('✅ Perfil obtenido:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil del usuario actual
   */
  updateProfile: async (userId, profileData) => {
    try {
      console.log('🔵 Actualizando perfil:', profileData);
      const data = await apiClient.put(`/users/${userId}`, profileData);
      console.log('✅ Perfil actualizado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      throw error;
    }
  },

  /**
   * Cambiar contraseña del usuario actual
   */
  updatePassword: async (passwordData) => {
    try {
      console.log('🔵 Actualizando contraseña...');
      const data = await apiClient.put('/users/me/password', passwordData);
      console.log('✅ Contraseña actualizada');
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar contraseña:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los usuarios (solo admin)
   */
  getAll: async () => {
    try {
      console.log('🔵 Obteniendo todos los usuarios...');
      const data = await apiClient.get('/users/');
      console.log('✅ Usuarios obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  },

  /**
   * Obtener un usuario por ID (solo admin)
   */
  getById: async (id) => {
    try {
      console.log(`🔵 Obteniendo usuario ${id}...`);
      const data = await apiClient.get(`/users/${id}`);
      console.log('✅ Usuario obtenido:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo usuario (solo admin)
   */
  create: async (userData) => {
    try {
      console.log('🔵 Creando usuario:', userData);
      const data = await apiClient.post('/users/', userData);
      console.log('✅ Usuario creado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario (solo admin)
   */
  update: async (id, userData) => {
    try {
      console.log(`🔵 Actualizando usuario ${id}:`, userData);
      const data = await apiClient.put(`/users/${id}`, userData);
      console.log('✅ Usuario actualizado:', data);
      return data;
    } catch (error) {
      console.error(`❌ Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar usuario (solo admin)
   */
  delete: async (id) => {
    try {
      console.log(`🔵 Eliminando usuario ${id}...`);
      const data = await apiClient.delete(`/users/${id}`);
      console.log('✅ Usuario eliminado');
      return data;
    } catch (error) {
      console.error(`❌ Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  }
};

export default usersService;