/**
 * VendorsTab Component - Bitel Admin
 * Gestión de vendors con balance y conexiones
 * Fecha: 2025-12-12
 */
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, RefreshCw, Search, AlertCircle, DollarSign, Package, Shield, Tag } from 'lucide-react';
import vendorsService from "../../services/vendorsService";
import VendorForm from './VendorForm';

const VendorsTab = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceSummary, setBalanceSummary] = useState(null);

  // Cargar vendors
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
        alert(`Balance sincronizado: ${result.balance}`);
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

  const handleManageBalance = (vendor) => {
    setSelectedVendor(vendor);
    setShowBalanceModal(true);
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
    if (!vendor.vendor_balance_amount) {
      return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">Sin balance</span>;
    }
    
    const amount = parseFloat(vendor.vendor_balance_amount);
    if (amount < 1000) {
      return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">⚠️ Bajo</span>;
    }
    if (amount < 5000) {
      return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">⚠️ Medio</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">✅ OK</span>;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Vendors</h2>
          <p className="text-gray-600">Administra proveedores y sus balances</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + Nuevo Vendor
        </button>
      </div>

      {/* Balance Summary */}
      {balanceSummary && (
        <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Balances</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600">Total Vendors</div>
              <div className="text-2xl font-bold text-blue-600">{balanceSummary.total_vendors}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600">Con Balance</div>
              <div className="text-2xl font-bold text-green-600">{balanceSummary.vendors_with_balance}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600">Saldo Bajo</div>
              <div className="text-2xl font-bold text-red-600">{balanceSummary.vendors_low_balance}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600">Desactualizado</div>
              <div className="text-2xl font-bold text-orange-600">{balanceSummary.vendors_stale_balance}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actualización
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <span className="text-sm text-gray-600">{vendor.vendor_type || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.vendor_balance_amount ? (
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {vendor.vendor_balance_currency} {parseFloat(vendor.vendor_balance_amount).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin balance</span>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vendor.vendor_balance_last_update 
                      ? new Date(vendor.vendor_balance_last_update).toLocaleString()
                      : 'Nunca'
                    }
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
                        onClick={() => handleManageBalance(vendor)}
                        className="text-green-600 hover:text-green-900"
                        title="Gestionar Balance"
                      >
                        💰
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

        {/* Empty State */}
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

      {/* Vendor Form Modal */}
      {showForm && (
        <VendorForm
          vendor={selectedVendor}
          onClose={() => {
            setShowForm(false);
            setSelectedVendor(null);
          }}
          onSave={() => {
            loadVendors();
            loadBalanceSummary();
          }}
        />
      )}

      {/* Balance Management Modal */}
      {showBalanceModal && selectedVendor && (
        <BalanceModal
          vendor={selectedVendor}
          onClose={() => {
            setShowBalanceModal(false);
            setSelectedVendor(null);
          }}
          onUpdate={() => {
            loadVendors();
            loadBalanceSummary();
          }}
        />
      )}
    </div>
  );
};

// Balance Modal Component
const BalanceModal = ({ vendor, onClose, onUpdate }) => {
  const [amount, setAmount] = useState(vendor.vendor_balance_amount || '0');
  const [currency, setCurrency] = useState(vendor.vendor_balance_currency || 'PEN');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < 0) {
      alert('Ingrese un monto válido');
      return;
    }

    setSaving(true);
    try {
      await vendorsService.updateBalance(vendor.vendor_code, {
        vendor_balance_amount: parseFloat(amount),
        vendor_balance_currency: currency
      });
      alert('✅ Balance actualizado exitosamente');
      onUpdate();
      onClose();
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-xl font-bold">💰 Actualizar Balance</h3>
          <p className="text-green-100 text-sm mt-1">{vendor.vendor_name}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Balance Actual
            </label>
            <div className="bg-gray-50 px-4 py-3 rounded-lg">
              <span className="text-lg font-semibold text-gray-800">
                {vendor.vendor_balance_currency} {parseFloat(vendor.vendor_balance_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nuevo Balance *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moneda
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="PEN">PEN (Soles)</option>
              <option value="USD">USD (Dólares)</option>
              <option value="EUR">EUR (Euros)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Actualizando...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Actualizar Balance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorsTab;
