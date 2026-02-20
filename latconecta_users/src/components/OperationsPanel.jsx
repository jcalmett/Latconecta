import React, { useState, useEffect, useCallback } from 'react';
import { Settings, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import opsConfigService from '../services/operationsConfigService';

/**
 * Operations Control Panel
 * Reemplaza MockControlPanel. Control centralizado fase1/fase2, success/fail.
 */
const OperationsPanel = ({ onConfigChange }) => {
  const [config, setConfig] = useState(null);
  const [presets, setPresets] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = await opsConfigService.getConfig();
      setConfig(cfg);
      const p = await opsConfigService.getPresets();
      setPresets(p.presets || []);
    } catch (e) { console.error('Error loading config:', e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

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

  if (!config) return null;

  const operations = Object.entries(config);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-700 text-sm"
      >
        <Settings size={16} />
        <span>Control Ops</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Panel */}
      {expanded && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-2xl p-4 w-[420px] max-h-[70vh] overflow-y-auto">
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

          {/* Operations table */}
          <div className="space-y-1">
            {operations.map(([op, cfg]) => (
              <div key={op} className="flex items-center gap-2 py-1 border-b border-gray-100">
                {/* Label */}
                <div className="flex-1 text-xs text-gray-700 truncate" title={cfg.fase2_description}>
                  {cfg.label || op}
                </div>

                {/* Mode toggle */}
                <button
                  onClick={() => handleModeChange(op, cfg.mode === 'fase1' ? 'fase2' : 'fase1')}
                  className={`text-xs px-2 py-0.5 rounded font-semibold min-w-[50px] text-center ${
                    cfg.mode === 'fase1'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                  title={cfg.mode === 'fase2' ? cfg.fase2_description : 'Simulado'}
                >
                  {cfg.mode === 'fase1' ? '🎭 F1' : '🚀 F2'}
                </button>

                {/* Success/Fail toggle (solo fase1) */}
                {cfg.mode === 'fase1' ? (
                  <button
                    onClick={() => handleResponseChange(op, cfg.fase1_response === 'success' ? 'fail' : 'success')}
                    className={`text-xs px-2 py-0.5 rounded font-semibold min-w-[55px] text-center ${
                      cfg.fase1_response === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
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

          {/* Info */}
          <div className="mt-3 text-xs text-gray-400 border-t pt-2">
            F1 = Simulado (controlable) | F2 = Real (gateway/mapping)
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsPanel;