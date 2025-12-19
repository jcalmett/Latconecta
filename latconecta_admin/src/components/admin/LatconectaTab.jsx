import React, { useState, useEffect } from 'react';
import { Upload, X, Save } from 'lucide-react';
import latconectaService from '../../services/latconectaService';
import { getImageUrl, FALLBACK_IMAGES } from '../../utils/imageHelper';

const LatconectaTab = ({ showNotification, handleImageUpload }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    latconecta_name: '',
    latconecta_logo: '',
    latconecta_photo: '',
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

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔵 LatconectaTab: Cargando datos...');
      
      const data = await latconectaService.get();
      console.log('✅ LatconectaTab: Datos recibidos:', data);
      
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('❌ LatconectaTab: Error al cargar datos:', error);
      console.error('❌ LatconectaTab: Error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      showNotification('Error al cargar datos de Latconecta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('🔵 LatconectaTab: Guardando datos:', formData);
      
      const result = await latconectaService.update(formData);
      console.log('✅ LatconectaTab: Datos guardados:', result);
      
      showNotification('Información de Latconecta actualizada exitosamente');
      
      // Recargar datos
      await loadData();
    } catch (error) {
      console.error('❌ LatconectaTab: Error al guardar:', error);
      console.error('❌ LatconectaTab: Error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#008C96]">Información Corporativa de Latconecta</h2>
        <p className="text-gray-600 mt-2">Gestiona la información general de la empresa matriz</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA 1: Información Básica */}
        <div className="space-y-4">
          <div className="pb-2 border-b-2 border-[#FFE709]">
            <h4 className="font-bold text-[#008C96] text-lg">Información Básica</h4>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.latconecta_name}
              onChange={(e) => setFormData({ ...formData, latconecta_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="Latconecta"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.latconecta_description}
              onChange={(e) => setFormData({ ...formData, latconecta_description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              rows={4}
              placeholder="Descripción de la empresa..."
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              {formData.latconecta_logo ? (
                <div className="relative">
                  <img
                    src={getImageUrl(formData.latconecta_logo, 'companies')}
                    alt="Logo"
                    onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, latconecta_logo: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Upload size={48} className="mb-2" />
                  <p className="text-sm">Logo de la empresa</p>
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
                      setFormData((prev) => ({ ...prev, latconecta_logo: url }));
                    }, 'companies')
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto Principal</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              {formData.latconecta_photo ? (
                <div className="relative">
                  <img
                    src={getImageUrl(formData.latconecta_photo, 'companies')}
                    alt="Foto"
                    onError={(e) => (e.target.src = FALLBACK_IMAGES.company)}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, latconecta_photo: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Upload size={48} className="mb-2" />
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
                      setFormData((prev) => ({ ...prev, latconecta_photo: url }));
                    }, 'companies')
                  }
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: Contacto y Redes Sociales */}
        <div className="space-y-4">
          <div className="pb-2 border-b-2 border-[#FFE709]">
            <h4 className="font-bold text-[#008C96] text-lg">Información de Contacto</h4>
          </div>

          {/* Email Soporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Soporte</label>
            <input
              type="email"
              value={formData.latconecta_mail_support}
              onChange={(e) => setFormData({ ...formData, latconecta_mail_support: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="support@latconecta.com"
            />
          </div>

          {/* Email Comercial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Comercial</label>
            <input
              type="email"
              value={formData.latconecta_mail_comercial}
              onChange={(e) => setFormData({ ...formData, latconecta_mail_comercial: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="comercial@latconecta.com"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="text"
              value={formData.latconecta_phone}
              onChange={(e) => setFormData({ ...formData, latconecta_phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="+51 999 999 999"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <textarea
              value={formData.latconecta_address}
              onChange={(e) => setFormData({ ...formData, latconecta_address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              rows={2}
              placeholder="Dirección completa..."
            />
          </div>

          {/* Web */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
            <input
              type="url"
              value={formData.latconecta_web}
              onChange={(e) => setFormData({ ...formData, latconecta_web: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="https://latconecta.com"
            />
          </div>

          <div className="pt-4 pb-2 border-b-2 border-[#FFE709]">
            <h4 className="font-bold text-[#008C96] text-lg">Redes Sociales</h4>
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input
              type="url"
              value={formData.latconecta_facebook}
              onChange={(e) => setFormData({ ...formData, latconecta_facebook: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="https://facebook.com/latconecta"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input
              type="url"
              value={formData.latconecta_instagram}
              onChange={(e) => setFormData({ ...formData, latconecta_instagram: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="https://instagram.com/latconecta"
            />
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
            <input
              type="url"
              value={formData.latconecta_twitter}
              onChange={(e) => setFormData({ ...formData, latconecta_twitter: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="https://twitter.com/latconecta"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={formData.latconecta_linkedin}
              onChange={(e) => setFormData({ ...formData, latconecta_linkedin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="https://linkedin.com/company/latconecta"
            />
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
            <input
              type="url"
              value={formData.latconecta_youtube}
              onChange={(e) => setFormData({ ...formData, latconecta_youtube: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
              placeholder="https://youtube.com/@latconecta"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={formData.latconecta_status}
              onChange={(e) => setFormData({ ...formData, latconecta_status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFE709] focus:border-[#FFE709]"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#008C96] text-white px-8 py-3 rounded-lg hover:bg-[#006B74] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LatconectaTab;