import React, { useState, useEffect } from 'react';
import { Settings, X, ChevronDown, ChevronUp, Check, XCircle, RefreshCw } from 'lucide-react';

/**
 * MockControlPanel - Panel flotante para controlar APIs mock
 * ✅ MODIFICADO: Ahora sincroniza con localStorage para validaciones
 * ✅ CORREGIDO: updateValCuenta ahora funciona correctamente
 */

const MockControlPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = 'http://localhost:8100/api/v1/mock';

  // APIs con sus configuraciones
  const APIS = {
    'VALNRO': { name: 'Val. Número', color: '#3b82f6' },
    'VALCUENTA': { name: 'Val. Cuenta', color: '#8b5cf6', hasParams: true },
    'PAGOTARJETA': { name: 'Pago Tarjeta', color: '#10b981' },
    'BARCODE': { name: 'Barcode', color: '#f59e0b' },
    'PROVISION_TOPUP': { name: 'Prov. Topup', color: '#06b6d4' },
    'PROVISION_PACKAGE': { name: 'Prov. Package', color: '#06b6d4' },
    'PROVISION_TRANSFER': { name: 'Prov. Transfer', color: '#06b6d4' },
    'PROVISION_BILLPAYMENT': { name: 'Prov. Bill', color: '#06b6d4' },
    'PROVISION_SMARTPHONE': { name: 'Prov. Phone', color: '#06b6d4' },
    'REVERSION': { name: 'Reversión', color: '#ef4444' }
  };

  // Cargar configuración
  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/config`);
      const data = await response.json();
      setConfig(data.config);
      showMessage('✅ Config cargada', 'success');
    } catch (error) {
      showMessage('❌ Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: Sincronizar con localStorage del frontend
  function syncToLocalStorage(apiName, apiConfig) {
    try {
      const localConfig = JSON.parse(localStorage.getItem('apiSimulatorConfig') || '{}');

      // Mapear nombres de APIs backend → frontend
      const apiMap = {
        'VALNRO': 'VALNUMTEL',
        'VALCUENTA': 'VALNUMCTA'
      };

      const frontendApiName = apiMap[apiName] || apiName;

      localConfig[frontendApiName] = {
        status: apiConfig.response === 'success' ? 'success' : 'error',
        ...apiConfig
      };

      localStorage.setItem('apiSimulatorConfig', JSON.stringify(localConfig));
      console.log('✅ LocalStorage sincronizado:', frontendApiName, localConfig[frontendApiName]);
    } catch (error) {
      console.error('❌ Error sincronizando localStorage:', error);
    }
  }

  // ✅ MODIFICADO: Cambiar estado de API + sincronizar localStorage
  const toggleAPI = async (apiName, newResponse) => {
    try {
      const response = await fetch(`${API_URL}/config/${apiName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_name: apiName, response: newResponse })
      });

      if (response.ok) {
        const currentConfig = config[apiName] || {};
        syncToLocalStorage(apiName, {
          ...currentConfig,
          response: newResponse
        });

        showMessage(`✅ ${apiName} → ${newResponse}`, 'success');
        loadConfig();
      }
    } catch (error) {
      showMessage('❌ ' + error.message, 'error');
    }
  };

  // Activar escenario
  const activateScenario = async (scenarioId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/scenarios/${scenarioId}`, {
        method: 'POST'
      });

      if (response.ok) {
        showMessage('✅ Escenario activado', 'success');
        loadConfig();
      }
    } catch (error) {
      showMessage('❌ ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREGIDO: Mover updateValCuenta AQUÍ (antes del return)
  const updateValCuenta = async (updates) => {
    try {
      const currentConfig = config.VALCUENTA || {};

      const payload = {
        response: currentConfig.response || 'success',
        monto_base: updates.monto_base !== undefined ? updates.monto_base : (currentConfig.monto_base || 85.50),
        indicador: updates.indicador !== undefined ? updates.indicador : (currentConfig.indicador || 'T')
      };

      console.log('📤 Enviando a backend:', payload);

      const response = await fetch(`${API_URL}/config/valcuenta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backend respondió:', result);

        // ✅ Sincronizar con localStorage
        syncToLocalStorage('VALCUENTA', payload);

        showMessage('✅ VALCUENTA actualizado', 'success');
        await loadConfig();
      } else {
        const error = await response.json();
        console.error('❌ Error del backend:', error);
        showMessage('❌ Error: ' + (error.detail || JSON.stringify(error)), 'error');
      }
    } catch (error) {
      console.error('❌ Error en updateValCuenta:', error);
      showMessage('❌ ' + error.message, 'error');
    }
  };

  // Mostrar mensaje temporal
  const showMessage = (msg, type) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Cargar al abrir
  useEffect(() => {
    if (isOpen && Object.keys(config).length === 0) {
      loadConfig();
    }
  }, [isOpen]);

  if (!isOpen) {
    // Botón flotante para abrir
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 hover:scale-110"
        title="Abrir Panel Mock"
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl z-50 border-2 border-purple-200"
         style={{
           width: isCollapsed ? '320px' : '400px',
           maxHeight: isCollapsed ? '60px' : '600px',
           transition: 'all 0.3s'
         }}>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between cursor-pointer"
           onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center gap-2">
          <Settings size={20} />
          <span className="font-bold">Mock Control</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <RefreshCw size={16} className="animate-spin" />}
          <button onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}>
            {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      {!isCollapsed && (
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '540px' }}>

          {/* MENSAJE */}
          {message && (
            <div className={`mb-3 p-2 rounded text-sm font-semibold ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* ESCENARIOS RÁPIDOS */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">⚡ Escenarios</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => activateScenario('happy-path')}
                className="bg-green-500 text-white text-xs py-2 px-3 rounded hover:bg-green-600 transition"
              >
                ✅ Todo OK
              </button>
              <button
                onClick={() => activateScenario('payment-failed')}
                className="bg-red-500 text-white text-xs py-2 px-3 rounded hover:bg-red-600 transition"
              >
                ❌ Pago Falla
              </button>
              <button
                onClick={() => activateScenario('provision-failed-reversal-ok')}
                className="bg-orange-500 text-white text-xs py-2 px-3 rounded hover:bg-orange-600 transition"
              >
                ⚠️ Prov. Falla
              </button>
              <button
                onClick={() => activateScenario('bill-payment-partial')}
                className="bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600 transition"
              >
                🔄 Bill Parcial
              </button>
            </div>
          </div>

          {/* CONTROL INDIVIDUAL */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">🎛️ Control Individual</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {Object.entries(APIS).map(([apiKey, apiInfo]) => {
                const apiConfig = config[apiKey] || { response: 'success' };
                const isSuccess = apiConfig.response === 'success';

                return (
                  <div key={apiKey} className="bg-gray-50 p-2 rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: apiInfo.color }}
                        />
                        <span className="text-xs font-semibold text-gray-700">
                          {apiInfo.name}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleAPI(apiKey, 'success')}
                          disabled={isSuccess}
                          className={`p-1 rounded text-xs ${
                            isSuccess
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                          }`}
                          title="Success"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => toggleAPI(apiKey, 'error')}
                          disabled={!isSuccess}
                          className={`p-1 rounded text-xs ${
                            !isSuccess
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                          }`}
                          title="Error"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>

                    {/* PARÁMETROS VALCUENTA */}
                    {apiKey === 'VALCUENTA' && apiInfo.hasParams && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-300">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Monto</label>
                          <input
                            type="number"
                            step="0.01"
                            value={apiConfig.monto_base || 85.50}
                            onChange={(e) => updateValCuenta({ monto_base: parseFloat(e.target.value) })}
                            className="w-full text-xs p-1 border rounded"
                            placeholder="85.50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Tipo</label>
                          <select
                            value={apiConfig.indicador || 'T'}
                            onChange={(e) => updateValCuenta({ indicador: e.target.value })}
                            className="w-full text-xs p-1 border rounded"
                          >
                            <option value="T">Total (T)</option>
                            <option value="R">Parcial (R)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTÓN RECARGAR */}
          <button
            onClick={loadConfig}
            className="w-full mt-3 bg-blue-500 text-white text-sm py-2 rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Recargar Config
          </button>
        </div>
      )}
    </div>
  );
};

export default MockControlPanel;