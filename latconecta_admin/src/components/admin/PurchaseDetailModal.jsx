/**
 * Purchase Detail Modal - Latconecta Admin
 * Modal con 2 tabs para mostrar todos los detalles de una compra
 * Tab 1: Básicos + Estado + Delivery (Partes 1,2,3)
 * Tab 2: Vendor + Balance + Auditoría (Partes 4,5,6)
 * Fecha: 2025-12-05
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

const PurchaseDetailModal = ({ purchase, onClose }) => {
  const [activeTab, setActiveTab] = useState(1);

  if (!purchase) return null;

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-PE');
    } catch {
      return dateString;
    }
  };

  // Formatear moneda
  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  };

  // Componente de campo
  const Field = ({ label, value, isBoolean = false, isDate = false, isCurrency = false }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
      </label>
      <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
        {isBoolean ? (
          <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {value ? 'Sí' : 'No'}
          </span>
        ) : isDate ? (
          formatDate(value)
        ) : isCurrency ? (
          formatCurrency(value, purchase.purchase_currency)
        ) : (
          value || 'N/A'
        )}
      </div>
    </div>
  );

  // Componente de sección
  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-blue-900 mb-3 pb-2 border-b-2 border-blue-200">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              Detalle de Compra
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Referencia: <span className="font-mono font-semibold">{purchase.purchase_reference}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 px-6 bg-gray-50">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 1
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            General y Estado
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 2
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Vendor y Auditoría
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: BÁSICOS + ESTADO + DELIVERY */}
          {activeTab === 1 && (
            <div>
              {/* PARTE 1: CAMPOS BÁSICOS */}
              <Section title="📋 INFORMACIÓN BÁSICA">
                <Field label="ID" value={purchase.purchase_id} />
                <Field label="Referencia" value={purchase.purchase_reference} />
                <Field label="Fecha" value={purchase.purchase_date} isDate />
                <Field label="Teléfono" value={purchase.purchase_phone_number} />
                <Field label="Servicio" value={purchase.purchase_service_name} />
                <Field label="Producto" value={purchase.purchase_product_name} />
                <Field label="Usuario ID" value={purchase.purchase_user_id || 'Anónimo'} />
                <Field label="Moneda" value={purchase.purchase_currency} />
                <Field label="Descuento" value={purchase.purchase_discount} isCurrency />
                <Field label="Comisión" value={purchase.purchase_fee} isCurrency />
                <Field label="TOTAL" value={purchase.purchase_total_amount} isCurrency />
              </Section>

              {/* PARTE 2: ESTADO */}
              <Section title="💳 ESTADO DE PAGO Y PROVISIÓN">
                <Field label="Método de Pago" value={purchase.purchase_payment_method} />
                <Field label="Estado Pago" value={purchase.purchase_payment_status} />
                <Field label="Ref. Pago" value={purchase.purchase_payment_ref} />
                <Field label="Código Barcode" value={purchase.purchase_barcode_code} />
                <Field label="Imagen Barcode" value={purchase.purchase_barcode_image} />
                <Field label="Estado Entrega" value={purchase.purchase_delivery_status} />
                <Field label="Ref. Provisión" value={purchase.purchase_provision_ref} />
                <Field label="Ref. Reversión" value={purchase.purchase_reversal_ref} />
                <Field 
                  label="Requiere Intervención Manual" 
                  value={purchase.requires_manual_intervention} 
                  isBoolean 
                />
                <Field label="Imagen Recibo" value={purchase.purchase_receip_image} />
              </Section>

              {/* PARTE 3: DELIVERY Y ENTREGA */}
              <Section title="📦 DATOS DE ENTREGA">
                <Field label="Teléfono Entrega" value={purchase.purchase_delivery_phone} />
                <Field label="Nombre Destinatario" value={purchase.purchase_delivery_name} />
                <Field label="Dirección" value={purchase.purchase_delivery_address} />
                <Field label="Número de Cuenta" value={purchase.purchase_account_number} />
              </Section>
            </div>
          )}

          {/* TAB 2: VENDOR + BALANCE + AUDITORÍA */}
          {activeTab === 2 && (
            <div>
              {/* PARTE 4: VENDOR */}
              <Section title="🏢 INFORMACIÓN DEL VENDOR">
                <Field label="Código Vendor" value={purchase.purchase_vendor_code} />
                <Field label="Tipo Producto" value={purchase.purchase_product_type} />
                <Field label="Código VendPro" value={purchase.purchase_vendpro_code} />
                <Field label="SKU ID Vendor" value={purchase.purchase_vendor_skuid} />
                <Field label="País VendPro" value={purchase.purchase_vendpro_country} />
                <Field label="Operador VendPro" value={purchase.purchase_vendpro_operator} />
                <Field label="Moneda Vendor" value={purchase.purchase_vendor_currency} />
                <Field label="Monto Vendor" value={purchase.purchase_vendor_amount} isCurrency />
                <Field label="JSON Vendor" value={purchase.purchase_vendor_json ? 'Ver datos' : 'N/A'} />
                <Field label="Fecha Petición" value={purchase.purchase_vendor_date_petition} isDate />
                <Field label="Fecha Respuesta" value={purchase.purchase_vendor_date_response} isDate />
                <Field label="Código Respuesta" value={purchase.purchase_vendor_response_code} />
                <Field label="Descripción Respuesta" value={purchase.purchase_vendor_response_description} />
                <Field label="ID Compra Vendor" value={purchase.purchase_vendor_purchase_id} />
                <Field label="IP Petición" value={purchase.purchase_ip_petition} />
                <Field label="Tasa de Cambio" value={purchase.purchase_exch_rate} />
              </Section>

              {/* PARTE 5: BALANCE */}
              <Section title="💰 BALANCE Y CONCILIACIÓN">
                <Field label="Moneda Balance" value={purchase.purchase_balance_currency} />
                <Field label="Balance Inicial" value={purchase.purchase_initial_balance} isCurrency />
                <Field label="Balance Final" value={purchase.purchase_final_balance} isCurrency />
                <Field label="Fecha Envío Conciliación" value={purchase.purchase_date_sent_to_conciliation} isDate />
              </Section>

              {/* PARTE 6: AUDITORÍA */}
              <Section title="📝 AUDITORÍA">
                <Field label="Creado Por" value={purchase.created_by} />
                <Field label="Actualizado Por" value={purchase.updated_by} />
                <Field label="Última Actualización" value={purchase.last_update_date} isDate />
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;
