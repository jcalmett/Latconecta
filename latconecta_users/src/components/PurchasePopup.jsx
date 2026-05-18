import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Loader2, AlertCircle, Download, FileText, Check, CreditCard, Smartphone } from 'lucide-react';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
import opsConfigService from '../services/operationsConfigService';
import paymentService from '../services/paymentService';
import CulqiCheckout from './payment/CulqiCheckout';

const PurchasePopup = React.memo(({
  showPurchasePopup,
  selectedProduct,
  selectedService,
  selectedVendorProduct,
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
  company,
  handleCheckBalance
}) => {
  if (!showPurchasePopup || !selectedProduct) return null;

  // --- Refs ---
  const isSubmitting = useRef(false);
  // --- Payment Gateway State ---
  const [showGatewayCheckout, setShowGatewayCheckout] = useState(false);
  const [gatewayResult, setGatewayResult] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);


  // Cargar config de pagos del backend al montar o al llegar al paso 4.
  // GET /payments/config retorna card_available y barcode_available según
  // DEPLOYMENT_COUNTRY — controles por país independientes del sistema de
  // operaciones (fase1/fase2), que es exclusivo de desarrollo y UAT.
  useEffect(() => {
    if (purchaseStep === 4 || showPurchasePopup) {
      paymentService.getConfig().then(cfg => {
        console.log('📋 Payment config:', cfg);
        setPaymentConfig(cfg);
      });
    }
  }, [purchaseStep, showPurchasePopup]);

  // card_available / barcode_available vienen del backend según país de instalación
  const cardEnabled    = paymentConfig?.card_available !== false;
  const barcodeEnabled = paymentConfig?.barcode_available !== false;
  // cardMode / barcodeMode siguen viniendo de ops_config (solo para dev/UAT)
  const cardMode   = paymentConfig?.card?.mode || 'fase1';
  const barcodeMode = paymentConfig?.barcode?.mode || 'fase1';


  const calculateTotalToPay = (amount) => {
    const baseAmount = parseFloat(amount) || 0;
    const discountPercentage = parseFloat(selectedProduct.product_discount_percentage || 0);
    const discount = baseAmount * (discountPercentage / 100);
    const fee = parseFloat(selectedProduct.product_fee || 0);
    return baseAmount - discount + fee;
  };

  useEffect(() => {
    const barcodeAvailable = company?.company_barcode_available === 'Si' && barcodeEnabled;

    if (!barcodeAvailable && purchaseData.paymentMethod === 'barcode') {
      setPurchaseData(prev => ({ ...prev, paymentMethod: cardEnabled ? 'card' : '' }));
      if (showNotification) {
        showNotification('Código de barras no disponible. Seleccione otro método.', 'info');
      }
    }
    // Si solo un método disponible, preseleccionar
    if (cardEnabled && !barcodeAvailable && !purchaseData.paymentMethod) {
      setPurchaseData(prev => ({ ...prev, paymentMethod: 'card' }));
    }
    if (!cardEnabled && barcodeAvailable && !purchaseData.paymentMethod) {
      setPurchaseData(prev => ({ ...prev, paymentMethod: 'barcode' }));
    }
  }, [company?.company_barcode_available, barcodeEnabled, cardEnabled, purchaseData.paymentMethod, setPurchaseData, showNotification]);

  useEffect(() => {
    if (purchaseStep === 2.6 && purchaseData.conversionApplies) {
      const maxDebt = purchaseData.validationData?.monto_base || 0;
      const amountUSD = (maxDebt / purchaseData.exchangeRate).toFixed(2);

      if (!purchaseData.billPaymentAmount || purchaseData.billPaymentAmount === '') {
        setPurchaseData(prev => ({ ...prev, billPaymentAmount: amountUSD }));
      }
    }
  }, [purchaseStep]);

  const getStepTitle = () => {
    if (purchaseStep === 6) return 'Resultado';
    if (purchaseStep === 5) return 'Procesando';
    if (purchaseStep === 4) return 'Método de Pago';
    if (purchaseStep === 3) return 'Monto';
    if (purchaseStep === 2.6) return 'Monto a Pagar';
    if (purchaseStep === 2.5) return 'Datos de Entrega';
    if (purchaseStep === 2) return 'Validación';
    return `Paso ${Math.floor(purchaseStep)}`;
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
                  onChange={(e) => {
                    let value = e.target.value;

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

                {purchaseData.deliveryAddress && purchaseData.deliveryAddress.length > 10 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🗺️ Mapa de Referencia
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
                    if (handleCheckBalance) {
                      handleCheckBalance().then(ok => { if (ok) setPurchaseStep(4); });
                    } else { setPurchaseStep(4); }
                  }}
                  className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PASO 2.6: Bill Payment - Monto a Pagar */}
          {purchaseStep === 2.6 && (
            <div>
              <h4 className="text-xl font-bold text-bitel-blue mb-4">Confirme el Monto a Pagar</h4>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Deuda Total:</span>
                  <span className="font-bold text-lg text-red-600">
                    {purchaseData.validationData?.monto_base?.toFixed(2)} {purchaseData.vendorCurrency}
                  </span>
                </div>

                {purchaseData.conversionApplies && (
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span>Equivalente a:</span>
                    <span className="font-semibold">
                      {(purchaseData.validationData?.monto_base / purchaseData.exchangeRate).toFixed(2)} {selectedProduct.product_currency}
                    </span>
                  </div>
                )}

                {purchaseData.conversionApplies && (
                  <div className="text-xs text-gray-500 mb-2">
                    (Tipo de cambio: {(purchaseData.exchangeRate || 1).toFixed(4)} {purchaseData.vendorCurrency}/{selectedProduct.product_currency})
                  </div>
                )}

                <div className="text-sm font-semibold mt-2">
                  {purchaseData.validationData?.indicador === 'R'
                    ? '✅ Acepta pago parcial'
                    : '⚠️ Debe pagar el monto completo'}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Pagar en {selectedProduct.product_currency} *
                </label>

                {purchaseData.conversionApplies && (
                  <div className="mb-2 text-sm text-blue-600">
                    💰 Monto máximo: {(purchaseData.validationData?.monto_base / purchaseData.exchangeRate).toFixed(2)} {selectedProduct.product_currency}
                  </div>
                )}

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
                  disabled={purchaseData.validationData?.indicador === 'T' || purchaseData.validationData?.indicador === 'F'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent disabled:bg-gray-100"
                  placeholder={purchaseData.conversionApplies
                    ? (purchaseData.validationData?.monto_base / purchaseData.exchangeRate).toFixed(2)
                    : purchaseData.validationData?.monto_base?.toFixed(2)}
                />

                <div className="text-xs text-gray-500 mt-1">
                  {purchaseData.billPaymentAmount && parseFloat(purchaseData.billPaymentAmount) !== parseFloat((purchaseData.validationData?.monto_base / (purchaseData.exchangeRate || 1)).toFixed(2))
                    ? '💡 Has modificado el monto'
                    : '💡 Monto calculado automáticamente para pago total'}
                </div>
              </div>

              {purchaseData.billPaymentAmount && parseFloat(purchaseData.billPaymentAmount) > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">Monto a pagar:</span>
                    <span className="font-semibold">
                      {selectedProduct.product_currency} {parseFloat(purchaseData.billPaymentAmount).toFixed(2)}
                    </span>
                  </div>

                  {parseFloat(selectedProduct.product_discount_percentage || 0) > 0 && (
                    <div className="flex justify-between items-center mb-1 text-green-600">
                      <span>Descuento ({parseFloat(selectedProduct.product_discount_percentage || 0).toFixed(2)}%):</span>
                      <span>
                        -{selectedProduct.product_currency} {(parseFloat(purchaseData.billPaymentAmount) * parseFloat(selectedProduct.product_discount_percentage || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {parseFloat(selectedProduct.product_fee || 0) > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Fee:</span>
                      <span className="font-semibold">
                        +{selectedProduct.product_currency} {parseFloat(selectedProduct.product_fee || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-bold">Total a Pagar:</span>
                    <span className="text-xl font-bold text-bitel-blue">
                      {selectedProduct.product_currency} {(() => {
                        const amount = parseFloat(purchaseData.billPaymentAmount);
                        const discount = amount * (parseFloat(selectedProduct.product_discount_percentage || 0) / 100);
                        const fee = parseFloat(selectedProduct.product_fee || 0);
                        return (amount - discount + fee).toFixed(2);
                      })()}
                    </span>
                  </div>

                  {purchaseData.conversionApplies && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        💱 <strong>Se pagarán al proveedor:</strong> {(() => {
                          const amountUSD = parseFloat(purchaseData.billPaymentAmount);
                          const amountLocal = amountUSD * purchaseData.exchangeRate;
                          const maxDebt = purchaseData.validationData?.monto_base || 0;
                          const diff = Math.abs(amountLocal - maxDebt);
                          const diffPercent = (diff / maxDebt) * 100;
                          if (diffPercent < 1) {
                            return `${maxDebt.toFixed(2)} ${purchaseData.vendorCurrency} (Pago Total)`;
                          } else {
                            return `${amountLocal.toFixed(2)} ${purchaseData.vendorCurrency}`;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPurchaseStep(3)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                >
                  Atrás
                </button>
                <button
                  onClick={() => {
                    let amountUSD = parseFloat(purchaseData.billPaymentAmount);
                    const maxDebt = purchaseData.validationData?.monto_base || 0;

                    if (!amountUSD || amountUSD <= 0) {
                      if (setError) setError('Ingrese un monto válido');
                      return;
                    }

                    let maxAllowedUSD = maxDebt;
                    if (purchaseData.conversionApplies) {
                      maxAllowedUSD = maxDebt / purchaseData.exchangeRate;
                    }

                    if (amountUSD > maxAllowedUSD + 0.01) {
                      if (setError) setError(`El monto no debe exceder ${maxAllowedUSD.toFixed(2)} ${selectedProduct.product_currency}`);
                      return;
                    }

                    if (handleCheckBalance) {
                      handleCheckBalance().then(ok => { if (ok) setPurchaseStep(4); });
                    } else { setPurchaseStep(4); }
                  }}
                  className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ✅ PASO 3: Definir/Mostrar Monto (GENÉRICO) */}
          {purchaseStep === 3 && (
            <div>
              <h4 className="text-xl font-bold text-bitel-blue mb-4">
                {selectedProduct.product_amount_type === 'F' ? 'Confirme el Monto' :
                 selectedProduct.product_amount_type === 'R' ? 'Ingrese el Monto' :
                 'Confirme el Monto a Pagar'}
              </h4>

              {/* CASO F: MONTO FIJO - Solo mostrar */}
              {selectedProduct.product_amount_type === 'F' && (
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700">Monto a pagar:</span>
                      <span className="font-semibold">
                        {selectedProduct.product_currency} {parseFloat(selectedProduct.product_base_price).toFixed(2)}
                      </span>
                    </div>

                    {parseFloat(selectedProduct.product_discount_percentage || 0) > 0 && (
                      <div className="flex justify-between items-center mb-1 text-green-600">
                        <span>Descuento ({parseFloat(selectedProduct.product_discount_percentage || 0).toFixed(2)}%):</span>
                        <span>
                          -{selectedProduct.product_currency} {parseFloat(selectedProduct.product_discount_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {parseFloat(selectedProduct.product_fee || 0) > 0 && (
                      <div className="flex justify-between items-center mb-2">
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

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPurchaseStep(2)}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => {
                        if (purchaseData.productType === 'smartphone') {
                          setPurchaseStep(2.5);
                        } else if (handleCheckBalance) {
                          handleCheckBalance().then(ok => { if (ok) setPurchaseStep(4); });
                        } else {
                          setPurchaseStep(4);
                        }
                      }}
                      className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* CASO R: MONTO EN RANGO - Input con validación */}
              {selectedProduct.product_amount_type === 'R' && (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold">
                        💰 Rango permitido: {parseFloat(selectedProduct.product_base_price).toFixed(2)} - {parseFloat(selectedProduct.product_base_price_max).toFixed(2)} {selectedProduct.product_currency}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto en {selectedProduct.product_currency} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={selectedProduct.product_base_price}
                      max={selectedProduct.product_base_price_max}
                      value={purchaseData.variableAmount}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        const discount = amount * (parseFloat(selectedProduct.product_discount_percentage || 0) / 100);
                        const fee = parseFloat(selectedProduct.product_fee || 0);
                        const total = amount - discount + fee;

                        setPurchaseData(prev => ({
                          ...prev,
                          variableAmount: e.target.value,
                          variableTotalToPay: total
                        }));
                      }}
                      placeholder={parseFloat(selectedProduct.product_base_price).toFixed(2)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitel-blue focus:border-transparent"
                    />

                    {purchaseData.variableAmount && (
                      parseFloat(purchaseData.variableAmount) < parseFloat(selectedProduct.product_base_price) ||
                      parseFloat(purchaseData.variableAmount) > parseFloat(selectedProduct.product_base_price_max)
                    ) && (
                      <div className="mt-2 text-sm text-red-600">
                        ⚠️ El monto debe estar entre {parseFloat(selectedProduct.product_base_price).toFixed(2)} y {parseFloat(selectedProduct.product_base_price_max).toFixed(2)} {selectedProduct.product_currency}
                      </div>
                    )}
                  </div>

                  {purchaseData.variableAmount && parseFloat(purchaseData.variableAmount) > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700">Monto seleccionado:</span>
                        <span className="font-semibold">
                          {selectedProduct.product_currency} {parseFloat(purchaseData.variableAmount).toFixed(2)}
                        </span>
                      </div>

                      {parseFloat(selectedProduct.product_discount_percentage || 0) > 0 && (
                        <div className="flex justify-between items-center mb-1 text-green-600">
                          <span>Descuento ({parseFloat(selectedProduct.product_discount_percentage || 0).toFixed(2)}%):</span>
                          <span>
                            -{selectedProduct.product_currency} {(parseFloat(purchaseData.variableAmount) * parseFloat(selectedProduct.product_discount_percentage || 0) / 100).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {parseFloat(selectedProduct.product_fee || 0) > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700">Fee:</span>
                          <span className="font-semibold">
                            +{selectedProduct.product_currency} {parseFloat(selectedProduct.product_fee || 0).toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                        <span className="font-bold text-gray-900">Total a Pagar:</span>
                        <span className="text-xl font-bold text-bitel-blue">
                          {selectedProduct.product_currency} {(purchaseData.variableTotalToPay || 0).toFixed(2)}
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
                        const amount = parseFloat(purchaseData.variableAmount);

                        if (!amount || amount <= 0) {
                          if (setError) setError('Ingrese un monto válido');
                          return;
                        }

                        if (amount < parseFloat(selectedProduct.product_base_price) ||
                            amount > parseFloat(selectedProduct.product_base_price_max)) {
                          if (setError) setError(`El monto debe estar entre ${parseFloat(selectedProduct.product_base_price).toFixed(2)} y ${parseFloat(selectedProduct.product_base_price_max).toFixed(2)} ${selectedProduct.product_currency}`);
                          return;
                        }

                        if (purchaseData.productType === 'smartphone') {
                          setPurchaseStep(2.5);
                        } else if (handleCheckBalance) {
                          handleCheckBalance().then(ok => { if (ok) setPurchaseStep(4); });
                        } else {
                          setPurchaseStep(4);
                        }
                      }}
                      className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* CASO V: BILL PAYMENT - Redirigir al paso específico */}
              {selectedProduct.product_amount_type === 'V' && (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800">
                      Este producto requiere validación de deuda. Redirigiendo...
                    </p>
                  </div>
                  {(() => {
                    setTimeout(() => setPurchaseStep(2.6), 500);
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Método de Pago + Checkout del Gateway */}
          {purchaseStep === 4 && (
            <div>
              {/* --- MODO CHECKOUT: Muestra el formulario del proveedor --- */}
              {showGatewayCheckout && (
                <CulqiCheckout
                  amount={(() => {
                    if (selectedProduct.product_amount_type === 'F') {
                      return parseFloat(selectedProduct.product_total_price);
                    } else if (selectedProduct.product_amount_type === 'R') {
                      return parseFloat(purchaseData.variableTotalToPay || 0);
                    } else if (selectedProduct.product_amount_type === 'V') {
                      return calculateTotalToPay(parseFloat(purchaseData.billPaymentAmount || 0));
                    }
                    return 0;
                  })()}
                  currency={selectedProduct.product_currency || 'PEN'}
                  orderNumber={`LC${Date.now().toString().slice(-12)}`}
                  user={user}
                  onResult={(result) => {
                    console.log('📨 Culqi result:', result);
                    setShowGatewayCheckout(false);
                    if (result.success) {
                      setGatewayResult(result);
                      handlePaymentAndProvision({
                        payment_gateway:          'culqi',
                        payment_transaction_id:   result.charge_id,
                        payment_reference_number: result.charge_id,
                        payment_order_number:     result.orderNumber,
                        payment_method_detail:    result.outcome_type || 'CARD',
                        payment_amount:           result.amount,
                        payment_currency:         result.currency,
                      });
                    } else {
                      setError(result.message || 'El pago no fue procesado');
                    }
                  }}
                  onCancel={() => {
                    console.log('🚫 Checkout cancelado por usuario');
                    setShowGatewayCheckout(false);
                    isSubmitting.current = false;
                  }}
                  autoStart={true}
                />
              )}

              {/* --- MODO SELECCIÓN: Botones de método de pago --- */}
              {!showGatewayCheckout && (
                <>
                  <h4 className="text-xl font-bold text-bitel-blue mb-4">Selecciona Método de Pago</h4>

                  <div className="space-y-4 mb-6">
                    {/* Opción: Tarjeta */}
                    {cardEnabled && (
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
                          <div className="flex-1 text-left">
                            <div className="font-bold">Pago con tarjeta</div>
                            <div className="text-sm text-gray-600">Pago inmediato y seguro</div>
                          </div>
                          {purchaseData.paymentMethod === 'card' && (
                            <Check size={24} className="text-bitel-blue" />
                          )}
                        </div>
                      </button>
                    )}

                    {/* Opción: Barcode */}
                    {company?.company_barcode_available === 'Si' && barcodeEnabled && (
                      <button
                        onClick={() => setPurchaseData(prev => ({ ...prev, paymentMethod: 'barcode' }))}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          purchaseData.paymentMethod === 'barcode'
                            ? 'border-bitel-blue bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">📊</div>
                          <div className="flex-1 text-left">
                            <div className="font-bold">Código de Barras</div>
                            <div className="text-sm text-gray-600">Paga en tienda autorizada</div>
                          </div>
                          {purchaseData.paymentMethod === 'barcode' && (
                            <Check size={24} className="text-bitel-blue" />
                          )}
                        </div>
                      </button>
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
                        } else if (purchaseData.productType === 'bill_payment' && selectedProduct.product_amount_type === 'V') {
                          setPurchaseStep(2.6);
                        } else {
                          setPurchaseStep(3);
                        }
                      }}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => {
                        if (isSubmitting.current) return;
                        if (!purchaseData.paymentMethod) {
                          setError('Selecciona un método de pago');
                          return;
                        }
                        setError(null);
                        isSubmitting.current = true;

                        if (purchaseData.paymentMethod === 'card') {
                          if (cardMode === 'fase2') {
                          } else {
                            // FASE 1: Pago simulado, va directo al backend
                            handlePaymentAndProvision();
                          }
                        } else if (purchaseData.paymentMethod === 'barcode') {
                          // Siempre va al backend (el backend decide fase1/fase2)
                          handlePaymentAndProvision();
                        }
                      }}
                      disabled={!purchaseData.paymentMethod}
                      className="flex-1 bg-bitel-blue text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      Procesar Compra
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PASO 5: Procesamiento */}
          {purchaseStep === 5 && !error && !purchaseResult && (
            <div className="text-center py-12">
              <Loader2 size={64} className="animate-spin text-bitel-blue mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700">Procesando tu compra...</p>
              <p className="text-sm text-gray-500 mt-2">Por favor espera un momento</p>
            </div>
          )}

          {/* PASO 5 - ERROR DE PAGO */}
          {purchaseStep === 5 && error && !purchaseResult && (
            <div className="text-center py-12">
              <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-red-600 mb-4">Error en el Pago</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
              <button
                onClick={() => {
                  setPurchaseStep(4);
                  setError(null);
                }}
                className="bg-bitel-blue text-white px-6 py-3 rounded-lg font-bold hover:opacity-90"
              >
                Volver a Método de Pago
              </button>
            </div>
          )}

          {/* PASO 6: Resultado */}
          {purchaseStep === 6 && purchaseResult && (
            <div className="py-6">
              {/* CASO 1: Provisión falló + Reversión EXITOSA */}
              {purchaseResult.purchase_status === 'Failed' && purchaseResult.payment_status === 'Reversed' ? (
                <>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={40} className="text-orange-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-orange-600 mb-1">
                      Provisión Fallida
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      No se pudo completar la provisión del servicio
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mx-auto max-w-md">
                      <p className="text-sm font-semibold text-green-700">
                        ✓ El pago ha sido revertido exitosamente
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        No se realizó ningún cargo a tu tarjeta
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-3">
                    <div className="border-b pb-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">Fecha:</span>
                          <p className="font-semibold">{new Date(purchaseResult.date).toLocaleString('es-PE')}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Referencia:</span>
                          <p className="font-bold text-orange-600">{purchaseResult.reference}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs text-gray-500 mb-1">
                        {purchaseData.productType === 'bill_payment' ? 'CUENTA' :
                         purchaseData.productType === 'smartphone' ? 'CONTACTO' :
                         purchaseData.productType === 'transfer' ? 'NÚMERO DESTINO' :
                         'NÚMERO'}
                      </p>
                      <p className="font-semibold">
                        {purchaseData.phoneNumber || purchaseData.accountNumber}
                      </p>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs font-bold text-gray-700 mb-1">PRODUCTO SOLICITADO</p>
                      <p className="font-semibold text-sm">{selectedProduct.product_name}</p>
                      <p className="text-xs text-gray-600">Servicio: {selectedService.service_name}</p>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs font-bold text-gray-700 mb-1">MONTO</p>
                      <div className="space-y-0.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monto solicitado:</span>
                          <span className="font-semibold">
                            {selectedProduct.product_currency} {purchaseResult.monto_pagar.toFixed(2)}
                          </span>
                        </div>
                        {purchaseResult.fee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Comisión:</span>
                            <span className="font-semibold">
                              +{selectedProduct.product_currency} {purchaseResult.fee.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-gray-300">
                          <span className="font-bold">Total:</span>
                          <span className="font-bold line-through text-gray-500">
                            {selectedProduct.product_currency} {parseFloat(purchaseResult.amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-green-600 font-bold">
                          <span>CARGO REAL:</span>
                          <span className="text-lg">$0.00</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">ESTADO</p>
                      <div className="space-y-0.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado Compra:</span>
                          <span className="font-semibold text-red-600">{purchaseResult.purchase_status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado Pago:</span>
                          <span className="font-semibold text-green-600">{purchaseResult.payment_status}</span>
                        </div>
                        {purchaseResult.payment_ref && (
                          <div className="text-xs text-gray-500">
                            Ref. Pago: {purchaseResult.payment_ref}
                          </div>
                        )}
                        {purchaseResult.reversal_ref && (
                          <div className="text-xs text-green-600 font-semibold">
                            Ref. Reversión: {purchaseResult.reversal_ref}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 bg-gray-500 text-white py-2.5 rounded-lg font-bold hover:bg-gray-600 flex items-center justify-center gap-2 text-sm"
                      >
                        <Download size={18} />
                        <span>Descargar TXT</span>
                      </button>
                      <button
                        onClick={handleDownloadReceiptPDF}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2 text-sm"
                      >
                        <FileText size={18} />
                        <span>Descargar PDF</span>
                      </button>
                    </div>
                    <button
                      onClick={closePurchasePopup}
                      className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-bold hover:bg-orange-600"
                    >
                      Cerrar
                    </button>
                  </div>
                </>

              ) : purchaseResult.purchase_status === 'Failed' && purchaseResult.payment_status === 'Refunded' ? (
                <>
                  {/* CASO 2: Provisión falló + Pago REEMBOLSADO */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={40} className="text-orange-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-orange-600 mb-1">Provisión Fallida</h4>
                    <p className="text-sm text-gray-600 mb-2">No se pudo completar la provisión del servicio</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mx-auto max-w-md">
                      <p className="text-sm font-semibold text-green-700">✓ El pago ha sido reembolsado por la pasarela</p>
                      <p className="text-xs text-green-600 mt-1">No se realizó ningún cargo definitivo a tu tarjeta</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-semibold">{new Date(purchaseResult.date).toLocaleString('es-PE')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referencia:</span>
                      <span className="font-bold text-orange-600">{purchaseResult.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado Compra:</span>
                      <span className="font-semibold text-red-600">{purchaseResult.purchase_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado Pago:</span>
                      <span className="font-semibold text-green-600">{purchaseResult.payment_status}</span>
                    </div>
                    {purchaseResult.reversal_ref && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ref. Reembolso:</span>
                        <span className="font-semibold text-green-600">{purchaseResult.reversal_ref}</span>
                      </div>
                    )}
                    {purchaseResult.payment_ref && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ref. Pago:</span>
                        <span className="text-gray-500">{purchaseResult.payment_ref}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={closePurchasePopup}
                    className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-bold hover:bg-orange-600"
                  >
                    Cerrar
                  </button>
                </>

              ) : purchaseResult.purchase_status === 'Failed' && purchaseResult.requires_manual_intervention ? (
                <>
                  {/* CASO 3: Provisión falló + Reversión FALLÓ - CRÍTICO */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={40} className="text-red-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-red-600 mb-1">⚠️ Intervención Manual Requerida</h4>
                    <p className="text-sm text-gray-600 mb-2">La provisión del servicio falló</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mx-auto max-w-md">
                      <p className="text-sm font-semibold text-red-700">✗ No se pudo revertir el pago automáticamente</p>
                      <p className="text-xs text-red-600 mt-1">El cargo permanece en tu tarjeta</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-3">
                    <div className="border-b pb-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">Fecha:</span>
                          <p className="font-semibold">{new Date(purchaseResult.date).toLocaleString('es-PE')}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Referencia:</span>
                          <p className="font-bold text-red-600">{purchaseResult.reference}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs text-gray-500 mb-1">
                        {purchaseData.productType === 'bill_payment' ? 'CUENTA' :
                         purchaseData.productType === 'smartphone' ? 'CONTACTO' :
                         purchaseData.productType === 'transfer' ? 'NÚMERO DESTINO' :
                         'NÚMERO'}
                      </p>
                      <p className="font-semibold">{purchaseData.phoneNumber || purchaseData.accountNumber}</p>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs font-bold text-gray-700 mb-1">PRODUCTO SOLICITADO</p>
                      <p className="font-semibold text-sm">{selectedProduct.product_name}</p>
                      <p className="text-xs text-gray-600">Servicio: {selectedService.service_name}</p>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs font-bold text-gray-700 mb-1">MONTO COBRADO</p>
                      <div className="space-y-0.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monto:</span>
                          <span className="font-semibold">
                            {selectedProduct.product_currency} {purchaseResult.monto_pagar.toFixed(2)}
                          </span>
                        </div>
                        {purchaseResult.fee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Comisión:</span>
                            <span className="font-semibold">
                              +{selectedProduct.product_currency} {purchaseResult.fee.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-gray-300 font-bold text-red-600">
                          <span>TOTAL COBRADO:</span>
                          <span className="text-lg">
                            {selectedProduct.product_currency} {parseFloat(purchaseResult.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs font-bold text-gray-700 mb-1">ESTADO</p>
                      <div className="space-y-0.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado Compra:</span>
                          <span className="font-semibold text-red-600">{purchaseResult.purchase_status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado Pago:</span>
                          <span className="font-semibold text-red-600">{purchaseResult.payment_status}</span>
                        </div>
                        {purchaseResult.payment_ref && (
                          <div className="text-xs text-gray-500">Ref. Pago: {purchaseResult.payment_ref}</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-xs font-bold text-yellow-800 mb-2">📞 ACCIÓN REQUERIDA</p>
                      <p className="text-xs text-yellow-700">
                        No se pudo completar la devolución automática.
                        Si no recibes tu reembolso en las próximas 48 horas,
                        contacta a <span className="font-semibold">soporte@latconecta.com</span> con
                        la referencia: <span className="font-bold">{purchaseResult.reference}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 bg-gray-500 text-white py-2.5 rounded-lg font-bold hover:bg-gray-600 flex items-center justify-center gap-2 text-sm"
                      >
                        <Download size={18} />
                        <span>Descargar TXT</span>
                      </button>
                      <button
                        onClick={handleDownloadReceiptPDF}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2 text-sm"
                      >
                        <FileText size={18} />
                        <span>Descargar PDF</span>
                      </button>
                    </div>
                    <button
                      onClick={closePurchasePopup}
                      className="w-full bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700"
                    >
                      Cerrar
                    </button>
                  </div>
                </>

              ) : purchaseResult.success ? (
                <>
                  {/* CASO 4: Compra EXITOSA */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check size={40} className="text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-green-600 mb-1">
                      {purchaseResult.purchase_status === 'Pending' ? '¡Compra Registrada!' : '¡Compra Exitosa!'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {purchaseResult.purchase_status === 'Pending'
                        ? 'Tu compra ha sido registrada y está pendiente de confirmación'
                        : 'Tu transacción ha sido completada'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-3">
                    <div className="border-b pb-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">Fecha:</span>
                          <p className="font-semibold">{new Date(purchaseResult.date).toLocaleString('es-PE')}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Referencia:</span>
                          <p className="font-bold text-bitel-blue">{purchaseResult.reference}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs text-gray-500 mb-1">
                        {purchaseData.productType === 'bill_payment' ? 'CUENTA PAGADA' :
                         purchaseData.productType === 'smartphone' ? 'CONTACTO ENTREGA' :
                         purchaseData.productType === 'transfer' ? 'NÚMERO DESTINO' :
                         'NÚMERO RECARGADO'}
                      </p>
                      <p className="font-semibold">{purchaseData.phoneNumber || purchaseData.accountNumber}</p>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs font-bold text-gray-700 mb-1">PRODUCTO</p>
                      <p className="font-semibold text-sm">{selectedProduct.product_name}</p>
                      <p className="text-xs text-gray-600">Servicio: {selectedService.service_name}</p>
                    </div>

                    <div className="border-b pb-2">
                      <p className="text-xs font-bold text-gray-700 mb-1">MONTO</p>
                      <div className="space-y-0.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monto a pagar:</span>
                          <span className="font-semibold">
                            {selectedProduct.product_currency} {purchaseResult.monto_pagar.toFixed(2)}
                          </span>
                        </div>
                        {purchaseResult.descuento > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Descuento ({purchaseResult.porcentaje_descuento}%):</span>
                            <span>-{selectedProduct.product_currency} {purchaseResult.descuento.toFixed(2)}</span>
                          </div>
                        )}
                        {purchaseResult.fee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Comisión:</span>
                            <span className="font-semibold">
                              +{selectedProduct.product_currency} {purchaseResult.fee.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-gray-300 font-bold">
                          <span>PAGO TOTAL:</span>
                          <span className="text-bitel-blue text-base">
                            {selectedProduct.product_currency} {parseFloat(purchaseResult.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={purchaseResult.barcode ? 'border-b pb-2' : ''}>
                      <p className="text-xs font-bold text-gray-700 mb-1">ESTADO</p>
                      <div className="space-y-0.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado Pago:</span>
                          <span className="font-semibold">{purchaseResult.payment_status}</span>
                        </div>
                        {purchaseResult.delivery_status && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estado Provisión:</span>
                            <span className="font-semibold">{purchaseResult.delivery_status}</span>
                          </div>
                        )}
                        {purchaseResult.payment_ref && (
                          <div className="text-xs text-gray-500">Ref. Pago: {purchaseResult.payment_ref}</div>
                        )}
                        {purchaseResult.provision_ref && (
                          <div className="text-xs text-gray-500">Ref. Provisión: {purchaseResult.provision_ref}</div>
                        )}
                        {purchaseResult.reversal_ref && (
                          <div className="text-xs text-green-600 font-semibold">Ref. Reversión: {purchaseResult.reversal_ref}</div>
                        )}
                      </div>
                    </div>

                    {purchaseResult.barcode && (
                      <div className={purchaseData.productType === 'smartphone' ? 'border-b pb-2' : ''}>
                        <p className="text-xs font-bold text-gray-700 mb-1">CÓDIGO DE BARRAS</p>
                        <p className="font-mono text-center text-base font-bold my-2">{purchaseResult.barcode}</p>
                        {purchaseResult.barcode_image && (
                          <div className="flex justify-center my-2">
                            <img
                              src={purchaseResult.barcode_image}
                              alt="Barcode"
                              className="max-w-full h-auto"
                              style={{ maxHeight: '80px' }}
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-500 text-center">
                          Acércate a una tienda autorizada para realizar el pago
                        </p>
                      </div>
                    )}

                    {purchaseData.productType === 'smartphone' && (
                      <div>
                        <p className="text-xs font-bold text-gray-700 mb-1">CONTACTO</p>
                        <div className="space-y-0.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Teléfono:</span>
                            <span className="font-semibold">{purchaseData.deliveryPhone || purchaseData.phoneNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nombre:</span>
                            <span className="font-semibold">{purchaseData.deliveryName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs">Dirección:</span>
                            <p className="text-sm font-semibold">{purchaseData.deliveryAddress}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {purchaseResult.requires_manual_intervention && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <p className="text-xs text-yellow-800 font-semibold">⚠️ Atención Requerida</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          No se pudo completar la devolución automática. Si no recibes tu reembolso en 48 horas,
                          contacta a soporte@latconecta.com con la referencia: {purchaseResult.reference}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 bg-gray-500 text-white py-2.5 rounded-lg font-bold hover:bg-gray-600 flex items-center justify-center gap-2 text-sm"
                      >
                        <Download size={18} />
                        <span>Descargar TXT</span>
                      </button>
                      <button
                        onClick={handleDownloadReceiptPDF}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2 text-sm"
                      >
                        <FileText size={18} />
                        <span>Descargar PDF</span>
                      </button>
                    </div>
                    <button
                      onClick={closePurchasePopup}
                      className="w-full bg-bitel-blue text-white py-2.5 rounded-lg font-bold hover:opacity-90"
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Error en compra */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={40} className="text-red-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-red-600 mb-2">Error en la Compra</h4>
                    <p className="text-gray-600">{purchaseResult.error || 'Hubo un problema al procesar tu compra'}</p>
                  </div>

                  <button
                    onClick={closePurchasePopup}
                    className="w-full bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
});

PurchasePopup.displayName = 'PurchasePopup';

export default PurchasePopup;
