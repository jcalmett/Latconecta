/**
 * VendorsTab Component - Latconecta Admin
 * Gestión de vendors con balance dual (USD + Local)
 * Actualizado: 2026-01-10 - Agregada verificación de consistencia de monedas
 */
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, RefreshCw, Search, AlertCircle, DollarSign, CheckCircle } from 'lucide-react';
import vendorsService from "../../services/vendorsService";
import VendorForm from './VendorForm';

const VendorsTab = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [balanceSummary, setBalanceSummary] = useState(null);

  useEffect(() => {
    loadVendors();
    loadBalanceSummary();
  }, [filterStatus]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filterStatus !== 'all' ? { vendor_status: filterStatus } : {};
      const data = await vendorsService.getAll(params);
      setVendors(data);
    } catch (err) {
      console.error('Error al cargar vendors:', err);
      setError('Error al cargar vendors');
    } finally {
      setLoading(false);
    }
  };

  const loadBalanceSummary = async () => {
    try {
      const summary = await vendorsService.getBalanceSummary();
      setBalanceSummary(summary);
    } catch (err) {
      console.error('Error al cargar resumen de balance:', err);
    }
  };

  const handleCreate = () => {
    setSelectedVendor(null);
    setShowForm(true);
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setShowForm(true);
  };

  const handleDelete = async (vendorCode) => {
    if (!confirm(`¿Eliminar vendor ${vendorCode}? Esta acción eliminará también todos sus productos.`)) {
      return;
    }

    try {
      await vendorsService.delete(vendorCode);
      alert('Vendor eliminado exitosamente');
      loadVendors();
      loadBalanceSummary();
    } catch (err) {
      alert(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleSyncBalance = async (vendorCode) => {
    try {
      const result = await vendorsService.syncBalance(vendorCode);
      if (result.success) {
        alert(`Balance sincronizado exitosamente`);
        loadVendors();
        loadBalanceSummary();
      } else {
        alert(`Error al sincronizar: ${result.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleTestConnection = async (vendorCode) => {
    try {
      const result = await vendorsService.testConnection(vendorCode);
      if (result.success) {
        alert(`✅ Conexión exitosa\nBalance: ${JSON.stringify(result.balance)}`);
      } else {
        alert(`❌ Error: ${result.message}\n${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleVerifyCurrency = (vendor) => {
    setSelectedVendor(vendor);
    setShowVerificationModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getBalanceStatusBadge = (vendor) => {
    const hasUSD = vendor.vendor_usd_balance !== null && vendor.vendor_usd_balance !== undefined;
    const usdAmount = hasUSD ? parseFloat(vendor.vendor_usd_balance) : 0;

    const hasLocal = vendor.vendor_local_balance !== null && vendor.vendor_local_balance !== undefined;
    const localAmount = hasLocal ? parseFloat(vendor.vendor_local_balance) : 0;

    if (!hasUSD && !hasLocal) {
      return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">Sin balance</span>;
    }

    if (hasUSD) {
      if (usdAmount < 100) {
        return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">⚠️ USD Bajo</span>;
      }
      if (usdAmount < 500) {
        return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">⚠️ USD Medio</span>;
      }
      return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">✅ USD OK</span>;
    }

    if (localAmount < 1000) {
      return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">⚠️ Local Bajo</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">✅ Local OK</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-blue-600">Cargando vendors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#008C96]">
            Gestión de Vendors
          </h2>
        </div>
        <button
          onClick={handleCreate}
          className="bg-[#008C96] hover:bg-[#006B74] text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + Nuevo Vendor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="suspended">Suspendidos</option>
          </select>
          <span className="text-sm text-gray-600">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} encontrado{vendors.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#008C96] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Balance USD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Balance Local
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Estado Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor.vendor_code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vendor.vendor_code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{vendor.vendor_name}</div>
                    <div className="text-sm text-gray-500">{vendor.vendor_description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.vendor_usd_balance !== null && vendor.vendor_usd_balance !== undefined ? (
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          USD {parseFloat(vendor.vendor_usd_balance).toFixed(2)}
                        </div>
                        {vendor.vendor_usd_date_balance && (
                          <div className="text-xs text-gray-500">
                            {new Date(vendor.vendor_usd_date_balance).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.vendor_local_balance !== null && vendor.vendor_local_balance !== undefined ? (
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {vendor.vendor_local_currency} {parseFloat(vendor.vendor_local_balance).toFixed(2)}
                        </div>
                        {vendor.vendor_local_date_balance && (
                          <div className="text-xs text-gray-500">
                            {new Date(vendor.vendor_local_date_balance).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(vendor.vendor_status)}`}>
                      {vendor.vendor_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getBalanceStatusBadge(vendor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleVerifyCurrency(vendor)}
                        className="text-green-600 hover:text-green-900"
                        title="Verificar Consistencia de Monedas"
                      >
                        🔍
                      </button>
                      <button
                        onClick={() => handleSyncBalance(vendor.vendor_code)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Sincronizar Balance"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => handleTestConnection(vendor.vendor_code)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Probar Conexión"
                      >
                        🔌
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.vendor_code)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {vendors.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No hay vendors</div>
            <button
              onClick={handleCreate}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear el primero
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <VendorForm
          vendor={selectedVendor}
          onClose={() => {
            setShowForm(false);
            setSelectedVendor(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedVendor(null);
            loadVendors();
            loadBalanceSummary();
          }}
        />
      )}

      {showVerificationModal && selectedVendor && (
        <CurrencyVerificationModal
          vendor={selectedVendor}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </div>
  );
};

const CurrencyVerificationModal = ({ vendor, onClose }) => {
  const [verificationData, setVerificationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadVerificationData();
  }, [vendor]);

  const loadVerificationData = async () => {
    try {
      setLoading(true);
      const response = await vendorsService.verifyCurrencyConsistency(vendor.vendor_code);
      setVerificationData(response);
    } catch (err) {
      console.error('Error al verificar consistencia:', err);
      alert(`Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = verificationData.filter(item => {
    if (filter === 'errors') return !item.is_valid;
    if (filter === 'correct') return item.is_valid;
    return true;
  });

  const errorCount = verificationData.filter(item => !item.is_valid).length;
  const correctCount = verificationData.filter(item => item.is_valid).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-xl font-bold">🔍 Verificación de Consistencia de Monedas</h3>
          <p className="text-green-100 text-sm mt-1">
            {vendor.vendor_name} - Moneda Local: {vendor.vendor_local_currency || 'No definida'}
          </p>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-blue-600">Cargando verificación...</div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <span className="text-sm text-green-800">
                      ✅ Correctos: <strong>{correctCount}</strong>
                    </span>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    <span className="text-sm text-red-800">
                      ❌ Errores: <strong>{errorCount}</strong>
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                    <span className="text-sm text-blue-800">
                      📊 Total: <strong>{verificationData.length}</strong>
                    </span>
                  </div>
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Todos ({verificationData.length})</option>
                  <option value="errors">Solo Errores ({errorCount})</option>
                  <option value="correct">Solo Correctos ({correctCount})</option>
                </select>
              </div>

              {filteredData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-lg">
                    {filter === 'errors' ? '✅ No hay errores de consistencia' : 'No hay registros para mostrar'}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moneda Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VP Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moneda VP</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observación</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((item, index) => (
                        <tr key={index} className={item.is_valid ? 'bg-green-50' : 'bg-red-50'}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.is_valid ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ❌ Error
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                            <div className="text-xs text-gray-500">ID: {item.product_id}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{item.product_currency}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{item.vp_code}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{item.vp_currency}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-700">{item.observation}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorsTab;