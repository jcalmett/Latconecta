import React, { useEffect, memo } from "react";
import { Edit2, Trash2, Upload, Plus, X } from "lucide-react";
import { getImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelper";
import countriesService from "../../services/countriesService";

const CountriesTab = ({
  formData,
  setFormData,
  countries,
  setCountries,
  loadingCountries,
  showForm,
  setShowForm,
  editingItem,
  setEditingItem,
  user,
  handleImageUpload,
  showNotification,
  resetForm,
  setConfirmDialog,
  loadCountries,
}) => {
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

  /**
   * Extraer mensaje legible de errores de API
   * Maneja tanto strings como arrays de objetos de validación Pydantic
   */
  const extractErrorMessage = (error) => {
    const detail = error.response?.data?.detail;

    if (!detail) {
      return error.message || "Error desconocido";
    }

    // Si detail es string, retornar directamente
    if (typeof detail === "string") {
      return detail;
    }

    // Si detail es array (errores de validación Pydantic), extraer mensajes
    if (Array.isArray(detail)) {
      return detail
        .map((err) => {
          const field = err.loc ? err.loc.slice(1).join(".") : "campo";
          return `${field}: ${err.msg}`;
        })
        .join("; ");
    }

    // Si es objeto con msg
    if (detail.msg) {
      return detail.msg;
    }

    return "Error en la operación";
  };

  useEffect(() => {
    if (editingItem) {
      setFormData({
        country_name: editingItem.country_name || "",
        country_code: editingItem.country_code || "",
        country_flag_photo: editingItem.country_flag_photo || "",
        country_photo: editingItem.country_photo || "",
        country_description: editingItem.country_description || "",
        country_er_usd: editingItem.country_er_usd || 3.75,
        country_er_date: editingItem.country_er_date || "",
        status: editingItem.status || "active",
      });
    }
  }, [editingItem, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'country_er_usd') {
      processedValue = normalizeDecimal(value);
      
      if (processedValue && !formData.country_er_date) {
        setFormData(prev => ({
          ...prev,
          [name]: processedValue,
          country_er_date: getLocalDateTime()
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
      if (!formData.country_name || !formData.country_code) {
        showNotification("Por favor complete los campos obligatorios", "error");
        return;
      }

      if (formData.country_code.length < 2 || formData.country_code.length > 3) {
        showNotification("El código debe tener 2-3 caracteres", "error");
        return;
      }

      if (formData.country_er_usd) {
        const erStr = formData.country_er_usd.toString();
        if (erStr.includes(',')) {
          showNotification("Use punto (.) como separador decimal, no coma (,)", "error");
          return;
        }
        const erNum = parseFloat(erStr);
        if (isNaN(erNum) || erNum <= 0) {
          showNotification("Tipo de cambio debe ser un número válido mayor a 0", "error");
          return;
        }
      }

      // Construir payload base con los campos del formulario
      const baseData = {
        country_name: formData.country_name,
        country_code: formData.country_code,
        country_flag_photo: formData.country_flag_photo || null,
        country_photo: formData.country_photo || null,
        country_description: formData.country_description || null,
        country_er_usd: formData.country_er_usd ? parseFloat(normalizeDecimal(formData.country_er_usd)) : 3.75,
        country_er_date: formData.country_er_date || null,
        status: formData.status || "active",
      };

      if (editingItem) {
        // UPDATE: incluir updated_by (aceptado por CountryUpdate)
        const updateData = {
          ...baseData,
          updated_by: user?.email || "admin",
        };
        await countriesService.update(editingItem.country_id, updateData);
        showNotification(`País "${formData.country_name}" actualizado`);
      } else {
        // CREATE: incluir created_by, NO enviar updated_by (no existe en CountryCreate)
        const createData = {
          ...baseData,
          created_by: user?.email || "admin",
        };
        await countriesService.create(createData);
        showNotification(`País "${formData.country_name}" creado`);
      }

      await loadCountries();
      resetForm();
    } catch (error) {
      console.error("Error al guardar país:", error);
      const errorMsg = extractErrorMessage(error);
      showNotification(errorMsg, "error");
    }
  };

  const handleDelete = (country) => {
    setConfirmDialog({
      show: true,
      title: "Eliminar País",
      message: `¿Estás seguro de eliminar "${country.country_name}"? Esto eliminará todas las compañías y productos asociados.`,
      onConfirm: async () => {
        try {
          await countriesService.delete(country.country_id);
          showNotification(`País "${country.country_name}" eliminado`);
          await loadCountries();
        } catch (error) {
          console.error("Error al eliminar país:", error);
          const errorMsg = extractErrorMessage(error);
          showNotification(errorMsg, "error");
        }
      },
    });
  };

  return (
    <div>
      {loadingCountries && (
        <div className="text-center py-4 mb-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#008C96]"></div>
          <p className="mt-2 text-gray-600">Cargando países...</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#008C96]">Gestión de Países</h2>
        <button
          onClick={() => {
            setFormData({
              country_name: "",
              country_code: "",
              country_flag_photo: "",
              country_photo: "",
              country_description: "",
              country_er_usd: 3.75,
              country_er_date: "",
              status: "active",
            });
            setShowForm(true);
          }}
          className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2 font-semibold"
        >
          <Plus size={18} />
          <span>Nuevo País</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#008C96] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Bandera</th>
                <th className="px-4 py-3 text-left">Nombre País</th>
                <th className="px-4 py-3 text-right">Tipo Cambio</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {countries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    {loadingCountries ? "Cargando..." : "No hay países registrados"}
                  </td>
                </tr>
              ) : (
                countries.map((country) => (
                  <tr key={country.country_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-[#008C96]">
                      {country.country_code}
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={getImageUrl(country.country_flag_photo, "country")}
                        alt={`Bandera ${country.country_name}`}
                        onError={(e) => (e.target.src = FALLBACK_IMAGES.country)}
                        className="w-12 h-8 object-contain rounded border border-gray-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{country.country_name}</div>
                      <div className="text-xs text-gray-500">{country.country_description}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {parseFloat(country.country_er_usd || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          country.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {country.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(country);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(country)}
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#008C96]">
                {editingItem ? "Editar País" : "Agregar País"}
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
                      Nombre del País <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country_name"
                      value={formData.country_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Perú"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código del País <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country_code"
                      value={formData.country_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          country_code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="PE"
                      maxLength={3}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">2-3 caracteres (Ej: PE, PER)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="country_description"
                      value={formData.country_description}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      rows={3}
                      placeholder="Descripción del país..."
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Cambio a USD <span className="text-blue-500 text-xs">(use punto como separador)</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="country_er_usd"
                      value={formData.country_er_usd}
                      onChange={handleChange}
                      placeholder="3.75"
                      lang="en"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ejemplo: 3.75 o 17.50</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha del Tipo de Cambio <span className="text-blue-500 text-xs">(hora local del sistema)</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="country_er_date"
                      value={formData.country_er_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.country_er_date 
                        ? 'Fecha configurada' 
                        : 'Se auto-completa al modificar el tipo de cambio'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bandera del País
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      {formData.country_flag_photo ? (
                        <div className="relative">
                          <img
                            src={getImageUrl(formData.country_flag_photo, "country")}
                            alt="Bandera"
                            onError={(e) => (e.target.src = FALLBACK_IMAGES.country)}
                            className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, country_flag_photo: "" })
                            }
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                          <Upload size={32} className="mb-2" />
                          <p className="text-sm">Bandera (ratio 3:2)</p>
                        </div>
                      )}
                      <label className="mt-3 cursor-pointer bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center justify-center space-x-2 font-semibold">
                        <Upload size={18} />
                        <span>Subir Bandera</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(
                              e,
                              (url) => {
                                setFormData((prev) => ({ ...prev, country_flag_photo: url }));
                              },
                              "countries"
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto del País
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      {formData.country_photo ? (
                        <div className="relative">
                          <img
                            src={getImageUrl(formData.country_photo, "country")}
                            alt="Foto"
                            onError={(e) => (e.target.src = FALLBACK_IMAGES.country)}
                            className="w-full h-48 object-contain bg-gray-50 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, country_photo: "" })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <Upload size={32} className="mb-2" />
                          <p className="text-sm">Foto representativa</p>
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
                                setFormData((prev) => ({ ...prev, country_photo: url }));
                              },
                              "countries"
                            )
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

export default memo(CountriesTab);