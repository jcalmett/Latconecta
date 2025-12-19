import apiClient from './apiClient';

class AuthService {
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: email,
        password: password
      });
      
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        const user = {
          user_id: response.user_id,
          user_name: response.user_name,
          user_email: response.user_email,
          user_role: response.user_role,
          user_photo: response.user_photo,
          user_phone_country_code: response.user_phone_country_code,
          user_phone_number: response.user_phone_number
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        user_name: userData.user_name,
        user_email: userData.user_email,
        user_password: userData.user_password,
        user_phone_country_code: userData.user_phone_country_code || '+51',
        user_phone_number: userData.user_phone_number || null,
        user_photo: userData.user_photo || null
      });
      
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        const user = {
          user_id: response.user_id,
          user_name: response.user_name,
          user_email: response.user_email,
          user_role: response.user_role,
          user_photo: response.user_photo,
          user_phone_country_code: response.user_phone_country_code,
          user_phone_number: response.user_phone_number
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al registrarse');
    }
  }

  async getCurrentUser() {
    try {
      return await apiClient.get('/auth/me');
    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuario');
    }
  }

  async updateProfile(userId, data) {
    try {
      return await apiClient.put(`/users/${userId}`, data);
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  }

  async changePassword(passwords) {
    try {
      return await apiClient.post('/auth/change-password', {
        current_password: passwords.current,
        new_password: passwords.newPassword,
        confirm_password: passwords.confirm
      });
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();