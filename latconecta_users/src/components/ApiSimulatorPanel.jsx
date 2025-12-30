import React, { useState, useEffect } from 'react';
import { X, Settings, CheckCircle, XCircle, RotateCcw, Save, Upload, Download } from 'lucide-react';
import axios from 'axios';

/**
 * ApiSimulatorPanel - Panel de control para simular respuestas de APIs externas
 * VERSIÓN MEJORADA: Sincroniza con backend mock universal
 * 
 * Uso:
 * import ApiSimulatorPanel from './components/ApiSimulatorPanel';
 * <ApiSimulatorPanel />
 */
const ApiSimulatorPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'success', 'error', null

  const BACKEND_URL = 'http://localhost:8100';

  // Configuración inicial de las APIs
  const defaultConfig = {
    // VALIDACIÓN
    VALNUMTEL: {
      status: 'success',
      valid: true,
      operator: 'bitel',
      country: 'PE',
      account_type: 'prepaid',
      errorMessage: 'Número de teléfono inválido'
    },
    VALNUMCTA: {
      status: 'success',
      valid: true,
      monto_base: 85.50,
      indicador: 'T',
      errorMessage: 'Número de cuenta inválido'
    },

    // PROVISIÓN
    APIRECARGA: {
      status: 'success',
      provision_ref: 'PROV-REC-001',
      delivery_status: 'completed',
      errorMessage: 'Error al provisionar recarga'
    },
    APIPAGOREC: {
      status: 'success',
      provision_ref: 'PROV-PAG-001',
      delivery_status: 'completed',
      errorMessage: 'Error al registrar pago de recibo'
    },
    APIYAPE: {
      status: 'success',
      provision_ref: 'PROV-YAPE-001',
      delivery_status: 'completed',
      errorMessage: 'Error en transferencia YAPE'
    },
    APISMART: {
      status: 'success',
      provision_ref: 'PROV-SMART-001',
      delivery_status: 'pending_delivery',
      errorMessage: 'Error al registrar venta de smartphone'
    },

    // PAGO
    APICARD: {
      status: 'success',
      payment_ref: 'PAY-CARD-001',
      payment_status: 'completed',
      card_last_digits: '1234',
      errorMessage: 'Error al procesar pago con tarjeta'
    },
    APIREVCARD: {
      status: 'success',
      reversal_ref: 'REV-CARD-001',
      reversal_status: 'reversed',
      errorMessage: 'Error al revertir pago'
    },
    APIBARC: {
      status: 'success',
      barcode: 'BC123456789',
      barcode_image: 'https://via.placeholder.com/300x100?text=BARCODE',
      payment_status: 'pending',
      expires_at: '2024-12-31T23:59:59',
      errorMessage: 'Error al generar barcode'
    }
  };

  // Cargar configuración del backend al montar
  useEffect(() => {
    loadConfigFromBackend();
  }, []);

  // Cargar config desde backend
  const loadConfigFromBackend = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/mock/config/legacy`);
      
      if (response.data && response.data.apis) {
        setConfig(response.data.apis);
        localStorage.setItem('apiSimulatorConfig', JSON.stringify(response.data.apis));
        setSyncStatus('success');
        setTimeout(() => setSyncStatus(null), 2000);
      } else {
        // Si backend no tiene config, usar defaults
        setConfig(defaultConfig);
        localStorage.setItem('apiSimulatorConfig', JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Error cargando config desde backend:', error);
      // Fallback a localStorage
      const savedConfig = localStorage.getItem('apiSimulatorConfig');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      } else {
        setConfig(defaultConfig);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar configuración (localStorage + backend)
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // 1. Guardar en localStorage (backup)
      localStorage.setItem('apiSimulatorConfig', JSON.stringify(config));
      
      // 2. Enviar al backend (bulk update)
      await axios.post(`${BACKEND_URL}/api/v1/mock/config/legacy/bulk`, config);
      
      setSyncStatus('success');
      setTimeout(() => {
        setSyncStatus(null);
        setIsSaving(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error guardando config:', error);
      setSyncStatus('error');
      setTimeout(() => {
        setSyncStatus(null);
        setIsSaving(false);
      }, 3000);
    }
  };

  // Resetear a valores por defecto
  const handleReset = async () => {
    if (window.confirm('¿Resetear toda la configuración a valores por defecto?')) {
      try {
        // Resetear en backend
        await axios.post(`${BACKEND_URL}/api/v1/mock/config/legacy/reset`);
        
        // Recargar desde backend
        await loadConfigFromBackend();
        
        alert('✅ Configuración reseteada');
      } catch (error) {
        console.error('Error reseteando:', error);
        // Fallback local
        setConfig(defaultConfig);
        localStorage.setItem('apiSimulatorConfig', JSON.stringify(defaultConfig));
        alert('✅ Configuración reseteada (solo local)');
      }
    }
  };

  // Cambiar estado de una API
  const toggleApiStatus = (apiName) => {
    setConfig(prev => ({
      ...prev,
      [apiName]: {
        ...prev[apiName],
        status: prev[apiName].status === 'success' ? 'failed' : 'success'
      }
    }));
  };

  // Actualizar campo de una API
  const updateApiField = (apiName, field, value) => {
    setConfig(prev => ({
      ...prev,
      [apiName]: {
        ...prev[apiName],
        [field]: value
      }
    }));
  };

  // Exportar configuración
  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `mock-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Importar configuración
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setConfig(imported);
          alert('✅ Configuración importada. No olvides guardar.');
        } catch (error) {
          alert('❌ Error al importar archivo');
        }
      };
      reader.readAsText(file);
    }
  };

  // Renderizar sección de API
  const renderApiSection = (title, apis) => (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">{title}</h3>
      <div className="space-y-3">
        {apis.map(api => (
          <div key={api.name} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800 text-sm">{api.name}</span>
              <button
                onClick={() => toggleApiStatus(api.name)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  config[api.name]?.status === 'success'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {config[api.name]?.status === 'success' ? (
                  <>
                    <CheckCircle size={14} />
                    <span>OK</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    <span>ERROR</span>
                  </>
                )}
              </button>
            </div>

            {/* Campos específicos por API */}
            {config[api.name]?.status === 'success' ? (
              <div className="space-y-2">
                {api.fields.map(field => (
                  <div key={field.key}>
                    <label className="text-xs text-gray-600 block mb-1">{field.label}:</label>
                    {field.type === 'select' ? (
                      <select
                        value={config[api.name]?.[field.key] || ''}
                        onChange={(e) => updateApiField(api.name, field.key, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        step="0.01"
                        value={config[api.name]?.[field.key] || ''}
                        onChange={(e) => updateApiField(api.name, field.key, parseFloat(e.target.value))}
                        placeholder={field.placeholder}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={config[api.name]?.[field.key] || ''}
                        onChange={(e) => updateApiField(api.name, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <label className="text-xs text-gray-600 block mb-1">Mensaje de error:</label>
                <input
                  type="text"
                  value={config[api.name]?.errorMessage || ''}
                  onChange={(e) => updateApiField(api.name, 'errorMessage', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-red-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Configuración de APIs por categoría
  const apiSections = [
    {
      title: '📞 Validación',
      apis: [
        {
          name: 'VALNUMTEL',
          fields: [
            { key: 'operator', label: 'Operador', placeholder: 'bitel' },
            { key: 'country', label: 'País', placeholder: 'PE' }
          ]
        },
        {
          name: 'VALNUMCTA',
          fields: [
            { key: 'monto_base', label: 'Monto Base', type: 'number', placeholder: '85.50' },
            { key: 'indicador', label: 'Indicador', type: 'select', options: ['T', 'R'] }
          ]
        }
      ]
    },
    {
      title: '🔌 Provisión de Servicios',
      apis: [
        {
          name: 'APIRECARGA',
          fields: [
            { key: 'provision_ref', label: 'Ref. Provisión', placeholder: 'PROV-REC-001' },
            { key: 'delivery_status', label: 'Estado', type: 'select', options: ['completed', 'pending', 'failed'] }
          ]
        },
        {
          name: 'APIPAGOREC',
          fields: [
            { key: 'provision_ref', label: 'Ref. Provisión', placeholder: 'PROV-PAG-001' },
            { key: 'delivery_status', label: 'Estado', type: 'select', options: ['completed', 'pending', 'failed'] }
          ]
        },
        {
          name: 'APIYAPE',
          fields: [
            { key: 'provision_ref', label: 'Ref. Provisión', placeholder: 'PROV-YAPE-001' },
            { key: 'delivery_status', label: 'Estado', type: 'select', options: ['completed', 'pending', 'failed'] }
          ]
        },
        {
          name: 'APISMART',
          fields: [
            { key: 'provision_ref', label: 'Ref. Provisión', placeholder: 'PROV-SMART-001' },
            { key: 'delivery_status', label: 'Estado', type: 'select', options: ['pending_delivery', 'in_transit', 'delivered'] }
          ]
        }
      ]
    },
    {
      title: '💳 Procesamiento de Pago',
      apis: [
        {
          name: 'APICARD',
          fields: [
            { key: 'payment_ref', label: 'Ref. Pago', placeholder: 'PAY-CARD-001' },
            { key: 'payment_status', label: 'Estado', type: 'select', options: ['completed', 'pending', 'failed'] },
            { key: 'card_last_digits', label: 'Últimos 4 dígitos', placeholder: '1234' }
          ]
        },
        {
          name: 'APIREVCARD',
          fields: [
            { key: 'reversal_ref', label: 'Ref. Reversión', placeholder: 'REV-CARD-001' },
            { key: 'reversal_status', label: 'Estado', type: 'select', options: ['reversed', 'pending', 'failed'] }
          ]
        },
        {
          name: 'APIBARC',
          fields: [
            { key: 'barcode', label: 'Código Barcode', placeholder: 'BC123456789' },
            { key: 'barcode_image', label: 'URL Imagen', placeholder: 'https://...' },
            { key: 'payment_status', label: 'Estado', type: 'select', options: ['pending', 'paid', 'expired'] }
          ]
        }
      ]
    }
  ];

  return (
    <>
      {/* Botón flotante para abrir panel */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50 flex items-center gap-2"
        title="Abrir Simulador de APIs"
      >
        <Settings size={20} />
        <span className="text-xs font-medium pr-1">API Simulator</span>
        {syncStatus === 'success' && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
        )}
      </button>

      {/* Panel lateral */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">🔧 API Simulator</h2>
                <p className="text-xs text-blue-100">
                  {syncStatus === 'success' ? '✅ Sincronizado con backend' : 
                   syncStatus === 'error' ? '❌ Error de sincronización' :
                   'Configurar respuestas de APIs'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-700 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Cargando configuración...</p>
                  </div>
                </div>
              ) : (
                <>
                  {apiSections.map(section => renderApiSection(section.title, section.apis))}
                </>
              )}
            </div>

            {/* Footer - Actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Save size={16} />
                  <span className="text-sm font-medium">
                    {isSaving ? 'Guardando...' : syncStatus === 'success' ? '✅ Guardado' : 'Guardar'}
                  </span>
                </button>
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw size={16} />
                  <span className="text-sm font-medium">Reset</span>
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  <Download size={14} />
                  <span>Exportar</span>
                </button>
                <label className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs cursor-pointer">
                  <Upload size={14} />
                  <span>Importar</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ApiSimulatorPanel;