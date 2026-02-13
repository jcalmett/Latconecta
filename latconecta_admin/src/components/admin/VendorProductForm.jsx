import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import vendorProductsService from '../../services/vendorProductsService';
import vendorsService from '../../services/vendorsService';
import vendorApiMappingsService from '../../services/vendorApiMappingsService';

const VendorProductForm = ({ vendorProduct, onClose, onSuccess = () => {} }) => {
  const [vendors, setVendors] = useState([]);
  const [apiMappings, setApiMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    vendor_code: vendorProduct?.vendor_code || '',
    vp_code: vendorProduct?.vp_code || '',
    vp_skuid: vendorProduct?.vp_skuid || '',
    vp_name: vendorProduct?.vp_name || '',
    vp_product_type: vendorProduct?.vp_product_type || '1',
    vp_country: vendorProduct?.vp_country || '',
    vp_operator: vendorProduct?.vp_operator || '',
    vp_currency: vendorProduct?.vp_currency || 'MXN',
    vp_amount_type: vendorProduct?.vp_amount_type || 'F',
    vp_amount: vendorProduct?.vp_amount || '0.00',
    vp_minimum_amount: vendorProduct?.vp_minimum_amount || '0.00',
    vp_maximum_amount: vendorProduct?.vp_maximum_amount || '0.00',
    vp_cost: vendorProduct?.vp_cost || '0.00',
    vp_commission: vendorProduct?.vp_commission || '0.00',
    vp_fee_usd: vendorProduct?.vp_fee_usd || '0.00000',
    vp_status: vendorProduct?.vp_status || 'active',
    api_group_code: vendorProduct?.api_group_code || ''  // ⭐ CAMBIO: api_group_code
  });

  // Cargar vendors
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        const data = await vendorsService.getAll();
        setVendors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading vendors:', error);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  // ⭐ CAMBIO: Cargar mappings cuando cambia el vendor
  useEffect(() => {
    const loadMappings = async () => {
      if (!formData.vendor_code) {
        setApiMappings([]);
        return;
      }

      try {
        console.log(`🔍 Cargando mappings para vendor: ${formData.vendor_code}`);
        const data = await vendorApiMappingsService.getByVendor(formData.vendor_code);
        console.log('✅ Mappings cargados:', data);
        setApiMappings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('❌ Error loading API mappings:', error);
        setApiMappings([]);
      }
    };

    loadMappings();
  }, [formData.vendor_code]);

  // ⭐ NUEVO: Extraer grupos únicos de los mappings
  const uniqueApiGroups = React.useMemo(() => {
    const groups = new Map();
    
    apiMappings.forEach(mapping => {
      const groupCode = mapping.api_group_code;
      if (groupCode && !groups.has(groupCode)) {
        // Contar cuántos mappings tiene este grupo
        const groupMappings = apiMappings.filter(m => m.api_group_code === groupCode);
        const operations = groupMappings.map(m => m.operation_type).join(', ');
        
        groups.set(groupCode, {
          code: groupCode,
          count: groupMappings.length,
          operations: operations,
          vendor_code: mapping.vendor_code
        });
      }
    });
    
    return Array.from(groups.values());
  }, [apiMappings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el vendor, resetear el grupo seleccionado
    if (name === 'vendor_code') {
      setFormData({
        ...formData,
        [name]: value,
        api_group_code: ''  // ⭐ CAMBIO: Reset group al cambiar vendor
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // ⭐ CAMBIO: Preparar datos con api_group_code
      const submitData = {
        ...formData,
        vp_amount: parseFloat(formData.vp_amount) || 0,
        vp_minimum_amount: parseFloat(formData.vp_minimum_amount) || 0,
        vp_maximum_amount: parseFloat(formData.vp_maximum_amount) || 0,
        vp_cost: parseFloat(formData.vp_cost) || 0,
        vp_commission: parseFloat(formData.vp_commission) || 0,
        vp_fee_usd: parseFloat(formData.vp_fee_usd) || 0,
        vp_product_type: formData.vp_product_type,  // Ya es string '1' o '2'
        api_group_code: formData.api_group_code || null  // ⭐ CAMBIO: api_group_code
      };

      console.log('📤 Enviando datos:', submitData);

      if (vendorProduct) {
        // Actualizar
        await vendorProductsService.update(vendorProduct.vp_id, submitData);
        alert('✅ Vendor Product actualizado correctamente');
      } else {
        // Crear
        await vendorProductsService.create(submitData);
        alert('✅ Vendor Product creado correctamente');
      }

      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving vendor product:', error);

      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          alert(`⛔ Error: ${error.response.data.detail}`);
        } else if (Array.isArray(error.response.data.detail)) {
          const errorMessages = error.response.data.detail.map(err =>
            `${err.loc.join('.')}: ${err.msg}`
          ).join('\n');
          alert(`⛔ Errores de validación:\n${errorMessages}`);
        }
      } else {
        alert(`⛔ Error al guardar: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {vendorProduct ? 'Editar Vendor Product' : 'Crear Vendor Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <select
                name="vendor_code"
                value={formData.vendor_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!vendorProduct} // Deshabilitado en edición
              >
                <option value="">Seleccionar Vendor</option>
                {(vendors || []).map((vendor) => (
                  <option key={vendor.vendor_code} value={vendor.vendor_code}>
                    {vendor.vendor_name} ({vendor.vendor_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                name="vp_code"
                value={formData.vp_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!vendorProduct} // Deshabilitado en edición
              />
            </div>

            {/* SKU ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU ID *
              </label>
              <input
                type="text"
                name="vp_skuid"
                value={formData.vp_skuid}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!vendorProduct} // Deshabilitado en edición
              />
            </div>

            {/* ========================================
                ⭐ CAMBIO: SELECTOR DE API GROUP
                ======================================== */}
            <div className="md:col-span-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🗺️ API Mapping (Plantilla de API a usar) <span className="text-gray-500 text-xs">(Opcional)</span>
              </label>
              <select
                name="api_group_code"
                value={formData.api_group_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono text-sm"
                disabled={!formData.vendor_code}
              >
                <option value="">Sin grupo de APIs asignado</option>
                {uniqueApiGroups.map((group) => (
                  <option key={group.code} value={group.code}>
                    {group.code} | {group.count} operación(es): {group.operations}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-gray-600">
                {!formData.vendor_code && (
                  <p>💡 Primero selecciona un vendor para ver los grupos de APIs disponibles.</p>
                )}
                {formData.vendor_code && uniqueApiGroups.length === 0 && (
                  <p className="text-orange-600">
                    ⚠️ No hay grupos de APIs disponibles para <strong>{formData.vendor_code}</strong>. 
                    Créalos primero en el tab "API Mappings".
                  </p>
                )}
                {formData.vendor_code && uniqueApiGroups.length > 0 && (
                  <p>
                    ✅ Hay {uniqueApiGroups.length} grupo(s) de APIs disponible(s) para {formData.vendor_code}. 
                    Cada grupo agrupa múltiples operaciones (provision, validate, reversal, etc).
                  </p>
                )}
                {formData.api_group_code && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="font-semibold text-green-800">
                      Grupo seleccionado: {formData.api_group_code}
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      Este producto usará las operaciones configuradas en este grupo de APIs.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Nombre */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                name="vp_name"
                value={formData.vp_name}
                onChange={handleChange}
                placeholder="Ej: Recarga 10 soles"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tipo de Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Producto
              </label>
              <select
                name="vp_product_type"
                value={formData.vp_product_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País
              </label>
              <input
                type="text"
                name="vp_country"
                value={formData.vp_country}
                onChange={handleChange}
                placeholder="Ej: PE, MX, CO"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                placeholder="Ej: Bitel, Claro, Movistar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                name="vp_currency"
                value={formData.vp_currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
                <option value="COP">COP</option>               
                <option value="VES">VES</option>
              </select>
            </div>

            {/* Tipo de Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Monto
              </label>
              <select
                name="vp_amount_type"
                value={formData.vp_amount_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="F">Fijo</option>
                <option value="R">Rango</option>
                <option value="V">Variable</option>
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
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            {/* Monto Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Mínimo
              </label>
              <input
                type="text"
                name="vp_minimum_amount"
                value={formData.vp_minimum_amount}
                onChange={handleChange}
                placeholder="0.00"
                pattern="^\d+(\.\d{1,2})?$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={formData.vp_amount_type === 'F'}
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <input
                type="text"
                name="vp_amount"
                value={formData.vp_amount}
                onChange={handleChange}
                placeholder="0.00"
                pattern="^\d+(\.\d{1,2})?$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Monto Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Máximo
              </label>
              <input
                type="text"
                name="vp_maximum_amount"
                value={formData.vp_maximum_amount}
                onChange={handleChange}
                placeholder="0.00"
                pattern="^\d+(\.\d{1,2})?$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={formData.vp_amount_type === 'F'}
              />
            </div>

            {/* Costo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo
              </label>
              <input
                type="text"
                name="vp_cost"
                value={formData.vp_cost}
                onChange={handleChange}
                placeholder="0.00"
                pattern="^\d+(\.\d{1,2})?$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Comisión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comisión
              </label>
              <input
                type="text"
                name="vp_commission"
                value={formData.vp_commission}
                onChange={handleChange}
                placeholder="0.00"
                pattern="^\d+(\.\d{1,2})?$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fee USD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee USD
              </label>
              <input
                type="text"
                name="vp_fee_usd"
                value={formData.vp_fee_usd}
                onChange={handleChange}
                placeholder="0.00000"
                pattern="^\d+(\.\d{1,5})?$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : (vendorProduct ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProductForm;