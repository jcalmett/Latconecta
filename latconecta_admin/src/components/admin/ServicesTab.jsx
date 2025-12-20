import React, { useEffect, memo } from "react";
import { Edit2, Trash2, Upload, Plus, X } from "lucide-react";
import { getImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelper";
import servicesService from "../../services/servicesService";

const ServicesTab = ({
  formData,
  setFormData,
  services,
  setServices,
  loadingServices,
  showForm,
  setShowForm,
  editingItem,
  setEditingItem,
  user,
  handleImageUpload,
  showNotification,
  resetForm,
  setConfirmDialog,
  loadServices,
}) => {
  // Cargar datos en modo edición
  useEffect(() => {
    if (editingItem) {
      setFormData({
        service_name: editingItem.service_name || "",
        service_photo: editingItem.service_photo || "",
        service_photo_MKT: editingItem.service_photo_MKT || "",
        service_description: editingItem.service_description || "",
        status: editingItem.status || "active",
      });
    }
  }, [editingItem, setFormData]);

  const handleSave = async () => {
    try {
      if (!formData.service_name) {
        showNotification("Por favor complete el nombre del servicio", "error");
        return;
      }

      const dataToSend = {
        ...formData,
        updated_by: user?.email || "admin",
      };

      if (editingItem) {
        await servicesService.update(editingItem.service_id, dataToSend);
        showNotification(`Servicio "${formData.service_name}" actualizado`);
      } else {
        dataToSend.created_by = user?.email || "admin";
        await servicesService.create(dataToSend);
        showNotification(`Servicio "${formData.service_name}" creado`);
      }

      await loadServices();
      resetForm();
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      const errorMsg = error.response?.data?.detail || "Error al guardar el servicio";
      showNotification(errorMsg, "error");
    }
  };

  const handleDelete = (service) => {
    setConfirmDialog({
      show: true,
      title: "Eliminar Servicio",
      message: `¿Estás seguro de eliminar "${service.service_name}"? Esto eliminará todas las compañías y productos asociados.`,
      onConfirm: async () => {
        try {
          await servicesService.delete(service.service_id);
          showNotification(`Servicio "${service.service_name}" eliminado`);
          await loadServices();
        } catch (error) {
          console.error("Error al eliminar servicio:", error);
          const errorMsg = error.response?.data?.detail || "Error al eliminar el servicio";
          showNotification(errorMsg, "error");
        }
      },
    });
  };

  return (
    <div>
      {loadingServices && (
        <div className="text-center py-4 mb-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#008C96]"></div>
          <p className="mt-2 text-gray-600">Cargando servicios...</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#008C96]">Gestión de Servicios</h2>
        <button
          onClick={() => {
            setFormData({
              service_name: "",
              service_photo: "",
              service_photo_MKT: "",
              service_description: "",
              status: "active",
            });
            setShowForm(true);
          }}
          className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74] flex items-center space-x-2 font-semibold"
        >
          <Plus size={18} />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* TABLA DE SERVICIOS */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#008C96] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Foto Principal</th>
                <th className="px-4 py-3 text-left">Foto Marketing</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    {loadingServices ? "Cargando..." : "No hay servicios registrados"}
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.service_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{service.service_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={getImageUrl(service.service_photo, "service")}
                        alt={service.service_name}
                        onError={(e) => (e.target.src = FALLBACK_IMAGES.service)}
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={getImageUrl(service.service_photo_MKT, "service")}
                        alt={`${service.service_name} MKT`}
                        onError={(e) => (e.target.src = FALLBACK_IMAGES.service)}
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 max-w-md">
                        {service.service_description || "Sin descripción"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          service.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(service);
                            setShowForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#008C96]">
                {editingItem ? "Editar Servicio" : "Agregar Servicio"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COLUMNA 1: DATOS */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Servicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.service_name}
                      onChange={(e) =>
                        setFormData({ ...formData, service_name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      placeholder="Top Ups"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.service_description}
                      onChange={(e) =>
                        setFormData({ ...formData, service_description: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                      rows={4}
                      placeholder="Descripción del servicio..."
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* COLUMNA 2: IMÁGENES */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto Principal
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      {formData.service_photo ? (
                        <div className="relative">
                          <img
                            src={getImageUrl(formData.service_photo, "service")}
                            alt="Foto Principal"
                            onError={(e) => (e.target.src = FALLBACK_IMAGES.service)}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, service_photo: "" })
                            }
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <Upload size={32} className="mb-2" />
                          <p className="text-sm">Foto principal del servicio</p>
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
                                setFormData((prev) => ({ ...prev, service_photo: url }));
                              },
                              "services"
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto Marketing
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      {formData.service_photo_MKT ? (
                        <div className="relative">
                          <img
                            src={getImageUrl(formData.service_photo_MKT, "service")}
                            alt="Foto Marketing"
                            onError={(e) => (e.target.src = FALLBACK_IMAGES.service)}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, service_photo_MKT: "" })
                            }
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <Upload size={32} className="mb-2" />
                          <p className="text-sm">Foto de marketing</p>
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
                                setFormData((prev) => ({ ...prev, service_photo_MKT: url }));
                              },
                              "services"
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

export default memo(ServicesTab);