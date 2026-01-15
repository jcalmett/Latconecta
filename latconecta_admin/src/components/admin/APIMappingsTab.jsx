// src/components/admin/APIMappingsTab.jsx

import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, X, Eye, TestTube } from "lucide-react";
import vendorApiMappingsService from "../../services/vendorApiMappingsService";
import vendorsService from "../../services/vendorsService";

const APIMappingsTab = ({ showNotification, setConfirmDialog }) => {
  // ==================== ESTADOS ====================
  const [mappings, setMappings] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [availableFields, setAvailableFields] = useState({
    purchase_fields: [],
    vendor_product_fields: []
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [filterVendor, setFilterVendor] = useState('');
  const [filterApiGroup, setFilterApiGroup] = useState(''); // ⭐ NUEVO FILTRO
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    mapping_code: '',
    vendor_code: '',
    api_group_code: '', // ⭐ NUEVO CAMPO
    operation_type: 'provision', // ⭐ CAMBIADO DE 'topup' A 'provision'
    http_method: 'POST',
    endpoint_url: '',
    auth_type: 'bearer',
    auth_config: {},
    request_mapping: { fields: [] },
    response_mapping: {},
    timeout_seconds: 30,
    headers: {},
    is_active: true
  });

  // ==================== CARGAR DATOS ====================
  useEffect(() => {
    loadMappings();
    loadVendors();
    loadAvailableFields();
  }, []);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const data = await vendorApiMappingsService.getAll();
      setMappings(data);
    } catch (error) {
      console.error('Error cargando mappings:', error);
      showNotification('Error al cargar mappings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await vendorsService.getAll();
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando vendors:', error);
    }
  };

  const loadAvailableFields = async () => {
    try {
      const data = await vendorApiMappingsService.getAvailableFields();
      setAvailableFields(data);
    } catch (error) {
      console.error('Error cargando campos disponibles:', error);
    }
  };

  // ==================== CRUD OPERATIONS ====================
  const handleSave = async () => {
    try {
      // Validaciones
      if (!formData.vendor_code || !formData.operation_type) {
        showNotification('Complete los campos obligatorios', 'error');
        return;
      }

      // ⭐ VALIDACIÓN NUEVA: api_group_code es requerido
      if (!formData.api_group_code || formData.api_group_code.trim() === '') {
        showNotification('El campo API Group Code es obligatorio', 'error');
        return;
      }

      if (formData.request_mapping.fields.length === 0) {
        showNotification('Agregue al menos un campo al request mapping', 'error');
        return;
      }

      if (editingMapping) {
        await vendorApiMappingsService.update(editingMapping.mapping_id, formData);
        showNotification(`Mapping actualizado para ${formData.vendor_code}`);
      } else {
        await vendorApiMappingsService.create(formData);
        showNotification(`Mapping creado para ${formData.vendor_code}`);
      }

      await loadMappings();
      resetForm();
    } catch (error) {
      console.error('Error guardando:', error);
      showNotification(error.response?.data?.detail || 'Error al guardar', 'error');
    }
  };

  const handleDelete = (mapping) => {
    setConfirmDialog({
      show: true,
      title: 'Eliminar Mapping',
      message: `¿Eliminar mapping de ${mapping.vendor_code} - ${mapping.operation_type}?`,
      onConfirm: async () => {
        try {
          await vendorApiMappingsService.delete(mapping.mapping_id);
          showNotification('Mapping eliminado');
          await loadMappings();
        } catch (error) {
          showNotification('Error al eliminar', 'error');
        }
      },
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMapping(null);
    setFormData({
      mapping_code: '',
      vendor_code: '',
      api_group_code: '', // ⭐ RESET
      operation_type: 'provision',
      http_method: 'POST',
      endpoint_url: '',
      auth_type: 'bearer',
      auth_config: {},
      request_mapping: { fields: [] },
      response_mapping: {},
      timeout_seconds: 30,
      headers: {},
      is_active: true
    });
  };

  const handleEdit = (mapping) => {
    setEditingMapping(mapping);
    setFormData({
      mapping_code: mapping.mapping_code || '',
      vendor_code: mapping.vendor_code,
      api_group_code: mapping.api_group_code || '', // ⭐ CARGAR CAMPO
      operation_type: mapping.operation_type,
      http_method: mapping.http_method,
      endpoint_url: mapping.endpoint_url || '',
      auth_type: mapping.auth_type || 'bearer',
      auth_config: mapping.auth_config || {},
      request_mapping: mapping.request_mapping || { fields: [] },
      response_mapping: mapping.response_mapping || {},
      timeout_seconds: mapping.timeout_seconds || 30,
      headers: mapping.headers || {},
      is_active: mapping.is_active !== false
    });
    setShowForm(true);
  };

  // ==================== REQUEST MAPPING HELPERS ====================
  const addRequestField = () => {
    const newField = {
      api_field: '',
      source_field: '',
      data_type: 'string',
      required: false
    };
    setFormData({
      ...formData,
      request_mapping: {
        fields: [...formData.request_mapping.fields, newField]
      }
    });
  };

  const updateRequestField = (index, field, value) => {
    const updatedFields = [...formData.request_mapping.fields];
    updatedFields[index][field] = value;
    setFormData({
      ...formData,
      request_mapping: { fields: updatedFields }
    });
  };

  const removeRequestField = (index) => {
    const updatedFields = formData.request_mapping.fields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      request_mapping: { fields: updatedFields }
    });
  };

  // ==================== RESPONSE MAPPING HELPERS ====================
  const addResponseField = () => {
    const newKey = prompt('Nombre del campo en response del vendor:');
    if (newKey && newKey.trim()) {
      setFormData({
        ...formData,
        response_mapping: {
          ...formData.response_mapping,
          [newKey.trim()]: ''
        }
      });
    }
  };

  const updateResponseField = (oldKey, newKey, value) => {
    const updated = { ...formData.response_mapping };
    if (newKey !== oldKey) {
      delete updated[oldKey];
    }
    updated[newKey] = value;
    setFormData({ ...formData, response_mapping: updated });
  };

  const removeResponseField = (key) => {
    const updated = { ...formData.response_mapping };
    delete updated[key];
    setFormData({ ...formData, response_mapping: updated });
  };

  // ==================== FILTROS ====================
  const filteredMappings = mappings.filter(mapping => {
    if (filterVendor && mapping.vendor_code !== filterVendor) return false;
    if (filterApiGroup && mapping.api_group_code !== filterApiGroup) return false; // ⭐ NUEVO FILTRO
    return true;
  });

  // ⭐ OBTENER GRUPOS ÚNICOS PARA FILTRO
  const uniqueApiGroups = [...new Set(mappings.map(m => m.api_group_code).filter(Boolean))];

  // ==================== RENDER ====================
  return (
    <div>
      {/* HEADER */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#008C96]">API Mappings</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2 font-semibold"
          >
            <Plus size={18} />
            <span>Nuevo Mapping</span>
          </button>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#FFE709]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Vendor:</label>
              <select
                value={filterVendor}
                onChange={(e) => setFilterVendor(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Todos los vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor.vendor_code} value={vendor.vendor_code}>
                    {vendor.vendor_code}
                  </option>
                ))}
              </select>
            </div>
            
            {/* ⭐ NUEVO FILTRO API GROUP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por API Group:</label>
              <select
                value={filterApiGroup}
                onChange={(e) => setFilterApiGroup(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Todos los grupos</option>
                {uniqueApiGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#008C96]"></div>
          <p className="mt-2 text-gray-600">Cargando mappings...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#008C96] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-left">API Group</th> {/* ⭐ NUEVA COLUMNA */}
                  <th className="px-4 py-3 text-left">Operación</th>
                  <th className="px-4 py-3 text-left">Método</th>
                  <th className="px-4 py-3 text-left">Endpoint</th>
                  <th className="px-4 py-3 text-center">Auth</th>
                  <th className="px-4 py-3 text-center">Request Fields</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      No hay mappings configurados
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map((mapping) => (
                    <tr key={mapping.mapping_code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm font-bold text-[#008C96]">{mapping.mapping_code}</td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold">{mapping.vendor_code}</td>
                      {/* ⭐ NUEVA COLUMNA */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-mono text-xs font-semibold">
                          {mapping.api_group_code || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {mapping.operation_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                          {mapping.http_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{mapping.endpoint_url || '-'}</td>
                      <td className="px-4 py-3 text-center text-sm">{mapping.auth_type || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          {mapping.request_mapping?.fields?.length || 0} campos
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          mapping.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {mapping.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(mapping)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(mapping)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORMULARIO MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#008C96]">
                {editingMapping ? 'Editar Mapping' : 'Nuevo Mapping'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center space-x-2"
                >
                  <Eye size={18} />
                  <span>{showJsonPreview ? 'Ocultar' : 'Ver'} JSON</span>
                </button>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* PREVIEW JSON */}
              {showJsonPreview && (
                <div className="mb-6 bg-gray-900 text-green-400 p-4 rounded-lg">
                  <p className="text-xs font-mono mb-2">JSON Preview:</p>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              )}

              {/* CONFIGURACIÓN BÁSICA */}
              <div className="mb-6 bg-yellow-50 border-2 border-[#FFE709] rounded-lg p-4">
                <h4 className="font-bold text-[#008C96] mb-4">⚙️ Configuración Básica</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Código del Mapping * (máx. 5 caracteres)</label>
                    <input
                      type="text"
                      value={formData.mapping_code}
                      onChange={(e) => setFormData({ ...formData, mapping_code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border rounded-lg font-mono font-bold text-[#008C96]"
                      placeholder="DTOP1"
                      maxLength={5}
                      required
                      disabled={!!editingMapping}
                    />
                    <p className="text-xs text-gray-600 mt-1">Ej: DTOP1 (DTone TopUp 1), MDTOP (Mock DTone TopUp)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Vendor Code *</label>
                    <select
                      value={formData.vendor_code}
                      onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.vendor_code} value={vendor.vendor_code}>
                          {vendor.vendor_code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ⭐ NUEVO CAMPO: API Group Code */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      API Group Code * 
                      <span className="text-xs text-gray-500 ml-2">(Agrupa mappings relacionados)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.api_group_code}
                      onChange={(e) => setFormData({ ...formData, api_group_code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border rounded-lg font-mono"
                      placeholder="001"
                      maxLength={50}
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Ej: 001, DT001, MP001 - Mismo código para mappings del mismo tipo
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Operación *</label>
                    <select
                      value={formData.operation_type}
                      onChange={(e) => setFormData({ ...formData, operation_type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="provision">provision</option>
                      <option value="validate">validate</option>
                      <option value="query">query</option>
                      <option value="reversal">reversal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Método HTTP</label>
                    <select
                      value={formData.http_method}
                      onChange={(e) => setFormData({ ...formData, http_method: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Endpoint URL</label>
                    <input
                      type="text"
                      value={formData.endpoint_url}
                      onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg font-mono"
                      placeholder="/api/v1/topup"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Timeout (segundos)</label>
                    <input
                      type="number"
                      value={formData.timeout_seconds}
                      onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="1"
                      max="300"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 text-[#008C96] border-gray-300 rounded focus:ring-[#008C96]"
                      />
                      <span className="text-sm font-medium">Mapping Activo</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* AUTH CONFIGURATION */}
              <div className="mb-6 bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <h4 className="font-bold text-[#008C96] mb-4">🔐 Autenticación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Auth</label>
                    <select
                      value={formData.auth_type}
                      onChange={(e) => setFormData({ ...formData, auth_type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="api_key">API Key</option>
                      <option value="none">Sin Auth</option>
                    </select>
                  </div>

                  {formData.auth_type === 'bearer' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Header Name</label>
                      <input
                        type="text"
                        value={formData.auth_config?.header_name || 'Authorization'}
                        onChange={(e) => setFormData({
                          ...formData,
                          auth_config: { ...formData.auth_config, header_name: e.target.value }
                        })}
                        className="w-full px-4 py-2 border rounded-lg font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* REQUEST MAPPING */}
              <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-[#008C96]">📤 Request Mapping (Purchase → Vendor API)</h4>
                  <button
                    onClick={addRequestField}
                    className="bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Agregar Campo</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.request_mapping.fields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay campos configurados. Click en "Agregar Campo" para empezar.
                    </p>
                  ) : (
                    formData.request_mapping.fields.map((field, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-5 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Campo API Vendor *</label>
                            <input
                              type="text"
                              value={field.api_field}
                              onChange={(e) => updateRequestField(index, 'api_field', e.target.value)}
                              className="w-full px-3 py-2 border rounded text-sm font-mono"
                              placeholder="phone_number"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1">Campo Origen *</label>
                            <select
                              value={field.source_field}
                              onChange={(e) => updateRequestField(index, 'source_field', e.target.value)}
                              className="w-full px-3 py-2 border rounded text-sm"
                            >
                              <option value="">Seleccionar...</option>
                              <optgroup label="Purchase Fields">
                                {availableFields.purchase_fields.map((f) => (
                                  <option key={f.field_name} value={f.field_name}>
                                    {f.field_name}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Vendor Product Fields">
                                {availableFields.vendor_product_fields.map((f) => (
                                  <option key={f.field_name} value={f.field_name}>
                                    {f.field_name}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1">Tipo de Dato</label>
                            <select
                              value={field.data_type}
                              onChange={(e) => updateRequestField(index, 'data_type', e.target.value)}
                              className="w-full px-3 py-2 border rounded text-sm"
                            >
                              <option value="string">String</option>
                              <option value="float">Float</option>
                              <option value="int">Integer</option>
                              <option value="boolean">Boolean</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateRequestField(index, 'required', e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className="text-xs font-medium">Requerido</span>
                            </label>
                          </div>

                          <div className="flex items-end justify-end">
                            <button
                              onClick={() => removeRequestField(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Ayuda contextual */}
                        {field.source_field && (
                          <div className="mt-2 text-xs text-gray-600">
                            {availableFields.purchase_fields.find(f => f.field_name === field.source_field)?.description ||
                             availableFields.vendor_product_fields.find(f => f.field_name === field.source_field)?.description}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RESPONSE MAPPING */}
              <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-[#008C96]">📥 Response Mapping (Vendor API → Purchase)</h4>
                  <button
                    onClick={addResponseField}
                    className="bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Agregar Campo</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.keys(formData.response_mapping).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay campos configurados. Click en "Agregar Campo" para empezar.
                    </p>
                  ) : (
                    Object.entries(formData.response_mapping).map(([key, value]) => (
                      <div key={key} className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <div>
                            <label className="block text-xs font-medium mb-1">Campo en Response API</label>
                            <input
                              type="text"
                              value={key}
                              onChange={(e) => {
                                if (e.target.value !== key) {
                                  updateResponseField(key, e.target.value, value);
                                }
                              }}
                              className="w-full px-3 py-2 border rounded text-sm font-mono"
                              placeholder="transaction_id"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1">Campo Destino en Purchase</label>
                            <select
                              value={value}
                              onChange={(e) => updateResponseField(key, key, e.target.value)}
                              className="w-full px-3 py-2 border rounded text-sm"
                            >
                              <option value="">Seleccionar...</option>
                              {availableFields.purchase_fields.map((f) => (
                                <option key={f.field_name} value={f.field_name}>
                                  {f.field_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => removeResponseField(key)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Ayuda contextual */}
                        {value && (
                          <div className="mt-2 text-xs text-gray-600">
                            → {availableFields.purchase_fields.find(f => f.field_name === value)?.description}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#008C96] text-white rounded-lg hover:bg-[#006B74]"
              >
                {editingMapping ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIMappingsTab;