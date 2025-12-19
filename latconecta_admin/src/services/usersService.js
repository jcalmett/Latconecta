import apiClient from '../config/api';

const usersService = {
  /**
   * Obtener todos los usuarios
   */
  getAll: async () => {
    try {
      console.log('🔵 Obteniendo todos los usuarios...');
      const response = await apiClient.get('/users/');
      console.log('✅ Usuarios obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  },

  /**
   * Obtener un usuario por ID
   */
  getById: async (id) => {
    try {
      console.log(`🔵 Obteniendo usuario ID: ${id}...`);
      const response = await apiClient.get(`/users/${id}`);
      console.log('✅ Usuario obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo usuario
   */
  create: async (userData) => {
    try {
      console.log('🔵 Creando nuevo usuario:', userData);
      const response = await apiClient.post('/users/', userData);
      console.log('✅ Usuario creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario existente
   */
  update: async (id, userData) => {
    try {
      console.log(`🔵 Actualizando usuario ID: ${id}`, userData);
      const response = await apiClient.put(`/users/${id}`, userData);
      console.log('✅ Usuario actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar usuario
   */
  delete: async (id) => {
    try {
      console.log(`🔵 Eliminando usuario ID: ${id}...`);
      const response = await apiClient.delete(`/users/${id}`);
      console.log('✅ Usuario eliminado');
      return response.data;
    } catch (error) {
      console.error(`❌ Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  }
};

export default usersService;
