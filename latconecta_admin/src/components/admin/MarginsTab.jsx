/**
 * MarginsTab - Latconecta Admin
 * Reporte diario de márgenes con ajuste del precio base.
 *
 * - Margen = (precio total de venta − costo del vendor convertido) / precio total
 * - Costo convertido con el tipo de cambio del día SIN margen
 * - En rojo: productos bajo el margen mínimo (configurado por vendor en el backend)
 * - Solo se edita el precio base de productos de precio fijo (F); el backend
 *   recalcula descuento y total con el % de descuento y el fee existentes.
 * Fecha: Octubre 2026
 */

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Filter, AlertCircle, Save, X, Pencil } from 'lucide-react';
import pricingService from '../../services/pricingService';
import vendorsService from '../../services/vendorsService';
import countriesService from '../../services/countriesService';
import servicesService from '../../services/servicesService';

const COST_SOURCE_LABEL = {
  vp_cost: 'Costo vendor',
  vp_amount: 'Monto vendor',
  monto_producto: 'Monto producto',
  sin_vendor_product: 'Sin producto vendor',
};

const fmt = (value, decimals = 2) =>
  value === null || value === undefined ? '—' : Number(value).toFixed(decimals);

const MarginsTab = ({ showNotification }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [services, setServices] = useState([]);

  const [filters, setFilters] = useState({
    vendor_code: '',
    country_id: '',
    service_id: '',
    only_below: false,
    include_inactive: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const notify = (message, type = 'success') => {
    if (showNotification) showNotification(message, type);
    else alert(message);
  };

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [v, c, s] = await Promise.all([
          vendorsService.getAll(),
          countriesService.getAll(),
          servicesService.getAll(),
        ]);
        setVendors(v || []);
        setCountries(c || []);
        setServices(s || []);
      } catch (err) {
        console.error('Error al cargar catálogos de filtros:', err);
      }
    };
    loadCatalogs();
  }, []);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pricingService.getMarginReport(filters);
      setReport(data);
    } catch (err) {
      console.error('Error al cargar reporte de márgenes:', err);
      setError(err.response?.data?.detail || 'Error al cargar el reporte de márgenes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const startEdit = (row) => {
    setEditingId(row.product_id);
    setEditValue(String(row.product_base_price));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Vista previa del total y margen con el nuevo precio base (misma fórmula del backend)
  const preview = (row, baseStr) => {
    const base = parseFloat(baseStr);
    if (!base || base <= 0) return null;
    const discount = Math.round(base * row.product_discount_percentage) / 100;
    const total = Math.round((base - discount + row.product_fee) * 100) / 100;
    if (row.cost_converted === null || row.cost_converted === undefined || total <= 0) {
      return { total, marginPct: null };
    }
    const marginPct = ((total - row.cost_converted) / total) * 100;
    return { total, marginPct };
  };

  const saveEdit = async (row) => {
    const base = parseFloat(editValue);
    if (!base || base <= 0) {
      notify('Ingresa un precio base válido mayor que cero', 'error');
      return;
    }
    try {
      setSaving(true);
      const result = await pricingService.updateBasePrice(row.product_id, base);
      notify(
        `Precio actualizado: ${row.product_code} → ${result.product_currency} ${fmt(result.product_total_price)}`,
        'success'
      );
      cancelEdit();
      await loadReport();
    } catch (err) {
      notify(err.response?.data?.detail || 'Error al actualizar el precio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const rows = report?.rows || [];

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reporte de Márgenes</h2>
          <p className="text-sm text-gray-500">
            Costo del vendor convertido con el tipo de cambio del día (sin margen) frente al precio de venta.
          </p>
        </div>
        <button
          onClick={loadReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#008C96] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Resumen */}
      {report && (
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-white border rounded-lg">
            <div className="text-xs text-gray-500">Productos</div>
            <div className="text-xl font-bold text-gray-800">{report.total}</div>
          </div>
          <div className={`px-4 py-2 border rounded-lg ${report.below_min_count > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
            <div className="text-xs text-gray-500">Bajo el mínimo</div>
            <div className={`text-xl font-bold ${report.below_min_count > 0 ? 'text-red-700' : 'text-gray-800'}`}>
              {report.below_min_count}
            </div>
          </div>
          <div className="px-4 py-2 bg-white border rounded-lg">
            <div className="text-xs text-gray-500">Margen mínimo</div>
            <div className="text-sm font-semibold text-gray-800">
              General {fmt(report.min_margin_default_pct, 1)}%
              {Object.entries(report.min_margin_by_vendor || {}).map(([v, pct]) => (
                <span key={v} className="ml-2 text-gray-600">· {v} {fmt(pct, 1)}%</span>
              ))}
            </div>
          </div>
          <div className="px-4 py-2 bg-white border rounded-lg">
            <div className="text-xs text-gray-500">Generado</div>
            <div className="text-sm font-semibold text-gray-800">
              {new Date(report.generated_at).toLocaleString('es-PE')}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-blue-600" />
          <h3 className="font-bold text-gray-700 text-sm">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vendor</label>
            <select
              value={filters.vendor_code}
              onChange={e => setFilter('vendor_code', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos</option>
              {vendors.map(v => (
                <option key={v.vendor_code} value={v.vendor_code}>{v.vendor_code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">País</label>
            <select
              value={filters.country_id}
              onChange={e => setFilter('country_id', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos</option>
              {countries.map(c => (
                <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Servicio</label>
            <select
              value={filters.service_id}
              onChange={e => setFilter('service_id', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos</option>
              {services.map(s => (
                <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.only_below}
              onChange={e => setFilter('only_below', e.target.checked)}
            />
            Solo bajo el mínimo
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.include_inactive}
              onChange={e => setFilter('include_inactive', e.target.checked)}
            />
            Incluir inactivos
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Vendor</th>
              <th className="px-3 py-2 text-left">País</th>
              <th className="px-3 py-2 text-left">Compañía / Producto</th>
              <th className="px-3 py-2 text-right">Costo vendor</th>
              <th className="px-3 py-2 text-right">T. cambio</th>
              <th className="px-3 py-2 text-right">Costo convertido</th>
              <th className="px-3 py-2 text-right">Precio base</th>
              <th className="px-3 py-2 text-right">Desc. %</th>
              <th className="px-3 py-2 text-right">Fee</th>
              <th className="px-3 py-2 text-right">Precio total</th>
              <th className="px-3 py-2 text-right">Margen</th>
              <th className="px-3 py-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={12} className="px-3 py-8 text-center text-gray-400">Cargando…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={12} className="px-3 py-8 text-center text-gray-400">Sin productos para los filtros seleccionados</td></tr>
            )}
            {!loading && rows.map(row => {
              const isEditing = editingId === row.product_id;
              const pv = isEditing ? preview(row, editValue) : null;
              return (
                <tr key={row.product_id} className={row.below_min ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2 font-medium text-gray-700">{row.vendor_code}</td>
                  <td className="px-3 py-2 text-gray-600">{row.country_code}</td>
                  <td className="px-3 py-2">
                    <div className="text-gray-500 text-xs">{row.company_name} · {row.service_name}</div>
                    <div className="text-gray-800">
                      {row.product_name}
                      <span className="ml-1 text-xs text-gray-400">({row.product_code})</span>
                      {row.product_status !== 'active' && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">inactivo</span>
                      )}
                    </div>
                    {row.warning && <div className="text-xs text-amber-700 mt-0.5">⚠️ {row.warning}</div>}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {row.cost_amount !== null ? `${row.cost_currency} ${fmt(row.cost_amount)}` : '—'}
                    <div className="text-xs text-gray-400">{COST_SOURCE_LABEL[row.cost_source] || row.cost_source}</div>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">{fmt(row.exchange_rate, 4)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {row.cost_converted !== null ? `${row.product_currency} ${fmt(row.cost_converted)}` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-24 px-2 py-1 border border-blue-400 rounded text-right"
                        autoFocus
                      />
                    ) : (
                      `${row.product_currency} ${fmt(row.product_base_price)}`
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">{fmt(row.product_discount_percentage)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{fmt(row.product_fee)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap font-semibold">
                    {row.product_currency} {fmt(isEditing && pv ? pv.total : row.product_total_price)}
                  </td>
                  <td className={`px-3 py-2 text-right whitespace-nowrap font-bold ${row.below_min ? 'text-red-700' : 'text-green-700'}`}>
                    {isEditing && pv ? (
                      <span className={pv.marginPct !== null && pv.marginPct < row.min_margin_pct ? 'text-red-700' : 'text-green-700'}>
                        {pv.marginPct !== null ? `${fmt(pv.marginPct)}%` : '—'}
                      </span>
                    ) : (
                      row.margin_pct !== null ? `${fmt(row.margin_pct)}%` : '—'
                    )}
                    {!isEditing && row.margin_amount !== null && (
                      <div className="text-xs font-normal text-gray-500">{row.product_currency} {fmt(row.margin_amount)}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    {!row.editable ? (
                      <span className="text-xs text-gray-400" title="Solo productos de precio fijo (F)">—</span>
                    ) : isEditing ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => saveEdit(row)}
                          disabled={saving}
                          className="text-green-600 hover:text-green-800 disabled:opacity-40"
                          title="Guardar"
                        >
                          <Save size={18} />
                        </button>
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700" title="Cancelar">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ajustar precio base"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarginsTab;
