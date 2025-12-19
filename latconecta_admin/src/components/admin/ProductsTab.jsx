import React, { useState, useEffect, memo } from "react";
import { Edit2, Trash2, Upload, Plus, X } from "lucide-react";
import productsService from "../../services/productsService";
import companiesService from "../../services/companiesService";
import countriesService from "../../services/countriesService";
import servicesService from "../../services/servicesService";
import { getImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelper";

const ProductsTab = ({
  // Props de formulario
  formData,
  setFormData,

  // Estados necesarios
  products,
  setProducts,
  services,
  loadingProducts,
  setLoadingProducts,
  showForm,
  setShowForm,
  editingItem,
  setEditingItem,

  // Funciones necesarias
  handleImageUpload,
  showNotification,
  calculateTotalPrice,
  setConfirmDialog,
  loadProducts,
}) => {
  // ==================== ESTADOS PARA JERARQUÍA LATCONECTA ====================
  
  // Datos maestros
  const [countries, setCountries] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  // Filtros de visualización (tabla)
  const [filterCountry, setFilterCountry] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  
  // Servicios y compañías filtrados para los selectores
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);

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

  // ==================== FILTROS EN CASCADA (VISUALIZACIÓN) ====================
  
  // Cuando cambia el país, resetear servicio y compañía
  useEffect(() => {
    setFilterService('');
    setFilterCompany('');
    
    if (filterCountry) {
      // Filtrar servicios que tienen compañías en este país
      const servicesInCountry = companies
        .filter(c => c.country_id === parseInt(filterCountry))
        .map(c => c.service_id);
      
      const uniqueServices = [...new Set(servicesInCountry)];
      setFilteredServices(allServices.filter(s => uniqueServices.includes(s.service_id)));
    } else {
      setFilteredServices(allServices);
    }
  }, [filterCountry, companies, allServices]);

  // Cuando cambia el servicio, resetear compañía
  useEffect(() => {
    setFilterCompany('');
    
    if (filterService) {
      // Filtrar compañías de este servicio (y país si está seleccionado)
      let filtered = companies.filter(c => c.service_id === parseInt(filterService));
      
      if (filterCountry) {
        filtered = filtered.filter(c => c.country_id === parseInt(filterCountry));
      }
      
      setFilteredCompanies(filtered);
    } else if (filterCountry) {
      // Solo país seleccionado, mostrar todas las compañías de ese país
      setFilteredCompanies(companies.filter(c => c.country_id === parseInt(filterCountry)));
    } else {
      setFilteredCompanies(companies);
    }
  }, [filterService, filterCountry, companies]);

  // ==================== FILTROS EN CASCADA (FORMULARIO) ====================
  
  // Servicios disponibles según país seleccionado en formulario
  const [formServices, setFormServices] = useState([]);
  
  // Compañías disponibles según país + servicio en formulario
  const [formCompanies, setFormCompanies] = useState([]);

  useEffect(() => {
    if (formData.country_id) {
      // Filtrar servicios que tienen compañías en este país
      const servicesInCountry = companies
        .filter(c => c.country_id === parseInt(formData.country_id))
        .map(c => c.service_id);
      
      const uniqueServices = [...new Set(servicesInCountry)];
      setFormServices(allServices.filter(s => uniqueServices.includes(s.service_id)));
      
      // Resetear servicio si ya no está disponible
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
      // Filtrar compañías de este país + servicio
      const filtered = companies.filter(
        c => c.country_id === parseInt(formData.country_id) 
          && c.service_id === parseInt(formData.service_id)
      );
      setFormCompanies(filtered);
      
      // Resetear compañía si ya no está disponible
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

  // ==================== CARGAR DATOS EN MODO EDICIÓN ====================
  
  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        product_base_price: parseFloat(editingItem.product_base_price || 0),
        product_discount_percentage: parseFloat(editingItem.product_discount_percentage || 0),
        product_discount_amount: parseFloat(editingItem.product_discount_amount || 0),
        product_fee: parseFloat(editingItem.product_fee || 0),
        product_total_price: parseFloat(editingItem.product_total_price || 0),
        product_vendpro_amount: parseFloat(editingItem.product_vendpro_amount || 0),
        product_vendpro_maximun_amount: parseFloat(editingItem.product_vendpro_maximun_amount || 0),
        product_vendpro_comission: parseFloat(editingItem.product_vendpro_comission || 0),
      });
    }
  }, [editingItem]);

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

  // ==================== GUARDAR PRODUCTO ====================

  const handleSave = async () => {
    try {
      // Validación básica
      if (!formData.product_code || !formData.product_name) {
        showNotification("Por favor complete los campos obligatorios", "error");
        return;
      }

      // Validación Latconecta
      if (!formData.country_id || !formData.service_id || !formData.company_id) {
        showNotification("Debe seleccionar País, Servicio y Compañía", "error");
        return;
      }

      if (!formData.product_vendpro_code || !formData.product_vendpro_skuid) {
        showNotification("Por favor complete todos los campos obligatorios de VendPro", "error");
        return;
      }

      // Validación de discount_percentage
      if (formData.product_discount_percentage > 100) {
        showNotification("El descuento no puede ser mayor al 100%", "error");
        return;
      }

      // Validación de amount range
      if (
        formData.product_vendpro_amount_type === "R" &&
        parseFloat(formData.product_vendpro_maximun_amount) <= parseFloat(formData.product_vendpro_amount)
      ) {
        showNotification("El monto máximo debe ser mayor al monto mínimo", "error");
        return;
      }

      // Preparar datos para enviar al backend
      const dataToSend = {
        ...formData,
        country_id: parseInt(formData.country_id),
        service_id: parseInt(formData.service_id),
        company_id: parseInt(formData.company_id),
        product_base_price: parseFloat(formData.product_base_price),
        product_discount_percentage: parseFloat(formData.product_discount_percentage),
        product_discount_amount: parseFloat(formData.product_discount_amount),
        product_fee: parseFloat(formData.product_fee),
        product_total_price: parseFloat(formData.product_total_price),
        product_vendpro_amount: parseFloat(formData.product_vendpro_amount),
        product_vendpro_comission: formData.product_vendpro_comission
          ? parseFloat(formData.product_vendpro_comission)
          : null,
        product_vendpro_maximun_amount:
          formData.product_vendpro_amount_type === "F"
            ? null
            : parseFloat(formData.product_vendpro_maximun_amount),
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
      console.error("Error al guardar producto:", error);
      const errorMsg = error.response?.data?.detail || "Error al guardar el producto";
      showNotification(errorMsg, "error");
    }
  };

  const handleDelete = (product) => {
    setConfirmDialog({
      show: true,
      title: "Eliminar Producto",
      message: `¿Estás seguro de eliminar "${product.product_name}"?`,
      onConfirm: async () => {
        try {
          await productsService.delete(product.product_id);
          showNotification(`Producto "${product.product_name}" eliminado`);
          await loadProducts();
        } catch (error) {
          console.error("Error al eliminar producto:", error);
          showNotification("Error al eliminar el producto", "error");
        }
      },
    });
  };

  // ==================== PRODUCTOS FILTRADOS ====================
  
  const filteredProducts = products.filter((product) => {
    if (filterCountry && product.country_id !== parseInt(filterCountry)) {
      return false;
    }
    if (filterService && product.service_id !== parseInt(filterService)) {
      return false;
    }
    if (filterCompany && product.company_id !== parseInt(filterCompany)) {
      return false;
    }
    return true;
  });

  // ==================== RENDER ====================

  return (
    <div>
      {/* Indicador de loading */}
      {loadingProducts && (
        <div className="text-center py-4 mb-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#008C96]"></div>
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      )}

      {/* HEADER */}
      <div className="space-y-4 mb-6">
        {/* FILA 1: TÍTULO + BOTÓN */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#008C96]">
            Gestión de Productos
          </h2>

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
                product_base_price: 0,
                product_discount_percentage: 0,
                product_discount_amount: 0,
                product_fee: 0,
                product_total_price: 0,
                product_status: "active",
                product_vendor_code: "",
                product_vendpro_code: "Vend001",
                product_vendpro_skuid: "",
                product_vendpro_country: "",
                product_vendpro_operator: "",
                product_vendpro_currency: "PEN",
                product_vendpro_product_type: "",
                product_vendpro_amount_type: "F",
                product_vendpro_amount: 0,
                product_vendpro_maximun_amount: 0,
                product_vendpro_comission: 0,
              });
              setShowForm(true);
            }}
            className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2 font-semibold"
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {/* FILA 2: FILTROS JERÁRQUICOS EN CASCADA */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#FFE709]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro País */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                1. Filtrar por País:
              </label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              >
                <option value="">Todos los países</option>
                {countries.map((country) => (
                  <option key={country.country_id} value={country.country_id}>
                    {country.country_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Servicio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                2. Filtrar por Servicio:
              </label>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                disabled={!filterCountry && filteredServices.length === 0}
              >
                <option value="">Todos los servicios</option>
                {filteredServices.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.service_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Compañía */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                3. Filtrar por Compañía:
              </label>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                disabled={!filterService && filteredCompanies.length === 0}
              >
                <option value="">Todas las compañías</option>
                {filteredCompanies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón Limpiar Filtros */}
          {(filterCountry || filterService || filterCompany) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilterCountry('');
                  setFilterService('');
                  setFilterCompany('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
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
                <th className="px-4 py-3 text-right">Precio Base</th>
                <th className="px-4 py-3 text-right">Descuento %</th>
                <th className="px-4 py-3 text-right">Fee</th>
                <th className="px-4 py-3 text-right font-bold">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    {loadingProducts ? 'Cargando...' : 'No hay productos que coincidan con los filtros'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">
                      {product.product_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl(product.product_photo, "product")}
                          alt={product.product_name}
                          onError={(e) => (e.target.src = FALLBACK_IMAGES.product)}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-semibold text-gray-800">
                            {product.product_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.product_description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getCountryName(product.country_id)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getServiceName(product.service_id)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getCompanyName(product.company_id)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${parseFloat(product.product_base_price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {parseFloat(product.product_discount_percentage || 0).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${parseFloat(product.product_fee || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#008C96]">
                      ${parseFloat(product.product_total_price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.product_status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.product_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(product);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* FORMULARIO MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#008C96]">
                {editingItem ? "Editar Producto" : "Agregar Producto"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* SELECTOR JERÁRQUICO EN FORMULARIO */}
              <div className="bg-yellow-50 border-2 border-[#FFE709] rounded-lg p-4 mb-6">
                <h4 className="font-bold text-[#008C96] mb-4">Ubicación del Producto (Obligatorio)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* País */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1. País <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.country_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          country_id: e.target.value,
                          service_id: '',
                          company_id: ''
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      required
                    >
                      <option value="">Seleccionar país...</option>
                      {countries.map((country) => (
                        <option key={country.country_id} value={country.country_id}>
                          {country.country_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Servicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2. Servicio <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.service_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          service_id: e.target.value,
                          company_id: ''
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      disabled={!formData.country_id}
                      required
                    >
                      <option value="">Seleccionar servicio...</option>
                      {formServices.map((service) => (
                        <option key={service.service_id} value={service.service_id}>
                          {service.service_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Compañía */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3. Compañía <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.company_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_id: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      disabled={!formData.service_id}
                      required
                    >
                      <option value="">Seleccionar compañía...</option>
                      {formCompanies.map((company) => (
                        <option key={company.company_id} value={company.company_id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* FORMULARIO EN 3 COLUMNAS - RESTO DEL FORMULARIO IGUAL */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLUMNA 1: DATOS BÁSICOS + FOTO */}
                <div className="space-y-4">
                  {/* Código Producto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Producto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.product_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="PROD-001"
                      maxLength={50}
                      required
                    />
                  </div>

                  {/* Nombre Producto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Producto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.product_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Recarga Bitel"
                      maxLength={100}
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.product_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      rows={3}
                      placeholder="Descripción del producto..."
                      maxLength={500}
                      required
                    />
                  </div>

                  {/* FOTO DEL PRODUCTO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto del Producto
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      {formData.product_photo ? (
                        <div className="relative">
                          <img
                            src={getImageUrl(formData.product_photo, "product")}
                            alt="Preview"
                            onError={(e) =>
                              (e.target.src = FALLBACK_IMAGES.product)
                            }
                            className="w-full h-64 object-cover rounded-lg border-2 border-[#FFE709]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, product_photo: "" })
                            }
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                          <Upload size={48} className="mb-2" />
                          <p className="text-sm">300x300px recomendado</p>
                        </div>
                      )}
                      <label className="mt-3 cursor-pointer bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center justify-center space-x-2 font-semibold">
                        <Upload size={18} />
                        <span>Subir Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(
                              e,
                              (url) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  product_photo: url,
                                }));
                              },
                              "products"
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.product_status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* COLUMNA 2: DATOS BITEL + DATOS VENDOR (PARCIAL) */}
                <div className="space-y-4">
                  {/* SECCIÓN: DATOS BITEL */}
                  <div className="pb-2 border-b-2 border-[#FFE709]">
                    <h4 className="font-bold text-[#008C96] text-lg">
                      Datos Bitel
                    </h4>
                  </div>

                  {/* Moneda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.product_currency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_currency: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      required
                    >
                      <option value="PEN">PEN - Soles</option>
                      <option value="USD">USD - Dólares</option>
                      <option value="EUR">EUR - Euros</option>
                      <option value="MXN">MXN - Pesos Mexicanos</option>
                    </select>
                  </div>

                  {/* Precio Base */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Base <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.product_base_price}
                      onChange={(e) => {
                        const newBase = parseFloat(e.target.value) || 0;
                        const prices = updatePrices(
                          newBase,
                          formData.product_discount_percentage,
                          formData.product_fee
                        );
                        setFormData({
                          ...formData,
                          product_base_price: newBase,
                          ...prices,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Descuento % */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descuento % <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        (Max 100%)
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.product_discount_percentage}
                      onChange={(e) => {
                        let newDiscount = parseFloat(e.target.value) || 0;
                        if (newDiscount > 100) newDiscount = 100;
                        const prices = updatePrices(
                          formData.product_base_price,
                          newDiscount,
                          formData.product_fee
                        );
                        setFormData({
                          ...formData,
                          product_discount_percentage: newDiscount,
                          ...prices,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="0"
                      required
                    />
                  </div>

                  {/* Monto Descuento (readonly) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Descuento{" "}
                      <span className="text-xs text-gray-500">(auto)</span>
                    </label>
                    <input
                      type="text"
                      value={`$${parseFloat(
                        formData.product_discount_amount || 0
                      ).toFixed(2)}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  {/* Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.product_fee}
                      onChange={(e) => {
                        const newFee = parseFloat(e.target.value) || 0;
                        const prices = updatePrices(
                          formData.product_base_price,
                          formData.product_discount_percentage,
                          newFee
                        );
                        setFormData({
                          ...formData,
                          product_fee: newFee,
                          ...prices,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Precio Total (readonly destacado) */}
                  <div className="bg-[#FFE709] bg-opacity-20 p-4 rounded-lg border-2 border-[#FFE709]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Total{" "}
                      <span className="text-xs text-gray-500">(auto)</span>
                    </label>
                    <div className="text-3xl font-bold text-[#008C96]">
                      $
                      {parseFloat(formData.product_total_price || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* SECCIÓN: DATOS VENDOR (SOLO 2 PRIMEROS CAMPOS) */}
                  <div className="pt-4 pb-2 border-b-2 border-[#FFE709]">
                    <h4 className="font-bold text-[#008C96] text-lg">
                      Datos Vendor
                    </h4>
                  </div>

                  {/* Vendor Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Code
                    </label>
                    <input
                      type="text"
                      value={formData.product_vendor_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendor_code: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="VEND-001"
                      maxLength={100}
                    />
                  </div>

                  {/* VendPro Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.product_vendpro_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_code: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Vend001"
                      maxLength={50}
                      required
                    />
                  </div>
                </div>

                {/* COLUMNA 3: DATOS VENDOR (RESTO) + DATOS VENDPRO - CONTINÚA IGUAL QUE EL ORIGINAL */}
                <div className="space-y-4">
                  {/* SECCIÓN: DATOS VENDOR (CONTINUACIÓN) */}
                  <div className="pb-2 border-b-2 border-[#FFE709]">
                    <h4 className="font-bold text-[#008C96] text-lg">
                      Datos Vendor
                    </h4>
                  </div>

                  {/* VendPro SKU ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro SKU ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.product_vendpro_skuid}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_skuid: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="SKU-001"
                      maxLength={50}
                      required
                    />
                  </div>

                  {/* VendPro Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.product_vendpro_country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_country: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Peru"
                      maxLength={50}
                      required
                    />
                  </div>

                  {/* VendPro Operator */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Operator <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.product_vendpro_operator}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_operator: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Bitel"
                      maxLength={50}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ejemplo: Bitel, Movistar, Claro
                    </p>
                  </div>

                  {/* VendPro Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Currency
                    </label>
                    <select
                      value={formData.product_vendpro_currency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_currency: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="PEN">PEN - Soles</option>
                      <option value="USD">USD - Dólares</option>
                      <option value="EUR">EUR - Euros</option>
                      <option value="MXN">MXN - Pesos Mexicanos</option>
                    </select>
                  </div>

                  {/* SECCIÓN: DATOS VENDPRO */}
                  <div className="pt-4 pb-2 border-b-2 border-[#FFE709]">
                    <h4 className="font-bold text-[#008C96] text-lg">
                      Datos VendPro
                    </h4>
                  </div>

                  {/* VendPro Product Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Product Type{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.product_vendpro_product_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_product_type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      required
                    >
                      <option value="">Seleccionar tipo...</option>
                      <option value="Topup">Topup</option>
                      <option value="pack">Pack</option>
                      <option value="bill">Bill Payment</option>
                      <option value="smartphone">Smartphone</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>

                  {/* VendPro Amount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Amount Type{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.product_vendpro_amount_type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setFormData({
                          ...formData,
                          product_vendpro_amount_type: newType,
                          product_vendpro_maximun_amount:
                            newType === "F"
                              ? 0
                              : formData.product_vendpro_maximun_amount,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      required
                    >
                      <option value="F">F - Fixed</option>
                      <option value="R">R - Range</option>
                    </select>
                  </div>

                  {/* VendPro Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Amount <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formData.product_vendpro_amount_type === "R"
                          ? "(Mínimo)"
                          : "(Fijo)"}
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.product_vendpro_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_amount:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* VendPro Maximum Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Maximum Amount
                      {formData.product_vendpro_amount_type === "R" && (
                        <span className="text-red-500">*</span>
                      )}
                      {formData.product_vendpro_amount_type === "F" && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Solo para Range)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.product_vendpro_maximun_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_maximun_amount:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709] ${
                        formData.product_vendpro_amount_type === "F"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="0.00"
                      disabled={formData.product_vendpro_amount_type === "F"}
                      required={formData.product_vendpro_amount_type === "R"}
                    />
                    {formData.product_vendpro_amount_type === "R" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Debe ser mayor a{" "}
                        {parseFloat(
                          formData.product_vendpro_amount || 0
                        ).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* VendPro Comission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VendPro Comisión %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.product_vendpro_comission}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_vendpro_comission:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#008C96] text-white rounded-lg hover:bg-[#006B74] font-semibold transition-colors flex items-center space-x-2"
              >
                <span>{editingItem ? "Actualizar" : "Guardar"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductsTab);