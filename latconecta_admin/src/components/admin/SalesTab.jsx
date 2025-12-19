/**
 * SalesTab - Bitel Admin (CORREGIDO)
 * Versión: 2.0
 * Correcciones:
 * - Inputs de filtros funcionan correctamente
 * - Diseño compacto (2 líneas)
 * - Mejor manejo de autenticación
 * Fecha: 2025-12-05
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Eye, Filter, X, AlertCircle } from 'lucide-react';
import purchasesService from '../../services/purchasesService';
import PurchaseDetailModal from './PurchaseDetailModal';

const SalesTab = ({ showNotification }) => {
  // Estados principales
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Estados de filtros - CORREGIDO: Cada filtro en su propio estado
  const [referenceFrom, setReferenceFrom] = useState('');
  const [referenceTo, setReferenceTo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [requiresIntervention, setRequiresIntervention] = useState('');

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // ==================== CARGAR DATOS ====================

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setAuthError(false);
    
    try {
      console.log('🔵 Cargando compras...');
      const data = await purchasesService.getAll();
      
      // Asegurarse de que sea array
      const purchasesArray = Array.isArray(data) ? data : [];
      
      setPurchases(purchasesArray);
      setFilteredPurchases(purchasesArray);
      
      console.log('✅ Compras cargadas:', purchasesArray.length);
      
      if (showNotification) {
        showNotification(`${purchasesArray.length} compras cargadas correctamente`, 'success');
      }
    } catch (error) {
      console.error('❌ Error al cargar compras:', error);
      
      // Verificar si es error 401
      if (error?.response?.status === 401 || error?.detail === 'Not authenticated') {
        setAuthError(true);
        if (showNotification) {
          showNotification('Error de autenticación. Por favor, vuelve a iniciar sesión.', 'error');
        }
      } else {
        setPurchases([]);
        setFilteredPurchases([]);
        
        if (showNotification) {
          showNotification('Error al cargar compras', 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Cargar al montar componente
  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // ==================== FILTROS ====================

  const applyFilters = useCallback(() => {
    let filtered = [...purchases];

    // Filtro por referencia (rango)
    if (referenceFrom || referenceTo) {
      filtered = filtered.filter(p => {
        const ref = p.purchase_reference || '';
        const matchFrom = !referenceFrom || ref >= referenceFrom;
        const matchTo = !referenceTo || ref <= referenceTo;
        return matchFrom && matchTo;
      });
    }

    // Filtro por fecha (rango)
    if (dateFrom || dateTo) {
      filtered = filtered.filter(p => {
        const date = new Date(p.purchase_date);
        const matchFrom = !dateFrom || date >= new Date(dateFrom);
        const matchTo = !dateTo || date <= new Date(dateTo);
        return matchFrom && matchTo;
      });
    }

    // Filtro por teléfono
    if (phoneSearch) {
      filtered = filtered.filter(p => {
        const phone = p.purchase_phone_number || '';
        return phone.includes(phoneSearch);
      });
    }

    // Filtro por estado de pago
    if (paymentStatus) {
      filtered = filtered.filter(p => p.purchase_payment_status === paymentStatus);
    }

    // Filtro por estado de entrega
    if (deliveryStatus) {
      filtered = filtered.filter(p => p.purchase_delivery_status === deliveryStatus);
    }

    // Filtro por intervención manual
    if (requiresIntervention !== '') {
      const requiresInterventionBool = requiresIntervention === 'true';
      filtered = filtered.filter(p => p.requires_manual_intervention === requiresInterventionBool);
    }

    setFilteredPurchases(filtered);
    setCurrentPage(1); // Reset a primera página

    if (showNotification) {
      showNotification(`${filtered.length} compras encontradas`, 'success');
    }
  }, [purchases, referenceFrom, referenceTo, dateFrom, dateTo, phoneSearch, paymentStatus, deliveryStatus, requiresIntervention, showNotification]);

  const clearFilters = () => {
    // Limpiar todos los estados de filtros
    setReferenceFrom('');
    setReferenceTo('');
    setDateFrom('');
    setDateTo('');
    setPhoneSearch('');
    setPaymentStatus('');
    setDeliveryStatus('');
    setRequiresIntervention('');
    
    setFilteredPurchases(purchases);
    setCurrentPage(1);
    
    if (showNotification) {
      showNotification('Filtros limpiados', 'info');
    }
  };

  // ==================== PAGINACIÓN ====================

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ==================== FORMATEO ====================

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-PE');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  };

  // ==================== COMPONENTES UI ====================

  // CORREGIDO: Filtros en 2 líneas, más compactos
  const FiltersSection = () => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-blue-600" />
          <h3 className="font-bold text-gray-700 text-sm">Filtros de Búsqueda</h3>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
        >
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {showFilters && (
        <div className="space-y-3">
          {/* LÍNEA 1: Referencias, Fechas, Teléfono */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {/* Referencias */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Ref Desde
              </label>
              <input
                type="text"
                value={referenceFrom}
                onChange={(e) => setReferenceFrom(e.target.value)}
                placeholder="REF-..."
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Ref Hasta
              </label>
              <input
                type="text"
                value={referenceTo}
                onChange={(e) => setReferenceTo(e.target.value)}
                placeholder="REF-..."
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Fechas */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                placeholder="999..."
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Estados - Pago */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Estado Pago
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="Paid">Pagado</option>
                <option value="Pending">Pendiente</option>
                <option value="Reversed">Reversado</option>
                <option value="Failed">Fallido</option>
              </select>
            </div>

            {/* Acciones en la misma línea */}
            <div className="flex items-end space-x-1">
              <button
                onClick={applyFilters}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold"
                title="Aplicar filtros"
              >
                <Search size={14} />
                <span>Aplicar</span>
              </button>
            </div>
          </div>

          {/* LÍNEA 2: Estados Entrega, Manual, Limpiar */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {/* Estado Entrega */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Estado Entrega
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="Success">Exitoso</option>
                <option value="Pending">Pendiente</option>
                <option value="Failed">Fallido</option>
              </select>
            </div>

            {/* Intervención Manual */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Req. Intervención
              </label>
              <select
                value={requiresIntervention}
                onChange={(e) => setRequiresIntervention(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Espacios vacíos para alinear */}
            <div></div>
            <div></div>
            <div></div>
            <div></div>

            {/* Botón Limpiar */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs font-semibold"
                title="Limpiar filtros"
              >
                <X size={14} />
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center mt-4 px-4">
        <div className="text-sm text-gray-600">
          Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPurchases.length)} de {filteredPurchases.length}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Anterior
          </button>
          
          {/* Números de página - mostrar solo algunos */}
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            } else if (
              pageNumber === currentPage - 2 ||
              pageNumber === currentPage + 2
            ) {
              return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
            }
            return null;
          })}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================

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
        <button
          onClick={loadPurchases}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Cargando...' : 'Recargar'}</span>
        </button>
      </div>

      {/* Error de Autenticación */}
      {authError && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4 flex items-start space-x-3">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 mb-1">Error de Autenticación</h3>
            <p className="text-sm text-red-700">
              No tienes permisos para ver las compras o tu sesión ha expirado. 
              Por favor, cierra sesión y vuelve a iniciar sesión.
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      {!authError && <FiltersSection />}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando compras...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !authError && filteredPurchases.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 font-semibold">No se encontraron compras</p>
          {purchases.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Tabla de Compras */}
      {!loading && !authError && currentPurchases.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#008C96] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Referencia</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Teléfono</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Servicio</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold">Producto</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold">Monto</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">Pago</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">Entrega</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">Manual</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentPurchases.map((purchase) => (
                    <tr key={purchase.purchase_id} className="hover:bg-gray-50">
                      {/* Referencia */}
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-blue-600 font-semibold">
                          {purchase.purchase_reference}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="px-3 py-2 text-xs text-gray-700">
                        {formatDate(purchase.purchase_date)}
                      </td>

                      {/* Teléfono */}
                      <td className="px-3 py-2 text-xs font-semibold text-gray-800">
                        {purchase.purchase_phone_number || 'N/A'}
                      </td>

                      {/* Servicio */}
                      <td className="px-3 py-2 text-xs text-gray-700">
                        {purchase.purchase_service_name || 'N/A'}
                      </td>

                      {/* Producto */}
                      <td className="px-3 py-2 text-xs text-gray-700">
                        {purchase.purchase_product_name || 'N/A'}
                      </td>

                      {/* Monto */}
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold text-[#008C96] text-sm">
                          {formatCurrency(purchase.purchase_total_amount, purchase.purchase_currency)}
                        </span>
                      </td>

                      {/* Estado Pago */}
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          purchase.purchase_payment_status === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : purchase.purchase_payment_status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : purchase.purchase_payment_status === 'Reversed'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {purchase.purchase_payment_status || 'N/A'}
                        </span>
                      </td>

                      {/* Estado Entrega */}
                      <td className="px-3 py-2 text-center">
                        {purchase.purchase_delivery_status ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            purchase.purchase_delivery_status === 'Success'
                              ? 'bg-green-100 text-green-700'
                              : purchase.purchase_delivery_status === 'Pending'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {purchase.purchase_delivery_status}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>

                      {/* Intervención Manual */}
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          purchase.requires_manual_intervention
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {purchase.requires_manual_intervention ? 'Sí' : 'No'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => setSelectedPurchase(purchase)}
                          className="p-1.5 text-[#008C96] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <PaginationControls />
        </>
      )}

      {/* Modal de Detalle */}
      {selectedPurchase && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
};

export default SalesTab;