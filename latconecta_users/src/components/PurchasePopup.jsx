import React, { useEffect } from 'react';
import { X, Loader2, AlertCircle, Download, FileText, Check, CreditCard, Smartphone } from 'lucide-react';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
import apiSimulator from '../services/apiSimulatorService';

const PurchasePopup = React.memo(({
  showPurchasePopup,
  selectedProduct,
  selectedService,
  purchaseStep,
  setPurchaseStep,
  purchaseData,
  setPurchaseData,
  closePurchasePopup,
  error,
  setError,
  processing,
  handleValidation,
  handlePaymentAndProvision,
  showNotification,
  purchaseResult,
  handleDownloadReceipt,
  handleDownloadReceiptPDF,
  user,
  company  // ✅ NUEVO: Información de la compañía para verificar disponibilidad de barcode
}) => {
  if (!showPurchasePopup || !selectedProduct) return null;

  // ✅ NUEVO: Resetear a 'card' si barcode no está disponible
  useEffect(() => {
    if (company?.company_barcode_available === 'No' && purchaseData.paymentMethod === 'barcode') {
      setPurchaseData(prev => ({ ...prev, paymentMethod: 'card' }));
      if (showNotification) {
        showNotification('Código de barras no disponible. Seleccione tarjeta.', 'info');
      }
    }
  }, [company?.company_barcode_available, purchaseData.paymentMethod, setPurchaseData, showNotification]);

  const getStepTitle = () => {
    if (purchaseStep === 5) return 'Resultado';
    if (purchaseStep === 4) return 'Procesando';
    if (purchaseStep === 2.5) return 'Datos de Entrega';
    if (purchaseStep === 2.6) return 'Monto a Pagar';
    if (purchaseStep === 2.7) return 'Monto a Transferir';
    return `Paso ${Math.floor(purchaseStep)} de ${purchaseData.productType === 'smartphone' ? '4' : '3'}`;
  };

  // Calcular Total a Pagar (Monto - Descuento + Fee)
  const calculateTotalToPay = (amount) => {
    const monto = parseFloat(amount) || 0;
    const discountPercent = parseFloat(selectedProduct.product_discount_percentage) || 0;
    const fee = parseFloat(selectedProduct.product_fee) || 0;

    const discountAmount = monto * (discountPercent / 100);
    const total = monto - discountAmount + fee;

    return total;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-bitel-blue">Compra - {getStepTitle()}</h3>
          <button onClick={closePurchasePopup} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* PASO 1: Confirmación */}
          {purchaseStep === 1 && (
            <div>
              <h4 className="text-xl font-bold text-bitel-blue mb-4">Confirma tu producto</h4>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={getImageUrl(selectedProduct.product_photo)}
                    alt={selectedProduct.product_name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGES.product;
                    }}
                  />
                  <div className="flex-1">
                    <h5 className="font-bold text-lg">{selectedProduct.product_name}</h5>
                    <p className="text-sm text-gray-600 mb-2">{selectedService?.service_name}</p>
                    <p className="text-gray-700 text-sm mb-3">{selectedProduct.product_description}</p>

                    {/* ✅ CORREGIDO: Mostrar desglose para TODOS los productos */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-700">Precio Base:</span>
                        <span className="font-semibold">
                          {selectedProduct.product_currency} {parseFloat(selectedProduct.product_base_price).toFixed(2)}
                        </span>
                      </div>
                      
                      {parseFloat(selectedProduct.product_discount_percentage || 0) > 0 && (
                        <div className="flex justify-between items-center text-sm mb-1 text-green-600">
                          <span>Descuento ({parseFloat(selectedProduct.product_discount_percentage || 0).toFixed(2)}%):</span>
                          <span>
                            -{selectedProduct.product_currency} {parseFloat(selectedProduct.product_discount_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {parseFloat(selectedProduct.product_fee || 0) > 0 && (
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="text-gray-700">Fee:</span>
                          <span className="font-semibold">
                            +{selectedProduct.product_currency} {parseFloat(selectedProduct.product_fee || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                        <span className="font-bold text-gray-900">Total a Pagar:</span>
                        <span className="text-xl font-bold text-bitel-blue">
                          {selectedProduct.product_currency} {parseFloat(selectedProduct.product_total_price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closePurchasePopup}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setPurchaseStep(2)}
                  className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Validación de número/cuenta */}
          {purchaseStep === 2 && (
            <div>
              <h4 className="text-xl font-bold text-bitel-blue mb-4">
                {purchaseData.productType === 'bill_payment'
                  ? 'Ingrese número de cuenta'
                  : purchaseData.productType === 'smartphone'
                  ? 'Ingrese número de contacto'
                  : purchaseData.productType === 'transfer'
                  ? 'Ingrese número de destino'
                  : 'Ingrese su número'}
              </h4>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {purchaseData.productType === 'bill_payment' ? 'Número de Cuenta' : 'Número Telefónico'}
                </label>
                <input
                  type="text"
                  value={purchaseData.productType === 'bill_payment' ? purchaseData.accountNumber : purchaseData.phoneNumber}
                  // ✅ PEGAR ESTO:
                  onChange={(e) => {
                    let value = e.target.value;
  
                    // Bill Payment acepta alfanumérico, otros solo números
                    if (purchaseData.productType === 'bill_payment') {
                      value = value.trim();
                    } else {
                     value = value.replace(/[^0-9]/g, '');
                    }
  
                    setPurchaseData(prev => ({
                      ...prev,
                      [purchaseData.productType === 'bill_payment' ? 'accountNumber' : 'phoneNumber']: value
                    }));
                  }}

                  placeholder={purchaseData.productType === 'bill_payment' ? '123456789' : '999888777'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                  maxLength={15}
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closePurchasePopup}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleValidation}
                  disabled={processing}
                  className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Validando...</span>
                    </>
                  ) : (
                    'Validar'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PASO 2.5: Datos de Entrega (Solo Smartphones) */}
          {purchaseStep === 2.5 && (
            <div>
              <h4 className="text-xl font-bold text-bitel-blue mb-4">Datos de Entrega</h4>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={purchaseData.deliveryName}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, deliveryName: e.target.value }))}
                    placeholder="Juan Pérez"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="text"
                    value={purchaseData.deliveryPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setPurchaseData(prev => ({ ...prev, deliveryPhone: value }));
                    }}
                    placeholder="999888777"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Entrega *
                  </label>
                  <textarea
                    value={purchaseData.deliveryAddress}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    placeholder="Av. Principal 123, Miraflores, Lima"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                  />
                </div>

                {/* Google Maps Embed */}
                {purchaseData.deliveryAddress && purchaseData.deliveryAddress.length > 10 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📍 Mapa de Referencia
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="250"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(purchaseData.deliveryAddress + ', Lima, Peru')}&output=embed`}
                        title="Mapa de referencia"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * Este es un mapa de referencia basado en la dirección ingresada
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPurchaseStep(2)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                >
                  Atrás
                </button>
                <button
                  onClick={() => {
                    if (!purchaseData.deliveryName || !purchaseData.deliveryPhone || !purchaseData.deliveryAddress) {
                      if (setError) setError('Complete todos los campos de entrega');
                      return;
                    }
                    setPurchaseStep(3);
                  }}
                  className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 2.6: Ingreso de Monto (Bill Payment con indicador R) */}
          {purchaseStep === 2.6 && (
            <div>
              <h4 className="text-xl font-bold text-bitel-blue mb-4">Confirme el Monto a Pagar</h4>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Monto Base:</span>
                  <span className="font-bold text-lg">
                    {selectedProduct.product_currency} {purchaseData.validationData?.monto_base?.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {purchaseData.validationData?.indicador === 'R'
                    ? 'Puede pagar un monto menor o igual al monto base'
                    : 'Monto fijo'}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Pagar *
                </label>
                <input
                  type="text"
                  value={purchaseData.billPaymentAmount || ''}
                  onChange={(e) => {
                    let value = e.target.value;
                    value = value.replace(/,/g, '.');
                    value = value.replace(/[^0-9.]/g, '');
                    const parts = value.split('.');
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('');
                    }
                    setPurchaseData(prev => ({ ...prev, billPaymentAmount: value }));
                  }}
                  disabled={purchaseData.validationData?.indicador === 'T'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent disabled:bg-gray-100"
                  placeholder="0.00"
                />
              </div>

              {/* CÁLCULO DEL TOTAL (Monto - Descuento + Fee) */}
              {purchaseData.billPaymentAmount && parseFloat(purchaseData.billPaymentAmount) > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">Monto a pagar:</span>
                    <span className="font-semibold">
                      {selectedProduct.product_currency} {parseFloat(purchaseData.billPaymentAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1 text-green-600">
                    <span>Descuento ({parseFloat(selectedProduct.product_discount_percentage || 0).toFixed(2)}%):</span>
                    <span>
                      -{selectedProduct.product_currency} {(parseFloat(purchaseData.billPaymentAmount) * parseFloat(selectedProduct.product_discount_percentage || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Fee:</span>
                    <span className="font-semibold">
                      +{selectedProduct.product_currency} {parseFloat(selectedProduct.product_fee || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-bold">Total a Pagar:</span>
                    <span className="text-xl font-bold text-bitel-blue">
                      {selectedProduct.product_currency} {calculateTotalToPay(purchaseData.billPaymentAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPurchaseStep(2)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                >
                  Atrás
                </button>
                <button
                  onClick={() => {
                    const amount = parseFloat(purchaseData.billPaymentAmount);
                    if (!amount || amount <= 0 || amount > (purchaseData.validationData?.monto_base || 0)) {
                      if (setError) setError('Ingrese un monto válido');
                      return;
                    }
                    setPurchaseStep(3);
                  }}
                  className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 2.7: Monto a Transferir (Transferencias) */}
          {purchaseStep === 2.7 && (
            <div>
              <h4 className="text-xl font-bold text-bitel-blue mb-4">Ingrese Monto a Transferir</h4>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Transferir *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={purchaseData.transferAmount}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value) || 0;
                    const total = calculateTotalToPay(amount);

                    setPurchaseData(prev => ({
                      ...prev,
                      transferAmount: e.target.value,
                      transferTotalToPay: total
                    }));
                  }}
                  placeholder="50.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                />
              </div>

              {/* CÁLCULO DEL TOTAL (Monto - Descuento + Fee) */}
              {purchaseData.transferAmount && parseFloat(purchaseData.transferAmount) > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">Monto a transferir:</span>
                    <span className="font-semibold">
                      {selectedProduct.product_currency} {parseFloat(purchaseData.transferAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1 text-green-600">
                    <span>Descuento ({parseFloat(selectedProduct.product_discount_percentage || 0).toFixed(2)}%):</span>
                    <span>
                      -{selectedProduct.product_currency} {(parseFloat(purchaseData.transferAmount) * parseFloat(selectedProduct.product_discount_percentage || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Fee:</span>
                    <span className="font-semibold">
                      +{selectedProduct.product_currency} {parseFloat(selectedProduct.product_fee || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-bold">Total a Pagar:</span>
                    <span className="text-xl font-bold text-bitel-blue">
                      {selectedProduct.product_currency} {purchaseData.transferTotalToPay.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPurchaseStep(2)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                >
                  Atrás
                </button>
                <button
                  onClick={() => {
                    if (!purchaseData.transferAmount || parseFloat(purchaseData.transferAmount) <= 0) {
                      if (setError) setError('Ingrese un monto válido');
                      return;
                    }
                    setPurchaseStep(3);
                  }}
                  className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Método de Pago */}
          {purchaseStep === 3 && (
            <div>
              <h4 className="text-xl font-bold text-bitel-blue mb-4">Seleccione Método de Pago</h4>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPurchaseData(prev => ({ ...prev, paymentMethod: 'card' }))}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    purchaseData.paymentMethod === 'card'
                      ? 'border-bitel-blue bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard size={24} className="text-bitel-blue" />
                    <div className="text-left">
                      <div className="font-bold">Tarjeta de Crédito/Débito</div>
                      <div className="text-sm text-gray-600">Pago inmediato</div>
                    </div>
                  </div>
                </button>

                {/* ✅ CONDICIONAL: Solo mostrar si barcode está disponible */}
                {company?.company_barcode_available === 'Si' && (
                  <button
                    onClick={() => setPurchaseData(prev => ({ ...prev, paymentMethod: 'barcode' }))}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      purchaseData.paymentMethod === 'barcode'
                        ? 'border-bitel-blue bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Smartphone size={24} className="text-bitel-blue" />
                      <div className="text-left">
                        <div className="font-bold">Código de Barras</div>
                        <div className="text-sm text-gray-600">Paga en agentes</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* ✅ NUEVO: Mensaje informativo si barcode no está disponible */}
                {company?.company_barcode_available === 'No' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    ℹ️ Código de barras no disponible temporalmente. Use tarjeta de crédito/débito.
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (purchaseData.productType === 'smartphone') {
                      setPurchaseStep(2.5);
                    } else if (purchaseData.productType === 'transfer') {
                      setPurchaseStep(2.7);
                    } else if (purchaseData.productType === 'bill_payment' && purchaseData.validationData?.indicador === 'R') {
                      setPurchaseStep(2.6);
                    } else {
                      setPurchaseStep(2);
                    }
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                >
                  Atrás
                </button>
                <button
                  onClick={handlePaymentAndProvision}
                  disabled={processing || !purchaseData.paymentMethod}
                  className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    'Pagar'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: Procesamiento */}
          {purchaseStep === 4 && !error && !purchaseResult && (
            <div className="text-center py-12">
              <Loader2 size={64} className="animate-spin text-bitel-blue mx-auto mb-4" />
              <p className="text-lg text-gray-600">Procesando transacción...</p>
              <p className="text-sm text-gray-500 mt-2">Por favor espere</p>
            </div>
          )}

          {/* PASO 4 - ERROR DE PAGO */}
          {purchaseStep === 4 && error && !purchaseResult && (
            <div>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X size={48} className="text-bitel-blue" />
              </div>
              <h4 className="text-2xl font-bold text-bitel-blue mb-4">No se Pudo Cobrar</h4>

              <p className="text-gray-700 mb-6 text-center">Cambie Medio de Pago</p>

              {error && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-700">{error}</p>
                </div>
              )}

              <button
                onClick={() => {
                  setPurchaseStep(3);
                  setError(null);
                }}
                className="w-full bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
              >
                Volver a Método de Pago
              </button>
            </div>
          )}

          {/* PASO 5: Resultado */}
          {purchaseStep === 5 && purchaseResult && (
            <div>
              {purchaseResult.success ? (
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={36} className="text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-green-600 mb-6">
                    {purchaseResult.payment_status === 'Pending' ? '¡Código Generado!' : '¡Compra Exitosa!'}
                  </h4>

                  <div className="bg-gray-50 rounded-lg p-5 mb-5 text-left text-sm">
                    <div className="mb-4 pb-4 border-b border-gray-300">
                      <h5 className="font-bold text-gray-700 mb-2">DATOS GENERALES</h5>
                      <div className="space-y-1">
                        <div><strong>Fecha:</strong> {new Date(purchaseResult.date).toLocaleString()}</div>
                        <div><strong>Referencia:</strong> <span className="font-mono">{purchaseResult.reference}</span></div>
                        <div>
                          <strong>
                            {purchaseData.productType === 'bill_payment' ? 'CUENTA PAGADA:' :
                             purchaseData.productType === 'transfer' ? 'NUMERO DESTINO:' :
                             purchaseData.productType === 'smartphone' ? 'NUMERO CONTACTO:' :
                             'NUMERO RECARGADO:'}
                          </strong> {purchaseData.phoneNumber || purchaseData.accountNumber}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-300">
                      <h5 className="font-bold text-gray-700 mb-2">PRODUCTO</h5>
                      <div className="space-y-1">
                        <div><strong>{selectedProduct.product_name}</strong></div>
                        <div className="text-xs text-gray-600">Servicio: {selectedService.service_name}</div>

                        <div className="mt-3 bg-white rounded p-3">
                          <div className="flex justify-between text-xs">
                            <span>Monto a pagar:</span>
                            <span className="font-semibold">{selectedProduct.product_currency} {purchaseResult.monto_pagar.toFixed(2)}</span>
                          </div>
                          {purchaseResult.descuento > 0 && (
                            <div className="flex justify-between text-xs text-green-600">
                              <span>Descuento ({purchaseResult.porcentaje_descuento}%):</span>
                              <span>-{selectedProduct.product_currency} {purchaseResult.descuento.toFixed(2)}</span>
                            </div>
                          )}
                          {purchaseResult.fee > 0 && (
                            <div className="flex justify-between text-xs">
                              <span>Fee:</span>
                              <span>+{selectedProduct.product_currency} {purchaseResult.fee.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold border-t mt-2 pt-2">
                            <span>PAGO TOTAL:</span>
                            <span className="text-lg text-bitel-blue">{selectedProduct.product_currency} {parseFloat(purchaseResult.amount).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-300">
                      <h5 className="font-bold text-gray-700 mb-2">ESTADO</h5>
                      <div className="space-y-1">
                        <div><strong>Estado de Pago:</strong> <span className="text-green-600 font-semibold">{purchaseResult.payment_status}</span></div>
                        {purchaseResult.payment_ref && (
                          <div className="text-xs"><strong>Ref. Pago:</strong> <span className="font-mono">{purchaseResult.payment_ref}</span></div>
                        )}
                        {purchaseResult.delivery_status && (
                          <div><strong>Estado de Entrega:</strong> <span className="text-green-600 font-semibold">{purchaseResult.delivery_status}</span></div>
                        )}
                        {purchaseResult.provision_ref && (
                          <div className="text-xs"><strong>Ref. Entrega:</strong> <span className="font-mono">{purchaseResult.provision_ref}</span></div>
                        )}
                      </div>
                    </div>

                    {purchaseResult.barcode && (
                      <div className="mb-4 pb-4 border-b border-gray-300">
                        <h5 className="font-bold text-gray-700 mb-2">CÓDIGO DE BARRAS</h5>
                        <div className="text-center">
                          <p className="font-mono text-base font-bold mb-2">{purchaseResult.barcode}</p>
                          <img
                            src={purchaseResult.barcode_image}
                            alt="Barcode"
                            className="w-full max-w-xs mx-auto mb-2"
                          />
                          <p className="text-xs text-orange-600">
                            📍 Acérquese a una tienda autorizada para completar el pago
                          </p>
                        </div>
                      </div>
                    )}

                    {purchaseData.productType === 'smartphone' && (
                      <div className="mb-2">
                        <h5 className="font-bold text-gray-700 mb-2">DATOS DE ENTREGA</h5>
                        <div className="space-y-1 text-xs">
                          <div><strong>Número de Contacto:</strong> {purchaseData.deliveryPhone || purchaseData.phoneNumber}</div>
                          <div><strong>Nombre Completo:</strong> {purchaseData.deliveryName}</div>
                          <div><strong>Dirección de Entrega:</strong> {purchaseData.deliveryAddress}</div>
                        </div>
                      </div>
                    )}
                  </div>

                {/* ✅ NUEVO: Advertencia para usuarios anónimos */}
                {!user && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <AlertCircle size={20} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-bold mb-2">📋 IMPORTANTE: Guarda estos datos</p>
                        <div className="bg-white rounded p-3 mb-2 border border-blue-200">
                          <div className="font-mono text-base space-y-1">
                            <div>
                              <strong>Referencia:</strong> 
                              <span className="ml-2 text-blue-600">{purchaseResult.reference}</span>
                            </div>
                            <div>
                              <strong>Teléfono:</strong> 
                              <span className="ml-2 text-blue-600">
                                {purchaseData.phoneNumber || purchaseData.accountNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs">
                          💡 Para consultas sobre tu compra, comunícate con nuestro equipo de soporte 
                          proporcionando estos datos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        <span>TXT</span>
                      </button>
                      <button
                        onClick={handleDownloadReceiptPDF}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <FileText size={20} />
                        <span>PDF</span>
                      </button>
                    </div>
                    <button
                      onClick={closePurchasePopup}
                      className="w-full bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                    >
                      Finalizar
                    </button>
                  </div>
                </div>
              ) : purchaseResult.payment_status === 'Reversed' ? (
                <div>
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={48} className="text-orange-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-orange-600 mb-4">Falló en Provisión</h4>

                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-6">
                    <p className="text-orange-800 font-bold mb-3">La Provisión Falló</p>
                    <p className="text-sm text-orange-700 mb-4">
                      Se devolvió cobro realizado
                    </p>

                    <div className="bg-white rounded p-3 space-y-2">
                      {purchaseResult.payment_ref && (
                        <div>
                          <p className="text-xs text-gray-600">Ref. Cobro:</p>
                          <p className="font-mono text-sm font-semibold">{purchaseResult.payment_ref}</p>
                        </div>
                      )}
                      {purchaseResult.reversal_ref && (
                        <div>
                          <p className="text-xs text-gray-600">Ref. Devolución:</p>
                          <p className="font-mono text-sm font-semibold text-orange-600">{purchaseResult.reversal_ref}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left text-sm">
                    <h5 className="font-bold text-gray-700 mb-2">ESTADO DE LA TRANSACCIÓN</h5>
                    <div className="space-y-1 text-xs">
                      <div><strong>Fecha:</strong> {new Date(purchaseResult.date).toLocaleString()}</div>
                      <div><strong>Referencia:</strong> <span className="font-mono">{purchaseResult.reference}</span></div>
                      <div><strong>Producto:</strong> {selectedProduct.product_name}</div>
                      <div><strong>Estado:</strong> <span className="text-orange-600 font-semibold">Reversed</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        <span>TXT</span>
                      </button>
                      <button
                        onClick={handleDownloadReceiptPDF}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <FileText size={20} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  <button onClick={closePurchasePopup} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700">
                    Cerrar
                  </button>
                </div>
              ) : purchaseResult.requires_manual_intervention ? (
                <div>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={48} className="text-red-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-red-600 mb-4">Fallo en la Devolución de Cobro Realizado</h4>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                    <p className="text-red-800 font-bold mb-3">La provisión del servicio falló</p>
                    <p className="text-sm text-red-700 font-bold mb-3">
                      No se pudo devolver cobro realizado
                    </p>
                    <p className="text-sm text-red-700 font-bold mb-4">
                      Si no recibe devolución en 48 horas, contactar con soporte@latcom.co
                    </p>

                    {purchaseResult.payment_ref && (
                      <div className="bg-white rounded p-3">
                        <p className="text-xs text-gray-600">Ref. Pago:</p>
                        <p className="font-mono font-bold text-sm text-red-600">{purchaseResult.payment_ref}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left text-sm">
                    <h5 className="font-bold text-gray-700 mb-2">ESTADO DE LA TRANSACCIÓN</h5>
                    <div className="space-y-1 text-xs">
                      <div><strong>Fecha:</strong> {new Date(purchaseResult.date).toLocaleString()}</div>
                      <div><strong>Referencia:</strong> <span className="font-mono">{purchaseResult.reference}</span></div>
                      <div><strong>Producto:</strong> {selectedProduct.product_name}</div>
                      <div><strong>Estado:</strong> <span className="text-red-600 font-semibold">Pendiente Devolución del Cobro</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        <span>TXT</span>
                      </button>
                      <button
                        onClick={handleDownloadReceiptPDF}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <FileText size={20} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  <button onClick={closePurchasePopup} className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700">
                    Cerrar
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={48} className="text-red-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-red-600 mb-4">Error en la compra</h4>
                  <p className="text-gray-600 mb-6">{purchaseResult.error}</p>
                  <button onClick={closePurchasePopup} className="w-full bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600">
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default PurchasePopup;