import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import vendorsService from '../../services/vendorsService';

const VendorForm = ({ vendor, onClose, onSuccess = () => {} }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);

  const [formData, setFormData] = useState({
    // Identificación
    vendor_code: '',
    vendor_name: '',
    vendor_description: '',
    
    // URLs
    vendor_url_uat: '',
    vendor_url_prod: '',
    
    // Credenciales
    vendor_username: '',
    vendor_password: '',
    vendor_api_key: '',
    vendor_user_uid: '',
    vendor_access_token: '',
    vendor_token_expiry: '',
    
    // Balance
    vendor_balance_currency: 'USD',
    vendor_balance_amount: '',
    vendor_balance_last_update: '',
    
    // Configuración
    vendor_status: 'active',
    vendor_timeout: '30',
    is_production: false,
    
    // Sincronización
    auto_sync_products: false,
    sync_interval_hours: '24',
    last_sync_date: ''
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_code: vendor.vendor_code || '',
        vendor_name: vendor.vendor_name || '',
        vendor_description: vendor.vendor_description || '',
        vendor_url_uat: vendor.vendor_url_uat || '',
        vendor_url_prod: vendor.vendor_url_prod || '',
        vendor_username: vendor.vendor_username || '',
        vendor_password: vendor.vendor_password || '',
        vendor_api_key: vendor.vendor_api_key || '',
        vendor_user_uid: vendor.vendor_user_uid || '',
        vendor_access_token: vendor.vendor_access_token || '',
        vendor_token_expiry: vendor.vendor_token_expiry || '',
        vendor_balance_currency: vendor.vendor_balance_currency || 'USD',
        vendor_balance_amount: vendor.vendor_balance_amount || '',
        vendor_balance_last_update: vendor.vendor_balance_last_update || '',
        vendor_status: vendor.vendor_status || 'active',
        vendor_timeout: vendor.vendor_timeout || '30',
        is_production: vendor.is_production || false,
        auto_sync_products: vendor.auto_sync_products || false,
        sync_interval_hours: vendor.sync_interval_hours || '24',
        last_sync_date: vendor.last_sync_date || ''
      });
    }
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.vendor_code?.trim()) newErrors.vendor_code = 'Código es requerido';
    if (!formData.vendor_name?.trim()) newErrors.vendor_name = 'Nombre es requerido';

    // Validar timeout
    if (formData.vendor_timeout && parseInt(formData.vendor_timeout) < 1) {
      newErrors.vendor_timeout = 'Timeout debe ser mayor a 0';
    }

    // Validar sync interval
    if (formData.sync_interval_hours && parseInt(formData.sync_interval_hours) < 1) {
      newErrors.sync_interval_hours = 'Intervalo debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        vendor_code: formData.vendor_code.trim(),
        vendor_name: formData.vendor_name.trim(),
        vendor_description: formData.vendor_description?.trim() || null,
        vendor_url_uat: formData.vendor_url_uat?.trim() || null,
        vendor_url_prod: formData.vendor_url_prod?.trim() || null,
        vendor_username: formData.vendor_username?.trim() || null,
        vendor_password: formData.vendor_password?.trim() || null,
        vendor_api_key: formData.vendor_api_key?.trim() || null,
        vendor_user_uid: formData.vendor_user_uid?.trim() || null,
        vendor_access_token: formData.vendor_access_token?.trim() || null,
        vendor_token_expiry: formData.vendor_token_expiry || null,
        vendor_balance_currency: formData.vendor_balance_currency || 'USD',
        vendor_balance_amount: formData.vendor_balance_amount ? parseFloat(formData.vendor_balance_amount) : null,
        vendor_balance_last_update: formData.vendor_balance_last_update || null,
        vendor_status: formData.vendor_status,
        vendor_timeout: formData.vendor_timeout ? parseInt(formData.vendor_timeout) : 30,
        is_production: formData.is_production,
        auto_sync_products: formData.auto_sync_products,
        sync_interval_hours: formData.sync_interval_hours ? parseInt(formData.sync_interval_hours) : 24,
        last_sync_date: formData.last_sync_date || null
      };

      if (vendor) {
        // Actualizar vendor existente
        await vendorsService.update(vendor.vendor_code, submitData);
        alert('✅ Vendor actualizado correctamente');
      } else {
        // Crear nuevo vendor
        await vendorsService.create(submitData);
        alert('✅ Vendor creado correctamente');
      }

      // Llamar onSuccess para cerrar modal y recargar lista
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving vendor:', error);

      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          alert(`⛔ Error: ${error.response.data.detail}`);
        } else if (Array.isArray(error.response.data.detail)) {
          const errorMessages = error.response.data.detail.map(err =>
            `${err.loc ? err.loc.join('.') : 'Campo'}: ${err.msg}`
          ).join('\n');
          alert(`⛔ Errores de validación:\n${errorMessages}`);
        }
      } else {
        alert(`⛔ Error al guardar vendor: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {vendor ? '✏️ Editar Vendor' : '➕ Nuevo Vendor'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Alerta de edición */}
        {vendor && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <Lock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <strong>⚠️ Modo Edición:</strong> No se puede modificar <strong>Código del Vendor</strong>.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Sección 1: Identificación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              🏢 Identificación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código <span className="text-red-500">*</span>
                  {vendor && <Lock size={14} className="inline ml-1 text-gray-400" />}
                </label>
                <input
                  type="text"
                  name="vendor_code"
                  value={formData.vendor_code}
                  onChange={handleChange}
                  disabled={!!vendor}
                  maxLength={50}
                  placeholder="LATCOM"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vendor_code ? 'border-red-500' : 'border-gray-300'
                  } ${vendor ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.vendor_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_code}</p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Latcom Internacional"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vendor_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vendor_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_name}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  name="vendor_description"
                  value={formData.vendor_description}
                  onChange={handleChange}
                  placeholder="Proveedor de servicios..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: URLs y Entornos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              🌐 URLs y Entornos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* URL UAT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL UAT (Pruebas)
                </label>
                <input
                  type="url"
                  name="vendor_url_uat"
                  value={formData.vendor_url_uat}
                  onChange={handleChange}
                  placeholder="https://uat-api.vendor.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* URL Producción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Producción
                </label>
                <input
                  type="url"
                  name="vendor_url_prod"
                  value={formData.vendor_url_prod}
                  onChange={handleChange}
                  placeholder="https://api.vendor.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Espacio vacío */}
              <div></div>
            </div>
          </div>

          {/* Sección 3: Credenciales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              🔐 Credenciales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  name="vendor_username"
                  value={formData.vendor_username}
                  onChange={handleChange}
                  placeholder="api_user"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="vendor_password"
                    value={formData.vendor_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    name="vendor_api_key"
                    value={formData.vendor_api_key}
                    onChange={handleChange}
                    placeholder="sk_live_••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* User UID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User UID
                </label>
                <input
                  type="text"
                  name="vendor_user_uid"
                  value={formData.vendor_user_uid}
                  onChange={handleChange}
                  placeholder="uid_123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Token Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiración Token
                </label>
                <input
                  type="datetime-local"
                  name="vendor_token_expiry"
                  value={formData.vendor_token_expiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Espacio vacío */}
              <div></div>

              {/* Access Token - Full Width */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token
                </label>
                <div className="relative">
                  <input
                    type={showAccessToken ? 'text' : 'password'}
                    name="vendor_access_token"
                    value={formData.vendor_access_token}
                    onChange={handleChange}
                    placeholder="Bearer ••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showAccessToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 4: Balance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              💰 Balance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Moneda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  name="vendor_balance_currency"
                  value={formData.vendor_balance_currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="PEN">PEN</option>
                  <option value="EUR">EUR</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  name="vendor_balance_amount"
                  value={formData.vendor_balance_amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Última actualización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Última Actualización
                </label>
                <input
                  type="datetime-local"
                  name="vendor_balance_last_update"
                  value={formData.vendor_balance_last_update}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sección 5: Configuración */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              ⚙️ Configuración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="vendor_status"
                  value={formData.vendor_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout (seg)
                </label>
                <input
                  type="number"
                  name="vendor_timeout"
                  value={formData.vendor_timeout}
                  onChange={handleChange}
                  min="1"
                  placeholder="30"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vendor_timeout ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vendor_timeout && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_timeout}</p>
                )}
              </div>

              {/* Producción */}
              <div className="flex items-center pt-7">
                <input
                  type="checkbox"
                  name="is_production"
                  checked={formData.is_production}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Usar Producción
                </label>
              </div>
            </div>
          </div>

          {/* Sección 6: Sincronización */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              🔄 Sincronización de Productos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Auto Sync */}
              <div className="flex items-center pt-7">
                <input
                  type="checkbox"
                  name="auto_sync_products"
                  checked={formData.auto_sync_products}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Auto Sincronizar
                </label>
              </div>

              {/* Intervalo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo (horas)
                </label>
                <input
                  type="number"
                  name="sync_interval_hours"
                  value={formData.sync_interval_hours}
                  onChange={handleChange}
                  min="1"
                  placeholder="24"
                  disabled={!formData.auto_sync_products}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sync_interval_hours ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.auto_sync_products ? 'bg-gray-100' : ''}`}
                />
                {errors.sync_interval_hours && (
                  <p className="text-red-500 text-xs mt-1">{errors.sync_interval_hours}</p>
                )}
              </div>

              {/* Última Sincronización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Última Sincronización
                </label>
                <input
                  type="datetime-local"
                  name="last_sync_date"
                  value={formData.last_sync_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {vendor ? 'Actualizar' : 'Crear'} Vendor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorForm;