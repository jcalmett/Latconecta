import React, { useState, useEffect } from 'react';
import { X, Settings, CheckCircle, XCircle, RotateCcw, Save } from 'lucide-react';

/**
 * ApiSimulatorPanel - Panel de control para simular respuestas de APIs externas
 * Permite configurar respuestas exitosas o fallidas para cada API durante desarrollo
 * 
 * Uso:
 * import ApiSimulatorPanel from './components/ApiSimulatorPanel';
 * <ApiSimulatorPanel />
 */
const ApiSimulatorPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Configuración inicial de las APIs
  const defaultConfig = {
    // VALIDACIÓN
    VALNUMTEL: {
      status: 'success',
      errorMessage: 'Número de teléfono inválido'
    },
    VALNUMCTA: {
      status: 'success',
      monto_base: '85.50',
      indicador: 'T',
      errorMessage: 'Número de cuenta inválido'
    },
    
    // PROVISIÓN
    APIRECARGA: {
      status: 'success',
      provision_ref: 'PROV-REC-001',
      errorMessage: 'Error al provisionar recarga'
    },
    APIPAGOREC: {
      status: 'success',
      provision_ref: 'PROV-PAG-001',
      errorMessage: 'Error al registrar pago de recibo'
    },
    APIYAPE: {
      status: 'success',
      provision_ref: 'PROV-YAPE-001',
      errorMessage: 'Error en transferencia YAPE'
    },
    APISMART: {
      status: 'success',
      provision_ref: 'PROV-SMART-001',
      errorMessage: 'Error al registrar venta de smartphone'
    },
    
    // PAGO
    APICARD: {
      status: 'success',
      payment_ref: 'PAY-CARD-001',
      errorMessage: 'Error al procesar pago con tarjeta'
    },
    APIREVCARD: {
      status: 'success',
      reversal_ref: 'REV-CARD-001',
      errorMessage: 'Error al revertir pago'
    },
    APIBARC: {
      status: 'success',
      barcode: 'BC123456789',
      barcode_image: 'https://via.placeholder.com/300x100?text=BARCODE',
      errorMessage: 'Error al generar barcode'
    }
  };

  // Cargar configuración del localStorage al montar
  useEffect(() => {
    const savedConfig = localStorage.getItem('apiSimulatorConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    } else {
      setConfig(defaultConfig);
    }
  }, []);

  // Guardar configuración
  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('apiSimulatorConfig', JSON.stringify(config));
    setTimeout(() => {
      setIsSaving(false);
      alert('✅ Configuración guardada');
    }, 300);
  };

  // Resetear a valores por defecto
  const handleReset = () => {
    if (window.confirm('¿Resetear toda la configuración a valores por defecto?')) {
      setConfig(defaultConfig);
      localStorage.setItem('apiSimulatorConfig', JSON.stringify(defaultConfig));
      alert('✅ Configuración reseteada');
    }
  };

  // Cambiar estado de una API
  const toggleApiStatus = (apiName) => {
    setConfig(prev => ({
      ...prev,
      [apiName]: {
        ...prev[apiName],
        status: prev[apiName].status === 'success' ? 'error' : 'success'
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
          fields: []
        },
        {
          name: 'VALNUMCTA',
          fields: [
            { key: 'monto_base', label: 'Monto Base', placeholder: '85.50' },
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
          fields: [{ key: 'provision_ref', label: 'Ref. Provisión', placeholder: 'PROV-REC-001' }]
        },
        {
          name: 'APIPAGOREC',
          fields: [{ key: 'provision_ref', label: 'Ref. Provisión', placeholder: 'PROV-PAG-001' }]
        },
        {
          name: 'APIYAPE',
          fields: [{ key: 'provision_ref', label: 'Ref. Provisión', placeholder: 'PROV-YAPE-001' }]
        },
        {
          name: 'APISMART',
          fields: [{ key: 'provision_ref', label: 'Ref. Provisión', placeholder: 'PROV-SMART-001' }]
        }
      ]
    },
    {
      title: '💳 Procesamiento de Pago',
      apis: [
        {
          name: 'APICARD',
          fields: [{ key: 'payment_ref', label: 'Ref. Pago', placeholder: 'PAY-CARD-001' }]
        },
        {
          name: 'APIREVCARD',
          fields: [{ key: 'reversal_ref', label: 'Ref. Reversión', placeholder: 'REV-CARD-001' }]
        },
        {
          name: 'APIBARC',
          fields: [
            { key: 'barcode', label: 'Código Barcode', placeholder: 'BC123456789' },
            { key: 'barcode_image', label: 'URL Imagen', placeholder: 'https://...' }
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
                <p className="text-xs text-blue-100">Configurar respuestas de APIs</p>
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
              {apiSections.map(section => renderApiSection(section.title, section.apis))}
            </div>

            {/* Footer - Actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={16} />
                <span className="text-sm font-medium">{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={16} />
                <span className="text-sm font-medium">Reset</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ApiSimulatorPanel;
