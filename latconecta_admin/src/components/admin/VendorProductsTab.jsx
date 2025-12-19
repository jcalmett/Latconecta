import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, RefreshCw, Search, AlertCircle, Package, DollarSign, Tag, Shield } from 'lucide-react';
import vendorProductsService from '../../services/vendorProductsService';
import vendorsService from '../../services/vendorsService';
import VendorProductForm from './VendorProductForm';

const VendorProductsTab = ({ userRole }) => {
  // Estados principales
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  // Estados de formulario y modal
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estados de filtros
  const [filters, setFilters] = useState({
    vendor_code: '',
    vp_status: 'all',
    vp_product_type: '',
    search: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadVendorProducts();
    loadVendors();
    loadSummary();
  }, [filters.vendor_code, filters.vp_status, filters.vp_product_type]);

  const loadVendorProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filters.vendor_code && filters.vendor_code !== '') params.vendor_code = filters.vendor_code;
      if (filters.vp_status !== 'all') params.vp_status = filters.vp_status;
      if (filters.vp_product_type) params.vp_product_type = parseInt(filters.vp_product_type);

      const data = await vendorProductsService.getAll(params);
      setVendorProducts(data);
    } catch (err) {
      console.error('Error loading vendor products:', err);
      setError('Error al cargar los productos de vendors');
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await vendorsService.getAll({ status: 'active' });
      setVendors(data);
    } catch (err) {
      console.error('Error loading vendors:', err);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await vendorProductsService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (vpId, vpCode) => {
    if (userRole !== 'superadmin') {
      alert('❌ Solo los superadministradores pueden eliminar productos de vendors');
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar el producto ${vpCode}?`)) {
      return;
    }

    try {
      await vendorProductsService.delete(vpId);
      alert('✅ Producto eliminado correctamente');
      loadVendorProducts();
      loadSummary();
    } catch (err) {
      console.error('Error deleting vendor product:', err);
      alert(err.response?.data?.detail || '❌ Error al eliminar el producto');
    }
  };

  const handleSyncProducts = async (vendorCode) => {
    if (!window.confirm(`¿Sincronizar productos con el vendor ${vendorCode}?`)) {
      return;
    }

    try {
      setLoading(true);
      const result = await vendorProductsService.syncProducts(vendorCode);
      alert(`✅ Sincronización completada:\n- Añadidos: ${result.added || 0}\n- Actualizados: ${result.updated || 0}\n- Errores: ${result.errors || 0}`);
      loadVendorProducts();
      loadSummary();
    } catch (err) {
      console.error('Error syncing products:', err);
      alert(err.response?.data?.detail || '❌ Error al sincronizar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadVendorProducts();
    loadSummary();
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-300',
      inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      suspended: 'bg-red-100 text-red-800 border-red-300',
      out_of_stock: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };

    const labels = {
      active: '✅ Activo',
      inactive: '⏸️ Inactivo',
      suspended: '🚫 Suspendido',
      out_of_stock: '📦 Sin Stock'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getProductTypeBadge = (type) => {
    // type es INTEGER: 1=bundle/paquete, 2=topup/recarga
    const styles = {
      1: 'bg-purple-100 text-purple-800',
      2: 'bg-blue-100 text-blue-800'
    };

    const labels = {
      1: '📦 Paquete',
      2: '📱 TopUp'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {labels[type] || `Tipo ${type}`}
      </span>
    );
  };

  const getAmountDisplay = (product) => {
    // Convertir a número porque BD devuelve strings
    const parseAmount = (val) => {
      if (!val) return '0.00';
      const num = parseFloat(val);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    if (product.vp_amount_type === 'range') {
      return `${parseAmount(product.vp_minimum_amount)} - ${parseAmount(product.vp_maximum_amount)}`;
    } else if (product.vp_amount_type === 'fixed') {
      return parseAmount(product.vp_amount);
    } else {
      return 'Variable';
    }
  };

  const filteredProducts = vendorProducts.filter(product => {
    if (filters.search && filters.search.trim()) {
      const search = filters.search.toLowerCase();
      return (
        product.vp_code?.toLowerCase().includes(search) ||
        product.vp_name?.toLowerCase().includes(search) ||
        product.vendor_code?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            📦 Productos de Vendors
          </h2>
          <p className="text-gray-600 mt-1">Gestión de productos disponibles de proveedores externos</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Cards de resumen */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Productos</p>
                <p className="text-2xl font-bold text-blue-900">{summary.total_products || 0}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Activos</p>
                <p className="text-2xl font-bold text-green-900">{summary.active_products || 0}</p>
              </div>
              <Shield className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Inactivos</p>
                <p className="text-2xl font-bold text-purple-900">{summary.inactive_products || 0}</p>
              </div>
              <Tag className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 font-medium">Vendors</p>
                <p className="text-2xl font-bold text-cyan-900">
                  {summary.products_by_vendor ? Object.keys(summary.products_by_vendor).length : 0}
                </p>
              </div>
              <DollarSign className="text-cyan-500" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <select
              value={filters.vendor_code}
              onChange={(e) => setFilters({ ...filters, vendor_code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los vendors</option>
              {vendors.map(vendor => (
                <option key={vendor.vendor_code} value={vendor.vendor_code}>
                  {vendor.vendor_name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.vp_status}
              onChange={(e) => setFilters({ ...filters, vp_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="suspended">Suspendidos</option>
              <option value="out_of_stock">Sin Stock</option>
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Producto
            </label>
            <select
              value={filters.vp_product_type}
              onChange={(e) => setFilters({ ...filters, vp_product_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="1">📦 Bundle / Paquete</option>
              <option value="2">📱 TopUp / Recarga</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Código o nombre..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <span className="ml-3 text-gray-600">Cargando productos...</span>
        </div>
      )}

      {/* Tabla de productos */}
      {!loading && filteredProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Operador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.vp_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {product.vp_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{product.vp_name}</div>
                      {product.vp_skuid && (
                        <div className="text-xs text-gray-500">SKU: {product.vp_skuid}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 font-medium">{product.vendor_code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {product.vp_operator || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getProductTypeBadge(product.vp_product_type)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {getAmountDisplay(product)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.vp_currency || 'PEN'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(product.vp_status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        {userRole === 'superadmin' && (
                          <button
                            onClick={() => handleDelete(product.vp_id, product.vp_code)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay productos de vendors
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.vendor_code || filters.vp_status !== 'all' || filters.vp_product_type || filters.search
              ? 'No se encontraron productos con los filtros aplicados'
              : 'Comienza agregando productos de vendors'}
          </p>
          {!filters.vendor_code && filters.vp_status === 'all' && !filters.vp_product_type && !filters.search && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Crear Primer Producto
            </button>
          )}
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <VendorProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={handleFormSuccess}
          vendors={vendors}
        />
      )}
    </div>
  );
};

export default VendorProductsTab;