import React, { useState, useEffect, memo } from "react";
import { Edit2, Trash2, Upload, Plus, X } from "lucide-react";
import productsService from "../../services/productsService";
import companiesService from "../../services/companiesService";
import countriesService from "../../services/countriesService";
import servicesService from "../../services/servicesService";
import vendorProductsService from "../../services/vendorProductsService";
import { getImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelper";

const ProductsTab = ({
  formData,
  setFormData,
  products,
  setProducts,
  services,
  loadingProducts,
  setLoadingProducts,
  showForm,
  setShowForm,
  editingItem,
  setEditingItem,
  handleImageUpload,
  showNotification,
  calculateTotalPrice,
  setConfirmDialog,
  loadProducts,
}) => {
  // ==================== ESTADOS ====================
  const [countries, setCountries] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [formServices, setFormServices] = useState([]);
  const [formCompanies, setFormCompanies] = useState([]);

  // ==================== NUEVO: TABS Y VENDORPRODUCT ====================
  const [activeTab, setActiveTab] = useState('producto');
  const [vendorProductData, setVendorProductData] = useState(null);
  const [loadingVendorProduct, setLoadingVendorProduct] = useState(false);

  // ==================== CARGAR DATOS INICIALES ====================
  useEffect(() => {
    loadCountries();
    loadAllServices();
    loadCompanies();
  }, []);

  const loadCountries = async () => {
    try {
      const data = await countriesService.getAll();
      setCountries(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Error cargando países:', error);
      showNotification('Error al cargar países', 'error');
    }
  };

  const loadAllServices = async () => {
    try {
      const data = await servicesService.getAll();
      setAllServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      showNotification('Error al cargar servicios', 'error');
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companiesService.getAll();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando compañías:', error);
      showNotification('Error al cargar compañías', 'error');
    }
  };

  // ==================== FILTROS CASCADA (VISUALIZACIÓN) ====================
  useEffect(() => {
    setFilterService('');
    setFilterCompany('');
    if (filterCountry) {
      const servicesInCountry = companies
        .filter(c => c.country_id === parseInt(filterCountry))
        .map(c => c.service_id);
      const uniqueServices = [...new Set(servicesInCountry)];
      setFilteredServices(allServices.filter(s => uniqueServices.includes(s.service_id)));
    } else {
      setFilteredServices(allServices);
    }
  }, [filterCountry, companies, allServices]);

  useEffect(() => {
    setFilterCompany('');
    if (filterService) {
      let filtered = companies.filter(c => c.service_id === parseInt(filterService));
      if (filterCountry) {
        filtered = filtered.filter(c => c.country_id === parseInt(filterCountry));
      }
      setFilteredCompanies(filtered);
    } else if (filterCountry) {
      setFilteredCompanies(companies.filter(c => c.country_id === parseInt(filterCountry)));
    } else {
      setFilteredCompanies(companies);
    }
  }, [filterService, filterCountry, companies]);

  // ==================== FILTROS CASCADA (FORMULARIO) ====================
  useEffect(() => {
    if (formData.country_id) {
      const servicesInCountry = companies
        .filter(c => c.country_id === parseInt(formData.country_id))
        .map(c => c.service_id);
      const uniqueServices = [...new Set(servicesInCountry)];
      setFormServices(allServices.filter(s => uniqueServices.includes(s.service_id)));
      if (formData.service_id && !uniqueServices.includes(formData.service_id)) {
        setFormData({ ...formData, service_id: '', company_id: '' });
      }
    } else {
      setFormServices([]);
      setFormData({ ...formData, service_id: '', company_id: '' });
    }
  }, [formData.country_id, companies, allServices]);

  useEffect(() => {
    if (formData.country_id && formData.service_id) {
      const filtered = companies.filter(
        c => c.country_id === parseInt(formData.country_id) && c.service_id === parseInt(formData.service_id)
      );
      setFormCompanies(filtered);
      if (formData.company_id && !filtered.find(c => c.company_id === formData.company_id)) {
        setFormData({ ...formData, company_id: '' });
      }
    } else {
      setFormCompanies([]);
      if (formData.company_id) {
        setFormData({ ...formData, company_id: '' });
      }
    }
  }, [formData.country_id, formData.service_id, companies]);

  // ==================== CARGAR EN MODO EDICIÓN ====================
  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        product_amount_type: editingItem.product_amount_type || 'F',  // ✅ AGREGAR ESTA LÍNEA
        product_base_price: parseFloat(editingItem.product_base_price || 0),
        product_base_price_max: parseFloat(editingItem.product_base_price_max || 0),
        product_discount_percentage: parseFloat(editingItem.product_discount_percentage || 0),
        product_discount_amount: parseFloat(editingItem.product_discount_amount || 0),
        product_fee: parseFloat(editingItem.product_fee || 0),
        product_total_price: parseFloat(editingItem.product_total_price || 0),
      });
    }
  }, [editingItem]);

  // ==================== CARGAR VENDORPRODUCT AUTOMÁTICAMENTE ====================

  // ==================== CARGAR VENDORPRODUCT AUTOMÁTICAMENTE (MEJORADO) ====================
  useEffect(() => {
    if (formData.product_vendpro_skuid && activeTab === 'vendorproduct') {
      loadVendorProductData();
    }
  }, [formData.product_vendpro_skuid, formData.product_vendor_code, formData.product_vendpro_code, activeTab]);

  const loadVendorProductData = async () => {
    // Validar que tenemos los 3 campos
    if (!formData.product_vendor_code || !formData.product_vendpro_code || !formData.product_vendpro_skuid) {
      setVendorProductData(null);
      console.log('⚠️ Faltan campos para buscar VendorProduct:', {
        vendor_code: formData.product_vendor_code || '❌',
        vp_code: formData.product_vendpro_code || '❌',
        vp_skuid: formData.product_vendpro_skuid || '❌'
      });
      return;
    }

    setLoadingVendorProduct(true);
    console.log('🔍 Buscando VendorProduct con:', {
      vendor_code: formData.product_vendor_code,
      vp_code: formData.product_vendpro_code,
      vp_skuid: formData.product_vendpro_skuid
    });

    try {
      const response = await vendorProductsService.getAll();
      console.log(`📦 VendorProducts disponibles: ${response.length}`);
      
      // ✅ BUSCAR POR LOS 3 CAMPOS (normalizados)
      const vendorProduct = response.find(vp => {
        const matchVendor = vp.vendor_code?.trim().toUpperCase() === formData.product_vendor_code?.trim().toUpperCase();
        const matchCode = vp.vp_code?.trim().toUpperCase() === formData.product_vendpro_code?.trim().toUpperCase();
        const matchSKU = vp.vp_skuid?.trim().toUpperCase() === formData.product_vendpro_skuid?.trim().toUpperCase();
        
        console.log(`🔎 Comparando con ${vp.vp_skuid}:`, {
          vendor: `${vp.vendor_code} === ${formData.product_vendor_code} → ${matchVendor ? '✅' : '❌'}`,
          code: `${vp.vp_code} === ${formData.product_vendpro_code} → ${matchCode ? '✅' : '❌'}`,
          sku: `${vp.vp_skuid} === ${formData.product_vendpro_skuid} → ${matchSKU ? '✅' : '❌'}`
        });

        return matchVendor && matchCode && matchSKU;
      });

      if (vendorProduct) {
        console.log('✅ VendorProduct encontrado:', vendorProduct);
        setVendorProductData(vendorProduct);
        showNotification(`VendorProduct encontrado: ${vendorProduct.vp_name || vendorProduct.vp_skuid}`, 'success');
      } else {
        console.log('❌ No se encontró VendorProduct con esos datos');
        setVendorProductData(null);
        showNotification(`No se encontró VendorProduct con:
        • Vendor: ${formData.product_vendor_code}
        • Code: ${formData.product_vendpro_code}  
        • SKU: ${formData.product_vendpro_skuid}`, 'warning');
      }
    } catch (error) {
      console.error('❌ Error cargando VendorProduct:', error);
      setVendorProductData(null);
      showNotification('Error al cargar datos del VendorProduct', 'error');
    } finally {
      setLoadingVendorProduct(false);
    }
  };

  // ==================== FUNCIONES AUXILIARES ====================
  const updatePrices = (base, discount, fee) => {
    const total = calculateTotalPrice(base, discount, fee);
    const discountAmount = (parseFloat(base) * parseFloat(discount)) / 100;
    return {
      product_total_price: parseFloat(total),
      product_discount_amount: discountAmount.toFixed(2),
    };
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setActiveTab('producto');
    setVendorProductData(null);
  };

  const getCountryName = (countryId) => {
    const country = countries.find(c => c.country_id === countryId);
    return country ? country.country_name : 'N/A';
  };

  const getServiceName = (serviceId) => {
    const service = allServices.find(s => s.service_id === serviceId);
    return service ? service.service_name : 'N/A';
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.company_id === companyId);
    return company ? company.company_name : 'N/A';
  };

  const getPriceDisplay = (product) => {
    if (product.product_amount_type === 'R') {
      return `$${parseFloat(product.product_base_price || 0).toFixed(2)} - $${parseFloat(product.product_base_price_max || 0).toFixed(2)}`;
    } else if (product.product_amount_type === 'V') {
      return 'Variable';
    } else {
      return `$${parseFloat(product.product_base_price || 0).toFixed(2)}`;
    }
  };

  // ==================== GUARDAR PRODUCTO ====================
  const handleSave = async () => {
    try {
      if (!formData.product_code || !formData.product_name) {
        showNotification("Complete los campos obligatorios", "error");
        return;
      }

      if (!formData.country_id || !formData.service_id || !formData.company_id) {
        showNotification("Seleccione País, Servicio y Compañía", "error");
        return;
      }

      if (!formData.product_vendpro_code || !formData.product_vendpro_skuid) {
        showNotification("Complete los códigos de VendorProduct", "error");
        return;
      }

      if (!formData.product_amount_type) {
        showNotification("Seleccione el Tipo de Monto", "error");
        return;
      }

      if (formData.product_amount_type === 'R') {
        if (!formData.product_base_price_max || formData.product_base_price_max <= 0) {
          showNotification("Especifique el Precio Máximo para Range", "error");
          return;
        }
        if (parseFloat(formData.product_base_price_max) <= parseFloat(formData.product_base_price)) {
          showNotification("Precio Máximo debe ser mayor al Precio Base", "error");
          return;
        }
      }

      // ✅ SOLO ENVIAR CAMPOS DE LA TABLA PRODUCTS
      const dataToSend = {
        country_id: parseInt(formData.country_id),
        service_id: parseInt(formData.service_id),
        company_id: parseInt(formData.company_id),
        product_code: formData.product_code,
        product_name: formData.product_name,
        product_description: formData.product_description,
        product_photo: formData.product_photo,
        product_currency: formData.product_currency,
        product_amount_type: formData.product_amount_type,
        product_base_price: parseFloat(formData.product_base_price),
        product_base_price_max: formData.product_amount_type === 'R' 
          ? parseFloat(formData.product_base_price_max)
          : null,
        product_discount_percentage: parseFloat(formData.product_discount_percentage),
        product_discount_amount: parseFloat(formData.product_discount_amount),
        product_fee: parseFloat(formData.product_fee),
        product_total_price: parseFloat(formData.product_total_price),
        product_status: formData.product_status,
        product_vendor_code: formData.product_vendor_code,
        product_vendpro_code: formData.product_vendpro_code,
        product_vendpro_skuid: formData.product_vendpro_skuid,
      };

      if (editingItem) {
        await productsService.update(editingItem.product_id, dataToSend);
        showNotification(`Producto "${formData.product_name}" actualizado`);
      } else {
        await productsService.create(dataToSend);
        showNotification(`Producto "${formData.product_name}" creado`);
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      console.error("Error al guardar:", error);
      showNotification(error.response?.data?.detail || "Error al guardar", "error");
    }
  };

  const handleDelete = (product) => {
    setConfirmDialog({
      show: true,
      title: "Eliminar Producto",
      message: `¿Eliminar "${product.product_name}"?`,
      onConfirm: async () => {
        try {
          await productsService.delete(product.product_id);
          showNotification(`Producto "${product.product_name}" eliminado`);
          await loadProducts();
        } catch (error) {
          showNotification("Error al eliminar", "error");
        }
      },
    });
  };

  // ==================== PRODUCTOS FILTRADOS ====================
  const filteredProducts = products.filter((product) => {
    if (filterCountry && product.country_id !== parseInt(filterCountry)) return false;
    if (filterService && product.service_id !== parseInt(filterService)) return false;
    if (filterCompany && product.company_id !== parseInt(filterCompany)) return false;
    if (filterStatus && product.product_status !== filterStatus) return false;
    return true;
  });

  // ==================== RENDER ====================
  return (
    <div>
      {loadingProducts && (
        <div className="text-center py-4 mb-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#008C96]"></div>
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      )}

      {/* HEADER */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#008C96]">Gestión de Productos</h2>
          <button
            onClick={() => {
              setFormData({
                country_id: '',
                service_id: '',
                company_id: '',
                product_code: "",
                product_name: "",
                product_description: "",
                product_photo: "",
                product_currency: "PEN",
                product_amount_type: "F",
                product_base_price: 0,
                product_base_price_max: 0,
                product_discount_percentage: 0,
                product_discount_amount: 0,
                product_fee: 0,
                product_total_price: 0,
                product_status: "active",
                product_vendor_code: "",
                product_vendpro_code: "",
                product_vendpro_skuid: "",
              });
              setShowForm(true);
              setActiveTab('producto');
            }}
            className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2 font-semibold"
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#FFE709]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">1. País:</label>
              <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Todos</option>
                {countries.map((c) => (
                  <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">2. Servicio:</label>
              <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Todos</option>
                {filteredServices.map((s) => (
                  <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">3. Compañía:</label>
              <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Todas</option>
                {filteredCompanies.map((c) => (
                  <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">4. Estado:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
          {(filterCountry || filterService || filterCompany) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilterCountry('');
                  setFilterService('');
                  setFilterCompany('');
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#008C96] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">País</th>
                <th className="px-4 py-3 text-left">Servicio</th>
                <th className="px-4 py-3 text-left">Compañía</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    {loadingProducts ? 'Cargando...' : 'No hay productos'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{product.product_code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl(product.product_photo, "product")}
                          alt={product.product_name}
                          onError={(e) => (e.target.src = FALLBACK_IMAGES.product)}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-semibold">{product.product_name}</div>
                          <div className="text-xs text-gray-500">{product.product_description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{getCountryName(product.country_id)}</td>
                    <td className="px-4 py-3 text-sm">{getServiceName(product.service_id)}</td>
                    <td className="px-4 py-3 text-sm">{getCompanyName(product.company_id)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        product.product_amount_type === 'F' ? 'bg-blue-100 text-blue-700' :
                        product.product_amount_type === 'R' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {product.product_amount_type === 'F' ? 'Fixed' :
                         product.product_amount_type === 'R' ? 'Range' : 'Variable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{getPriceDisplay(product)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.product_status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {product.product_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => { setEditingItem(product); setShowForm(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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

      {/* FORMULARIO MODAL CON TABS */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#008C96]">
                {editingItem ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* TABS NAVIGATION */}
            <div className="border-b px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('producto')}
                  className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                    activeTab === 'producto'
                      ? 'border-[#008C96] text-[#008C96]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📦 Datos del Producto
                </button>
                <button
                  onClick={() => setActiveTab('vendorproduct')}
                  disabled={!formData.product_vendpro_skuid}
                  className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                    activeTab === 'vendorproduct'
                      ? 'border-[#FFE709] text-[#008C96]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  } ${!formData.product_vendpro_skuid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  🏪 Datos VendorProduct (Read-Only)
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* TAB 1: DATOS DEL PRODUCTO */}
              {activeTab === 'producto' && (
                <div className="space-y-3">
                  {/* SELECTOR JERÁRQUICO */}
                  <div className="bg-yellow-50 border-2 border-[#FFE709] rounded-lg p-3">
                    <h4 className="font-bold text-[#008C96] mb-3">Ubicación (Obligatorio)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">1. País *</label>
                        <select
                          value={formData.country_id}
                          onChange={(e) => setFormData({ ...formData, country_id: e.target.value, service_id: '', company_id: '' })}
                          className="w-full px-4 py-1.5 border rounded-lg"
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {countries.map((c) => (
                            <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">2. Servicio *</label>
                        <select
                          value={formData.service_id}
                          onChange={(e) => setFormData({ ...formData, service_id: e.target.value, company_id: '' })}
                          className="w-full px-4 py-1.5 border rounded-lg"
                          disabled={!formData.country_id}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {formServices.map((s) => (
                            <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">3. Compañía *</label>
                        <select
                          value={formData.company_id}
                          onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                          className="w-full px-4 py-1.5 border rounded-lg"
                          disabled={!formData.service_id}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {formCompanies.map((c) => (
                            <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* FORMULARIO EN 3 COLUMNAS */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* COLUMNA 1: DATOS BÁSICOS */}
                    <div className="space-y-2">
                      <div className="pb-1 border-b-2 border-[#008C96]">
                        <h4 className="font-bold text-[#008C96]">Datos Básicos</h4>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Código *</label>
                        <input
                          type="text"
                          value={formData.product_code}
                          onChange={(e) => setFormData({ ...formData, product_code: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-1.5 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre *</label>
                        <input
                          type="text"
                          value={formData.product_name}
                          onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                          className="w-full px-4 py-1.5 border rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                          value={formData.product_description}
                          onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                          className="w-full px-4 py-1.5 border rounded-lg"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Foto</label>
                        <div className="border-2 border-dashed rounded-lg p-2 bg-gray-50">
                          {formData.product_photo ? (
                            <div className="relative">
                              <img
                                src={getImageUrl(formData.product_photo, "product")}
                                alt="Preview"
                                onError={(e) => (e.target.src = FALLBACK_IMAGES.product)}
                                className="w-full h-40 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, product_photo: "" })}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                              <Upload size={32} />
                              <p className="text-xs mt-2">300x300px</p>
                            </div>
                          )}
                          <label className="mt-2 cursor-pointer bg-[#008C96] text-white px-4 py-2 rounded-lg flex items-center justify-center">
                            <Upload size={16} className="mr-2" />
                            Subir
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, (url) => setFormData(prev => ({ ...prev, product_photo: url })), "products")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Estado *</label>
                        <select
                          value={formData.product_status}
                          onChange={(e) => setFormData({ ...formData, product_status: e.target.value })}
                          className="w-full px-4 py-1.5 border rounded-lg"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* COLUMNA 2: PRECIOS */}
                    <div className="space-y-2">
                      <div className="pb-1 border-b-2 border-[#008C96]">
                        <h4 className="font-bold text-[#008C96]">Precios y Fees</h4>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Moneda *</label>
                        <select
                          value={formData.product_currency}
                          onChange={(e) => setFormData({ ...formData, product_currency: e.target.value })}
                          className="w-full px-4 py-1.5 border rounded-lg"
                        >
                          <option value="PEN">PEN - Soles</option>
                          <option value="USD">USD - Dólares</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Monto *</label>
                        <select
                          value={formData.product_amount_type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setFormData({
                              ...formData,
                              product_amount_type: newType,
                              product_base_price_max: newType === 'F' ? 0 : formData.product_base_price_max
                            });
                          }}
                          className="w-full px-4 py-1.5 border rounded-lg"
                        >
                          <option value="F">F - Fixed</option>
                          <option value="R">R - Range</option>
                          <option value="V">V - Variable</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Precio Base * {formData.product_amount_type === 'R' && '(Mínimo)'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.product_base_price}
                          onChange={(e) => {
                            const newBase = parseFloat(e.target.value) || 0;
                            const prices = updatePrices(newBase, formData.product_discount_percentage, formData.product_fee);
                            setFormData({ ...formData, product_base_price: newBase, ...prices });
                          }}
                          className="w-full px-4 py-1.5 border rounded-lg"
                          required
                        />
                      </div>

                      {formData.product_amount_type === 'R' && (
                        <div className="bg-green-50 p-3 rounded-lg border-2 border-green-300">
                          <label className="block text-sm font-medium mb-1">Precio Máximo *</label>
                          <input
                            type="number"
                            step="0.01"
                            min={formData.product_base_price}
                            value={formData.product_base_price_max}
                            onChange={(e) => setFormData({ ...formData, product_base_price_max: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-1.5 border rounded-lg"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Debe ser mayor a ${formData.product_base_price}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1">Descuento %</label>
                        <input
                          type="number"
                          step="0.1"
                          max="100"
                          value={formData.product_discount_percentage}
                          onChange={(e) => {
                            let newDiscount = parseFloat(e.target.value) || 0;
                            if (newDiscount > 100) newDiscount = 100;
                            const prices = updatePrices(formData.product_base_price, newDiscount, formData.product_fee);
                            setFormData({ ...formData, product_discount_percentage: newDiscount, ...prices });
                          }}
                          className="w-full px-4 py-1.5 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Monto Descuento (auto)</label>
                        <input
                          type="text"
                          value={`$${parseFloat(formData.product_discount_amount || 0).toFixed(2)}`}
                          className="w-full px-4 py-1.5 border rounded-lg bg-gray-100"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Fee</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.product_fee}
                          onChange={(e) => {
                            const newFee = parseFloat(e.target.value) || 0;
                            const prices = updatePrices(formData.product_base_price, formData.product_discount_percentage, newFee);
                            setFormData({ ...formData, product_fee: newFee, ...prices });
                          }}
                          className="w-full px-4 py-1.5 border rounded-lg"
                        />
                      </div>

                      <div className="bg-[#FFE709] bg-opacity-20 p-4 rounded-lg border-2 border-[#FFE709]">
                        <label className="block text-sm font-medium mb-1">Precio Total (auto)</label>
                        <div className="text-2xl font-bold text-[#008C96]">
                          ${parseFloat(formData.product_total_price || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA 3: CÓDIGOS VENDOR (SOLO 3 CAMPOS) */}
                    {/* COLUMNA 3: CÓDIGOS VENDOR (MEJORADO) */}
                    <div className="space-y-2">
                      <div className="pb-1 border-b-2 border-[#008C96]">
                        <h4 className="font-bold text-[#008C96]">Códigos Vendor</h4>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Vendor Code *</label>
                        <input
                          type="text"
                          value={formData.product_vendor_code}
                          onChange={(e) => setFormData({ ...formData, product_vendor_code: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-1.5 border rounded-lg font-mono"
                          placeholder="DTONE, LATCOM, MOCK_DTONE..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">VendPro Code *</label>
                        <input
                          type="text"
                          value={formData.product_vendpro_code}
                          onChange={(e) => setFormData({ ...formData, product_vendpro_code: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-1.5 border rounded-lg font-mono"
                          placeholder="CODIGO 031, BITEL_50..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">VendPro SKU ID *</label>
                        <input
                          type="text"
                          value={formData.product_vendpro_skuid}
                          onChange={(e) => setFormData({ ...formData, product_vendpro_skuid: e.target.value })}
                          className="w-full px-4 py-1.5 border rounded-lg font-mono"
                          placeholder="SKU_12323, PE_BITEL_50_SKU..."
                          required
                        />
                      </div>

                      {/* BOTÓN DE BÚSQUEDA MANUAL */}
                      <button
                        type="button"
                        onClick={loadVendorProductData}
                        disabled={!formData.product_vendor_code || !formData.product_vendpro_code || !formData.product_vendpro_skuid || loadingVendorProduct}
                        className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
                          loadingVendorProduct
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : (!formData.product_vendor_code || !formData.product_vendpro_code || !formData.product_vendpro_skuid)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#FFE709] text-[#008C96] hover:bg-[#E6D008]'
                        }`}
                      >
                        {loadingVendorProduct ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#008C96]"></div>
                            <span>Buscando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>Buscar VendorProduct</span>
                          </>
                        )}
                      </button>

                      {/* FEEDBACK VISUAL */}
                      {formData.product_vendor_code && formData.product_vendpro_code && formData.product_vendpro_skuid && (
                        <div className={`p-4 rounded-lg border-2 ${
                          vendorProductData 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-gray-50 border-gray-300'
                        }`}>
                          {vendorProductData ? (
                            <>
                              <div className="flex items-center space-x-2 text-green-700 mb-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold">¡Encontrado!</span>
                              </div>
                              <div className="text-sm space-y-1">
                                <div className="font-semibold text-gray-800">{vendorProductData.vp_name || 'Sin nombre'}</div>
                                <div className="text-gray-600">
                                  {vendorProductData.vp_country} | {vendorProductData.vp_operator}
                                </div>
                                <div className="text-gray-600">
                                  Monto: ${parseFloat(vendorProductData.vp_amount || 0).toFixed(2)} {vendorProductData.vp_currency}
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-green-200">
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('vendorproduct')}
                                  className="text-xs text-green-700 hover:text-green-800 font-semibold flex items-center space-x-1"
                                >
                                  <span>👉 Ver detalles completos en Tab 2</span>
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold">Pendiente</span>
                              </div>
                              <p className="text-xs text-gray-600">
                                Ingresa los 3 códigos y presiona "Buscar" para validar.
                              </p>
                            </>
                          )}
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Información:</strong><br/>
                          Estos 3 códigos conectan el producto con el sistema Vendor.<br/><br/>
                          Los datos completos del VendorProduct (país, operador, tipo, montos, etc.) se visualizan en el <strong>Tab 2</strong> automáticamente.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: DATOS VENDORPRODUCT (READ-ONLY) */}
              {/* TAB 2: DATOS VENDORPRODUCT (3 COLUMNAS COMPACTAS) */}
              {activeTab === 'vendorproduct' && (
                <div className="space-y-4">
                  {loadingVendorProduct ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#008C96]"></div>
                      <p className="mt-4 text-gray-600">Cargando datos VendorProduct...</p>
                    </div>
                  ) : vendorProductData ? (
                    <div className="bg-gray-50 rounded-lg p-4">  {/* ✅ ANTES: p-6 */}
                      <div className="bg-white rounded-lg p-3 mb-3 border-l-4 border-[#FFE709]">  {/* ✅ ANTES: p-4 mb-4 */}
                        <h4 className="font-bold text-[#008C96] mb-1">🔒 Datos en Solo Lectura</h4>  {/* ✅ ANTES: mb-2 */}
                        <p className="text-sm text-gray-600">
                          Esta información proviene del VendorProduct asociado (SKU: <strong>{formData.product_vendpro_skuid}</strong>) y no puede ser editada desde aquí.
                        </p>
                      </div>

                      {/* ✅ 3 COLUMNAS EN VEZ DE 2 */}
                      <div className="grid grid-cols-3 gap-4">  {/* ✅ ANTES: grid-cols-2 gap-6 */}
                        
                        {/* COLUMNA 1: INFORMACIÓN GENERAL */}
                        <div className="space-y-2">  {/* ✅ ANTES: space-y-3 */}
                          <h5 className="font-bold text-gray-700 border-b pb-1 text-sm">Información General</h5>  {/* ✅ ANTES: pb-2 */}
                          
                          <div>
                            <label className="text-xs text-gray-500">Vendor Code</label>
                            <div className="font-mono bg-gray-100 p-1.5 rounded text-sm">{vendorProductData.vendor_code || 'N/A'}</div>  {/* ✅ ANTES: p-2 */}
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">VendPro Code</label>
                            <div className="font-mono bg-gray-100 p-1.5 rounded text-sm">{vendorProductData.vp_code || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">SKU ID</label>
                            <div className="font-mono bg-gray-100 p-1.5 rounded text-sm">{vendorProductData.vp_skuid}</div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">País</label>
                            <div className="bg-gray-100 p-1.5 rounded text-sm">{vendorProductData.vp_country}</div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Operador</label>
                            <div className="bg-gray-100 p-1.5 rounded text-sm">{vendorProductData.vp_operator}</div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Tipo de Producto</label>
                            <div className="bg-gray-100 p-1.5 rounded text-sm">{vendorProductData.vp_product_type}</div>
                          </div>
                        </div>

                        {/* COLUMNA 2: PRECIOS Y MONTOS */}
                        <div className="space-y-2">
                          <h5 className="font-bold text-gray-700 border-b pb-1 text-sm">Precios y Montos</h5>
                          
                          <div>
                            <label className="text-xs text-gray-500">Moneda</label>
                            <div className="bg-gray-100 p-1.5 rounded text-sm">{vendorProductData.vp_currency}</div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Tipo de Monto</label>
                            <div className="bg-gray-100 p-1.5 rounded">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                vendorProductData.vp_amount_type === 'F' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {vendorProductData.vp_amount_type === 'F' ? 'Fixed (Fijo)' : 'Range (Rango)'}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Monto {vendorProductData.vp_amount_type === 'R' ? '(Base)' : ''}</label>
                            <div className="bg-gray-100 p-1.5 rounded font-semibold text-sm">
                              ${parseFloat(vendorProductData.vp_amount || 0).toFixed(2)}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Monto Mínimo</label>
                            <div className="bg-gray-100 p-1.5 rounded font-semibold text-sm">
                              ${parseFloat(vendorProductData.vp_minimum_amount || 0).toFixed(2)}
                            </div>
                          </div>
                          
                          {vendorProductData.vp_amount_type === 'R' && (
                            <div>
                              <label className="text-xs text-gray-500">Monto Máximo</label>
                              <div className="bg-gray-100 p-1.5 rounded font-semibold text-sm">
                                ${parseFloat(vendorProductData.vp_maximum_amount || 0).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* COLUMNA 3: COMISIONES Y ESTADO */}
                        <div className="space-y-2">
                          <h5 className="font-bold text-gray-700 border-b pb-1 text-sm">Comisiones y Estado</h5>
                          
                          <div>
                            <label className="text-xs text-gray-500">Comisión %</label>
                            <div className="bg-gray-100 p-1.5 rounded font-semibold text-green-600 text-sm">
                              {parseFloat(vendorProductData.vp_commission || 0).toFixed(2)}%
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Costo</label>
                            <div className="bg-gray-100 p-1.5 rounded font-semibold text-sm">
                              ${parseFloat(vendorProductData.vp_cost || 0).toFixed(2)}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Fee USD</label>
                            <div className="bg-gray-100 p-1.5 rounded font-semibold text-sm">
                              ${parseFloat(vendorProductData.vp_fee_usd || 0).toFixed(5)}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Estado</label>
                            <div className="bg-gray-100 p-1.5 rounded">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                vendorProductData.vp_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {vendorProductData.vp_status}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-500">Nombre</label>
                            <div className="bg-gray-100 p-1.5 rounded text-sm font-medium">
                              {vendorProductData.vp_name || 'Sin nombre'}
                            </div>
                          </div>
                          
                          {vendorProductData.vp_description && (
                            <div>
                              <label className="text-xs text-gray-500">Descripción</label>
                              <div className="bg-gray-100 p-1.5 rounded text-xs text-gray-600">
                                {vendorProductData.vp_description}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">  {/* ✅ ANTES: mt-6 p-4 */}
                        <p className="text-sm text-blue-800">
                          💡 <strong>Nota:</strong> Para modificar estos datos, edita el VendorProduct correspondiente en el tab "VendorProducts" del administrador.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No se encontró VendorProduct</p>
                      <p className="text-sm text-gray-400 mt-2">
                        SKU ID: <strong>{formData.product_vendpro_skuid || '(vacío)'}</strong>
                      </p>
                      <p className="text-xs text-gray-400 mt-4">
                        Verifica que el SKU ID sea correcto y exista en VendorProducts
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BOTONES */}
            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button onClick={resetForm} className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-6 py-3 bg-[#008C96] text-white rounded-lg hover:bg-[#006B74]">
                {editingItem ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductsTab);