/**
 * Purchase Detail Modal - Latconecta Admin
 * Modal con 2 tabs para mostrar todos los detalles de una compra
 * Tab 1: Básicos + Estado + Delivery
 * Tab 2: Vendor + Balance + Auditoría
 * 
 * ACTUALIZADO: 2026-01-11
 * - Botón cerrar arriba (modal más compacto)
 * - Información Básica: sin IDs internos, con Purchase Status y códigos vendor
 * - Estado Pago: con ambas referencias y flag de intervención manual
 * - Estado Entrega: limpio, sin campos de pago
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
  const Field = ({ 
    label, 
    value, 
    isBoolean = false, 
    isDate = false, 
    isCurrency = false, 
    isJson = false,
    isUrl = false,
    statusType = null  // 'transaction', 'payment', 'delivery'
  }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
      </label>
      <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
        {isUrl && value ? (
          <a
            href={value.startsWith('http') ? value : `https://peruse.latconecta.com${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
          >
            📄 Ver Recibo PDF
          </a>
        ) : isBoolean ? (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {value ? 'SÍ' : 'NO'}
          </span>
        ) : isDate ? (
          formatDate(value)
        ) : isCurrency ? (
          formatCurrency(value, purchase.purchase_currency)
        ) : isJson && value ? (
          <pre className="text-xs overflow-x-auto">{JSON.stringify(JSON.parse(value), null, 2)}</pre>
        ) : statusType === 'transaction' ? (
          // purchase_status: Success, Pending, Failed (NO Reversed)
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            value === 'Success' ? 'bg-green-100 text-green-800' :
            value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            value === 'Failed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value || 'N/A'}
          </span>
        ) : statusType === 'payment' ? (
          // purchase_payment_status: Success, Pending, Reversed (NO Failed grabado)
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            value === 'Success' ? 'bg-green-100 text-green-800' :
            value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            value === 'Reversed' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value || 'N/A'}
          </span>
        ) : statusType === 'delivery' ? (
          // purchase_delivery_status: Success, Pending, Failed, Ordered (solo smartphones)
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            value === 'Success' ? 'bg-green-100 text-green-800' :
            value === 'Pending' ? 'bg-blue-100 text-blue-800' :
            value === 'Ordered' ? 'bg-cyan-100 text-cyan-800' :
            value === 'Failed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value || 'N/A'}
          </span>
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
        {/* Header Compacto */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-blue-900">Detalle de Compra</h2>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-mono font-semibold">{purchase.purchase_reference}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
          >
            <X size={18} className="inline mr-1" />
            Cerrar
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
          {/* TAB 1: GENERAL Y ESTADO */}
          {activeTab === 1 && (
            <div>
              {/* INFORMACIÓN BÁSICA */}
              <Section title="📋 INFORMACIÓN BÁSICA">
                <Field label="Referencia" value={purchase.purchase_reference} />
                <Field label="Fecha" value={purchase.purchase_date} isDate />
                <Field label="Teléfono" value={purchase.purchase_phone_number} />
                <Field label="Usuario ID" value={purchase.purchase_user_id || 'Anónimo'} />
                <Field label="Servicio" value={purchase.purchase_service_name} />
                <Field label="Producto" value={purchase.purchase_product_name} />
                <Field label="Estado de la Transacción" value={purchase.purchase_status} statusType="transaction" />
                <Field label="Código Vendor" value={purchase.purchase_vendor_code} />
                <Field label="Código VendorProduct" value={purchase.purchase_vendpro_code} />
              </Section>

              {/* MONTOS */}
              <Section title="💰 MONTOS Y PRECIOS">
                <Field label="Moneda" value={purchase.purchase_currency} />
                <Field label="Precio Base" value={purchase.purchase_base_price} isCurrency />
                <Field label="Descuento" value={purchase.purchase_discount} isCurrency />
                <Field label="Comisión/Fee" value={purchase.purchase_fee} isCurrency />
                <Field label="TOTAL" value={purchase.purchase_total_amount} isCurrency />
              </Section>

              {/* ESTADO DE PAGO */}
              <Section title="💳 ESTADO DE PAGO">
                <Field label="Método de Pago" value={purchase.purchase_payment_method} />
                <Field label="Estado Pago" value={purchase.purchase_payment_status} statusType="payment" />
                <Field label="Ref. Pago" value={purchase.purchase_payment_ref} />
                <Field label="Ref. Reversión" value={purchase.purchase_reversal_ref} />
                <Field label="Últimos 4 Dígitos Tarjeta" value={purchase.purchase_credit_card_last_digits} />
                <Field 
                  label="Requiere Intervención Manual" 
                  value={purchase.requires_manual_intervention} 
                  isBoolean 
                />
              </Section>

              {/* ESTADO DE ENTREGA */}
              <Section title="📦 ESTADO DE ENTREGA (Solo Smartphones)">
                <Field label="Estado Entrega" value={purchase.purchase_delivery_status} statusType="delivery" />
                <Field label="Ref. Provisión" value={purchase.purchase_provision_ref} />
                <Field label="Recibo PDF" value={purchase.purchase_receip_url} isUrl />
              </Section>

              {/* DATOS DE ENTREGA */}
              <Section title="🚚 DATOS DE ENTREGA">
                <Field label="Teléfono Entrega" value={purchase.purchase_delivery_phone} />
                <Field label="Nombre Destinatario" value={purchase.purchase_delivery_name} />
                <Field label="Dirección" value={purchase.purchase_delivery_address} />
                <Field label="Número de Cuenta" value={purchase.purchase_account_number} />
              </Section>

              {/* CÓDIGO DE BARRAS */}
              <Section title="📱 CÓDIGO DE BARRAS">
                <Field label="Código Barcode" value={purchase.purchase_barcode_code} />
                <Field label="Imagen Barcode" value={purchase.purchase_barcode_image} />
              </Section>
            </div>
          )}

          {/* TAB 2: VENDOR Y AUDITORÍA */}
          {activeTab === 2 && (
            <div>
              {/* VENDOR - INFORMACIÓN BÁSICA */}
              <Section title="🏢 INFORMACIÓN DEL VENDOR">
                <Field label="Código Vendor" value={purchase.purchase_vendor_code} />
                <Field label="Nombre Vendor" value={purchase.vendor_name} />
                <Field label="Tipo Producto" value={purchase.purchase_product_type} />
                <Field label="Código VendPro" value={purchase.purchase_vendpro_code} />
                <Field label="SKU ID Vendor" value={purchase.purchase_vendor_skuid} />
                <Field label="País VendPro" value={purchase.purchase_vendpro_country} />
                <Field label="Operador VendPro" value={purchase.purchase_vendpro_operator} />
                <Field label="Tipo Producto VendPro" value={purchase.purchase_vendpro_product_type} />
                <Field 
                  label="Tipo de Monto" 
                  value={purchase.purchase_vendpro_amount_type 
                    ? `${purchase.purchase_vendpro_amount_type} (${
                        purchase.purchase_vendpro_amount_type === 'F' ? 'Fixed' :
                        purchase.purchase_vendpro_amount_type === 'R' ? 'Range' :
                        purchase.purchase_vendpro_amount_type === 'V' ? 'Variable' : 
                        'Unknown'
                      })`
                    : 'N/A'
                  }
                />
                <Field 
                  label="Monto Máximo" 
                  value={purchase.purchase_vendpro_maximum_amount 
                    ? `${parseFloat(purchase.purchase_vendpro_maximum_amount).toFixed(2)} ${purchase.purchase_vendor_currency || ''}`
                    : 'N/A'
                  }
                />               
              </Section>

              {/* VENDOR - MONTOS Y TRANSACCIONES */}
              <Section title="💵 MONTOS Y TRANSACCIONES VENDOR">
                <Field label="Moneda Vendor" value={purchase.purchase_vendor_currency} />
                <Field label="Monto Vendor" value={purchase.purchase_vendor_amount} isCurrency />
                <Field label="Costo Vendor" value={purchase.purchase_vendor_cost} isCurrency />
                <Field label="Tasa de Cambio" value={purchase.purchase_exch_rate} />
                <Field label="ID Compra Vendor" value={purchase.purchase_vendor_purchase_id} />
                <Field label="ID Transacción Vendor" value={purchase.vendor_trans_id} />
                <Field label="ID Transacción Proveedor" value={purchase.vendor_provider_trans_id} />
              </Section>

              {/* VENDOR - COMUNICACIÓN */}
              <Section title="📡 COMUNICACIÓN CON VENDOR">
                <Field label="IP Petición" value={purchase.purchase_ip_petition} />
                <Field label="Fecha Petición" value={purchase.purchase_vendor_date_petition} isDate />
                <Field label="Fecha Respuesta" value={purchase.purchase_vendor_date_response} isDate />
                <Field label="Código Respuesta" value={purchase.purchase_vendor_response_code} />
                <Field label="Descripción Respuesta" value={purchase.purchase_vendor_response_description} />
              </Section>

              {/* VENDOR - REQUEST/RESPONSE */}
              <Section title="📨 REQUEST Y RESPONSE VENDOR">
                <div className="col-span-full">
                  <Field
                    label="Vendor Request (JSON)"
                    value={purchase.vendor_request}
                    isJson
                  />
                </div>
                <div className="col-span-full">
                  <Field
                    label="Vendor Response (JSON)"
                    value={purchase.vendor_response}
                    isJson
                  />
                </div>
                <div className="col-span-full">
                  <Field
                    label="Vendor JSON (Completo)"
                    value={purchase.purchase_vendor_json}
                    isJson
                  />
                </div>
              </Section>

              {/* BALANCE */}
              <Section title="💰 BALANCE Y CONCILIACIÓN">
                <Field label="Moneda Balance" value={purchase.purchase_balance_currency} />
                <Field label="Balance Inicial" value={purchase.purchase_initial_balance} isCurrency />
                <Field label="Balance Final" value={purchase.purchase_final_balance} isCurrency />
                <Field label="Fecha Envío Conciliación" value={purchase.purchase_date_sent_to_conciliation} isDate />
              </Section>

              {/* AUDITORÍA */}
              <Section title="🔒 AUDITORÍA">
                <Field label="Creado Por" value={purchase.created_by} />
                <Field label="Actualizado Por" value={purchase.updated_by} />
                <Field label="Última Actualización" value={purchase.last_update_date} isDate />
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;