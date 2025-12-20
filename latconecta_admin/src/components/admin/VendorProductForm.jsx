import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import vendorProductsService from '../../services/vendorProductsService';

const VendorProductForm = ({ product, onClose, onSuccess, vendors }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Información Básica (CAMPOS DE TEXTO LIBRE)
    vendor_code: '',
    vp_code: '',
    vp_name: '',
    vp_skuid: '',
    vp_country: '',      // ✅ Texto libre
    vp_operator: '',     // ✅ Texto libre
    vp_product_type: '', // ✅ Texto libre
    vp_service_type: 'combo',
    vp_status: 'active',
    vp_description: '',

    // Configuración de Precio (CAMPOS DE TEXTO LIBRE)
    vp_currency: '',     // ✅ Texto libre
    vp_amount_type: '',  // ✅ Texto libre
    vp_amount: '',
    vp_minimum_amount: '',
    vp_maximum_amount: '',
    vp_commission: '',
    vp_cost: ''
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (product) {
      setFormData({
        vendor_code: product.vendor_code || '',
        vp_code: product.vp_code || '',
        vp_name: product.vp_name || '',
        vp_skuid: product.vp_skuid || '',
        vp_country: product.vp_country || '',
        vp_operator: product.vp_operator || '',
        vp_product_type: product.vp_product_type || '',
        vp_service_type: product.vp_service_type || 'combo',
        vp_status: product.vp_status || 'active',
        vp_description: product.vp_description || '',
        vp_currency: product.vp_currency || '',
        vp_amount_type: product.vp_amount_type || '',
        vp_amount: product.vp_amount || '',
        vp_minimum_amount: product.vp_minimum_amount || '',
        vp_maximum_amount: product.vp_maximum_amount || '',
        vp_commission: product.vp_commission || '',
        vp_cost: product.vp_cost || ''
      });
    }
  }, [product]);

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

    // Validaciones de campos requeridos
    if (!formData.vendor_code?.trim()) newErrors.vendor_code = 'Vendor es requerido';
    if (!formData.vp_code?.trim()) newErrors.vp_code = 'Código es requerido';
    if (!formData.vp_name?.trim()) newErrors.vp_name = 'Nombre es requerido';
    if (!formData.vp_skuid?.trim()) newErrors.vp_skuid = 'SKU ID es requerido';
    if (!formData.vp_country?.trim()) newErrors.vp_country = 'País es requerido';
    if (!formData.vp_currency?.trim()) newErrors.vp_currency = 'Moneda es requerida';
    if (!formData.vp_amount_type?.trim()) newErrors.vp_amount_type = 'Tipo de monto es requerido';

    // Validación de montos según tipo
    const amountType = formData.vp_amount_type?.toLowerCase();
    
    if (amountType === 'fixed' || amountType === 'f') {
      if (!formData.vp_amount || parseFloat(formData.vp_amount) <= 0) {
        newErrors.vp_amount = 'Monto debe ser mayor a 0';
      }
    } else if (amountType === 'range' || amountType === 'r') {
      if (!formData.vp_minimum_amount || parseFloat(formData.vp_minimum_amount) <= 0) {
        newErrors.vp_minimum_amount = 'Monto mínimo debe ser mayor a 0';
      }
      if (!formData.vp_maximum_amount || parseFloat(formData.vp_maximum_amount) <= 0) {
        newErrors.vp_maximum_amount = 'Monto máximo debe ser mayor a 0';
      }
      if (formData.vp_minimum_amount && formData.vp_maximum_amount) {
        if (parseFloat(formData.vp_maximum_amount) <= parseFloat(formData.vp_minimum_amount)) {
          newErrors.vp_maximum_amount = 'Monto máximo debe ser mayor al monto mínimo';
        }
      }
    }

    // Validación de comisión
    if (formData.vp_commission && parseFloat(formData.vp_commission) < 0) {
      newErrors.vp_commission = 'Comisión no puede ser negativa';
    }

    // Validación de costo
    if (formData.vp_cost && parseFloat(formData.vp_cost) < 0) {
      newErrors.vp_cost = 'Costo no puede ser negativo';
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
      // Preparar datos para enviar
      const submitData = {
        vendor_code: formData.vendor_code.trim(),
        vp_code: formData.vp_code.trim(),
        vp_name: formData.vp_name.trim(),
        vp_skuid: formData.vp_skuid.trim(),
        vp_country: formData.vp_country.trim(),
        vp_operator: formData.vp_operator?.trim() || null,
        vp_product_type: formData.vp_product_type?.trim() || null,
        vp_service_type: formData.vp_service_type || null,
        vp_status: formData.vp_status,
        vp_description: formData.vp_description?.trim() || null,
        vp_currency: formData.vp_currency.trim(),
        vp_amount_type: formData.vp_amount_type.trim()
      };

      // Asignar montos según el tipo
      const amountType = formData.vp_amount_type?.toLowerCase();
      
      if (amountType === 'fixed' || amountType === 'f') {
        submitData.vp_amount = parseFloat(formData.vp_amount);
        submitData.vp_minimum_amount = null;
        submitData.vp_maximum_amount = null;
      } else if (amountType === 'range' || amountType === 'r') {
        submitData.vp_amount = parseFloat(formData.vp_minimum_amount);
        submitData.vp_minimum_amount = parseFloat(formData.vp_minimum_amount);
        submitData.vp_maximum_amount = parseFloat(formData.vp_maximum_amount);
      } else {
        // variable o cualquier otro
        submitData.vp_amount = null;
        submitData.vp_minimum_amount = null;
        submitData.vp_maximum_amount = null;
      }

      // Campos opcionales
      submitData.vp_commission = formData.vp_commission ? parseFloat(formData.vp_commission) : null;
      submitData.vp_cost = formData.vp_cost ? parseFloat(formData.vp_cost) : null;

      if (product) {
        // Actualizar
        await vendorProductsService.update(product.vp_id, submitData);
        alert('✅ Producto actualizado correctamente');
      } else {
        // Crear
        await vendorProductsService.create(submitData);
        alert('✅ Producto creado correctamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving vendor product:', error);

      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          alert(`❌ Error: ${error.response.data.detail}`);
        } else if (Array.isArray(error.response.data.detail)) {
          const errorMessages = error.response.data.detail.map(err =>
            `${err.loc ? err.loc.join('.') : 'Campo'}: ${err.msg}`
          ).join('\n');
          alert(`❌ Errores de validación:\n${errorMessages}`);
        }
      } else {
        alert('❌ Error al guardar el producto');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {product ? '✏️ Editar Producto de Vendor' : '➕ Nuevo Producto de Vendor'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Alerta de edición */}
        {product && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <Lock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <strong>⚠️ Modo Edición:</strong> No se puede modificar <strong>Vendor</strong> ni <strong>Código del Producto</strong>.
              <br/>Si necesitas cambiar estos campos, crea un nuevo Vendor Product.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sección 1: Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              📋 Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor <span className="text-red-500">*</span>
                  {product && <Lock size={14} className="inline ml-1 text-gray-400" />}
                </label>
                <input
                  type="text"
                  name="vendor_code"
                  value={formData.vendor_code}
                  onChange={handleChange}
                  disabled={!!product}
                  placeholder="LATCOM, DIGICEL, etc."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vendor_code ? 'border-red-500' : 'border-gray-300'
                  } ${product ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.vendor_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.vendor_code}</p>
                )}
                {!product && (
                  <p className="text-xs text-gray-500 mt-1">Acepta mayúsculas/minúsculas. El vendor puede usar cualquier código.</p>
                )}
              </div>

              {/* Código del Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código del Producto <span className="text-red-500">*</span>
                  {product && <Lock size={14} className="inline ml-1 text-gray-400" />}
                </label>
                <input
                  type="text"
                  name="vp_code"
                  value={formData.vp_code}
                  onChange={handleChange}
                  disabled={!!product}
                  placeholder="ENTEL_20_PEN, topup-20, etc."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vp_code ? 'border-red-500' : 'border-gray-300'
                  } ${product ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.vp_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.vp_code}</p>
                )}
                {!product && (
                  <p className="text-xs text-gray-500 mt-1">Acepta mayúsculas/minúsculas. El vendor define el formato.</p>
                )}
              </div>

              {/* Nombre del Producto */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vp_name"
                  value={formData.vp_name}
                  onChange={handleChange}
                  placeholder="Recarga ENTEL 20 PEN, TopUp 20 soles, etc."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vp_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vp_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.vp_name}</p>
                )}
              </div>

              {/* SKU ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vp_skuid"
                  value={formData.vp_skuid}
                  onChange={handleChange}
                  placeholder="SKU_CLARO_20, sku-001, etc."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vp_skuid ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vp_skuid && (
                  <p className="text-red-500 text-xs mt-1">{errors.vp_skuid}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Acepta mayúsculas/minúsculas. El vendor define el formato.</p>
              </div>

              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vp_country"
                  value={formData.vp_country}
                  onChange={handleChange}
                  placeholder="PE, Peru, MX, Mexico, etc."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vp_country ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vp_country && (
                  <p className="text-red-500 text-xs mt-1">{errors.vp_country}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Común: PE, Peru, MX, Mexico, CO, Colombia, etc.
                </p>
              </div>

              {/* Operador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operador
                </label>
                <input
                  type="text"
                  name="vp_operator"
                  value={formData.vp_operator}
                  onChange={handleChange}
                  placeholder="Claro, Entel, movistar, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Común: Claro, Movistar, Entel, etc.
                </p>
              </div>

              {/* Tipo de Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Producto
                </label>
                <input
                  type="text"
                  name="vp_product_type"
                  value={formData.vp_product_type}
                  onChange={handleChange}
                  placeholder="topup, bundle, bill_payment, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Común: topup, bundle, bill_payment, transfer, etc.
                </p>
              </div>

              {/* Tipo de Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Servicio
                </label>
                <select
                  name="vp_service_type"
                  value={formData.vp_service_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="combo">📊 Combo (Datos + Voz + SMS)</option>
                  <option value="data">📶 Solo Datos</option>
                  <option value="voice">📞 Solo Voz</option>
                  <option value="sms">💬 Solo SMS</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="vp_status"
                  value={formData.vp_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">✅ Activo</option>
                  <option value="inactive">❌ Inactivo</option>
                  <option value="suspended">⏸️ Suspendido</option>
                  <option value="out_of_stock">📦 Sin Stock</option>
                </select>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="vp_description"
                  value={formData.vp_description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Descripción del producto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Configuración de Precio */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              💰 Configuración de Precio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Moneda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vp_currency"
                  value={formData.vp_currency}
                  onChange={handleChange}
                  placeholder="PEN, USD, MXN, COP, etc."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vp_currency ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vp_currency && (
                  <p className="text-red-500 text-xs mt-1">{errors.vp_currency}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Común: PEN, USD, MXN, COP, CLP, ARS, BRL, etc.
                </p>
              </div>

              {/* Tipo de Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Monto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vp_amount_type"
                  value={formData.vp_amount_type}
                  onChange={handleChange}
                  placeholder="F, fixed, R, range, V, variable, etc."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vp_amount_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vp_amount_type && (
                  <p className="text-red-500 text-xs mt-1">{errors.vp_amount_type}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Común: F o fixed (fijo), R o range (rango), V o variable
                </p>
              </div>

              {/* Montos según tipo */}
              {(formData.vp_amount_type?.toLowerCase() === 'fixed' || 
                formData.vp_amount_type?.toLowerCase() === 'f') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto Fijo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="vp_amount"
                    value={formData.vp_amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="20.00"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.vp_amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.vp_amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.vp_amount}</p>
                  )}
                </div>
              )}

              {(formData.vp_amount_type?.toLowerCase() === 'range' || 
                formData.vp_amount_type?.toLowerCase() === 'r') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto Mínimo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="vp_minimum_amount"
                      value={formData.vp_minimum_amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="10.00"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.vp_minimum_amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.vp_minimum_amount && (
                      <p className="text-red-500 text-xs mt-1">{errors.vp_minimum_amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto Máximo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="vp_maximum_amount"
                      value={formData.vp_maximum_amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="100.00"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.vp_maximum_amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.vp_maximum_amount && (
                      <p className="text-red-500 text-xs mt-1">{errors.vp_maximum_amount}</p>
                    )}
                  </div>
                </>
              )}

              {formData.vp_amount_type && 
               !['fixed', 'f', 'range', 'r'].includes(formData.vp_amount_type.toLowerCase()) && (
                <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ <strong>Monto Variable:</strong> El usuario podrá ingresar cualquier monto al momento de la compra.
                  </p>
                </div>
              )}

              {/* Comisión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión del Vendor
                </label>
                <input
                  type="number"
                  name="vp_commission"
                  value={formData.vp_commission}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vp_commission ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vp_commission && (
                  <p className="text-red-500 text-xs mt-1">{errors.vp_commission}</p>
                )}
              </div>

              {/* Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Real del Vendor
                </label>
                <input
                  type="number"
                  name="vp_cost"
                  value={formData.vp_cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vp_cost ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.vp_cost && (
                  <p className="text-red-500 text-xs mt-1">{errors.vp_cost}</p>
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">📌 Reglas Importantes:</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li><strong>Relación Products ↔ Vendor Products:</strong> Un producto puede estar asociado a solo un vendor_product, pero varios productos pueden referenciar al mismo vendor_product.</li>
              <li><strong>Campos de texto libre:</strong> Los vendors pueden usar cualquier formato (mayúsculas/minúsculas). No los controlamos.</li>
              <li><strong>Edición bloqueada:</strong> No se puede cambiar Vendor ni Código de Producto. Si necesitas cambiarlos, crea un nuevo vendor_product.</li>
            </ul>
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
                  {product ? 'Actualizar' : 'Crear'} Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProductForm;