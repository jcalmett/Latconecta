import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, RefreshCw, Filter } from 'lucide-react';
import vendorProductsService from '../../services/vendorProductsService';
import vendorsService from '../../services/vendorsService';
import VendorProductForm from './VendorProductForm';

const VendorProductsTab = () => {
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendorProduct, setEditingVendorProduct] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    vendor: 'all',
    country: 'all',
    status: 'all',
    searchTerm: ''
  });

  // Cargar vendor products
  const loadVendorProducts = async () => {
    try {
      setLoading(true);
      const data = await vendorProductsService.getAll();
      console.log('[VendorProductsTab] Data received:', data);
      console.log('[VendorProductsTab] Type:', typeof data);
      console.log('[VendorProductsTab] Is array?', Array.isArray(data));
      
      // Asegurar que sea un array
      if (Array.isArray(data)) {
        setVendorProducts(data);
      } else if (data && data.vendor_products) {
        // Si viene en un objeto con propiedad vendor_products
        setVendorProducts(data.vendor_products);
      } else if (data && data.data) {
        // Si viene en un objeto con propiedad data
        setVendorProducts(data.data);
      } else {
        console.error('[VendorProductsTab] Data is not an array:', data);
        setVendorProducts([]);
      }
    } catch (error) {
      console.error('Error loading vendor products:', error);
      alert('Error al cargar vendor products');
      setVendorProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar vendors para el filtro
  const loadVendors = async () => {
    try {
      const data = await vendorsService.getAll();
      setVendors(data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  useEffect(() => {
    loadVendorProducts();
    loadVendors();
  }, []);

  // Crear nuevo vendor product
  const handleCreate = () => {
    setEditingVendorProduct(null);
    setShowForm(true);
  };

  // Editar vendor product
  const handleEdit = (vendorProduct) => {
    setEditingVendorProduct(vendorProduct);
    setShowForm(true);
  };

  // ✅ ELIMINAR vendor product
  const handleDelete = async (vendorProduct) => {
    const confirmMessage = `¿Está seguro de eliminar este Vendor Product?

Vendor: ${vendorProduct.vendor_code}
Código: ${vendorProduct.vp_code}
Nombre: ${vendorProduct.vp_name || 'N/A'}
SKU: ${vendorProduct.vp_skuid}

Esta acción no se puede deshacer.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await vendorProductsService.delete(vendorProduct.vp_id);
      alert('✅ Vendor Product eliminado correctamente');
      loadVendorProducts(); // Recargar lista
    } catch (error) {
      console.error('Error deleting vendor product:', error);
      
      if (error.response?.data?.detail) {
        alert(`⛔ Error: ${error.response.data.detail}`);
      } else {
        alert(`⛔ Error al eliminar: ${error.message}`);
      }
    }
  };

  // Filtrar vendor products
  const filteredVendorProducts = (Array.isArray(vendorProducts) ? vendorProducts : []).filter(vp => {
    const matchVendor = filters.vendor === 'all' || vp.vendor_code === filters.vendor;
    const matchCountry = filters.country === 'all' || vp.vp_country === filters.country;
    const matchStatus = filters.status === 'all' || vp.vp_status === filters.status;
    const matchSearch = !filters.searchTerm || 
      vp.vp_code?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      vp.vp_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      vp.vp_skuid?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    return matchVendor && matchCountry && matchStatus && matchSearch;
  });

  // Obtener países únicos para filtro
  const uniqueCountries = [...new Set((Array.isArray(vendorProducts) ? vendorProducts : []).map(vp => vp.vp_country).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Products</h2>
          <p className="text-gray-600 mt-1">
            Gestiona los productos disponibles en los vendors
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Crear Vendor Product
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <select
              value={filters.vendor}
              onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los vendors</option>
              {vendors.map(v => (
                <option key={v.vendor_code} value={v.vendor_code}>
                  {v.vendor_name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro País */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los países</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Código, nombre, SKU..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contador */}
        <div className="mt-3 text-sm text-gray-600">
          Mostrando {filteredVendorProducts.length} de {Array.isArray(vendorProducts) ? vendorProducts.length : 0} vendor products
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-gray-600">Cargando vendor products...</span>
          </div>
        ) : filteredVendorProducts.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-600">No se encontraron vendor products</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  País
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operador
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendorProducts.map((vp) => (
                <tr key={vp.vp_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vp.vendor_code}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vp.vp_code}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vp.vp_skuid}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {vp.vp_name || 'Sin nombre'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vp.vp_country || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vp.vp_operator || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vp.vp_currency} {vp.vp_amount || '0.00'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      vp.vp_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vp.vp_status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón Editar */}
                      <button
                        onClick={() => handleEdit(vp)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Vendor Product"
                      >
                        <Edit size={18} />
                      </button>
                      
                      {/* ✅ Botón Eliminar */}
                      <button
                        onClick={() => handleDelete(vp)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar Vendor Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <VendorProductForm
          vendorProduct={editingVendorProduct}
          onClose={() => {
            setShowForm(false);
            setEditingVendorProduct(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingVendorProduct(null);
            loadVendorProducts();
          }}
        />
      )}
    </div>
  );
};

export default VendorProductsTab;