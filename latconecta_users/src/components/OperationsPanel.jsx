import React, { useState, useEffect, useCallback } from 'react';
import { Settings, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import opsConfigService from '../services/operationsConfigService';

const OperationsPanel = ({ onConfigChange }) => {
  const [config, setConfig] = useState(null);
  const [presets, setPresets] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState(opsConfigService.getPin());
  const [pinError, setPinError] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const loadConfig = useCallback(async () => {
    if (!opsConfigService.getPin()) return;
    setLoading(true);
    try {
      const cfg = await opsConfigService.getConfig();
      if (cfg) { setConfig(cfg); setPinError(false); }
      const p = await opsConfigService.getPresets();
      setPresets(p.presets || []);
    } catch (e) { setPinError(true); }
    setLoading(false);
  }, []);

  const handlePinSubmit = () => {
    opsConfigService.setPin(pinInput);
    setPin(pinInput);
    loadConfig();
  };

  const handleModeChange = async (operation, newMode) => {
    const currentResponse = config[operation]?.fase1_response || 'success';
    await opsConfigService.setOperation(operation, newMode, currentResponse);
    opsConfigService.invalidateCache();
    await loadConfig();
    if (onConfigChange) onConfigChange();
  };

  const handleResponseChange = async (operation, newResponse) => {
    const currentMode = config[operation]?.mode || 'fase1';
    await opsConfigService.setOperation(operation, currentMode, newResponse);
    opsConfigService.invalidateCache();
    await loadConfig();
    if (onConfigChange) onConfigChange();
  };

  const handlePreset = async (presetId) => {
    setLoading(true);
    await opsConfigService.applyPreset(presetId);
    opsConfigService.invalidateCache();
    await loadConfig();
    if (onConfigChange) onConfigChange();
    setLoading(false);
  };

  useEffect(() => { if (pin) loadConfig(); }, [loadConfig, pin]);

  const operations = config ? Object.entries(config) : [];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón toggle — siempre visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-700 text-sm"
      >
        <Settings size={16} />
        <span>Control Ops</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Panel expandido */}
      {expanded && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-2xl p-4 w-[420px] max-h-[70vh] overflow-y-auto">

          {/* Sin PIN — mostrar formulario */}
          {!pin && (
            <div>
              <h3 className="font-bold text-sm text-gray-800 mb-3">Ingresa el PIN de acceso</h3>
              <input
                type="password"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
                placeholder="PIN"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-xs mb-2">PIN incorrecto</p>}
              <button
                onClick={handlePinSubmit}
                className="w-full bg-gray-800 text-white py-1.5 rounded text-sm hover:bg-gray-700"
              >
                Acceder
              </button>
            </div>
          )}

          {/* Con PIN — mostrar panel */}
          {pin && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-800">Control de Operaciones</h3>
                <button onClick={loadConfig} className="text-gray-500 hover:text-gray-700" title="Refrescar">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Presets */}
              <div className="mb-3 flex flex-wrap gap-1">
                <button onClick={() => handlePreset('all-fase1-success')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                  ✅ Todo F1 OK
                </button>
                <button onClick={() => handlePreset('all-fase1-fail')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                  ❌ Todo F1 Fail
                </button>
                <button onClick={() => handlePreset('all-fase2')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                  🚀 Todo F2
                </button>
                <button onClick={() => handlePreset('provision-fail-reversal-ok')} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">
                  ⚠️ Prov Fail
                </button>
                <button onClick={() => handlePreset('provision-fail-reversal-fail')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                  🚨 Crítico
                </button>
              </div>

              {/* Tabla de operaciones */}
              <div className="space-y-1">
                {operations.map(([op, cfg]) => (
                  <div key={op} className="flex items-center gap-2 py-1 border-b border-gray-100">
                    <div className="flex-1 text-xs text-gray-700 truncate" title={cfg.fase2_description}>
                      {cfg.label || op}
                    </div>
                    <button
                      onClick={() => handleModeChange(op, cfg.mode === 'fase1' ? 'fase2' : 'fase1')}
                      className={`text-xs px-2 py-0.5 rounded font-semibold min-w-[50px] text-center ${
                        cfg.mode === 'fase1' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {cfg.mode === 'fase1' ? '🎭 F1' : '🚀 F2'}
                    </button>
                    {cfg.mode === 'fase1' ? (
                      <button
                        onClick={() => handleResponseChange(op, cfg.fase1_response === 'success' ? 'fail' : 'success')}
                        className={`text-xs px-2 py-0.5 rounded font-semibold min-w-[55px] text-center ${
                          cfg.fase1_response === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {cfg.fase1_response === 'success' ? '✅ OK' : '❌ Fail'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 min-w-[55px] text-center">— real</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-400 border-t pt-2">
                F1 = Simulado (controlable) | F2 = Real (gateway/mapping)
              </div>
              <button
                onClick={() => { opsConfigService.clearPin(); setPin(''); setConfig(null); }}
                className="mt-2 text-xs text-gray-400 hover:text-red-500"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OperationsPanel;
