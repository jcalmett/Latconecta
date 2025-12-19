import React, { useState, useEffect, memo } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getImageUrl, FALLBACK_IMAGES } from '../../utils/imageHelper';
import usersService from '../../services/usersService';

const UsersTab = ({
  users,
  setUsers,
  showForm,
  setShowForm,
  editingItem,
  setEditingItem,
  showNotification,
  setConfirmDialog,
  handleImageUpload,
  currentUser
}) => {
  // ✅ ESTADOS DE BÚSQUEDA POR ROLE Y STATUS
  const [searchRole, setSearchRole] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone_country_code: '+51',
    user_phone_number: '',
    user_role: 'user',
    user_status: 'active',
    user_photo: '',
    user_password: ''
  });

  const [phoneValue, setPhoneValue] = useState('');
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (editingItem && showForm) {
      const countryCode = editingItem.user_phone_country_code || '+51';
      const phoneNumber = editingItem.user_phone_number || '';
      const fullPhone = countryCode && phoneNumber ? `${countryCode}${phoneNumber}` : '';

      setPhoneValue(fullPhone);
      setFormData({
        user_name: editingItem.user_name || '',
        user_email: editingItem.user_email || '',
        user_phone_country_code: countryCode,
        user_phone_number: phoneNumber,
        user_role: editingItem.user_role || 'user',
        user_status: editingItem.user_status || 'active',
        user_photo: editingItem.user_photo || '',
        user_password: ''
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } else if (!editingItem && showForm) {
      setPhoneValue('');
      setFormData({
        user_name: '',
        user_email: '',
        user_phone_country_code: '+51',
        user_phone_number: '',
        user_role: 'user',
        user_status: 'active',
        user_photo: '',
        user_password: ''
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    }
  }, [editingItem, showForm]);

  const handlePhoneChange = (value, country) => {
    setPhoneValue(value);
    const countryCode = `+${country.dialCode}`;
    const phoneNumber = value.substring(country.dialCode.length);
    setFormData({
      ...formData,
      user_phone_country_code: countryCode,
      user_phone_number: phoneNumber
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.user_name) {
        showNotification('El nombre es obligatorio', 'error');
        return;
      }

      if (!formData.user_email) {
        showNotification('El email es obligatorio', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.user_email)) {
        showNotification('El email no es válido', 'error');
        return;
      }

      if (editingItem) {
        const updateData = {
          user_name: formData.user_name,
          user_email: formData.user_email,
          user_phone_country_code: formData.user_phone_country_code,
          user_phone_number: formData.user_phone_number,
          user_role: formData.user_role,
          user_status: formData.user_status,
          user_photo: formData.user_photo || null,
          updated_by: currentUser?.name || 'Admin',
          last_update_date: new Date().toISOString()
        };

        if (showPasswordSection) {
          if (!passwordData.newPassword) {
            showNotification('Debe ingresar una nueva contraseña', 'error');
            return;
          }

          if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
          }

          if (passwordData.newPassword.length < 6) {
            showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
          }

          updateData.user_password = passwordData.newPassword;
        }

        if (!updateData.user_photo) {
          delete updateData.user_photo;
        }

        await usersService.update(editingItem.user_id, updateData);

        setUsers(users.map(u =>
          u.user_id === editingItem.user_id
            ? { ...u, ...updateData, user_id: editingItem.user_id }
            : u
        ));

        showNotification(`Usuario "${formData.user_name}" actualizado`, 'success');
      } else {
        if (!formData.user_password) {
          showNotification('La contraseña es obligatoria para crear usuario', 'error');
          return;
        }

        if (formData.user_password.length < 6) {
          showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
          return;
        }

        const newUserData = {
          user_name: formData.user_name,
          user_email: formData.user_email,
          user_phone_country_code: formData.user_phone_country_code,
          user_phone_number: formData.user_phone_number,
          user_password: formData.user_password,
          user_role: formData.user_role,
          user_status: formData.user_status,
          user_photo: formData.user_photo || null,
          created_by: currentUser?.name || 'Admin'
        };

        if (!newUserData.user_photo) {
          delete newUserData.user_photo;
        }

        const createdUser = await usersService.create(newUserData);
        setUsers([...users, createdUser]);
        showNotification(`Usuario "${formData.user_name}" creado`, 'success');
      }

      resetForm();
    } catch (error) {
      console.error('Error al guardar usuario:', error);

      let errorMessage = 'Error al guardar el usuario';

      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map(err => err.msg || JSON.stringify(err))
            .join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      } else if (error.detail) {
        if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = (user) => {
    setConfirmDialog({
      show: true,
      title: 'Eliminar Usuario',
      message: `¿Está seguro de eliminar al usuario "${user.user_name}"?`,
      onConfirm: async () => {
        try {
          await usersService.delete(user.user_id);
          setUsers(users.filter(u => u.user_id !== user.user_id));
          showNotification(`Usuario "${user.user_name}" eliminado`, 'success');
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          showNotification('Error al eliminar el usuario', 'error');
        }
      }
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setPhoneValue('');
    setFormData({
      user_name: '',
      user_email: '',
      user_phone_country_code: '+51',
      user_phone_number: '',
      user_role: 'user',
      user_status: 'active',
      user_photo: '',
      user_password: ''
    });
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setShowPasswordSection(false);
  };

  const handlePhotoUpload = (e) => {
    handleImageUpload(e, (photoUrl) => {
      setFormData({ ...formData, user_photo: photoUrl });
    }, 'users');
  };

  return (
    <div>
      {/* ✅ HEADER CON FILTROS POR ROLE Y STATUS */}
      <div className="space-y-4 mb-6">
        {/* FILA 1: TÍTULO + BOTÓN */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#008C96]">Gestión de Usuarios</h2>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingItem(null);
              }}
              className="bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Crear Usuario</span>
            </button>
          )}
        </div>

        {/* ✅ FILA 2: FILTROS POR ROLE Y STATUS */}
        {!showForm && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#FFE709]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por Role */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Filtrar por Rol:
                </label>
                <select
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                >
                  <option value="">Todos los roles</option>
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="superadmin">Super Administrador</option>
                </select>
              </div>

              {/* Filtro por Status */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Filtrar por Estado:
                </label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Botón Limpiar Filtros */}
            {(searchRole || searchStatus) && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setSearchRole('');
                    setSearchStatus('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#FFE709]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#008C96]">
              {editingItem ? 'Editar Usuario' : 'Crear Usuario'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Foto de perfil */}
            <div className="flex items-center space-x-4">
              <img
                src={getImageUrl(formData.user_photo, 'user')}
                alt="Preview"
                onError={(e) => (e.target.src = FALLBACK_IMAGES.user)}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#FFE709]"
              />
              <label className="cursor-pointer bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74]">
                Cambiar Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                maxLength={50}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                maxLength={50}
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <PhoneInput
                country={'pe'}
                value={phoneValue}
                onChange={handlePhoneChange}
                inputClass="w-full"
                containerClass="phone-input-container"
                buttonClass="phone-input-button"
                inputStyle={{
                  width: '100%',
                  height: '42px',
                  fontSize: '14px',
                  paddingLeft: '48px',
                  borderRadius: '0.5rem',
                  border: '1px solid #D1D5DB'
                }}
                buttonStyle={{
                  borderRadius: '0.5rem 0 0 0.5rem',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#F9FAFB'
                }}
                dropdownStyle={{
                  maxHeight: '200px'
                }}
                enableSearch={true}
                searchPlaceholder="Buscar país..."
                searchNotFound="No se encontró el país"
              />
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.user_role}
                onChange={(e) => setFormData({ ...formData, user_role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">Super Administrador</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.user_status}
                onChange={(e) => setFormData({ ...formData, user_status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            {/* Contraseña - MODO CREACIÓN */}
            {!editingItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.user_password}
                  onChange={(e) => setFormData({ ...formData, user_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                  maxLength={25}
                  required
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            )}

            {/* Contraseña - MODO EDICIÓN (Opcional) */}
            {editingItem && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-[#008C96]">
                    Cambiar Contraseña (Opcional)
                  </h4>
                  <button
                    onClick={() => {
                      setShowPasswordSection(!showPasswordSection);
                      if (showPasswordSection) {
                        setPasswordData({ newPassword: '', confirmPassword: '' });
                      }
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      showPasswordSection
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-[#008C96] text-white hover:bg-[#006B74]'
                    }`}
                  >
                    {showPasswordSection ? 'Cancelar' : 'Cambiar Contraseña'}
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      Como administrador, puede restablecer la contraseña del usuario sin conocer la contraseña actual.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                          maxLength={25}
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({ ...showPassword, new: !showPassword.new })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008C96]"
                        >
                          {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                          maxLength={25}
                          placeholder="Repetir contraseña"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008C96]"
                        >
                          {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#008C96] text-white rounded-lg hover:bg-[#006B74]"
              >
                {editingItem ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#008C96] text-white">
              <tr>
                <th className="px-6 py-3 text-left">Foto</th>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Teléfono</th>
                <th className="px-6 py-3 text-left">Rol</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users
                .filter((user) => {
                  // ✅ FILTRAR POR ROLE
                  if (searchRole && user.user_role !== searchRole) {
                    return false;
                  }
                  // ✅ FILTRAR POR STATUS
                  if (searchStatus && user.user_status !== searchStatus) {
                    return false;
                  }
                  return true;
                })
                .map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={getImageUrl(user.user_photo, 'user')}
                        alt={user.user_name}
                        onError={(e) => (e.target.src = FALLBACK_IMAGES.user)}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4">{user.user_name}</td>
                    <td className="px-6 py-4">{user.user_email}</td>
                    <td className="px-6 py-4">
                      {user.user_phone_country_code && user.user_phone_number
                        ? `${user.user_phone_country_code} ${user.user_phone_number}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.user_role === 'superadmin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.user_role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.user_role === 'superadmin'
                          ? 'Super Admin'
                          : user.user_role === 'admin'
                          ? 'Admin'
                          : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.user_status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.user_status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(user);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default memo(UsersTab);