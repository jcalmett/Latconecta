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
  // ✅ CORREGIDO: Cargar AMBAS fotos correctamente en modo edición
  useEffect(() => {
    if (editingItem) {
      setFormData({
        service_name: editingItem.service_name || "",
        service_photo: editingItem.service_photo || "",
        service_photo_MKT: editingItem.service_photo_MKT || "", // ✅ Asegurar carga
        service_description: editingItem.service_description || "",
        status: editingItem.status || "active",
      });
    }
  }, [editingItem, setFormData]);

  const handleSave = async () => {
    try {
      if (!formData.service_name || !formData.service_description) {
        showNotification("Por favor complete los campos obligatorios", "error");
        return;
      }

      if (editingItem) {
        await servicesService.update(editingItem.service_id, formData);
        showNotification(`Servicio "${formData.service_name}" actualizado`);
      } else {
        await servicesService.create(formData);
        showNotification(`Servicio "${formData.service_name}" creado`);
      }

      await loadServices();
      resetForm();
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      showNotification("Error al guardar el servicio", "error");
    }
  };

  const handleDelete = (service) => {
    setConfirmDialog({
      show: true,
      title: "Eliminar Servicio",
      message: `¿Estás seguro de eliminar "${service.service_name}"?`,
      onConfirm: async () => {
        try {
          await servicesService.delete(service.service_id);
          showNotification(`Servicio "${service.service_name}" eliminado`);
          await loadServices();
        } catch (error) {
          console.error("Error al eliminar servicio:", error);
          showNotification("Error al eliminar el servicio", "error");
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
        <h2 className="text-2xl font-bold text-[#008C96]">
          Gestión de Servicios
        </h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.service_id}
            className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-[#FFE709] hover:shadow-lg transition-shadow"
          >
            <img
              src={getImageUrl(service.service_photo, "service")}
              alt={service.service_name}
              onError={(e) => (e.target.src = FALLBACK_IMAGES.service)}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#008C96] mb-2">
                {service.service_name}
              </h3>
              <p className="text-gray-600 mb-4">
                {service.service_description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {service.status}
                </span>
                <div className="flex space-x-2">
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#008C96]">
                {editingItem ? "Editar Servicio" : "Nuevo Servicio"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.service_name}
                    onChange={(e) =>
                      setFormData({ ...formData, service_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.service_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* ✅ FOTO PRINCIPAL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Principal
                  </label>
                  {formData.service_photo && (
                    <img
                      src={getImageUrl(formData.service_photo, "service")}
                      alt="Preview"
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.service)}
                      className="mb-2 w-full h-32 object-cover rounded-lg border-2 border-[#FFE709]"
                    />
                  )}
                  <label className="cursor-pointer bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center justify-center space-x-2 font-semibold">
                    <Upload size={18} />
                    <span>Subir Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(
                          e,
                          (url) =>
                            setFormData((prev) => ({
                              ...prev,
                              service_photo: url,
                            })),
                          "services"
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {/* ✅ FOTO MARKETING - VERIFICADA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Marketing
                  </label>
                  {formData.service_photo_MKT && (
                    <img
                      src={getImageUrl(formData.service_photo_MKT, "service")}
                      alt="Preview Marketing"
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.service)}
                      className="mb-2 w-full h-32 object-cover rounded-lg border-2 border-[#FFE709]"
                    />
                  )}
                  <label className="cursor-pointer bg-[#008C96] text-white px-4 py-2 rounded-lg hover:bg-[#006B74] flex items-center justify-center space-x-2 font-semibold">
                    <Upload size={18} />
                    <span>Subir Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(
                          e,
                          (url) =>
                            setFormData((prev) => ({
                              ...prev,
                              service_photo_MKT: url,
                            })),
                          "services"
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#008C96] text-white rounded-lg hover:bg-[#006B74] font-semibold"
              >
                {editingItem ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ServicesTab);