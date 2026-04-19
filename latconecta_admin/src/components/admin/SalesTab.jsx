/**
 * SalesTab - Latconecta Admin
 * Versión: 3.0
 * Nuevas funcionalidades:
 * - Column Picker: selector de columnas visibles con persistencia en localStorage
 * - Descarga CSV: exporta los datos filtrados actualmente visibles
 * Fecha: Abril 2026
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, RefreshCw, Eye, Filter, X, AlertCircle,
  FileJson, Download, Columns, Check
} from 'lucide-react';
import purchasesService from '../../services/purchasesService';
import PurchaseDetailModal from './PurchaseDetailModal';

// =============================================================================
// DEFINICIÓN DE TODAS LAS COLUMNAS DISPONIBLES
// =============================================================================

const ALL_COLUMNS = [
  // ── Siempre visibles (no se pueden ocultar) ──────────────────────────────
  { key: 'purchase_reference',        label: 'Referencia',       fixed: true  },
  { key: 'purchase_date',             label: 'Fecha',            fixed: true  },

  // ── Columnas opcionales ──────────────────────────────────────────────────
  { key: 'purchase_phone_number',     label: 'Teléfono',         fixed: false },
  { key: 'purchase_country',          label: 'País',             fixed: false },
  { key: 'purchase_vendor_code',      label: 'Vendor',           fixed: false },
  { key: 'purchase_vendpro_operator', label: 'Operador',         fixed: false },
  { key: 'purchase_service_name',     label: 'Servicio',         fixed: false },
  { key: 'purchase_product_name',     label: 'Producto',         fixed: false },
  { key: 'purchase_total_amount',     label: 'Monto',            fixed: false },
  { key: 'purchase_amount_usd',       label: 'Monto USD',        fixed: false },
  { key: 'purchase_vendor_amount',    label: 'Monto Vendor',     fixed: false },
  { key: 'purchase_currency',         label: 'Moneda',           fixed: false },
  { key: 'purchase_payment_method',   label: 'Método Pago',      fixed: false },
  { key: 'purchase_payment_status',   label: 'Est. Pago',        fixed: false },
  { key: 'purchase_delivery_status',  label: 'Est. Entrega',     fixed: false },
  { key: 'purchase_transaction_id',   label: 'Trans. ID Vendor', fixed: false },
  { key: 'purchase_user_id',          label: 'User ID',          fixed: false },
  { key: 'purchase_ip_petition',      label: 'IP',               fixed: false },
  { key: 'purchase_initial_balance',  label: 'Bal. Inicial',     fixed: false },
  { key: 'purchase_final_balance',    label: 'Bal. Final',       fixed: false },
  { key: 'requires_manual_intervention', label: 'IM',            fixed: false },
  // Acciones siempre al final
  { key: '__ver',                     label: 'Ver',              fixed: true  },
  { key: '__json',                    label: 'JSON',             fixed: true  },
];

// Columnas visibles por defecto (igual que la versión anterior)
const DEFAULT_VISIBLE = [
  'purchase_reference',
  'purchase_date',
  'purchase_phone_number',
  'purchase_vendor_code',
  'purchase_vendpro_operator',
  'purchase_service_name',
  'purchase_product_name',
  'purchase_total_amount',
  'purchase_payment_status',
  'purchase_delivery_status',
  'requires_manual_intervention',
  '__ver',
  '__json',
];

const LS_KEY = 'latconecta_sales_columns';

const loadSavedColumns = () => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Asegurarse de que las fijas siempre estén incluidas
      const fixed = ALL_COLUMNS.filter(c => c.fixed).map(c => c.key);
      return [...new Set([...fixed, ...parsed])];
    }
  } catch { /* ignorar */ }
  return DEFAULT_VISIBLE;
};

// =============================================================================
// UTILIDAD CSV
// =============================================================================

const exportToCSV = (data, visibleKeys, allColumns) => {
  // Excluir columnas de acción (__ver, __json)
  const exportKeys = visibleKeys.filter(k => !k.startsWith('__'));
  const headers    = exportKeys.map(k => allColumns.find(c => c.key === k)?.label || k);

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map(row =>
    exportKeys.map(k => {
      if (k === 'requires_manual_intervention') return row[k] ? 'Sí' : 'No';
      return escape(row[k]);
    }).join(',')
  );

  const csv     = [headers.join(','), ...rows].join('\n');
  const blob    = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url     = URL.createObjectURL(blob);
  const link    = document.createElement('a');
  const now     = new Date().toISOString().slice(0, 10);
  link.href     = url;
  link.download = `latconecta_ventas_${now}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

const SalesTab = ({ showNotification }) => {
  // ── Datos ──────────────────────────────────────────────────────────────────
  const [purchases,         setPurchases]         = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [selectedPurchase,  setSelectedPurchase]  = useState(null);
  const [showFilters,       setShowFilters]       = useState(true);
  const [authError,         setAuthError]         = useState(false);
  const [jsonPopup,         setJsonPopup]         = useState(null);

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const [referenceFrom,        setReferenceFrom]        = useState('');
  const [referenceTo,          setReferenceTo]          = useState('');
  const [dateFrom,             setDateFrom]             = useState('');
  const [dateTo,               setDateTo]               = useState('');
  const [phoneSearch,          setPhoneSearch]          = useState('');
  const [paymentStatus,        setPaymentStatus]        = useState('');
  const [deliveryStatus,       setDeliveryStatus]       = useState('');
  const [requiresIntervention, setRequiresIntervention] = useState('');

  // ── Paginación ───────────────────────────────────────────────────────────────
  const [currentPage]  = useState(1);
  const [itemsPerPage] = useState(20);
  const [page,         setPage] = useState(1);

  // ── Column Picker ─────────────────────────────────────────────────────────
  const [visibleColumns, setVisibleColumns] = useState(loadSavedColumns);
  const [showPicker,     setShowPicker]     = useState(false);
  const pickerRef = useRef(null);

  // Cerrar picker al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleColumn = (key) => {
    const col = ALL_COLUMNS.find(c => c.key === key);
    if (col?.fixed) return; // No se pueden ocultar las fijas
    setVisibleColumns(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE);
    localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_VISIBLE));
  };

  // Columnas en el orden definido en ALL_COLUMNS
  const orderedVisible = ALL_COLUMNS.filter(c => visibleColumns.includes(c.key));

  // ── Carga de datos ────────────────────────────────────────────────────────
  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setAuthError(false);
    try {
      const data = await purchasesService.getAll();
      const arr  = Array.isArray(data) ? data : [];
      setPurchases(arr);
      setFilteredPurchases(arr);
      if (showNotification) showNotification(`${arr.length} compras cargadas`, 'success');
    } catch (error) {
      if (error?.response?.status === 401 || error?.detail === 'Not authenticated') {
        setAuthError(true);
        if (showNotification) showNotification('Error de autenticación.', 'error');
      } else {
        setPurchases([]);
        setFilteredPurchases([]);
        if (showNotification) showNotification('Error al cargar compras', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => { loadPurchases(); }, [loadPurchases]);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const applyFilters = useCallback(() => {
    let filtered = [...purchases];
    if (referenceFrom || referenceTo) {
      filtered = filtered.filter(p => {
        const ref = p.purchase_reference || '';
        return (!referenceFrom || ref >= referenceFrom) && (!referenceTo || ref <= referenceTo);
      });
    }
    if (dateFrom || dateTo) {
      filtered = filtered.filter(p => {
        const date = new Date(p.purchase_date);
        return (!dateFrom || date >= new Date(dateFrom)) && (!dateTo || date <= new Date(dateTo));
      });
    }
    if (phoneSearch)          filtered = filtered.filter(p => (p.purchase_phone_number || '').includes(phoneSearch));
    if (paymentStatus)        filtered = filtered.filter(p => p.purchase_payment_status === paymentStatus);
    if (deliveryStatus)       filtered = filtered.filter(p => p.purchase_delivery_status === deliveryStatus);
    if (requiresIntervention !== '') {
      const val = requiresIntervention === 'true';
      filtered  = filtered.filter(p => p.requires_manual_intervention === val);
    }
    setFilteredPurchases(filtered);
    setPage(1);
    if (showNotification) showNotification(`${filtered.length} compras encontradas`, 'success');
  }, [purchases, referenceFrom, referenceTo, dateFrom, dateTo, phoneSearch,
      paymentStatus, deliveryStatus, requiresIntervention, showNotification]);

  const clearFilters = () => {
    setReferenceFrom(''); setReferenceTo('');
    setDateFrom(''); setDateTo('');
    setPhoneSearch(''); setPaymentStatus('');
    setDeliveryStatus(''); setRequiresIntervention('');
    setFilteredPurchases(purchases);
    setPage(1);
    if (showNotification) showNotification('Filtros limpiados', 'info');
  };

  // ── Paginación ─────────────────────────────────────────────────────────────
  const totalPages      = Math.ceil(filteredPurchases.length / itemsPerPage);
  const indexOfFirst    = (page - 1) * itemsPerPage;
  const indexOfLast     = indexOfFirst + itemsPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirst, indexOfLast);

  // ── Formato ───────────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString('es-PE'); } catch { return d; }
  };
  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  };

  // ── Render celda por clave ────────────────────────────────────────────────
  const renderCell = (purchase, colKey) => {
    switch (colKey) {
      case 'purchase_reference':
        return (
          <span className="font-mono text-xs text-blue-600 font-semibold whitespace-nowrap">
            {purchase.purchase_reference}
          </span>
        );
      case 'purchase_date':
        return <span className="text-xs text-gray-700 whitespace-nowrap">{formatDate(purchase.purchase_date)}</span>;
      case 'purchase_phone_number':
        return <span className="text-xs font-semibold text-gray-800">{purchase.purchase_phone_number ? String(purchase.purchase_phone_number).slice(0, 9) : 'N/A'}</span>;
      case 'purchase_country':
        return <span className="text-xs text-gray-700">{purchase.purchase_country || 'N/A'}</span>;
      case 'purchase_vendor_code':
        return <span className="text-xs text-gray-700">{purchase.purchase_vendor_code || purchase.vendor_name || 'N/A'}</span>;
      case 'purchase_vendpro_operator':
        return <span className="text-xs text-gray-700">{purchase.purchase_vendpro_operator || 'N/A'}</span>;
      case 'purchase_service_name':
        return <span className="text-xs text-gray-700">{purchase.purchase_service_name || 'N/A'}</span>;
      case 'purchase_product_name':
        return <span className="text-xs text-gray-700 max-w-[140px] truncate block" title={purchase.purchase_product_name}>{purchase.purchase_product_name || 'N/A'}</span>;
      case 'purchase_total_amount':
        return <span className="font-bold text-[#008C96] text-xs whitespace-nowrap">{formatCurrency(purchase.purchase_total_amount, purchase.purchase_currency)}</span>;
      case 'purchase_amount_usd':
        return <span className="text-xs text-gray-700 whitespace-nowrap">{purchase.purchase_amount_usd !== null && purchase.purchase_amount_usd !== undefined ? `USD ${parseFloat(purchase.purchase_amount_usd).toFixed(2)}` : 'N/A'}</span>;
      case 'purchase_vendor_amount':
        return <span className="text-xs text-gray-700 whitespace-nowrap">{purchase.purchase_vendor_amount !== null && purchase.purchase_vendor_amount !== undefined ? parseFloat(purchase.purchase_vendor_amount).toFixed(2) : 'N/A'}</span>;
      case 'purchase_currency':
        return <span className="text-xs text-gray-700">{purchase.purchase_currency || 'N/A'}</span>;
      case 'purchase_payment_method':
        return <span className="text-xs text-gray-700">{purchase.purchase_payment_method || 'N/A'}</span>;
      case 'purchase_payment_status':
        return (
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            purchase.purchase_payment_status === 'Paid'     ? 'bg-green-100 text-green-700'  :
            purchase.purchase_payment_status === 'Pending'  ? 'bg-yellow-100 text-yellow-700' :
            purchase.purchase_payment_status === 'Reversed' ? 'bg-orange-100 text-orange-700' :
                                                              'bg-red-100 text-red-700'
          }`}>{purchase.purchase_payment_status || 'N/A'}</span>
        );
      case 'purchase_delivery_status':
        return purchase.purchase_delivery_status ? (
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            purchase.purchase_delivery_status === 'Success' ? 'bg-green-100 text-green-700' :
            purchase.purchase_delivery_status === 'Pending' ? 'bg-blue-100 text-blue-700'  :
                                                              'bg-red-100 text-red-700'
          }`}>{purchase.purchase_delivery_status}</span>
        ) : <span className="text-gray-400 text-xs">N/A</span>;
      case 'purchase_transaction_id':
        return <span className="font-mono text-xs text-gray-600 max-w-[120px] truncate block" title={purchase.purchase_transaction_id}>{purchase.purchase_transaction_id || 'N/A'}</span>;
      case 'purchase_user_id':
        return <span className="text-xs text-gray-700">{purchase.purchase_user_id || '—'}</span>;
      case 'purchase_ip_petition':
        return <span className="font-mono text-xs text-gray-600">{purchase.purchase_ip_petition || 'N/A'}</span>;
      case 'purchase_initial_balance':
        return <span className="text-xs text-gray-700 whitespace-nowrap">{purchase.purchase_initial_balance !== null && purchase.purchase_initial_balance !== undefined ? parseFloat(purchase.purchase_initial_balance).toFixed(2) : 'N/A'}</span>;
      case 'purchase_final_balance':
        return <span className="text-xs text-gray-700 whitespace-nowrap">{purchase.purchase_final_balance !== null && purchase.purchase_final_balance !== undefined ? parseFloat(purchase.purchase_final_balance).toFixed(2) : 'N/A'}</span>;
      case 'requires_manual_intervention':
        return (
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${purchase.requires_manual_intervention ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {purchase.requires_manual_intervention ? 'Sí' : 'No'}
          </span>
        );
      case '__ver':
        return (
          <button onClick={() => setSelectedPurchase(purchase)}
            className="p-1 text-[#008C96] hover:bg-blue-50 rounded transition-colors" title="Ver detalle completo">
            <Eye size={14} />
          </button>
        );
      case '__json':
        if (!(purchase.vendor_request || purchase.vendor_response || purchase.purchase_vendor_json)) {
          return <span className="text-gray-300 text-xs">—</span>;
        }
        return (
          <button
            onClick={() => {
              let request = purchase.vendor_request ?? null;
              let response = purchase.vendor_response ?? null;
              if (!request && !response && purchase.purchase_vendor_json) {
                try {
                  const parsed = typeof purchase.purchase_vendor_json === 'string'
                    ? JSON.parse(purchase.purchase_vendor_json) : purchase.purchase_vendor_json;
                  request  = parsed.request ?? parsed.vendor_request ?? null;
                  response = parsed.response ?? parsed.vendor_response ?? parsed;
                } catch { response = purchase.purchase_vendor_json; }
              }
              setJsonPopup({ reference: purchase.purchase_reference, request, response });
            }}
            className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Ver Request / Response JSON">
            <FileJson size={14} />
          </button>
        );
      default:
        return <span className="text-xs text-gray-500">—</span>;
    }
  };

  // ── Column Picker dropdown ────────────────────────────────────────────────
  const ColumnPicker = () => (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setShowPicker(p => !p)}
        className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold shadow-sm"
        title="Seleccionar columnas visibles"
      >
        <Columns size={16} />
        <span>Columnas</span>
      </button>

      {showPicker && (
        <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl w-64 p-3">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Columnas visibles</span>
            <button onClick={resetColumns} className="text-xs text-blue-600 hover:underline">Restablecer</button>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {ALL_COLUMNS.map(col => (
              <label key={col.key}
                className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${col.fixed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                <div
                  onClick={() => !col.fixed && toggleColumn(col.key)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    visibleColumns.includes(col.key)
                      ? 'bg-[#008C96] border-[#008C96]'
                      : 'border-gray-300 bg-white'
                  }`}>
                  {visibleColumns.includes(col.key) && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs text-gray-700">{col.label}</span>
                {col.fixed && <span className="text-xs text-gray-400 ml-auto">fija</span>}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Filtros ───────────────────────────────────────────────────────────────
  const FiltersSection = () => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-blue-600" />
          <h3 className="font-bold text-gray-700 text-sm">Filtros de Búsqueda</h3>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {showFilters && (
        <div className="space-y-3">
          {/* Línea 1 */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ref Desde</label>
              <input type="text" value={referenceFrom} onChange={(e) => setReferenceFrom(e.target.value)}
                placeholder="REF-..." className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ref Hasta</label>
              <input type="text" value={referenceTo} onChange={(e) => setReferenceTo(e.target.value)}
                placeholder="REF-..." className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Desde</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Hasta</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
              <input type="text" value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)}
                placeholder="999..." className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Estado Pago</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500">
                <option value="">Todos</option>
                <option value="Paid">Pagado</option>
                <option value="Pending">Pendiente</option>
                <option value="Reversed">Reversado</option>
                <option value="Failed">Fallido</option>
              </select>
            </div>
            <div className="flex items-end space-x-1">
              <button onClick={applyFilters}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold">
                <Search size={14} /><span>Aplicar</span>
              </button>
            </div>
          </div>

          {/* Línea 2 */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Estado Entrega</label>
              <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500">
                <option value="">Todos</option>
                <option value="Success">Exitoso</option>
                <option value="Pending">Pendiente</option>
                <option value="Failed">Fallido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Req. Intervención</label>
              <select value={requiresIntervention} onChange={(e) => setRequiresIntervention(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500">
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <div></div><div></div><div></div><div></div>
            <div className="flex items-end">
              <button onClick={clearFilters}
                className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs font-semibold">
                <X size={14} /><span>Limpiar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Paginación ─────────────────────────────────────────────────────────────
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-between items-center mt-4 px-4">
        <div className="text-sm text-gray-600">
          Mostrando {indexOfFirst + 1} – {Math.min(indexOfLast, filteredPurchases.length)} de {filteredPurchases.length}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            Anterior
          </button>
          {[...Array(totalPages)].map((_, i) => {
            const n = i + 1;
            if (n === 1 || n === totalPages || (n >= page - 1 && n <= page + 1)) {
              return (
                <button key={n} onClick={() => setPage(n)}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm ${page === n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {n}
                </button>
              );
            } else if (n === page - 2 || n === page + 2) {
              return <span key={n} className="px-2 text-gray-500">...</span>;
            }
            return null;
          })}
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  // ── RENDER PRINCIPAL ──────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#008C96]">Gestión de Compras</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filteredPurchases.length} compras
            {filteredPurchases.length !== purchases.length && ` (de ${purchases.length} totales)`}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center space-x-2">
          {/* Column Picker */}
          <ColumnPicker />

          {/* Descargar CSV */}
          <button
            onClick={() => exportToCSV(filteredPurchases, visibleColumns, ALL_COLUMNS)}
            disabled={filteredPurchases.length === 0}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold shadow-sm"
            title={`Descargar ${filteredPurchases.length} registros como CSV`}
          >
            <Download size={16} />
            <span>CSV ({filteredPurchases.length})</span>
          </button>

          {/* Recargar */}
          <button onClick={loadPurchases} disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Cargando...' : 'Recargar'}</span>
          </button>
        </div>
      </div>

      {/* Error Auth */}
      {authError && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4 flex items-start space-x-3">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 mb-1">Error de Autenticación</h3>
            <p className="text-sm text-red-700">No tienes permisos o tu sesión ha expirado. Cierra sesión y vuelve a iniciar sesión.</p>
          </div>
        </div>
      )}

      {!authError && <FiltersSection />}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando compras...</p>
          </div>
        </div>
      )}

      {!loading && !authError && filteredPurchases.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 font-semibold">No se encontraron compras</p>
          {purchases.length > 0 && (
            <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-800 font-semibold">
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Tabla */}
      {!loading && !authError && currentPurchases.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#008C96] text-white">
                  <tr>
                    {orderedVisible.map(col => (
                      <th key={col.key}
                        className={`px-2 py-1 text-xs font-semibold whitespace-nowrap ${
                          ['purchase_total_amount', 'purchase_amount_usd', 'purchase_vendor_amount',
                           'purchase_initial_balance', 'purchase_final_balance'].includes(col.key)
                            ? 'text-right' : 
                          ['purchase_payment_status', 'purchase_delivery_status',
                           'requires_manual_intervention', '__ver', '__json'].includes(col.key)
                            ? 'text-center' : 'text-left'
                        }`}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentPurchases.map((purchase) => (
                    <tr key={purchase.purchase_id} className="hover:bg-gray-50">
                      {orderedVisible.map(col => (
                        <td key={col.key}
                          className={`px-2 py-0.5 ${
                            ['purchase_total_amount', 'purchase_amount_usd', 'purchase_vendor_amount',
                             'purchase_initial_balance', 'purchase_final_balance'].includes(col.key)
                              ? 'text-right' :
                            ['purchase_payment_status', 'purchase_delivery_status',
                             'requires_manual_intervention', '__ver', '__json'].includes(col.key)
                              ? 'text-center' : ''
                          }`}>
                          {renderCell(purchase, col.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationControls />
        </>
      )}

      {/* Modal Detalle */}
      {selectedPurchase && (
        <PurchaseDetailModal purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} />
      )}

      {/* JSON Popup */}
      {jsonPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center px-5 py-3 bg-purple-700 rounded-t-xl">
              <div className="flex items-center space-x-2">
                <FileJson size={18} className="text-white" />
                <span className="text-white font-bold text-sm">Request / Response — {jsonPopup.reference}</span>
              </div>
              <button onClick={() => setJsonPopup(null)} className="text-white hover:text-purple-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">📤 Request enviado al vendor</h3>
                <pre className="flex-1 bg-gray-900 text-green-400 text-xs p-3 rounded-lg overflow-auto font-mono leading-relaxed">
                  {jsonPopup.request ? (() => { try { return JSON.stringify(typeof jsonPopup.request === 'string' ? JSON.parse(jsonPopup.request) : jsonPopup.request, null, 2); } catch { return String(jsonPopup.request); } })() : '— Sin datos —'}
                </pre>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">📥 Response recibido del vendor</h3>
                <pre className="flex-1 bg-gray-900 text-blue-300 text-xs p-3 rounded-lg overflow-auto font-mono leading-relaxed">
                  {jsonPopup.response ? (() => { try { return JSON.stringify(typeof jsonPopup.response === 'string' ? JSON.parse(jsonPopup.response) : jsonPopup.response, null, 2); } catch { return String(jsonPopup.response); } })() : '— Sin datos —'}
                </pre>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
              <button onClick={() => setJsonPopup(null)}
                className="px-4 py-1.5 bg-purple-700 text-white rounded-lg text-sm font-semibold hover:bg-purple-800 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTab;
