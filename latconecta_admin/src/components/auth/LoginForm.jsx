import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { X, Mail, Lock, Eye, EyeOff, Loader2, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';

// ─── Validación de contraseña ────────────────────────────────────────────────
// Mínimo 8 caracteres y primera letra mayúscula
const validatePassword = (pwd) => {
  if (!pwd || pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (pwd[0] !== pwd[0].toUpperCase() || !/[A-Z]/.test(pwd[0]))
    return 'La contraseña debe comenzar con una letra mayúscula.';
  return null; // null = válida
};

const LoginForm = ({ onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Login state ─────────────────────────────────────────────────────────────
  const [formData, setFormData]     = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // ── Forgot / Reset state ────────────────────────────────────────────────────
  const [forgotEmail, setForgotEmail]         = useState('');
  const [resetCode, setResetCode]             = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // ── Shared state ────────────────────────────────────────────────────────────
  // step: 'login' | 'forgot' | 'verify' | 'success'
  const [step, setStep]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const clearAll = () => {
    setFormData({ email: '', password: '' }); setShowPassword(false);
    setForgotEmail(''); setResetCode('');
    setNewPassword(''); setConfirmPassword(''); setShowNewPassword(false);
    setError(''); setLoading(false); setStep('login');
  };

  const handleClose = () => { clearAll(); if (onClose) onClose(); };

  // ── Handler: Login ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        if (result.user?.role === 'admin' || result.user?.role === 'superadmin') {
          if (onClose) onClose();
          navigate('/admin');
        } else {
          setError('No tienes permisos de administrador');
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // ── Handler: Forgot password ─────────────────────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Por favor ingrese un email válido'); return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      setStep('verify');
    } catch {
      setError('No se pudo enviar el código. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handler: Reset password ──────────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!resetCode || resetCode.length !== 6) {
      setError('El código debe tener 6 dígitos'); return;
    }
    const pwdError = validatePassword(newPassword);
    if (pwdError) { setError(pwdError); return; }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden'); return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(forgotEmail, resetCode, newPassword);
      setStep('success');
    } catch (err) {
      setError(err.message || 'El código no es válido o ha expirado.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 relative">

      {/* ── PASO: LOGIN ──────────────────────────────────────────────────────── */}
      {step === 'login' && (
        <>
          {onClose && (
            <button onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Cerrar">
              <X size={24} />
            </button>
          )}

          <div className="bg-[#FFE709] p-6 rounded-t-lg">
            <h2 className="text-2xl font-bold text-[#008C96] text-center">
              Panel de Administración
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} required
                  placeholder="admin@latconecta.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C96] focus:border-[#008C96] transition-all"
                  disabled={loading} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C96] focus:border-[#008C96] transition-all"
                  disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={loading}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-[#008C96] text-white py-3 rounded-lg font-semibold hover:bg-[#007580] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /><span>Iniciando sesión...</span></>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>

            {/* Forgot password link */}
            <div className="text-center">
              <button type="button"
                onClick={() => { setError(''); setForgotEmail(formData.email); setStep('forgot'); }}
                className="text-sm text-[#008C96] hover:underline" disabled={loading}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </>
      )}

      {/* ── PASO: FORGOT — ingresa tu email ──────────────────────────────────── */}
      {step === 'forgot' && (
        <>
          <div className="bg-[#FFE709] p-6 rounded-t-lg flex items-center gap-3">
            <button onClick={() => { setError(''); setStep('login'); }}
              className="text-[#008C96] hover:text-[#007580] transition-colors">
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-xl font-bold text-[#008C96]">
              Recuperar contraseña
            </h2>
          </div>

          <form onSubmit={handleForgotSubmit} className="p-6 space-y-5">
            <p className="text-gray-600 text-sm">
              Ingresa el email de tu cuenta y te enviaremos un código de 6 dígitos
              para restablecer tu contraseña.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input type="email" value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@latconecta.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C96] focus:border-[#008C96] transition-all"
                  disabled={loading} autoFocus />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#008C96] text-white py-3 rounded-lg font-semibold hover:bg-[#007580] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /><span>Enviando código...</span></>
              ) : (
                <span>Enviar código</span>
              )}
            </button>
          </form>
        </>
      )}

      {/* ── PASO: VERIFY — ingresa código + nueva contraseña ─────────────────── */}
      {step === 'verify' && (
        <>
          <div className="bg-[#FFE709] p-6 rounded-t-lg flex items-center gap-3">
            <button onClick={() => { setError(''); setResetCode(''); setStep('forgot'); }}
              className="text-[#008C96] hover:text-[#007580] transition-colors">
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-xl font-bold text-[#008C96]">
              Ingresa el código
            </h2>
          </div>

          <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Enviamos un código de 6 dígitos a:</p>
              <p className="text-[#008C96] font-semibold text-sm">{forgotEmail}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Código */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código de verificación
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="text-gray-400" size={20} />
                </div>
                <input type="text" value={resetCode} maxLength={6}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C96] focus:border-[#008C96] transition-all text-center text-2xl font-bold tracking-widest"
                  placeholder="000000" disabled={loading} autoFocus />
              </div>
              <p className="text-xs text-gray-400 mt-1">Válido por 15 minutos.</p>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C96] focus:border-[#008C96] transition-all"
                  placeholder="Mínimo 8 caracteres, inicial mayúscula" disabled={loading} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={loading}>
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Mínimo 8 caracteres · Debe comenzar con mayúscula
              </p>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input type={showNewPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008C96] focus:border-[#008C96] transition-all"
                  placeholder="Repite la contraseña" disabled={loading} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#008C96] text-white py-3 rounded-lg font-semibold hover:bg-[#007580] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /><span>Verificando...</span></>
              ) : (
                <span>Cambiar contraseña</span>
              )}
            </button>

            <div className="text-center">
              <button type="button" disabled={loading}
                onClick={() => { setError(''); setResetCode(''); setStep('forgot'); }}
                className="text-sm text-gray-500 hover:text-[#008C96] hover:underline">
                ¿No recibiste el código? Volver a enviar
              </button>
            </div>
          </form>
        </>
      )}

      {/* ── PASO: SUCCESS ─────────────────────────────────────────────────────── */}
      {step === 'success' && (
        <>
          <div className="bg-[#FFE709] p-6 rounded-t-lg">
            <h2 className="text-xl font-bold text-[#008C96] text-center">
              ¡Contraseña actualizada!
            </h2>
          </div>

          <div className="p-6 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-gray-700">
              Tu contraseña fue restablecida exitosamente.
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button onClick={() => { setError(''); setStep('login'); }}
              className="w-full bg-[#008C96] text-white py-3 rounded-lg font-semibold hover:bg-[#007580] transition-all">
              Ir a Iniciar Sesión
            </button>
          </div>
        </>
      )}

    </div>
  );
};

export default LoginForm;
