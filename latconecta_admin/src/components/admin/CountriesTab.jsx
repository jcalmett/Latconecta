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
  // Cargar datos en modo edición
  useEffect(() => {
    if (editingItem) {
      setFormData({
        country_code: editingItem.country_code || "",
        country_name: editingItem.country_name || "",
        country_flag_photo: editingItem.country_flag_photo || "",
        country_photo: editingItem.country_photo || "",
        country_description: editingItem.country_description || "",
        country_er_usd_pen: editingItem.country_er_usd_pen || 3.75,
        status: editingItem.status || "active",
      });
    }
  }, [editingItem, setFormData]);

  const handleSave = async () => {
    try {
      if (!formData.country_code || !formData.country_name) {
        showNotification("Por favor complete los campos obligatorios", "error");
        return;
      }

      // Validar código de país (2 o 3 caracteres)
      if (formData.country_code.length < 2 || formData.country_code.length > 3) {
        showNotification("El código del país debe tener 2 o 3 caracteres", "error");
        return;
      }

      const dataToSend = {
        ...formData,
        country_code: formData.country_code.toUpperCase(),
        country_er_usd_pen: parseFloat(formData.country_er_usd_pen) || 3.75,
        updated_by: user?.email || 'admin'
      };

      if (editingItem) {
        await countriesService.update(editingItem.country_id, dataToSend);
        showNotification(`País "${formData.country_name}" actualizado`);
      } else {
        dataToSend.created_by = user?.email || 'admin';
        await countriesService.create(dataToSend);
        showNotification(`País "${formData.country_name}" creado`);
      }

      await loadCountries();
      resetForm();
    } catch (error) {
      console.error("Error al guardar país:", error);
      const errorMsg = error.response?.data?.detail || "Error al guardar el país";
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
          const errorMsg = error.response?.data?.detail || "Error al eliminar el país";
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
              country_code: "",
              country_name: "",
              country_flag_photo: "",
              country_photo: "",
              country_description: "",
              country_er_usd_pen: 3.75,
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

      {/* GRID DE PAÍSES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <div
            key={country.country_id}
            className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-[#FFE709] hover:shadow-lg transition-shadow"
          >
            {/* Bandera */}
            <div className="relative h-32 bg-gray-100">
              <img
                src={getImageUrl(country.country_flag_photo, "country")}
                alt={`Bandera ${country.country_name}`}
                onError={(e) => (e.target.src = FALLBACK_IMAGES.country)}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-white px-3 py-1 rounded-full font-bold text-[#008C96]">
                {country.country_code}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-[#008C96] mb-2">
                {country.country_name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {country.country_description || "Sin descripción"}
              </p>

              {/* Tasa de Cambio */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500">Tasa de Cambio USD/PEN</div>
                <div className="text-lg font-bold text-[#008C96]">
                  {parseFloat(country.country_er_usd_pen || 0).toFixed(2)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    country.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {country.status}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(country);
                      setShowForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(country)}
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
                {/* COLUMNA 1 */}
                <div className="space-y-4">
                  {/* Código País */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código País (ISO) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.country_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          country_code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="PER o PE"
                      maxLength={3}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      2 o 3 caracteres (PE, PER, MX, MEX, etc.)
                    </p>
                  </div>

                  {/* Nombre País */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del País <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.country_name}
                      onChange={(e) =>
                        setFormData({ ...formData, country_name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Perú"
                      maxLength={100}
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.country_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          country_description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      rows={3}
                      placeholder="Descripción del país..."
                      maxLength={500}
                    />
                  </div>

                  {/* Tasa de Cambio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tasa de Cambio USD/PEN
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.country_er_usd_pen}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          country_er_usd_pen: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="3.75"
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* COLUMNA 2: FOTOS */}
                <div className="space-y-4">
                  {/* Bandera */}
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
                            className="w-full h-32 object-cover rounded-lg"
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
                          <p className="text-sm">Bandera del país</p>
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
                                setFormData((prev) => ({
                                  ...prev,
                                  country_flag_photo: url,
                                }));
                              },
                              "countries"
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Foto del País */}
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
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, country_photo: "" })
                            }
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <Upload size={48} className="mb-2" />
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
                                setFormData((prev) => ({
                                  ...prev,
                                  country_photo: url,
                                }));
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

export default memo(CountriesTab);