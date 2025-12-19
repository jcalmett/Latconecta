import { useState } from 'react';
import { X, Eye, EyeOff, User, Upload } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import uploadService from '../../services/uploadService';

const SignUpModal = ({ isOpen, onClose, onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    user_password_confirm: '',
    user_phone_country_code: '+51',
    user_phone_number: '',
    user_photo: null,
  });

  const [phoneValue, setPhoneValue] = useState('');

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirm: false,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePhoneChange = (value, country) => {
    setPhoneValue(value);
    
    // Extraer código de país y número
    const countryCode = `+${country.dialCode}`;
    const phoneNumber = value.substring(country.dialCode.length);
    
    setFormData({
      ...formData,
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
      alert(validation.error);
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
      setFormData({ ...formData, user_photo: photoUrl });
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert('Error al subir la foto. Intenta de nuevo.');
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
    if (!formData.user_name.trim()) {
      alert('El nombre es requerido');
      setLoading(false);
      return;
    }

    if (!formData.user_email.trim()) {
      alert('El email es requerido');
      setLoading(false);
      return;
    }

    if (!formData.user_password) {
      alert('La contraseña es requerida');
      setLoading(false);
      return;
    }

    if (formData.user_password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.user_password !== formData.user_password_confirm) {
      alert('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Preparar datos para enviar (sin password_confirm)
    const { user_password_confirm, ...registerData } = formData;

    const result = await onRegister(registerData);
    setLoading(false);

    if (result.success) {
      // Limpiar formulario
      setFormData({
        user_name: '',
        user_email: '',
        user_password: '',
        user_password_confirm: '',
        user_phone_country_code: '+51',
        user_phone_number: '',
        user_photo: null,
      });
      setPhotoPreview(null);
      setPhoneValue('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-bitel-blue">Crear Cuenta</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLUMNA IZQUIERDA: Datos */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.user_name}
                  onChange={(e) =>
                    setFormData({ ...formData, user_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) =>
                    setFormData({ ...formData, user_email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                  placeholder="juan@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword.password ? 'text' : 'password'}
                    value={formData.user_password}
                    onChange={(e) =>
                      setFormData({ ...formData, user_password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent pr-12"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, password: !showPassword.password })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.password ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={formData.user_password_confirm}
                    onChange={(e) =>
                      setFormData({ ...formData, user_password_confirm: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
            </div>

            {/* COLUMNA DERECHA: Foto */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <h3 className="text-lg font-semibold text-bitel-blue">Foto de Perfil</h3>

              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-bitel-yellow">
                {photoPreview || formData.user_photo ? (
                  <img
                    src={photoPreview || formData.user_photo}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
              </div>

              <label className="cursor-pointer bg-bitel-blue text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors flex items-center space-x-2 font-semibold">
                <Upload size={20} />
                <span>{uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>

              <p className="text-xs text-gray-500 text-center">
                JPG, PNG, GIF o WEBP<br />Máximo 5MB
              </p>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-bold hover:bg-gray-500 transition-colors disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>

          {/* LINK A LOGIN */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-bitel-blue font-semibold hover:underline"
              >
                Inicia Sesión
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;