import React, { useEffect, useState, memo } from "react";
import { Edit2, Trash2, Upload, Plus, X } from "lucide-react";
import { getImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelper";
import companiesService from "../../services/companiesService";

const CompaniesTab = ({
  formData,
  setFormData,
  companies,
  setCompanies,
  loadingCompanies,
  countries,
  services,
  showForm,
  setShowForm,
  editingItem,
  setEditingItem,
  user,
  handleImageUpload,
  showNotification,
  resetForm,
  setConfirmDialog,
  loadCompanies,
}) => {
  const [filterCountry, setFilterCountry] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const getLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const normalizeDecimal = (value) => {
    if (!value) return value;
    return value.toString().replace(',', '.');
  };

  useEffect(() => {
    if (editingItem) {
      setFormData({
        country_id: editingItem.country_id || "",
        service_id: editingItem.service_id || "",
        company_name: editingItem.company_name || "",
        company_logo: editingItem.company_logo || "",
        company_photo: editingItem.company_photo || "",
        company_photo_mkt1: editingItem.company_photo_mkt1 || "",
        company_photo_mkt2: editingItem.company_photo_mkt2 || "",
        company_photo_mkt3: editingItem.company_photo_mkt3 || "",
        company_photo_mkt4: editingItem.company_photo_mkt4 || "",
        company_description5: editingItem.company_description5 || "",
        company_lema_1: editingItem.company_lema_1 || "",
        company_lema_2: editingItem.company_lema_2 || "",
        company_usd_balance: editingItem.company_usd_balance || 0,
        company_usd_date_balance: editingItem.company_usd_date_balance || "",
        company_local_currency: editingItem.company_local_currency || "",
        company_local_balance: editingItem.company_local_balance || 0,
        company_local_date_balance: editingItem.company_local_date_balance || "",
        company_barcode_available: editingItem.company_barcode_available || "No",
        company_mail_customer_support: editingItem.company_mail_customer_support || "",
        company_mail_commercial_support: editingItem.company_mail_commercial_support || "",
        company_status: editingItem.company_status || "active",
      });
    }
  }, [editingItem, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'company_usd_balance') {
      processedValue = normalizeDecimal(value);
      if (processedValue && !formData.company_usd_date_balance) {
        setFormData(prev => ({
          ...prev,
          [name]: processedValue,
          company_usd_date_balance: getLocalDateTime()
        }));
        return;
      }
    }

    if (name === 'company_local_balance') {
      processedValue = normalizeDecimal(value);
      if (processedValue && !formData.company_local_date_balance) {
        setFormData(prev => ({
          ...prev,
          [name]: processedValue,
          company_local_date_balance: getLocalDateTime()
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.company_name || !formData.country_id || !formData.service_id) {
        showNotification("Por favor complete los campos obligatorios", "error");
        return;
      }

      if (formData.company_mail_customer_support && !isValidEmail(formData.company_mail_customer_support)) {
        showNotification("El email de soporte no es válido", "error");
        return;
      }

      if (formData.company_mail_commercial_support && !isValidEmail(formData.company_mail_commercial_support)) {
        showNotification("El email comercial no es válido", "error");
        return;
      }

      if (formData.company_usd_balance) {
        const balanceStr = formData.company_usd_balance.toString();
        if (balanceStr.includes(',')) {
          showNotification("Use punto (.) como separador decimal en Balance USD, no coma (,)", "error");
          return;
        }
      }

      if (formData.company_local_balance) {
        const balanceStr = formData.company_local_balance.toString();
        if (balanceStr.includes(',')) {
          showNotification("Use punto (.) como separador decimal en Balance Local, no coma (,)", "error");
          return;
        }
      }

      const dataToSend = {
        ...formData,
        country_id: parseInt(formData.country_id),
        service_id: parseInt(formData.service_id),
        company_usd_balance: formData.company_usd_balance ? parseFloat(normalizeDecimal(formData.company_usd_balance)) : 0,
        company_usd_date_balance: formData.company_usd_date_balance || null,
        company_local_currency: formData.company_local_currency || null,
        company_local_balance: formData.company_local_balance ? parseFloat(normalizeDecimal(formData.company_local_balance)) : null,
        company_local_date_balance: formData.company_local_date_balance || null,
        updated_by: user?.email || "admin",
      };

      if (editingItem) {
        await companiesService.update(editingItem.company_id, dataToSend);
        showNotification(`Compañía "${formData.company_name}" actualizada`);
      } else {
        dataToSend.created_by = user?.email || "admin";
        await companiesService.create(dataToSend);
        showNotification(`Compañía "${formData.company_name}" creada`);
      }

      await loadCompanies();
      resetForm();
    } catch (error) {
      console.error("Error al guardar compañía:", error);
      let errorMsg = "Error al guardar la compañía";
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map((e) => e.msg || e).join(", ");
        } else if (typeof error.response.data.detail === "string") {
          errorMsg = error.response.data.detail;
        }
      }
      showNotification(errorMsg, "error");
    }
  };

  const handleDelete = (company) => {
    setConfirmDialog({
      show: true,
      title: "Eliminar Compañía",
      message: `¿Estás seguro de eliminar "${company.company_name}"? Esto eliminará todos los productos asociados.`,
      onConfirm: async () => {
        try {
          await companiesService.delete(company.company_id);
          showNotification(`Compañía "${company.company_name}" eliminada`);
          await loadCompanies();
        } catch (error) {
          console.error("Error al eliminar compañía:", error);
          let errorMsg = "Error al eliminar la compañía";
          if (error.response?.data?.detail) {
            if (Array.isArray(error.response.data.detail)) {
              errorMsg = error.response.data.detail.map((e) => e.msg || e).join(", ");
            } else if (typeof error.response.data.detail === "string") {
              errorMsg = error.response.data.detail;
            }
          }
          showNotification(errorMsg, "error");
        }
      },
    });
  };

  const isValidEmail = (email) => {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  };

  const getCountryCode = (countryId) => {
    const country = countries.find((c) => c.country_id === countryId);
    return country ? country.country_code : "N/A";
  };

  const getServiceName = (serviceId) => {
    const service = services.find((s) => s.service_id === serviceId);
    return service ? service.service_name : "N/A";
  };

  const filteredCompanies = companies.filter((company) => {
    if (filterCountry && company.country_id !== parseInt(filterCountry)) return false;
    if (filterService && company.service_id !== parseInt(filterService)) return false;
    if (filterStatus && company.company_status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      {loadingCompanies && (
        <div className="text-center py-4 mb-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#008C96]"></div>
          <p className="mt-2 text-gray-600">Cargando compañías...</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#008C96]">Gestión de Compañías</h2>
        <button
          onClick={() => {
            setFormData({
              country_id: "",
              service_id: "",
              company_name: "",
              company_logo: "",
              company_photo: "",
              company_photo_mkt1: "",
              company_photo_mkt2: "",
              company_photo_mkt3: "",
              company_photo_mkt4: "",
              company_description5: "",
              company_lema_1: "",
              company_lema_2: "",
              company_usd_balance: 0,
              company_usd_date_balance: "",
              company_local_currency: "",
              company_local_balance: 0,
              company_local_date_balance: "",
              company_barcode_available: "No",
              company_mail_customer_support: "",
              company_mail_commercial_support: "",
              company_status: "active",
            });
            setShowForm(true);
          }}
          className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2 font-semibold"
        >
          <Plus size={18} />
          <span>Nueva Compañía</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-[#FFE709]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrar por País:
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrar por Servicio:
            </label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
            >
              <option value="">Todos los servicios</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.service_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrar por Estado:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        {(filterCountry || filterService || filterStatus) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilterCountry("");
                setFilterService("");
                setFilterStatus("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#008C96] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Cód País</th>
                <th className="px-4 py-3 text-left">Servicio</th>
                <th className="px-4 py-3 text-left">Logo</th>
                <th className="px-4 py-3 text-left">Nombre Compañía</th>
                <th className="px-4 py-3 text-right">Balance USD</th>
                <th className="px-4 py-3 text-center">Barcode</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    {loadingCompanies ? "Cargando..." : "No hay compañías que coincidan con los filtros"}
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.company_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-[#008C96]">
                      {getCountryCode(company.country_id)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {getServiceName(company.service_id)}
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={getImageUrl(company.company_logo, "company")}
                        alt={`Logo ${company.company_name}`}
                        onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                        className="w-16 h-16 object-contain rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{company.company_name}</div>
                      <div className="text-xs text-gray-500">{company.company_description5}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#008C96]">
                      ${parseFloat(company.company_usd_balance || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          company.company_barcode_available === "Si"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {company.company_barcode_available}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          company.company_status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {company.company_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(company);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(company)}
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#008C96]">
                {editingItem ? "Editar Compañía" : "Agregar Compañía"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country_id"
                      value={formData.country_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      required
                    >
                      <option value="">Seleccione un país</option>
                      {countries.map((country) => (
                        <option key={country.country_id} value={country.country_id}>
                          {country.country_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servicio <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      required
                    >
                      <option value="">Seleccione un servicio</option>
                      {services.map((service) => (
                        <option key={service.service_id} value={service.service_id}>
                          {service.service_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Compañía <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Telefónica Perú - TopUps"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="company_description5"
                      value={formData.company_description5}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      rows={3}
                      maxLength={500}
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">💵 Balance USD</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Balance USD <span className="text-blue-500 text-xs">(use punto)</span>
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          name="company_usd_balance"
                          value={formData.company_usd_balance}
                          onChange={handleChange}
                          placeholder="0.00"
                          lang="en"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ejemplo: 1000.50</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha Balance USD <span className="text-blue-500 text-xs">(hora local)</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="company_usd_date_balance"
                          value={formData.company_usd_date_balance}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.company_usd_date_balance ? 'Configurada' : 'Auto-completa al modificar balance'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-800 mb-3">🌎 Balance Moneda Local</h4>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moneda
                        </label>
                        <select
                          name="company_local_currency"
                          value={formData.company_local_currency}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                        >
                          <option value="">Ninguna</option>
                          <option value="PEN">PEN</option>
                          <option value="MXN">MXN</option>
                          <option value="VES">VES</option>
                          <option value="COP">COP</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Balance Local <span className="text-blue-500 text-xs">(use punto)</span>
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          name="company_local_balance"
                          value={formData.company_local_balance}
                          onChange={handleChange}
                          placeholder="0.00"
                          lang="en"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ejemplo: 3750.00</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Balance Local <span className="text-blue-500 text-xs">(hora local)</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="company_local_date_balance"
                        value={formData.company_local_date_balance}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.company_local_date_balance ? 'Configurada' : 'Auto-completa al modificar balance'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Barcode
                      </label>
                      <select
                        name="company_barcode_available"
                        value={formData.company_barcode_available}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      >
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        name="company_status"
                        value={formData.company_status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Soporte Clientes
                    </label>
                    <input
                      type="email"
                      name="company_mail_customer_support"
                      value={formData.company_mail_customer_support}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Comercial
                    </label>
                    <input
                      type="email"
                      name="company_mail_commercial_support"
                      value={formData.company_mail_commercial_support}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo de la Compañía
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      {formData.company_logo ? (
                        <div className="relative">
                          <img
                            src={getImageUrl(formData.company_logo, "company")}
                            alt="Logo"
                            onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                            className="w-full h-32 object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, company_logo: "" })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                          <Upload size={32} className="mb-2" />
                          <p className="text-sm">Logo de la compañía</p>
                        </div>
                      )}
                      <label className="mt-3 cursor-pointer bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center justify-center space-x-2 font-semibold">
                        <Upload size={18} />
                        <span>Subir Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, (url) => {
                              setFormData((prev) => ({ ...prev, company_logo: url }));
                            }, "companies")
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto Principal
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      {formData.company_photo ? (
                        <div className="relative">
                          <img
                            src={getImageUrl(formData.company_photo, "company")}
                            alt="Foto"
                            onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                            className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, company_photo: "" })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                          <Upload size={32} className="mb-2" />
                          <p className="text-sm">Foto principal</p>
                        </div>
                      )}
                      <label className="mt-3 cursor-pointer bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center justify-center space-x-2 font-semibold">
                        <Upload size={18} />
                        <span>Subir Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, (url) => {
                              setFormData((prev) => ({ ...prev, company_photo: url }));
                            }, "companies")
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#008C96] text-white rounded-lg hover:bg-[#006B74] font-semibold transition-colors"
              >
                {editingItem ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(CompaniesTab);