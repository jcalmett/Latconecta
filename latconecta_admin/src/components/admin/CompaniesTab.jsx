import React, { useEffect, memo } from "react";
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
  // Cargar datos en modo edición
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
        company_credit_balance: editingItem.company_credit_balance || 0,
        company_date_balance: editingItem.company_date_balance || "",
        company_barcode_available: editingItem.company_barcode_available || "No",
        company_mail_customer_support: editingItem.company_mail_customer_support || "",
        company_mail_commercial_support: editingItem.company_mail_commercial_support || "",
        company_status: editingItem.company_status || "active",
      });
    }
  }, [editingItem, setFormData]);

  const handleSave = async () => {
    try {
      if (!formData.company_name || !formData.country_id || !formData.service_id) {
        showNotification("Por favor complete los campos obligatorios", "error");
        return;
      }

      // Validar email si se proporciona
      if (formData.company_mail_customer_support && !isValidEmail(formData.company_mail_customer_support)) {
        showNotification("El email de soporte no es válido", "error");
        return;
      }

      if (formData.company_mail_commercial_support && !isValidEmail(formData.company_mail_commercial_support)) {
        showNotification("El email comercial no es válido", "error");
        return;
      }

      // Validar balance
      if (formData.company_credit_balance) {
        const balanceStr = String(formData.company_credit_balance).replace(/,/g, '');
        const balance = parseFloat(balanceStr);

        if (isNaN(balance) || balance < 0 || balance > 99999999.99) {
          showNotification("El balance debe estar entre 0.00 y 99999999.99", "error");
          return;
        }

        const parts = balanceStr.split('.');
        if (parts[0].length > 8) {
          showNotification("El balance no puede tener más de 8 dígitos enteros", "error");
          return;
        }
        if (parts[1] && parts[1].length > 2) {
          showNotification("El balance no puede tener más de 2 decimales", "error");
          return;
        }
      }

      const dataToSend = {
        ...formData,
        country_id: parseInt(formData.country_id),
        service_id: parseInt(formData.service_id),
        company_credit_balance: parseFloat(formData.company_credit_balance) || 0,
        updated_by: user?.email || 'admin'
      };

      // No enviar company_date_balance si está vacío (el backend lo manejará)
      if (!dataToSend.company_date_balance || dataToSend.company_date_balance === '') {
        delete dataToSend.company_date_balance;
      }

      if (editingItem) {
        await companiesService.update(editingItem.company_id, dataToSend);
        showNotification(`Compañía "${formData.company_name}" actualizada`);
      } else {
        dataToSend.created_by = user?.email || 'admin';
        await companiesService.create(dataToSend);
        showNotification(`Compañía "${formData.company_name}" creada`);
      }

      await loadCompanies();
      resetForm();
    } catch (error) {
      console.error("Error al guardar compañía:", error);
      
      // Manejar errores de validación de Pydantic (arrays)
      let errorMsg = "Error al guardar la compañía";
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map(e => e.msg || e).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
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
          
          // Manejar errores de validación
          let errorMsg = "Error al eliminar la compañía";
          if (error.response?.data?.detail) {
            if (Array.isArray(error.response.data.detail)) {
              errorMsg = error.response.data.detail.map(e => e.msg || e).join(', ');
            } else if (typeof error.response.data.detail === 'string') {
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

  const handleBalanceChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[0].length > 8) {
      return;
    }
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    setFormData({ ...formData, company_credit_balance: value });
  };

  const getCountryName = (countryId) => {
    const country = countries.find(c => c.country_id === countryId);
    return country ? country.country_name : 'N/A';
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.service_id === serviceId);
    return service ? service.service_name : 'N/A';
  };

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
              company_credit_balance: 0,
              company_date_balance: "",
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

      {/* GRID DE COMPAÑÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.company_id}
            className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-[#FFE709] hover:shadow-lg transition-shadow"
          >
            {/* Logo */}
            <div className="relative h-32 bg-gray-100">
              <img
                src={getImageUrl(company.company_logo, "company")}
                alt={`Logo ${company.company_name}`}
                onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                className="w-full h-full object-contain p-4"
              />
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-[#008C96] mb-2">
                {company.company_name}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">País:</span>
                  <span className="font-semibold">{getCountryName(company.country_id)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">Servicio:</span>
                  <span className="font-semibold">{getServiceName(company.service_id)}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {company.company_description5 || "Sin descripción"}
              </p>

              {/* Balance y Barcode */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">Balance USD</div>
                  <div className="text-sm font-bold text-[#008C96]">
                    ${parseFloat(company.company_credit_balance || 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">Barcode</div>
                  <div className="text-sm font-bold">
                    {company.company_barcode_available === 'Si' ? '✓ Si' : '✗ No'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    company.company_status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {company.company_status}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(company);
                      setShowForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FORMULARIO MODAL */}
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
                {/* COLUMNA 1: DATOS BÁSICOS */}
                <div className="space-y-4">
                  {/* País */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.country_id}
                      onChange={(e) =>
                        setFormData({ ...formData, country_id: e.target.value })
                      }
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

                  {/* Servicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servicio <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.service_id}
                      onChange={(e) =>
                        setFormData({ ...formData, service_id: e.target.value })
                      }
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

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Compañía <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({ ...formData, company_name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Ej: Bitel Perú - TopUps"
                      maxLength={50}
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.company_description5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_description5: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      rows={3}
                      placeholder="Descripción de la compañía..."
                      maxLength={500}
                    />
                  </div>

                  {/* Lemas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lema 1
                      </label>
                      <input
                        type="text"
                        value={formData.company_lema_1}
                        onChange={(e) =>
                          setFormData({ ...formData, company_lema_1: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                        maxLength={500}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lema 2
                      </label>
                      <input
                        type="text"
                        value={formData.company_lema_2}
                        onChange={(e) =>
                          setFormData({ ...formData, company_lema_2: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                        maxLength={500}
                      />
                    </div>
                  </div>

                  {/* Balance, Barcode, Estado */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Balance USD
                      </label>
                      <input
                        type="text"
                        value={formData.company_credit_balance}
                        onChange={handleBalanceChange}
                        placeholder="0.00"
                        maxLength={11}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Barcode
                      </label>
                      <select
                        value={formData.company_barcode_available}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company_barcode_available: e.target.value,
                          })
                        }
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
                        value={formData.company_status}
                        onChange={(e) =>
                          setFormData({ ...formData, company_status: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  {/* Emails */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Soporte Clientes
                    </label>
                    <input
                      type="email"
                      value={formData.company_mail_customer_support}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_mail_customer_support: e.target.value,
                        })
                      }
                      placeholder="soporte@empresa.com"
                      maxLength={255}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Comercial
                    </label>
                    <input
                      type="email"
                      value={formData.company_mail_commercial_support}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_mail_commercial_support: e.target.value,
                        })
                      }
                      placeholder="comercial@empresa.com"
                      maxLength={255}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                    />
                  </div>
                </div>

                {/* COLUMNA 2: IMÁGENES */}
                <div className="space-y-4">
                  {/* Logo */}
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
                            onClick={() =>
                              setFormData({ ...formData, company_logo: "" })
                            }
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
                            handleImageUpload(
                              e,
                              (url) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  company_logo: url,
                                }));
                              },
                              "companies"
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Foto Principal */}
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
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, company_photo: "" })
                            }
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
                            handleImageUpload(
                              e,
                              (url) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  company_photo: url,
                                }));
                              },
                              "companies"
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Fotos Marketing (Grid 2x2) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fotos Marketing
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((num) => {
                        const field = `company_photo_mkt${num}`;
                        return (
                          <div key={num} className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
                            {formData[field] ? (
                              <div className="relative">
                                <img
                                  src={getImageUrl(formData[field], "company")}
                                  alt={`MKT ${num}`}
                                  onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({ ...formData, [field]: "" })
                                  }
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-24 text-gray-400">
                                <Upload size={20} />
                                <p className="text-xs">MKT {num}</p>
                              </div>
                            )}
                            <label className="mt-2 cursor-pointer bg-[#008C96] text-white px-2 py-1 rounded text-xs hover:bg-[#006B74] flex items-center justify-center space-x-1">
                              <Upload size={12} />
                              <span>Subir</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageUpload(
                                    e,
                                    (url) => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        [field]: url,
                                      }));
                                    },
                                    "companies"
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTONES */}
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