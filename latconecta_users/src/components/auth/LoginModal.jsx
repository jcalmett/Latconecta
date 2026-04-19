import { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';

const LoginModal = ({ isOpen, onClose, onLogin, onSwitchToSignUp }) => {
  // ── Login state ────────────────────────────────────────────────────────────
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Forgot / Reset state ───────────────────────────────────────────────────
  const [forgotEmail, setForgotEmail]         = useState('');
  const [resetCode, setResetCode]             = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // ── Shared state ───────────────────────────────────────────────────────────
  // step: 'login' | 'forgot' | 'verify' | 'success'
  const [step, setStep]     = useState('login');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearAll = () => {
    setEmail(''); setPassword(''); setShowPassword(false);
    setForgotEmail(''); setResetCode('');
    setNewPassword(''); setConfirmPassword(''); setShowNewPassword(false);
    setError(''); setLoading(false); setStep('login');
  };

  const handleClose = () => { clearAll(); onClose(); };

  // ── Handlers: Login ────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Por favor complete todos los campos'); return; }
    if (!email.includes('@')) { setError('Por favor ingrese un email válido'); return; }
    setLoading(true);
    try {
      const result = await onLogin(email, password);
      if (result.success) { clearAll(); onClose(); }
      else setError(result.error || 'Error al iniciar sesión');
    } catch { setError('Error al iniciar sesión. Intente nuevamente.'); }
    finally { setLoading(false); }
  };

  const handleSwitchToSignUp = () => { clearAll(); onSwitchToSignUp(); };

  // ── Handlers: Forgot password ──────────────────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Por favor ingrese un email válido'); return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      // Siempre avanzar a verify (el backend no revela si el email existe)
      setStep('verify');
    } catch { setError('No se pudo enviar el código. Intente nuevamente.'); }
    finally { setLoading(false); }
  };

  // ── Handlers: Reset password ───────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!resetCode || resetCode.length !== 6) {
      setError('El código debe tener 6 dígitos'); return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden'); return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(forgotEmail, resetCode, newPassword);
      setStep('success');
    } catch (err) {
      setError(err.message || 'El código no es válido o ha expirado.');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">

        {/* ── PASO: LOGIN ─────────────────────────────────────────────────── */}
        {step === 'login' && (
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-bitel-blue">Iniciar Sesión</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bitel-blue"
                    placeholder="tu@email.com" disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bitel-blue"
                    placeholder="••••••••" disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" disabled={loading}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-bitel-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              {/* Forgot Password */}
              <div className="mt-4 text-center">
                <button type="button"
                  onClick={() => { setError(''); setForgotEmail(email); setStep('forgot'); }}
                  className="text-sm text-bitel-blue hover:underline" disabled={loading}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Switch to Sign Up */}
              <div className="mt-6 text-center border-t pt-4">
                <p className="text-gray-600 text-sm">
                  ¿No tienes una cuenta?{' '}
                  <button type="button" onClick={handleSwitchToSignUp}
                    className="text-bitel-blue font-semibold hover:underline" disabled={loading}>
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </form>
          </>
        )}

        {/* ── PASO: FORGOT — ingresa tu email ─────────────────────────────── */}
        {step === 'forgot' && (
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <button onClick={() => { setError(''); setStep('login'); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-bitel-blue">Recuperar contraseña</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="p-6">
              <p className="text-gray-600 text-sm mb-5">
                Ingresa el email de tu cuenta y te enviaremos un código de 6 dígitos
                para restablecer tu contraseña.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email" value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bitel-blue"
                    placeholder="tu@email.com" disabled={loading} autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-bitel-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Enviando código...' : 'Enviar código'}
              </button>
            </form>
          </>
        )}

        {/* ── PASO: VERIFY — ingresa código + nueva contraseña ────────────── */}
        {step === 'verify' && (
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <button onClick={() => { setError(''); setResetCode(''); setStep('forgot'); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-bitel-blue">Ingresa el código</h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-6">
              <p className="text-gray-600 text-sm mb-1">
                Enviamos un código de 6 dígitos a:
              </p>
              <p className="text-bitel-blue font-semibold text-sm mb-5">{forgotEmail}</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Código */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Código de verificación
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text" value={resetCode} maxLength={6}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bitel-blue text-center text-2xl font-bold tracking-widest"
                    placeholder="000000" disabled={loading} autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Válido por 15 minutos.</p>
              </div>

              {/* Nueva contraseña */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bitel-blue"
                    placeholder="Mínimo 6 caracteres" disabled={loading}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" disabled={loading}>
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bitel-blue"
                    placeholder="Repite la contraseña" disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-bitel-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Verificando...' : 'Cambiar contraseña'}
              </button>

              {/* Reenviar código */}
              <div className="mt-4 text-center">
                <button type="button" disabled={loading}
                  onClick={() => { setError(''); setResetCode(''); setStep('forgot'); }}
                  className="text-sm text-gray-500 hover:text-bitel-blue hover:underline">
                  ¿No recibiste el código? Volver a enviar
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── PASO: SUCCESS ────────────────────────────────────────────────── */}
        {step === 'success' && (
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-bitel-blue">¡Contraseña actualizada!</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-6">
                Tu contraseña fue restablecida exitosamente.
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => { setError(''); setStep('login'); }}
                className="w-full bg-bitel-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Ir a Iniciar Sesión
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default LoginModal;
