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
    vendor_display_name: '',
    vendor_description: '',

    // Balance USD
    vendor_usd_balance: '',
    vendor_usd_date_balance: '',

    // Balance Local
    vendor_local_currency: 'PEN',
    vendor_local_balance: '',
    vendor_local_date_balance: '',

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

    // Configuración
    vendor_status: 'active',
    vendor_timeout: '30',
    is_production: false,

    // Sincronización
    auto_sync_products: false,
    sync_time: '06:00',
    last_sync_date: ''
  });

  // Obtener fecha actual local
  const getLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Cargar datos si es edición
  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_code: vendor.vendor_code || '',
        vendor_name: vendor.vendor_name || '',
        vendor_display_name: vendor.vendor_display_name || '',
        vendor_description: vendor.vendor_description || '',
        vendor_usd_balance: vendor.vendor_usd_balance || '',
        vendor_usd_date_balance: vendor.vendor_usd_date_balance || '',
        vendor_local_currency: vendor.vendor_local_currency || 'PEN',
        vendor_local_balance: vendor.vendor_local_balance || '',
        vendor_local_date_balance: vendor.vendor_local_date_balance || '',
        vendor_url_uat: vendor.vendor_url_uat || '',
        vendor_url_prod: vendor.vendor_url_prod || '',
        vendor_username: vendor.vendor_username || '',
        vendor_password: vendor.vendor_password || '',
        vendor_api_key: vendor.vendor_api_key || '',
        vendor_user_uid: vendor.vendor_user_uid || '',
        vendor_access_token: vendor.vendor_access_token || '',
        vendor_token_expiry: vendor.vendor_token_expiry || '',
        vendor_status: vendor.vendor_status || 'active',
        vendor_timeout: vendor.vendor_timeout || '30',
        is_production: vendor.is_production || false,
        auto_sync_products: vendor.auto_sync_products || false,
        sync_time: vendor.sync_time || '06:00',
        last_sync_date: vendor.last_sync_date || ''
      });
    }
  }, [vendor]);

  const normalizeDecimal = (value) => {
    if (!value) return value;
    return value.toString().replace(',', '.');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    // Normalizar decimales para balances
    if (name === 'vendor_usd_balance' || name === 'vendor_local_balance') {
      processedValue = normalizeDecimal(value);

      // Auto-completar fecha de actualización correspondiente
      if (processedValue) {
        const dateField = name === 'vendor_usd_balance' ? 'vendor_usd_date_balance' : 'vendor_local_date_balance';
        if (!formData[dateField]) {
          setFormData(prev => ({
            ...prev,
            [name]: processedValue,
            [dateField]: getLocalDateTime()
          }));
          return;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.vendor_code?.trim()) newErrors.vendor_code = 'Código es requerido';
    if (!formData.vendor_name?.trim()) newErrors.vendor_name = 'Nombre es requerido';

    // Validar balance USD
    if (formData.vendor_usd_balance) {
      const balanceStr = formData.vendor_usd_balance.toString();
      if (balanceStr.includes(',')) {
        newErrors.vendor_usd_balance = 'Use punto (.) como separador decimal';
      }
      const balanceNum = parseFloat(balanceStr);
      if (isNaN(balanceNum) || balanceNum < 0) {
        newErrors.vendor_usd_balance = 'Balance debe ser un número válido >= 0';
      }
    }

    // Validar balance Local
    if (formData.vendor_local_balance) {
      const balanceStr = formData.vendor_local_balance.toString();
      if (balanceStr.includes(',')) {
        newErrors.vendor_local_balance = 'Use punto (.) como separador decimal';
      }
      const balanceNum = parseFloat(balanceStr);
      if (isNaN(balanceNum) || balanceNum < 0) {
        newErrors.vendor_local_balance = 'Balance debe ser un número válido >= 0';
      }
    }

    // Validar timeout
    if (formData.vendor_timeout && parseInt(formData.vendor_timeout) < 1) {
      newErrors.vendor_timeout = 'Timeout debe ser mayor a 0';
    }

    // Validar sync interval


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
        vendor_display_name: formData.vendor_display_name?.trim() || null,
        vendor_description: formData.vendor_description?.trim() || null,
        
        // Balance USD
        vendor_usd_balance: formData.vendor_usd_balance ? parseFloat(normalizeDecimal(formData.vendor_usd_balance)) : null,
        
        // Balance Local
        vendor_local_currency: formData.vendor_local_currency || null,
        vendor_local_balance: formData.vendor_local_balance ? parseFloat(normalizeDecimal(formData.vendor_local_balance)) : null,
        
        vendor_url_uat: formData.vendor_url_uat?.trim() || null,
        vendor_url_prod: formData.vendor_url_prod?.trim() || null,
        vendor_username: formData.vendor_username?.trim() || null,
        vendor_password: formData.vendor_password?.trim() || null,
        vendor_api_key: formData.vendor_api_key?.trim() || null,
        vendor_user_uid: formData.vendor_user_uid?.trim() || null,
        vendor_access_token: formData.vendor_access_token?.trim() || null,
        vendor_token_expiry: formData.vendor_token_expiry || null,
        vendor_status: formData.vendor_status,
        vendor_timeout: formData.vendor_timeout ? parseInt(formData.vendor_timeout) : 30,
        is_production: formData.is_production,
        auto_sync_products: formData.auto_sync_products,
        sync_time: formData.sync_time || '06:00',
        last_sync_date: formData.last_sync_date || null
      };

      if (vendor) {
        await vendorsService.update(vendor.vendor_code, submitData);
        alert('✅ Vendor actualizado correctamente');
      } else {
        await vendorsService.create(submitData);
        alert('✅ Vendor creado correctamente');
      }

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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 rounded-t-lg flex items-center justify-between">
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
          <div className="mx-6 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <Lock size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <strong>⚠️ Modo Edición:</strong> No se puede modificar el Código del Vendor.
            </div>
          </div>
        )}

        {/* Form - ESPACIADO REDUCIDO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-200">
              🏢 Identificación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Código <span className="text-red-500">*</span>
                  {vendor && <Lock size={12} className="inline ml-1 text-gray-400" />}
                </label>
                <input
                  type="text"
                  name="vendor_code"
                  value={formData.vendor_code}
                  onChange={handleChange}
                  disabled={!!vendor}
                  maxLength={50}
                  placeholder="LATCOM"
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.vendor_code ? 'border-red-500' : 'border-gray-300'
                  } ${vendor ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.vendor_code && <p className="text-red-500 text-xs mt-0.5">{errors.vendor_code}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Latcom Internacional"
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.vendor_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vendor_name && <p className="text-red-500 text-xs mt-0.5">{errors.vendor_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre Display
                </label>
                <input
                  type="text"
                  name="vendor_display_name"
                  value={formData.vendor_display_name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Latcom"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  name="vendor_description"
                  value={formData.vendor_description}
                  onChange={handleChange}
                  placeholder="Proveedor de servicios..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: BALANCES */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-200">
              💰 Balances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Balance USD */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-xs font-bold text-blue-900 mb-2">Balance USD</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Monto USD
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="vendor_usd_balance"
                      value={formData.vendor_usd_balance}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.vendor_usd_balance ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.vendor_usd_balance && <p className="text-red-500 text-xs mt-0.5">{errors.vendor_usd_balance}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fecha Actualización
                    </label>
                    <input
                      type="datetime-local"
                      name="vendor_usd_date_balance"
                      value={formData.vendor_usd_date_balance}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Balance Local */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="text-xs font-bold text-green-900 mb-2">Balance Moneda Local</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <select
                      name="vendor_local_currency"
                      value={formData.vendor_local_currency}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PEN">PEN</option>
                      <option value="VES">VES</option>
                      <option value="USD">USD</option>
                      <option value="MXN">MXN</option>
                      <option value="COP">COP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Monto
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="vendor_local_balance"
                      value={formData.vendor_local_balance}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.vendor_local_balance ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.vendor_local_balance && <p className="text-red-500 text-xs mt-0.5">{errors.vendor_local_balance}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fecha Actualización
                    </label>
                    <input
                      type="datetime-local"
                      name="vendor_local_date_balance"
                      value={formData.vendor_local_date_balance}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: CREDENCIALES */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-200">
              🔐 Credenciales y URLs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Usuario</label>
                <input
                  type="text"
                  name="vendor_username"
                  value={formData.vendor_username}
                  onChange={handleChange}
                  placeholder="api_user"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="vendor_password"
                    value={formData.vendor_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    name="vendor_api_key"
                    value={formData.vendor_api_key}
                    onChange={handleChange}
                    placeholder="sk_live_••••"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">User UID</label>
                <input
                  type="text"
                  name="vendor_user_uid"
                  value={formData.vendor_user_uid}
                  onChange={handleChange}
                  placeholder="uid_123456"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">URL UAT</label>
                <input
                  type="url"
                  name="vendor_url_uat"
                  value={formData.vendor_url_uat}
                  onChange={handleChange}
                  placeholder="https://uat-api.vendor.com"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">URL Producción</label>
                <input
                  type="url"
                  name="vendor_url_prod"
                  value={formData.vendor_url_prod}
                  onChange={handleChange}
                  placeholder="https://api.vendor.com"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Access Token</label>
                <div className="relative">
                  <input
                    type={showAccessToken ? 'text' : 'password'}
                    name="vendor_access_token"
                    value={formData.vendor_access_token}
                    onChange={handleChange}
                    placeholder="Bearer ••••••••"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showAccessToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Token Expiry</label>
                <input
                  type="datetime-local"
                  name="vendor_token_expiry"
                  value={formData.vendor_token_expiry}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: CONFIGURACIÓN */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-200">
              ⚙️ Configuración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="vendor_status"
                  value={formData.vendor_status}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Timeout (seg)</label>
                <input
                  type="number"
                  name="vendor_timeout"
                  value={formData.vendor_timeout}
                  onChange={handleChange}
                  min="1"
                  placeholder="30"
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.vendor_timeout ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vendor_timeout && <p className="text-red-500 text-xs mt-0.5">{errors.vendor_timeout}</p>}
              </div>

              <div className="flex items-center pt-5">
                <input
                  type="checkbox"
                  name="is_production"
                  checked={formData.is_production}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-xs font-medium text-gray-700">Usar Producción</label>
              </div>

              <div className="flex items-center pt-5">
                <input
                  type="checkbox"
                  name="auto_sync_products"
                  checked={formData.auto_sync_products}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-xs font-medium text-gray-700">Auto Sync</label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hora de Sync</label>
                <input
                  type="time"
                  name="sync_time"
                  value={formData.sync_time}
                  onChange={handleChange}
                  disabled={!formData.auto_sync_products}
                  className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300 ${
                    !formData.auto_sync_products ? 'bg-gray-100' : ''
                  }`}
                />
                <p className="text-gray-400 text-xs mt-0.5">Hora diaria de sincronización automática</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Última Sync</label>
                <input
                  type="datetime-local"
                  name="last_sync_date"
                  value={formData.last_sync_date}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {vendor ? 'Actualizar' : 'Crear'}
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