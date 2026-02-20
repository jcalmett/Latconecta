/**
 * Operations Config Service (Frontend)
 * Reemplaza apiSimulatorService.js + paymentGatewayService.js
 * Una única fuente de verdad: consulta al backend.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8100/api/v1';

class OperationsConfigService {
  constructor() {
    this._cache = null;
    this._cacheTime = 0;
    this._cacheTTL = 5000;
  }

  async getConfig() {
    const now = Date.now();
    if (this._cache && (now - this._cacheTime) < this._cacheTTL) return this._cache;
    try {
      const r = await fetch(`${API_URL}/operations/config`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      this._cache = data.config;
      this._cacheTime = now;
      return this._cache;
    } catch (e) {
      console.error('Error fetching ops config:', e);
      return this._defaultConfig();
    }
  }

  async getPaymentConfig() {
    try {
      const r = await fetch(`${API_URL}/operations/payment-config`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.error('Error fetching payment config:', e);
      return { card: { mode: 'fase1', fase1_response: 'success', enabled: true }, barcode: { mode: 'fase1', fase1_response: 'success', enabled: true } };
    }
  }

  async setOperation(operation, mode, fase1_response = 'success') {
    try {
      this._cache = null;
      const r = await fetch(`${API_URL}/operations/config/${operation}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, fase1_response })
      });
      return await r.json();
    } catch (e) { console.error('Error setting operation:', e); return { success: false }; }
  }


  async applyPreset(presetId) {
    try {
      this._cache = null;
      const r = await fetch(`${API_URL}/operations/presets/${presetId}`, { method: 'POST' });
      return await r.json();
    } catch (e) { console.error('Error applying preset:', e); return { success: false }; }
  }

  async getPresets() {
    try {
      const r = await fetch(`${API_URL}/operations/presets`);
      return await r.json();
    } catch (e) { console.error('Error fetching presets:', e); return { presets: [] }; }
  }

  async setValCuentaParams(params) {
    try {
      const r = await fetch(`${API_URL}/operations/config/val-cuenta-params`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await r.json();
    } catch (e) { console.error('Error setting val_cuenta params:', e); return { success: false }; }
  }

  invalidateCache() { this._cache = null; }

  _defaultConfig() {
    const ops = ['val_telefono','val_cuenta','pago_tarjeta','pago_barcode','anulacion_tarjeta','provision_topup','provision_package','provision_smartphone','provision_transfer','provision_billpay'];
    const cfg = {};
    ops.forEach(op => { cfg[op] = { mode: 'fase1', fase1_response: 'success', label: op }; });
    return cfg;
  }
}

const opsConfigService = new OperationsConfigService();
export default opsConfigService;