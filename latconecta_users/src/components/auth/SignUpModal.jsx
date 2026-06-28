import { useState, useRef } from 'react';
import { X, Eye, EyeOff, User, Upload, Mail, RefreshCw } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import uploadService from '../../services/uploadService';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8100/api/v1';

const SignUpModal = ({ isOpen, onClose, onRegister, onSwitchToLogin }) => {

  // step: 'form' | 'verify'
  const [step, setStep] = useState('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimer = useRef(null);

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
  const [showPassword, setShowPassword] = useState({ password: false, confirm: false });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const startResendCooldown = () => {
    setResendCooldown(60);
    resendTimer.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(resendTimer.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneChange = (value, country) => {
    setPhoneValue(value);
    const countryCode = `+${country.dialCode}`;
    const phoneNumber = value.substring(country.dialCode.length);
    setFormData({ ...formData, user_phone_country_code: countryCode, user_phone_number: phoneNumber });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = uploadService.validateImage(file);
    if (!validation.valid) { alert(validation.error); return; }
    try {
      setUploadingPhoto(true);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
      // Endpoint público — usuario aún no tiene token durante el registro
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const resp = await fetch(`${API_URL}/upload/users-public`, {
        method: 'POST',
        body: formDataUpload,
      });
      if (!resp.ok) throw new Error('Error al subir imagen');
      const result = await resp.json();
      setFormData({ ...formData, user_photo: result.url });
    } catch {
      alert('Error al subir la foto. Intenta de nuevo.');
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── PASO 1: Enviar formulario → solicitar OTP ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.user_name.trim()) { setError('El nombre es requerido'); setLoading(false); return; }
    if (!formData.user_email.trim()) { setError('El email es requerido'); setLoading(false); return; }
    if (!formData.user_password) { setError('La contraseña es requerida'); setLoading(false); return; }
    if (formData.user_password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); setLoading(false); return; }
    if (!formData.user_password[0].match(/[A-Z]/)) { setError('La contraseña debe comenzar con mayúscula'); setLoading(false); return; }
    if (formData.user_password !== formData.user_password_confirm) { setError('Las contraseñas no coinciden'); setLoading(false); return; }

    try {
      const { user_password_confirm, ...registerData } = formData;
      const resp = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setError(data.detail || 'Error al registrarse');
        setLoading(false);
        return;
      }

      // Éxito: pasar al step de verificación OTP
      setPendingEmail(formData.user_email);
      setStep('verify');
      startResendCooldown();
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 2: Verificar OTP → crear cuenta ─────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (otpCode.length !== 6) { setOtpError('Ingresa el código de 6 dígitos'); return; }
    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code: otpCode }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setOtpError(data.detail || 'Código incorrecto');
        setLoading(false);
        return;
      }

      // Cuenta creada — autenticar al usuario
      if (onRegister) {
        onRegister({ _tokenResponse: data });
      }

      // Limpiar y cerrar
      setStep('form');
      setOtpCode('');
      setPendingEmail('');
      setFormData({ user_name: '', user_email: '', user_password: '', user_password_confirm: '',
                    user_phone_country_code: '+51', user_phone_number: '', user_photo: null });
      setPhotoPreview(null);
      setPhoneValue('');
      onClose();
    } catch {
      setOtpError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reenviar OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpError('');
    try {
      await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
      });
      startResendCooldown();
    } catch {
      setOtpError('Error al reenviar el código.');
    }
  };

  // ── RENDER: step 'verify' ─────────────────────────────────────────────────
  if (step === 'verify') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-bitel-blue" />
            </div>
            <h2 className="text-2xl font-bold text-bitel-blue mb-2">Verifica tu email</h2>
            <p className="text-gray-600 text-sm">
              Hemos enviado un código de 6 dígitos a
            </p>
            <p className="text-bitel-blue font-semibold text-sm mt-1">{pendingEmail}</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Código de verificación
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-center
                           text-3xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-bitel-blue
                           focus:border-transparent"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-2 text-center">{otpError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold
                         hover:bg-green-700 transition-colors
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Verificar y Crear Cuenta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">¿No recibiste el código?</p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-bitel-blue hover:underline disabled:text-gray-400
                         disabled:no-underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw size={14} />
              {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setStep('form'); setOtpCode(''); setOtpError(''); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Volver al registro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: step 'form' ───────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-bitel-blue">Crear Cuenta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                <input type="text" value={formData.user_name}
                  onChange={e => setFormData({ ...formData, user_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue"
                  placeholder="Juan Pérez" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" value={formData.user_email}
                  onChange={e => setFormData({ ...formData, user_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue"
                  placeholder="juan@example.com" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
                <div className="relative">
                  <input type={showPassword.password ? 'text' : 'password'} value={formData.user_password}
                    onChange={e => setFormData({ ...formData, user_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue pr-12"
                    placeholder="••••••••" required />
                  <button type="button"
                    onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {showPassword.password ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, debe comenzar con mayúscula</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña *</label>
                <div className="relative">
                  <input type={showPassword.confirm ? 'text' : 'password'} value={formData.user_password_confirm}
                    onChange={e => setFormData({ ...formData, user_password_confirm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue pr-12"
                    placeholder="••••••••" required />
                  <button type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <PhoneInput country={'pe'} value={phoneValue} onChange={handlePhoneChange}
                  inputStyle={{ width: '100%', height: '42px', fontSize: '14px',
                               paddingLeft: '48px', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                  buttonStyle={{ borderRadius: '0.5rem 0 0 0.5rem', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB' }}
                  enableSearch searchPlaceholder="Buscar país..." />
              </div>
            </div>

            {/* COLUMNA DERECHA: Foto */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <h3 className="text-lg font-semibold text-bitel-blue">Foto de Perfil</h3>
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-bitel-yellow">
                {photoPreview || formData.user_photo ? (
                  <img src={photoPreview || formData.user_photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-bitel-blue text-white px-6 py-3 rounded-lg hover:opacity-90 flex items-center space-x-2 font-semibold">
                <Upload size={20} />
                <span>{uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={uploadingPhoto} />
              </label>
              <p className="text-xs text-gray-500 text-center">JPG, PNG, GIF o WEBP<br />Máximo 5MB</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button type="submit" disabled={loading || uploadingPhoto}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {loading ? 'Enviando código...' : 'Registrarse'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-bold hover:bg-gray-500 disabled:cursor-not-allowed">
              Cancelar
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={onSwitchToLogin} className="text-bitel-blue font-semibold hover:underline">
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
