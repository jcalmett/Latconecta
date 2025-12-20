/**
 * VendorForm Component - Latconecta Admin
 * Formulario para crear y editar vendors
 * Fecha: 2025-12-12
 */

import { useState, useEffect } from 'react';
import vendorsService from "../../services/vendorsService";  // ✅ CORRECTO

const VendorForm = ({ vendor, onClose, onSave }) => {
  const isEdit = !!vendor;
  
  const [formData, setFormData] = useState({
    vendor_code: '',
    vendor_name: '',
    vendor_description: '',
    vendor_type: 'API',
    vendor_status: 'active',
    vendor_api_url: '',
    vendor_api_username: '',
    vendor_api_password: '',
    vendor_balance_currency: 'PEN',
    vendor_balance_alert_threshold: 1000.0,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_code: vendor.vendor_code || '',
        vendor_name: vendor.vendor_name || '',
        vendor_description: vendor.vendor_description || '',
        vendor_type: vendor.vendor_type || 'API',
        vendor_status: vendor.vendor_status || 'active',
        vendor_api_url: vendor.vendor_api_url || '',
        vendor_api_username: vendor.vendor_api_username || '',
        vendor_api_password: vendor.vendor_api_password || '',
        vendor_balance_currency: vendor.vendor_balance_currency || 'PEN',
        vendor_balance_alert_threshold: vendor.vendor_balance_alert_threshold || 1000.0,
      });
    }
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar código (solo en creación)
    if (!isEdit && !formData.vendor_code.trim()) {
      newErrors.vendor_code = 'El código es requerido';
    } else if (!isEdit && !/^[A-Z0-9_-]+$/.test(formData.vendor_code)) {
      newErrors.vendor_code = 'Solo mayúsculas, números, guiones y guiones bajos';
    }

    // Validar nombre
    if (!formData.vendor_name.trim()) {
      newErrors.vendor_name = 'El nombre es requerido';
    }

    // Validar API URL
    if (!formData.vendor_api_url.trim()) {
      newErrors.vendor_api_url = 'La URL de la API es requerida';
    } else if (!/^https?:\/\/.+/.test(formData.vendor_api_url)) {
      newErrors.vendor_api_url = 'Debe ser una URL válida (http:// o https://)';
    }

    // Validar API username
    if (!formData.vendor_api_username.trim()) {
      newErrors.vendor_api_username = 'El usuario de la API es requerido';
    }

    // Validar API password (solo en creación o si se está cambiando)
    if (!isEdit && !formData.vendor_api_password.trim()) {
      newErrors.vendor_api_password = 'La contraseña de la API es requerida';
    }

    // Validar threshold
    if (formData.vendor_balance_alert_threshold < 0) {
      newErrors.vendor_balance_alert_threshold = 'El umbral debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      let result;
      if (isEdit) {
        // Al editar, solo enviar campos que el usuario puede cambiar
        const updateData = {
          vendor_name: formData.vendor_name,
          vendor_description: formData.vendor_description,
          vendor_type: formData.vendor_type,
          vendor_status: formData.vendor_status,
          vendor_api_url: formData.vendor_api_url,
          vendor_api_username: formData.vendor_api_username,
          vendor_balance_currency: formData.vendor_balance_currency,
          vendor_balance_alert_threshold: parseFloat(formData.vendor_balance_alert_threshold),
        };

        // Solo incluir password si se está cambiando
        if (formData.vendor_api_password.trim()) {
          updateData.vendor_api_password = formData.vendor_api_password;
        }

        result = await vendorsService.update(vendor.vendor_code, updateData);
        alert('✅ Vendor actualizado exitosamente');
      } else {
        // Al crear, enviar todos los campos
        const createData = {
          ...formData,
          vendor_balance_alert_threshold: parseFloat(formData.vendor_balance_alert_threshold),
        };
        result = await vendorsService.create(createData);
        alert('✅ Vendor creado exitosamente');
      }

      onSave(result);
      onClose();
    } catch (err) {
      console.error('Error al guardar vendor:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error al guardar vendor';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">
            {isEdit ? '✏️ Editar Vendor' : '➕ Nuevo Vendor'}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {isEdit ? `Código: ${vendor.vendor_code}` : 'Complete los datos del nuevo vendor'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sección: Información Básica */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📋 Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código del Vendor *
                </label>
                <input
                  type="text"
                  name="vendor_code"
                  value={formData.vendor_code}
                  onChange={handleChange}
                  disabled={isEdit}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${errors.vendor_code ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="LATCOM"
                />
                {errors.vendor_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_code}</p>
                )}
                {!isEdit && (
                  <p className="text-gray-500 text-xs mt-1">
                    Mayúsculas, números, - y _. Ej: LATCOM, VENDOR_1
                  </p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Vendor *
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.vendor_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Latcom API Services"
                />
                {errors.vendor_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_name}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  name="vendor_type"
                  value={formData.vendor_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="API">API</option>
                  <option value="MANUAL">Manual</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="vendor_status"
                  value={formData.vendor_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="vendor_description"
                  value={formData.vendor_description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del vendor..."
                />
              </div>
            </div>
          </div>

          {/* Sección: Configuración API */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🔌 Configuración de API
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {/* API URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la API *
                </label>
                <input
                  type="text"
                  name="vendor_api_url"
                  value={formData.vendor_api_url}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.vendor_api_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://api.vendor.com"
                />
                {errors.vendor_api_url && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_api_url}</p>
                )}
              </div>

              {/* API Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario de API *
                </label>
                <input
                  type="text"
                  name="vendor_api_username"
                  value={formData.vendor_api_username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.vendor_api_username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="api_user"
                />
                {errors.vendor_api_username && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_api_username}</p>
                )}
              </div>

              {/* API Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña de API {!isEdit && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="vendor_api_password"
                    value={formData.vendor_api_password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                      errors.vendor_api_password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Contraseña de API'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.vendor_api_password && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_api_password}</p>
                )}
                {isEdit && (
                  <p className="text-gray-500 text-xs mt-1">
                    Dejar vacío para mantener la contraseña actual
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Configuración de Balance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              💰 Configuración de Balance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Moneda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda de Balance
                </label>
                <select
                  name="vendor_balance_currency"
                  value={formData.vendor_balance_currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PEN">PEN (Soles)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="EUR">EUR (Euros)</option>
                </select>
              </div>

              {/* Umbral de Alerta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Umbral de Alerta de Saldo Bajo
                </label>
                <input
                  type="number"
                  name="vendor_balance_alert_threshold"
                  value={formData.vendor_balance_alert_threshold}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.vendor_balance_alert_threshold ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1000.00"
                />
                {errors.vendor_balance_alert_threshold && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_balance_alert_threshold}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Alerta cuando el balance esté por debajo de este valor
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Guardando...
                </>
              ) : (
                <>
                  <span>💾</span>
                  {isEdit ? 'Actualizar' : 'Crear'} Vendor
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
