import { useState, useEffect } from 'react';
import { Eye, EyeOff, Upload, User } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import purchasesService from '../services/purchasesService';
import usersService from '../services/usersService';
import authService from '../services/authService';
import uploadService from '../services/uploadService';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';

const ProfileView = ({ user, showNotification, onUserUpdate }) => {
  // Estados para editar perfil
  const [profileData, setProfileData] = useState({
    user_name: user?.user_name || '',
    user_email: user?.user_email || '',
    user_phone_country_code: '+51',
    user_phone_number: '',
    user_photo: user?.user_photo || null,
  });

  // Estado para teléfono completo (PhoneInput)
  const [phoneValue, setPhoneValue] = useState('');

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    current: '',
    newPassword: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Estados para foto
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estado para historial de compras
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  // Estados para loading
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Cargar historial de compras al montar
  useEffect(() => {
    loadPurchases();
  }, []);

  // Sincronizar profileData cuando user cambia
  useEffect(() => {
    if (user) {
      const countryCode = user.user_phone_country_code || '+51';
      const phoneNumber = user.user_phone_number || '';
      const fullPhone = countryCode && phoneNumber ? `${countryCode}${phoneNumber}` : '';
      
      setPhoneValue(fullPhone);
      
      setProfileData({
        user_name: user.user_name || '',
        user_email: user.user_email || '',
        user_phone_country_code: countryCode,
        user_phone_number: phoneNumber,
        user_photo: user.user_photo || null,
      });
      setPhotoPreview(null);
    }
  }, [user]);

  const loadPurchases = async () => {
    try {
      setLoadingPurchases(true);
      const data = await purchasesService.getMyPurchases();
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar compras:', error);
      setPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handlePhoneChange = (value, country) => {
    setPhoneValue(value);
    
    // Extraer código de país y número
    const countryCode = `+${country.dialCode}`;
    const phoneNumber = value.substring(country.dialCode.length);
    
    setProfileData({
      ...profileData,
      user_phone_country_code: countryCode,
      user_phone_number: phoneNumber
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar imagen
    const validation = uploadService.validateImage(file);
    if (!validation.valid) {
      if (showNotification) {
        showNotification(validation.error, 'error');
      } else {
        alert(validation.error);
      }
      return;
    }

    try {
      setUploadingPhoto(true);

      // Crear preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Subir al servidor
      const photoUrl = await uploadService.uploadImage(file, 'users');
      setProfileData({ ...profileData, user_photo: photoUrl });

      if (showNotification) {
        showNotification('Foto subida correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      if (showNotification) {
        showNotification('Error al subir la foto', 'error');
      } else {
        alert('Error al subir la foto');
      }
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdatingProfile(true);

      // Validaciones
      if (!profileData.user_name.trim()) {
        showNotification('El nombre es requerido', 'error');
        return;
      }

      if (!profileData.user_email.trim()) {
        showNotification('El email es requerido', 'error');
        return;
      }

      // Preparar datos según schema del backend
      const updateData = {
        user_name: profileData.user_name.trim(),
        user_email: profileData.user_email.trim(),
        user_phone_country_code: profileData.user_phone_country_code,
        user_phone_number: profileData.user_phone_number.trim(),
        user_photo: profileData.user_photo,
        updated_by: user.user_email, // Email del usuario actual
      };

      // Actualizar en el backend (necesita user_id)
      const updatedUser = await usersService.updateProfile(user.user_id, updateData);

      // Actualizar contexto del usuario
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      showNotification('Perfil actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showNotification(
        error.response?.data?.detail || error.message || 'Error al actualizar perfil',
        'error'
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      // Validaciones
      if (!passwordData.current) {
        showNotification('Debe ingresar la contraseña actual', 'error');
        return;
      }

      if (!passwordData.newPassword) {
        showNotification('Debe ingresar una nueva contraseña', 'error');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirm) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      setUpdatingPassword(true);

      // Llamar al servicio de cambio de contraseña
      await authService.changePassword({
        current: passwordData.current,
        newPassword: passwordData.newPassword,
        confirm: passwordData.confirm
      });

      showNotification('Contraseña actualizada correctamente', 'success');
      
      // Limpiar campos
      setPasswordData({
        current: '',
        newPassword: '',
        confirm: ''
      });
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      showNotification(
        error.message || 'Error al actualizar contraseña',
        'error'
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-bitel-blue mb-8">Mi Cuenta</h1>

        {/* LAYOUT DE 2 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMNA IZQUIERDA: Información del Usuario */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-bitel-yellow h-fit">
            <h2 className="text-2xl font-bold text-bitel-blue mb-6">Información Personal</h2>

            {/* Foto de Perfil */}
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-bitel-yellow mb-4">
                {photoPreview || profileData.user_photo ? (
                  <img
                    src={photoPreview || getImageUrl(profileData.user_photo, 'user')}
                    alt="Foto de perfil"
                    onError={(e) => (e.target.src = FALLBACK_IMAGES.user)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              <label className="cursor-pointer bg-bitel-blue text-white px-6 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center space-x-2 font-semibold">
                <Upload size={18} />
                <span>{uploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>

              <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF o WEBP · Máx 5MB</p>
            </div>

            {/* Formulario de datos */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={profileData.user_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, user_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.user_email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, user_email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                  placeholder="juan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <button
                onClick={handleUpdateProfile}
                disabled={updatingProfile}
                className="w-full bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {updatingProfile ? 'Actualizando...' : 'Actualizar Perfil'}
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: Cambiar Contraseña + Historial */}
          <div className="space-y-6">
            
            {/* Cambiar Contraseña - HABILITADA */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-bitel-yellow">
              <h2 className="text-xl font-bold text-bitel-blue mb-4">Cambiar Contraseña</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwordData.current}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, current: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                      maxLength={25}
                      placeholder="Ingrese contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({ ...showPassword, current: !showPassword.current })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bitel-blue"
                    >
                      {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                      maxLength={25}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({ ...showPassword, new: !showPassword.new })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bitel-blue"
                    >
                      {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirm: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                      maxLength={25}
                      placeholder="Repetir contraseña"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bitel-blue"
                    >
                      {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={updatingPassword}
                  className="w-full bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </div>

            {/* Historial de Compras */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-bitel-yellow">
              <h2 className="text-xl font-bold text-bitel-blue mb-4">Historial de Compras</h2>

              {loadingPurchases ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bitel-blue mb-4"></div>
                  <p className="text-gray-600">Cargando compras...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tienes compras aún</p>
                  <button
                    onClick={() => (window.location.href = '/shop')}
                    className="mt-4 bg-bitel-yellow text-bitel-blue px-6 py-2 rounded-lg font-semibold hover:bg-bitel-yellow-dark transition-colors"
                  >
                    Ir a la Tienda
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.purchase_id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-bitel-blue">
                            {purchase.purchase_product_name || 'Producto'}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Ref: {purchase.purchase_reference}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(purchase.purchase_date).toLocaleString('es-PE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {purchase.purchase_recipient_phone && (
                            <p className="text-xs text-gray-600 mt-1">
                              Tel: {purchase.purchase_recipient_phone}
                            </p>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-bitel-blue">
                            PEN {parseFloat(purchase.purchase_total_amount || 0).toFixed(2)}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              purchase.purchase_payment_status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : purchase.purchase_payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {purchase.purchase_payment_status === 'completed'
                              ? 'Completado'
                              : purchase.purchase_payment_status === 'pending'
                              ? 'Pendiente'
                              : 'Fallido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;