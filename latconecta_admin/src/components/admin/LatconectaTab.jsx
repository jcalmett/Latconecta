import React, { useState, useEffect } from 'react';
import { Upload, X, Save } from 'lucide-react';
import latconectaService from '../../services/latconectaService';
import { getImageUrl, FALLBACK_IMAGES } from '../../utils/imageHelper';

const LatconectaTab = ({ showNotification, handleImageUpload }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    latconecta_name: '',
    latconecta_logo: '',
    latconecta_photo: '',
    latconecta_photo_mkt1: '',
    latconecta_photo_mkt2: '',
    latconecta_photo_mkt3: '',
    latconecta_photo_mkt4: '',
    latconecta_lema_1: '',
    latconecta_lema_2: '',
    latconecta_description: '',
    latconecta_mail_support: '',
    latconecta_mail_comercial: '',
    latconecta_web: '',
    latconecta_facebook: '',
    latconecta_instagram: '',
    latconecta_twitter: '',
    latconecta_linkedin: '',
    latconecta_youtube: '',
    latconecta_phone: '',
    latconecta_address: '',
    latconecta_status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await latconectaService.get();
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar datos de Latconecta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await latconectaService.update(formData);
      showNotification('Información de Latconecta actualizada exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error al guardar:', error);
      const errorMsg = error.response?.data?.detail || 'Error al actualizar datos de Latconecta';
      showNotification(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008C96] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de Latconecta...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER CON TÍTULO Y BOTÓN GUARDAR */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#008C96]">Información Corporativa de Latconecta</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#008C96] text-white px-6 py-2 rounded-lg hover:bg-[#006B74] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="mb-3 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentPage(1)}
            className={`pb-3 px-4 font-semibold transition-colors ${
              currentPage === 1
                ? 'border-b-2 border-[#008C96] text-[#008C96]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Datos Generales
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`pb-3 px-4 font-semibold transition-colors ${
              currentPage === 2
                ? 'border-b-2 border-[#008C96] text-[#008C96]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Imágenes
          </button>
        </div>
      </div>

      {/* PÁGINA 1: DATOS GENERALES */}
      {currentPage === 1 && (
        <div>
          {/* DATOS BÁSICOS - 3 COLUMNAS */}
          <div className="mb-3">
            <div className="pb-2 border-b-2 border-[#FFE709] mb-3">
              <h4 className="font-bold text-[#008C96]">Información Básica</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.latconecta_name}
                  onChange={(e) => setFormData({ ...formData, latconecta_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="Latconecta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formData.latconecta_phone}
                  onChange={(e) => setFormData({ ...formData, latconecta_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="+51 999 999 999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.latconecta_status}
                  onChange={(e) => setFormData({ ...formData, latconecta_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* LEMAS - 2 COLUMNAS */}
          <div className="mb-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lema 1</label>
                <input
                  type="text"
                  value={formData.latconecta_lema_1}
                  onChange={(e) => setFormData({ ...formData, latconecta_lema_1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="Lema principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lema 2</label>
                <input
                  type="text"
                  value={formData.latconecta_lema_2}
                  onChange={(e) => setFormData({ ...formData, latconecta_lema_2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="Lema secundario"
                />
              </div>
            </div>
          </div>

          {/* DESCRIPCIÓN Y DIRECCIÓN - 2 COLUMNAS - 3 LÍNEAS */}
          <div className="mb-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.latconecta_description}
                  onChange={(e) => setFormData({ ...formData, latconecta_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  rows={3}
                  placeholder="Descripción..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea
                  value={formData.latconecta_address}
                  onChange={(e) => setFormData({ ...formData, latconecta_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  rows={3}
                  placeholder="Dirección..."
                />
              </div>
            </div>
          </div>

          {/* CONTACTO - 3 COLUMNAS */}
          <div className="mb-3">
            <div className="pb-2 border-b-2 border-[#FFE709] mb-3">
              <h4 className="font-bold text-[#008C96]">Contacto</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Soporte</label>
                <input
                  type="email"
                  value={formData.latconecta_mail_support}
                  onChange={(e) => setFormData({ ...formData, latconecta_mail_support: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="support@latconecta.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Comercial</label>
                <input
                  type="email"
                  value={formData.latconecta_mail_comercial}
                  onChange={(e) => setFormData({ ...formData, latconecta_mail_comercial: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="comercial@latconecta.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                <input
                  type="url"
                  value={formData.latconecta_web}
                  onChange={(e) => setFormData({ ...formData, latconecta_web: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="https://latconecta.com"
                />
              </div>
            </div>
          </div>

          {/* REDES SOCIALES - 3 COLUMNAS */}
          <div className="mb-3">
            <div className="pb-2 border-b-2 border-[#FFE709] mb-3">
              <h4 className="font-bold text-[#008C96]">Redes Sociales</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input
                  type="url"
                  value={formData.latconecta_facebook}
                  onChange={(e) => setFormData({ ...formData, latconecta_facebook: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="https://facebook.com/latconecta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <input
                  type="url"
                  value={formData.latconecta_instagram}
                  onChange={(e) => setFormData({ ...formData, latconecta_instagram: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="https://instagram.com/latconecta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input
                  type="url"
                  value={formData.latconecta_twitter}
                  onChange={(e) => setFormData({ ...formData, latconecta_twitter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="https://twitter.com/latconecta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={formData.latconecta_linkedin}
                  onChange={(e) => setFormData({ ...formData, latconecta_linkedin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="https://linkedin.com/company/latconecta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                <input
                  type="url"
                  value={formData.latconecta_youtube}
                  onChange={(e) => setFormData({ ...formData, latconecta_youtube: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709]"
                  placeholder="https://youtube.com/@latconecta"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PÁGINA 2: IMÁGENES */}
      {currentPage === 2 && (
        <div>
          <div className="pb-2 border-b-2 border-[#FFE709] mb-3">
            <h4 className="font-bold text-[#008C96]">Imágenes Corporativas</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                {formData.latconecta_logo ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(formData.latconecta_logo, 'companies')}
                      alt="Logo"
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                      className="w-full h-32 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, latconecta_logo: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <Upload size={28} />
                  </div>
                )}
                <label className="mt-2 cursor-pointer bg-[#008C96] text-white px-3 py-1.5 rounded-lg hover:bg-[#006B74] flex items-center justify-center text-sm font-semibold">
                  <Upload size={14} />
                  <span className="ml-1">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e, (url) => {
                        setFormData((prev) => ({ ...prev, latconecta_logo: url }));
                      }, 'companies')
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Foto Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto Principal</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                {formData.latconecta_photo ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(formData.latconecta_photo, 'companies')}
                      alt="Principal"
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                      className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, latconecta_photo: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <Upload size={28} />
                  </div>
                )}
                <label className="mt-2 cursor-pointer bg-[#008C96] text-white px-3 py-1.5 rounded-lg hover:bg-[#006B74] flex items-center justify-center text-sm font-semibold">
                  <Upload size={14} />
                  <span className="ml-1">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e, (url) => {
                        setFormData((prev) => ({ ...prev, latconecta_photo: url }));
                      }, 'companies')
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Marketing 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marketing 1</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                {formData.latconecta_photo_mkt1 ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(formData.latconecta_photo_mkt1, 'companies')}
                      alt="MKT1"
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                      className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, latconecta_photo_mkt1: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <Upload size={28} />
                  </div>
                )}
                <label className="mt-2 cursor-pointer bg-[#008C96] text-white px-3 py-1.5 rounded-lg hover:bg-[#006B74] flex items-center justify-center text-sm font-semibold">
                  <Upload size={14} />
                  <span className="ml-1">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e, (url) => {
                        setFormData((prev) => ({ ...prev, latconecta_photo_mkt1: url }));
                      }, 'companies')
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Marketing 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marketing 2</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                {formData.latconecta_photo_mkt2 ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(formData.latconecta_photo_mkt2, 'companies')}
                      alt="MKT2"
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                      className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, latconecta_photo_mkt2: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <Upload size={28} />
                  </div>
                )}
                <label className="mt-2 cursor-pointer bg-[#008C96] text-white px-3 py-1.5 rounded-lg hover:bg-[#006B74] flex items-center justify-center text-sm font-semibold">
                  <Upload size={14} />
                  <span className="ml-1">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e, (url) => {
                        setFormData((prev) => ({ ...prev, latconecta_photo_mkt2: url }));
                      }, 'companies')
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Marketing 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marketing 3</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                {formData.latconecta_photo_mkt3 ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(formData.latconecta_photo_mkt3, 'companies')}
                      alt="MKT3"
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                      className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, latconecta_photo_mkt3: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <Upload size={28} />
                  </div>
                )}
                <label className="mt-2 cursor-pointer bg-[#008C96] text-white px-3 py-1.5 rounded-lg hover:bg-[#006B74] flex items-center justify-center text-sm font-semibold">
                  <Upload size={14} />
                  <span className="ml-1">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e, (url) => {
                        setFormData((prev) => ({ ...prev, latconecta_photo_mkt3: url }));
                      }, 'companies')
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Marketing 4 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marketing 4</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                {formData.latconecta_photo_mkt4 ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(formData.latconecta_photo_mkt4, 'companies')}
                      alt="MKT4"
                      onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                      className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, latconecta_photo_mkt4: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <Upload size={28} />
                  </div>
                )}
                <label className="mt-2 cursor-pointer bg-[#008C96] text-white px-3 py-1.5 rounded-lg hover:bg-[#006B74] flex items-center justify-center text-sm font-semibold">
                  <Upload size={14} />
                  <span className="ml-1">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e, (url) => {
                        setFormData((prev) => ({ ...prev, latconecta_photo_mkt4: url }));
                      }, 'companies')
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatconectaTab;