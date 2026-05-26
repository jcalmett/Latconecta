import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, ShoppingCart, CreditCard, Smartphone, Check, AlertCircle, Loader2, Download, FileText, ArrowLeft } from 'lucide-react';
import servicesService from '../services/servicesService';
import productsService from '../services/productsService';
import purchasesService from '../services/purchasesService';
import exchangeRateService from '../services/exchangeRateService';
import vendorProductsService from '../services/vendorProductsService';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
import companiesService from '../services/companiesService';
import { getUploadUrl } from '../utils/uploadHelper';
import PurchasePopup from '../components/PurchasePopup';
import OperationsPanel from '../components/OperationsPanel';
import jsPDF from 'jspdf';
import countriesService from '../services/countriesService';

const ShopView = ({ user, showNotification }) => {
  // Leer parámetros de URL
  const [searchParams] = useSearchParams();
  const urlCountry = searchParams.get('country');
  const urlService = searchParams.get('service');
  const urlCompany = searchParams.get('company');

  // Estados principales
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVendorProduct, setSelectedVendorProduct] = useState(null);
  const [company, setCompany] = useState(null);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);

  // Estados para flujo de compra
  const [purchaseStep, setPurchaseStep] = useState(1);
  const [purchaseData, setPurchaseData] = useState({
    phoneNumber: '',
    accountNumber: '',
    isValidated: false,
    validationData: null,
    productType: null,
    transferAmount: '',
    transferTotalToPay: 0,
    billPaymentAmount: 0,
    paymentMethod: null,
    deliveryName: '',
    deliveryPhone: '',
    deliveryAddress: '',
    exchangeRate: null,
    productCurrency: null,
    vendorCurrency: null,
    conversionApplies: false,
    payment_ref: null,
    provision_ref: null,
    reversal_ref: null,
    barcode: null,
    barcode_image: null,
  });
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [urlCountry, urlService, urlCompany]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (urlCountry) {
        const countriesData = await countriesService.get();
        const countriesArray = Array.isArray(countriesData) ? countriesData : [countriesData];
        const foundCountry = countriesArray.find(c => c.country_code === urlCountry);
        setCountry(foundCountry || null);
      } else {
        const countryData = await countriesService.getActive();
        setCountry(Array.isArray(countryData) ? countryData[0] : countryData);
      }

      let resolvedCompany = null;

      if (urlCompany) {
        const companiesData = await companiesService.getAll();
        const companiesArray = Array.isArray(companiesData) ? companiesData : [companiesData];
        const foundCompany = companiesArray.find(c => c.company_name === urlCompany);
        if (foundCompany) {
          resolvedCompany = foundCompany;
          setCompany(foundCompany);
          console.log('🟢 Compañía seleccionada:', foundCompany.company_name);
        } else {
          console.warn('⚠️ Compañía no encontrada:', urlCompany);
          const companyData = await companiesService.getActive();
          resolvedCompany = Array.isArray(companyData) ? companyData[0] : companyData;
          setCompany(resolvedCompany);
        }
      } else {
        const companyData = await companiesService.getActive();
        resolvedCompany = Array.isArray(companyData) ? companyData[0] : companyData;
        setCompany(resolvedCompany);
      }

      const servicesData = await servicesService.getAll();
      const activeServices = servicesData.filter(s => s.status === 'active');
      setServices(activeServices);

      if (urlService && activeServices.length > 0) {
        const foundService = activeServices.find(s => s.service_name === urlService);
        if (foundService) {
          setSelectedService(foundService);
          await loadProducts(foundService.service_id, resolvedCompany?.company_id);
        } else {
          setSelectedService(activeServices[0]);
          await loadProducts(activeServices[0].service_id, resolvedCompany?.company_id);
        }
      } else if (activeServices.length > 0) {
        setSelectedService(activeServices[0]);
        await loadProducts(activeServices[0].service_id, resolvedCompany?.company_id);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      if (showNotification) {
        showNotification('Error al cargar servicios', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (serviceId, companyId = null) => {
    try {
      const productsData = await productsService.getByService(serviceId);
      let activeProducts = Array.isArray(productsData)
        ? productsData.filter(p => p.product_status === 'active')
        : [];

      if (companyId) {
        activeProducts = activeProducts.filter(p => p.company_id === companyId);
        console.log(`🔎 Productos filtrados por compañía ${companyId}:`, activeProducts.length);
      }

      setProducts(activeProducts);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    }
  };

  const handleServiceClick = async (service) => {
    if (service.status !== 'active') {
      if (showNotification) {
        showNotification('Este servicio no está disponible', 'error');
      }
      return;
    }

    setSelectedService(service);
    await loadProducts(service.service_id, company?.company_id);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleBuyClick = async () => {
    console.log('🔍 selectedService al comprar:', selectedService?.service_name, selectedService?.service_id);
    const productType = detectProductType(selectedService);

    setShowProductDetail(false);
    setShowPurchasePopup(true);
    setPurchaseStep(2);
    setError(null);
    setProcessing(true);

    try {
      console.log('📦 Cargando vendor_product...');

      const vendorProduct = await vendorProductsService.getByKeys(
        selectedProduct.product_vendor_code,
        selectedProduct.product_vendpro_code,
        selectedProduct.product_vendpro_skuid
      );

      console.log('✅ Vendor product cargado:', vendorProduct);
      setSelectedVendorProduct(vendorProduct);

      const productCurrency = selectedProduct.product_currency;
      const vendorCurrency = vendorProduct.vp_currency;

      console.log(`💱 Monedas: Product=${productCurrency}, Vendor=${vendorCurrency}`);

      let exchangeRate = 1.0;
      let conversionApplies = false;

      if (productCurrency !== vendorCurrency) {
        console.log(`📊 Obteniendo TC: ${productCurrency} → ${vendorCurrency}`);

        const tcResponse = await exchangeRateService.getForPricing(
          productCurrency,
          vendorCurrency
        );

        exchangeRate = tcResponse.rate;
        conversionApplies = true;

        console.log(`✅ TC obtenido: ${exchangeRate} (con margen -5%)`);
      }

      setPurchaseData({
        phoneNumber: '',
        accountNumber: '',
        isValidated: false,
        validationData: null,
        productType: productType,
        transferAmount: '',
        transferTotalToPay: 0,
        billPaymentAmount: 0,
        variableAmount: '',
        variableTotalToPay: 0,
        paymentMethod: null,
        deliveryName: user?.user_name || 'Cliente',
        deliveryPhone: '',
        deliveryAddress: '',
        payment_ref: null,
        provision_ref: null,
        reversal_ref: null,
        barcode: null,
        barcode_image: null,
        exchangeRate: exchangeRate,
        productCurrency: productCurrency,
        vendorCurrency: vendorCurrency,
        conversionApplies: conversionApplies
      });

      console.log('✅ Datos de compra inicializados correctamente');

    } catch (error) {
      console.error('❌ Error cargando vendor product:', error);
      setError('Error al cargar información del producto. Por favor intenta nuevamente.');
      closePurchasePopup();
      if (showNotification) {
        showNotification('Error al cargar producto', 'error');
      }
    } finally {
      setProcessing(false);
    }
  };

  const detectProductType = (service) => {
    const serviceName = service?.service_name || '';
    if (serviceName === 'TopUps') return 'topup';
    if (serviceName === 'Paquetes') return 'package';
    if (serviceName === 'Bill Payment') return 'bill_payment';
    if (serviceName === 'Transfers') return 'transfer';
    if (serviceName === 'Smartphones') return 'smartphone';
    return 'topup';
  };

  const handleValidation = async () => {
    setProcessing(true);
    setError(null);

    try {
      let response;

      if (purchaseData.productType === 'bill_payment') {
        if (!purchaseData.accountNumber) {
          setError('Ingresa el número de cuenta');
          setProcessing(false);
          return;
        }

        console.log('Using backend validation for account');
        response = await purchasesService.validateAccount(
          selectedProduct.product_id,
          purchaseData.accountNumber
        );

        console.log('Account validation response:', response);
        logOperationResult('val_cuenta', response, {
          account_number: purchaseData.accountNumber,
          monto_base: response?.data?.monto_base,
          indicador: response?.data?.indicador,
        });

        if (response && (response.status === 200 || response.status === 'success')) {
          const isValid = response.data?.valid === true;

          if (isValid) {
            const montoBase = parseFloat(response.data.monto_base || 0);
            const billCurrency = purchaseData.vendorCurrency || selectedProduct.product_currency;

            setPurchaseData(prev => ({
              ...prev,
              isValidated: true,
              billPaymentAmount: '',
              validationData: {
                monto_base: montoBase,
                indicador: response.data.indicador || 'T',
                account_holder: response.data.account_holder || '',
                bill_currency: billCurrency
              }
            }));

            setPurchaseStep(2.6);
          } else {
            const errorMsg = response.data?.message || response.message || 'Cuenta inválida';
            console.error('Account validation failed:', errorMsg);
            setError(errorMsg);
          }
        } else {
          const errorMsg = response?.message || 'Error al validar cuenta. Por favor intenta de nuevo.';
          console.error('Account validation error:', errorMsg);
          setError(errorMsg);
        }

      } else {
        if (!purchaseData.phoneNumber) {
          setError('Ingresa el número de teléfono');
          setProcessing(false);
          return;
        }

        console.log('Using backend validation for phone');
        response = await purchasesService.validatePhone(
          selectedProduct.product_id,
          purchaseData.phoneNumber
        );

        console.log('Phone validation response:', response);
        logOperationResult('val_telefono', response, {
          phone_number: purchaseData.phoneNumber,
          valid: response?.data?.valid,
        });

        if (response && (response.status === 200 || response.status === 'success')) {
          const isValid = response.data?.valid === true;

          if (isValid) {
            setPurchaseData(prev => ({
              ...prev,
              isValidated: true,
              validationData: { phone_valid: true }
            }));

            setPurchaseStep(3);
            console.log('✅ Phone validation successful, moving to step 3');
          } else {
            const errorMsg = response.data?.message || response.message || 'Teléfono inválido';
            console.error('Phone validation failed:', errorMsg);
            setError(errorMsg);
          }
        } else {
          const errorMsg = response?.message || 'Error al validar teléfono. Por favor intenta de nuevo.';
          console.error('Phone validation error:', errorMsg);
          setError(errorMsg);
        }
      }

    } catch (err) {
      console.error('Validation exception:', err);

      let errorMessage = 'Error en validación: ';

      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage += 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (err.message.includes('timeout')) {
        errorMessage += 'El servidor tardó demasiado en responder. Intenta de nuevo.';
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentAndProvision = async (gatewayData = null) => {
    if (!purchaseData.paymentMethod) {
      setError('Selecciona un método de pago');
      return;
    }

    if (selectedProduct.product_amount_type === 'R') {
      const amount = parseFloat(purchaseData.variableAmount);
      if (!amount || amount <= 0) {
        setError('Debes ingresar un monto válido');
        return;
      }
    }

    setProcessing(true);
    setError(null);

    try {
      // ─── CORRECCIÓN 1: user_selected_amount nunca envía string vacío ────────
      // Para productos tipo F (precio fijo), variableAmount y transferAmount son
      // strings vacíos. Enviarlos como '' causa decimal.ConversionSyntax en el
      // backend al hacer Decimal(''). Se normaliza a null cuando no tienen valor.
      const rawVariableAmount = purchaseData.variableAmount
        ? parseFloat(purchaseData.variableAmount)
        : null;

      const rawTransferAmount = purchaseData.transferAmount
        ? parseFloat(purchaseData.transferAmount)
        : null;

      const rawBillAmount = (purchaseData.validationData?.indicador === 'R' && purchaseData.billPaymentAmount)
        ? parseFloat(purchaseData.billPaymentAmount)
        : null;

      const userSelectedAmount = rawVariableAmount ?? rawTransferAmount ?? rawBillAmount ?? null;
      // ─────────────────────────────────────────────────────────────────────────

      const purchaseRequest = {
        product_id: selectedProduct.product_id,
        product_type: purchaseData.productType,
        phone_number: purchaseData.phoneNumber || null,
        account_number: purchaseData.accountNumber || null,
        payment_method: purchaseData.paymentMethod,
        exchange_rate: purchaseData.exchangeRate || null,

        user_selected_amount: userSelectedAmount,

        payment_type: purchaseData.validationData?.indicador === 'R' ? 'partial' : 'full',
        bill_total_debt: purchaseData.validationData?.monto_base || null,
        bill_currency: purchaseData.vendorCurrency || null,
        delivery_name: purchaseData.deliveryName || null,
        delivery_phone: purchaseData.deliveryPhone || null,
        delivery_address: purchaseData.deliveryAddress || null,
        user_email: user?.user_email || null,

        // Datos del gateway de pago (Izipay) — críticos para reversión
        ...(gatewayData && {
          payment_gateway: gatewayData.payment_gateway,
          payment_transaction_uuid: gatewayData.payment_transaction_uuid,
          payment_transaction_id: gatewayData.payment_transaction_id,
          payment_reference_number: gatewayData.payment_reference_number,
          payment_order_number: gatewayData.payment_order_number,
          payment_method_detail: gatewayData.payment_method_detail,
          payment_code_auth: gatewayData.payment_code_auth,
          // Normalizar payment_amount a string con 2 decimales para evitar
          // cualquier problema de formato Decimal en el backend
          payment_amount: gatewayData.payment_amount
            ? parseFloat(gatewayData.payment_amount).toFixed(2)
            : null,
          payment_currency: gatewayData.payment_currency,
          payment_transaction_datetime: gatewayData.payment_transaction_datetime,
        }),
      };

      console.log('📤 Enviando purchase request:', purchaseRequest);

      const response = await purchasesService.create(purchaseRequest);

      console.log('✅ Purchase response:', response);

      // Log de cada sub-operación del proceso de compra
      const pMethod = purchaseData.paymentMethod === 'card' ? 'pago_tarjeta' : 'pago_barcode';
      const pType   = purchaseData.productType || 'topup';
      const provOp  = `provision_${pType}`;

      const payOk  = response.payment_status === 'Success' || response.payment_status === 'Pending';
      const provOk = response.purchase_status === 'Success';
      const revOk  = response.purchase_status === 'Failed' && response.payment_status === 'Reversed';
      const isSimulated = response.simulated === true;

      // Pago
      console.log(
        `${isSimulated ? '🎭 [F1]' : '🚀 [F2]'} ${pMethod} → ${payOk ? '✅ SUCCESS' : '❌ FAIL'}`,
        { payment_status: response.payment_status, payment_ref: response.payment_ref, simulated: isSimulated }
      );

      // Provisión
      console.log(
        `${isSimulated ? '🎭 [F1]' : '🚀 [F2]'} ${provOp} → ${provOk ? '✅ SUCCESS' : '❌ FAIL'}`,
        { purchase_status: response.purchase_status, provision_ref: response.provision_ref, simulated: isSimulated }
      );

      // Reversión (si aplica)
      if (!provOk && payOk) {
        console.log(
          `${isSimulated ? '🎭 [F1]' : '🚀 [F2]'} anulacion_tarjeta → ${revOk ? '✅ SUCCESS' : '❌ FAIL — 🚨 INTERVENCIÓN MANUAL'}`,
          { reversal_ref: response.reversal_ref, requires_manual: response.requires_manual_intervention, simulated: isSimulated }
        );
      }

      setPurchaseResult({
        success: response.purchase_status === 'Success' ||
                 response.purchase_status === 'Pending' ||
                 (response.purchase_status === 'Failed' && response.payment_status === 'Reversed'),
        date: response.purchase_date,
        reference: response.purchase_reference,
        purchase_status: response.purchase_status,
        payment_status: response.payment_status,
        delivery_status: response.delivery_status,
        payment_ref: response.payment_ref,
        provision_ref: response.provision_ref,
        reversal_ref: response.reversal_ref,
        monto_pagar: parseFloat(response.purchase_base_price),
        descuento: parseFloat(response.purchase_discount),
        fee: parseFloat(response.purchase_fee),
        amount: parseFloat(response.purchase_total_amount),
        porcentaje_descuento: parseFloat(response.amount_breakdown?.discount_percentage || 0),
        barcode: response.barcode,
        barcode_image: response.barcode_image,
        requires_manual_intervention: response.requires_manual_intervention || false,
      });

      setPurchaseStep(6);

    } catch (error) {
      console.error('❌ Error en purchase:', error);

      const errorMsg = error.message || 'Error al procesar la compra';

      // ─── CORRECCIÓN 2: Manejo de error diferenciado post-gateway ────────────
      // Si el pago con Izipay ya fue aprobado (gatewayData != null) y luego
      // el backend falla (500 u otro error), NO enviamos al Step 4 porque el
      // pago ya se procesó — el usuario podría intentar pagar de nuevo creyendo
      // que no pagó. En su lugar, mostramos el error en el Step 6 para informar
      // claramente qué pasó y que contacte a soporte con la referencia.
      if (gatewayData) {
        // Pago Izipay exitoso + error en backend: ir a Step 6 con error claro
        setPurchaseResult({
          success: false,
          error: `Error al registrar la compra en el sistema. Tu pago fue procesado por Izipay ` +
                 `(orden: ${gatewayData.payment_order_number}). ` +
                 `Por favor contacta a soporte@latconecta.com con este número de orden.`,
          purchase_status: 'Failed',
          payment_status: 'Success',
          payment_ref: gatewayData.payment_order_number || null,
          // Campos requeridos por el Step 6 para no romper el render
          date: new Date().toISOString(),
          reference: gatewayData.payment_order_number || 'N/A',
          monto_pagar: 0,
          descuento: 0,
          fee: 0,
          amount: 0,
          porcentaje_descuento: 0,
          requires_manual_intervention: true,
        });
        setPurchaseStep(6);
        return;
      }

      // Sin gatewayData: error antes o durante el pago
      const isPaymentError = errorMsg.includes('Payment failed') ||
                             errorMsg.includes('Tarjeta rechazada') ||
                             errorMsg.includes('Barcode generation failed') ||
                             errorMsg.includes('rechazado') ||
                             errorMsg.includes('fallido') ||
                             errorMsg.includes('simulado') ||
                             errorMsg.includes('Insufficient') ||
                             errorMsg.includes('vendor balance');

      if (isPaymentError) {
        // Error de pago conocido: volver al Step 4 para reintentar
        setError(errorMsg);
        setPurchaseStep(4);
      } else {
        // Error técnico desconocido: mostrar en Step 6
        setError(errorMsg);
        setPurchaseResult({
          success: false,
          error: errorMsg,
          date: new Date().toISOString(),
          reference: 'N/A',
          monto_pagar: 0,
          descuento: 0,
          fee: 0,
          amount: 0,
          porcentaje_descuento: 0,
        });
        setPurchaseStep(6);
      }
      // ─────────────────────────────────────────────────────────────────────────

    } finally {
      setProcessing(false);
    }
  };

  const generateAndUploadReceiptPDF = async (receiptData) => {
    try {
      console.log('📄 Generando PDF del recibo con jsPDF...');

      if (!receiptData || !receiptData.reference) {
        console.error('❌ ERROR: receiptData inválido');
        return null;
      }

      let labelDestinatario = '';
      let destinatario = '';

      if (receiptData.productType === 'bill_payment') {
        labelDestinatario = 'CUENTA PAGADA';
        destinatario = receiptData.accountNumber || 'N/A';
      } else if (receiptData.productType === 'smartphone') {
        labelDestinatario = 'NUMERO CONTACTO';
        destinatario = receiptData.phoneNumber || 'N/A';
      } else if (receiptData.productType === 'transfer') {
        labelDestinatario = 'NUMERO DESTINO';
        destinatario = receiptData.phoneNumber || 'N/A';
      } else {
        labelDestinatario = 'NUMERO RECARGADO';
        destinatario = receiptData.phoneNumber || 'N/A';
      }

      const hasBarcode = !!(receiptData.barcode && receiptData.barcodeImage);
      const isSmartphone = receiptData.productType === 'smartphone';
      const needsCompactMode = hasBarcode || isSmartphone;

      const spacing = {
        small: needsCompactMode ? 2.5 : 3,
        medium: needsCompactMode ? 3 : 4,
        large: needsCompactMode ? 4 : 6
      };

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [105, 148]
      });

      doc.setFont('courier');

      let y = 8;

      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('COMPROBANTE DE COMPRA', 52.5, y, { align: 'center' });
      y += 4;

      doc.setFontSize(10);
      doc.text('BITEL TELECOM', 52.5, y, { align: 'center' });
      y += 6;

      doc.setLineWidth(0.5);
      doc.line(10, y, 95, y);
      y += 5;

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');

      doc.text(`Fecha: ${new Date(receiptData.date).toLocaleString('es-PE')}`, 12, y);
      y += spacing.medium;
      doc.text(`Referencia: ${receiptData.reference}`, 12, y);
      y += spacing.medium;
      doc.text(`${labelDestinatario}: ${destinatario}`, 12, y);
      y += spacing.large;

      doc.setLineWidth(0.3);
      doc.line(10, y, 95, y);
      y += 4;

      doc.setFontSize(9);
      doc.setFont('courier', 'bold');
      doc.text('PRODUCTO', 12, y);
      y += spacing.medium;

      doc.setFont('courier', 'normal');
      doc.text(receiptData.productName, 12, y);
      y += spacing.medium;

      doc.setFontSize(7);
      doc.text(`Servicio: ${receiptData.serviceName}`, 12, y);
      y += spacing.large;

      doc.setLineWidth(0.3);
      doc.line(10, y, 95, y);
      y += 4;

      doc.setFontSize(9);
      doc.setFont('courier', 'bold');
      doc.text('MONTO', 12, y);
      y += 4;

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');

      doc.text('Monto a pagar:', 12, y);
      doc.text(`${receiptData.currency} ${receiptData.montoPagar.toFixed(2)}`, 93, y, { align: 'right' });
      y += spacing.medium;

      if (receiptData.descuento > 0) {
        doc.setTextColor(0, 128, 0);
        doc.text(`Descuento (${receiptData.porcentajeDescuento}%):`, 12, y);
        doc.text(`-${receiptData.currency} ${receiptData.descuento.toFixed(2)}`, 93, y, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        y += spacing.medium;
      }

      if (receiptData.fee > 0) {
        doc.text('Comision:', 12, y);
        doc.text(`+${receiptData.currency} ${receiptData.fee.toFixed(2)}`, 93, y, { align: 'right' });
        y += spacing.medium;
      }

      doc.setLineWidth(0.5);
      doc.line(12, y, 93, y);
      y += 4;

      doc.setFontSize(10);
      doc.setFont('courier', 'bold');
      doc.text('PAGO TOTAL:', 12, y);
      doc.text(`${receiptData.currency} ${receiptData.totalAmount.toFixed(2)}`, 93, y, { align: 'right' });
      y += spacing.large;

      doc.setLineWidth(0.3);
      doc.line(10, y, 95, y);
      y += 4;

      doc.setFontSize(9);
      doc.setFont('courier', 'bold');
      doc.text('ESTADO', 12, y);
      y += spacing.medium;

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text(`Estado Pago: ${receiptData.paymentStatus}`, 12, y);
      y += spacing.medium;

      if (receiptData.deliveryStatus) {
        doc.text(`Estado Provision: ${receiptData.deliveryStatus}`, 12, y);
        y += spacing.medium;
      }

      if (receiptData.paymentRef) {
        doc.setFontSize(7);
        doc.text(`Ref. Pago: ${receiptData.paymentRef}`, 12, y);
        y += spacing.small;
      }

      if (receiptData.provisionRef) {
        doc.setFontSize(7);
        doc.text(`Ref. Provision: ${receiptData.provisionRef}`, 12, y);
        y += spacing.medium;
      }

      if (receiptData.reversalRef) {
        doc.setFontSize(7);
        doc.setTextColor(0, 128, 0);
        doc.text(`Ref. Reversion: ${receiptData.reversalRef}`, 12, y);
        doc.setTextColor(0, 0, 0);
        y += spacing.medium;
      }

      if (receiptData.purchaseStatus === 'Failed' && receiptData.paymentStatus === 'Reversed') {
        y += 2;
        doc.setLineWidth(0.3);
        doc.line(10, y, 95, y);
        y += 4;

        doc.setFontSize(8);
        doc.setFont('courier', 'bold');
        doc.setTextColor(255, 140, 0);
        doc.text('PROVISION FALLIDA', 12, y);
        doc.setTextColor(0, 0, 0);
        y += spacing.medium;

        doc.setFontSize(7);
        doc.setFont('courier', 'normal');
        const lines1 = doc.splitTextToSize('No se pudo completar la provision del servicio solicitado.', 80);
        lines1.forEach(line => {
          doc.text(line, 12, y);
          y += spacing.small;
        });
        y += spacing.small;

        doc.setTextColor(0, 128, 0);
        doc.setFont('courier', 'bold');
        doc.text('PAGO REVERTIDO EXITOSAMENTE', 12, y);
        y += spacing.small;
        doc.setFont('courier', 'normal');
        const lines2 = doc.splitTextToSize('No se realizo ningun cargo a su tarjeta de credito.', 80);
        lines2.forEach(line => {
          doc.text(line, 12, y);
          y += spacing.small;
        });
        doc.setTextColor(0, 0, 0);
        y += spacing.medium;
      }

      if (receiptData.requiresManualIntervention) {
        y += 2;
        doc.setLineWidth(0.3);
        doc.line(10, y, 95, y);
        y += 4;

        doc.setFontSize(8);
        doc.setFont('courier', 'bold');
        doc.setTextColor(255, 0, 0);
        doc.text('INTERVENCION MANUAL REQUERIDA', 12, y);
        doc.setTextColor(0, 0, 0);
        y += spacing.medium;

        doc.setFontSize(7);
        doc.setFont('courier', 'normal');
        const lines3 = doc.splitTextToSize('La provision fallo y no se pudo revertir el pago automaticamente.', 80);
        lines3.forEach(line => {
          doc.text(line, 12, y);
          y += spacing.small;
        });
        y += spacing.small;

        doc.setTextColor(255, 0, 0);
        doc.setFont('courier', 'bold');
        doc.text('El cargo permanece en su tarjeta', 12, y);
        y += spacing.small;
        doc.setFont('courier', 'normal');
        doc.setTextColor(0, 0, 0);

        const lines4 = doc.splitTextToSize('Si en 48 horas no recibe la devolucion, comuniquese con: soporte@latconecta.com', 80);
        lines4.forEach(line => {
          doc.text(line, 12, y);
          y += spacing.small;
        });

        doc.setFont('courier', 'bold');
        doc.text(`Referencia: ${receiptData.reference}`, 12, y);
        doc.setFont('courier', 'normal');
        y += spacing.medium;
      }

      if (hasBarcode) {
        y += 2;
        doc.setLineWidth(0.3);
        doc.line(10, y, 95, y);
        y += 4;

        doc.setFontSize(9);
        doc.setFont('courier', 'bold');
        doc.text('CODIGO DE BARRAS', 52.5, y, { align: 'center' });
        y += 4;

        doc.setFontSize(10);
        doc.text(receiptData.barcode, 52.5, y, { align: 'center' });
        y += 4;

        try {
          console.log('📷 Cargando imagen del barcode...');

          const img = new Image();
          img.crossOrigin = 'anonymous';

          await new Promise((resolve, reject) => {
            img.onload = () => {
              console.log('✅ Imagen del barcode cargada');

              const maxWidth = 75;
              const maxHeight = 20;
              let imgWidth = maxWidth;
              let imgHeight = (img.height / img.width) * maxWidth;

              if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = (img.width / img.height) * maxHeight;
              }

              const x = (105 - imgWidth) / 2;

              doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
              y += imgHeight + 2;

              resolve();
            };

            img.onerror = (error) => {
              console.warn('⚠️ No se pudo cargar imagen del barcode:', error);
              y += 2;
              resolve();
            };

            img.src = receiptData.barcodeImage;
          });

        } catch (error) {
          console.warn('⚠️ Error al cargar barcode:', error);
          y += 2;
        }

        doc.setFontSize(7);
        doc.text('Acerquese a tienda autorizada para pagar', 52.5, y, { align: 'center' });
        y += spacing.medium;
      }

      if (isSmartphone) {
        y += 2;
        doc.setLineWidth(0.3);
        doc.line(10, y, 95, y);
        y += 4;

        doc.setFontSize(9);
        doc.setFont('courier', 'bold');
        doc.text('DATOS DE ENTREGA', 12, y);
        y += spacing.medium;

        doc.setFontSize(7);
        doc.setFont('courier', 'normal');

        doc.text(`Tel: ${receiptData.deliveryPhone || 'N/A'}`, 12, y);
        y += spacing.small;

        doc.text(`Nombre: ${receiptData.deliveryName || 'N/A'}`, 12, y);
        y += spacing.small;

        const direccion = receiptData.deliveryAddress || 'N/A';
        if (direccion.length > 40) {
          const lineas = doc.splitTextToSize(`Dir: ${direccion}`, 80);
          lineas.forEach((linea) => {
            doc.text(linea, 12, y);
            y += spacing.small;
          });
        } else {
          doc.text(`Dir: ${direccion}`, 12, y);
          y += spacing.small;
        }
      }

      if (y < 135) {
        y = 140;
      } else {
        y += 2;
      }

      doc.setLineWidth(0.5);
      doc.line(10, y, 95, y);
      y += 3;

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text('Gracias por su compra', 52.5, y, { align: 'center' });

      console.log('✅ PDF creado con jsPDF');

      const pdfBlob = doc.output('blob');

      console.log('✅ PDF generado:', (pdfBlob.size / 1024).toFixed(2), 'KB');

      if (pdfBlob.size < 10000) {
        console.warn('⚠️ PDF pequeño (<10 KB)');
      }

      const formData = new FormData();
      formData.append('file', pdfBlob, `recibo_${receiptData.reference}.pdf`);

      const token = localStorage.getItem('token') || localStorage.getItem('bitel_token');

      const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8100/api/v1';
      const response = await fetch(`${baseURL}/upload/receipts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir PDF');
      }

      const result = await response.json();
      console.log('✅ PDF subido:', result.url);

      return result.url;

    } catch (error) {
      console.error('❌ Error:', error);
      return null;
    }
  };

  const handleDownloadReceiptPDF = () => {
    if (!purchaseResult) return;

    if (purchaseResult.receipt_pdf_url) {
      const fullUrl = getUploadUrl(purchaseResult.receipt_pdf_url);
      window.open(fullUrl, '_blank');
      return;
    }

    alert('Generando PDF del recibo...');
    generateAndUploadReceiptPDF({
      reference: purchaseResult.reference,
      date: purchaseResult.date,
      phoneNumber: purchaseData.phoneNumber,
      accountNumber: purchaseData.accountNumber,
      productType: purchaseData.productType,
      productName: selectedProduct.product_name,
      serviceName: selectedService.service_name,
      currency: selectedProduct.product_currency || 'PEN',
      montoPagar: purchaseResult.monto_pagar,
      descuento: purchaseResult.descuento,
      fee: purchaseResult.fee,
      totalAmount: parseFloat(purchaseResult.amount),
      porcentajeDescuento: purchaseResult.porcentaje_descuento,
      purchaseStatus: purchaseResult.purchase_status,
      paymentStatus: purchaseResult.payment_status,
      deliveryStatus: purchaseResult.delivery_status,
      paymentRef: purchaseResult.payment_ref,
      provisionRef: purchaseResult.provision_ref,
      reversalRef: purchaseResult.reversal_ref,
      requiresManualIntervention: purchaseResult.requires_manual_intervention,
      barcode: purchaseResult.barcode,
      barcodeImage: purchaseResult.barcode_image,
      deliveryPhone: purchaseData.deliveryPhone,
      deliveryName: purchaseData.deliveryName,
      deliveryAddress: purchaseData.deliveryAddress,
    }).then(pdfUrl => {
      if (pdfUrl) {
        const fullUrl = getUploadUrl(pdfUrl);
        window.open(fullUrl, '_blank');
        setPurchaseResult(prev => ({
          ...prev,
          receipt_pdf_url: pdfUrl
        }));
      }
    }).catch(err => {
      console.error('Error generando PDF:', err);
      alert('No se pudo generar el PDF');
    });
  };

  const handleDownloadReceipt = () => {
    if (!purchaseResult) return;

    let destinatario = '';
    if (purchaseData.productType === 'bill_payment') {
      destinatario = `CUENTA PAGADA: ${purchaseData.accountNumber}`;
    } else if (purchaseData.productType === 'smartphone') {
      destinatario = `CONTACTO ENTREGA: ${purchaseData.phoneNumber}`;
    } else if (purchaseData.productType === 'transfer') {
      destinatario = `NUMERO DESTINO: ${purchaseData.phoneNumber}`;
    } else {
      destinatario = `NUMERO RECARGADO: ${purchaseData.phoneNumber}`;
    }

    const montoAPagar = purchaseResult.monto_pagar || parseFloat(selectedProduct.product_base_price) || 0;
    const descuento = purchaseResult.descuento || 0;
    const fee = purchaseResult.fee || 0;
    const totalAmount = parseFloat(purchaseResult.amount) || 0;
    const porcentajeDesc = purchaseResult.porcentaje_descuento || 0;

    const receiptText = `
╔═══════════════════════════════════╗
        COMPROBANTE DE COMPRA
           LATCONECTA
╚═══════════════════════════════════╝

Fecha: ${new Date(purchaseResult.date).toLocaleString()}
Referencia: ${purchaseResult.reference}
${destinatario}

───────────────────────────────────
PRODUCTO
───────────────────────────────────
${selectedProduct.product_name}
Servicio: ${selectedService.service_name}

───────────────────────────────────
MONTO
───────────────────────────────────
Monto a pagar:    ${selectedProduct.product_currency} ${montoAPagar.toFixed(2)}
${descuento > 0 ? `Descuento (${porcentajeDesc}%):   ${selectedProduct.product_currency} -${descuento.toFixed(2)}` : ''}
${fee > 0 ? `Comisión:         ${selectedProduct.product_currency} +${fee.toFixed(2)}` : ''}
───────────────────────────────────
PAGO TOTAL:       ${selectedProduct.product_currency} ${totalAmount.toFixed(2)}

───────────────────────────────────
ESTADO
───────────────────────────────────
Estado Compra: ${purchaseResult.purchase_status}
Estado Pago: ${purchaseResult.payment_status}
${purchaseResult.delivery_status ? `Estado Provisión: ${purchaseResult.delivery_status}` : ''}

${purchaseResult.payment_ref ? `Ref. Pago: ${purchaseResult.payment_ref}` : ''}
${purchaseResult.provision_ref ? `Ref. Provisión: ${purchaseResult.provision_ref}` : ''}
${purchaseResult.reversal_ref ? `Ref. Reversión: ${purchaseResult.reversal_ref}` : ''}
${purchaseResult.barcode ? `Código Barras: ${purchaseResult.barcode}` : ''}

${purchaseResult.purchase_status === 'Failed' && purchaseResult.payment_status === 'Reversed' ? `
───────────────────────────────────
⚠️  PROVISIÓN FALLIDA
───────────────────────────────────
No se pudo completar la provisión
del servicio solicitado.

✓ PAGO REVERTIDO EXITOSAMENTE
No se realizó ningún cargo a su 
tarjeta de crédito.
` : ''}

${purchaseResult.requires_manual_intervention ? `
───────────────────────────────────
⚠️  INTERVENCIÓN MANUAL REQUERIDA
───────────────────────────────────
La provisión falló y no se pudo 
revertir el pago automáticamente.

El cargo permanece en su tarjeta.

Si en 48 horas no recibe la 
devolución, comuníquese con:
soporte@latconecta.com

Referencia: ${purchaseResult.reference}
` : ''}

${purchaseData.productType === 'smartphone' ? `───────────────────────────────────
CONTACTO
───────────────────────────────────
Teléfono: ${purchaseData.deliveryPhone || purchaseData.phoneNumber}
Nombre: ${purchaseData.deliveryName}
Dirección: ${purchaseData.deliveryAddress}
` : ''}

╔═══════════════════════════════════╗
       Gracias por su compra
╚═══════════════════════════════════╝
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${purchaseResult.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const closePurchasePopup = () => {
    setShowPurchasePopup(false);
    setPurchaseStep(1);
    setSelectedVendorProduct(null);
    setPurchaseData({
      phoneNumber: '',
      accountNumber: '',
      isValidated: false,
      validationData: null,
      productType: null,
      transferAmount: '',
      transferTotalToPay: 0,
      billPaymentAmount: 0,
      paymentMethod: null,
      deliveryName: '',
      deliveryPhone: '',
      deliveryAddress: '',
      payment_ref: null,
      provision_ref: null,
      reversal_ref: null,
      barcode: null,
      barcode_image: null,
    });
    setPurchaseResult(null);
    setError(null);
  };

  const ProductDetailModal = () => {
    if (!showProductDetail || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-bitel-blue">Detalle del Producto</h3>
            <button onClick={() => setShowProductDetail(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <img
                src={getImageUrl(selectedProduct.product_photo, 'product')}
                alt={selectedProduct.product_name}
                onError={(e) => (e.target.src = FALLBACK_IMAGES.product)}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            <h2 className="text-3xl font-bold text-bitel-blue mb-4">{selectedProduct.product_name}</h2>
            <p className="text-gray-700 mb-6">{selectedProduct.product_description}</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {selectedProduct.product_amount_type === 'R' &&
               selectedProduct.product_base_price &&
               selectedProduct.product_base_price_max ? (
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="mb-2 p-2 bg-blue-50 rounded">
                    <div className="text-sm font-semibold text-blue-800 mb-1">
                      💰 Producto con Monto Variable
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">Rango permitido:</span>
                      <span className="font-bold text-blue-900">
                        {selectedProduct.product_currency} {parseFloat(selectedProduct.product_base_price).toFixed(2)} - {parseFloat(selectedProduct.product_base_price_max).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 text-center mt-2">
                    Podrás ingresar el monto deseado en el siguiente paso
                  </div>
                </div>
              ) : (
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
              )}
            </div>

            <button
              onClick={handleBuyClick}
              className="w-full bg-bitel-yellow text-bitel-blue py-3 rounded-lg font-bold text-lg hover:bg-bitel-yellow-dark transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={24} />
              <span>Comprar Ahora</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-bitel-blue mx-auto mb-4" />
          <p className="text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {(urlCountry || urlService || urlCompany) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {company && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={getImageUrl(company.company_logo, 'company')}
                      alt={company.company_name}
                      onError={(e) => e.target.src = FALLBACK_IMAGES.company}
                      className="h-16 w-auto object-contain"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-bitel-blue">{company.company_name}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        {country && (
                          <span className="flex items-center">
                            <img
                              src={getImageUrl(country.country_flag_photo, 'country')}
                              alt={country.country_name}
                              onError={(e) => e.target.src = FALLBACK_IMAGES.country}
                              className="w-6 h-4 object-cover rounded mr-2"
                            />
                            {country.country_name}
                          </span>
                        )}
                        {selectedService && (
                          <span>• {selectedService.service_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <a
                href="/latconecta_users/select"
                className="flex items-center space-x-2 text-bitel-blue hover:text-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Volver a Selección</span>
              </a>
            </div>
          </div>
        )}

        <h1 className="text-4xl font-bold text-bitel-blue mb-8">
          {company ? `Productos de ${company.company_name}` : 'Tienda Latconecta'}
        </h1>

        <div className="bg-white rounded-lg shadow-md mb-8 overflow-x-auto">
          <div className="flex">
            {services
              .filter(s => s.status === 'active')
              .map((service) => (
                <button
                  key={service.service_id}
                  onClick={() => handleServiceClick(service)}
                  className={`px-6 py-4 font-semibold whitespace-nowrap border-b-4 transition-colors ${
                    selectedService?.service_id === service.service_id
                      ? 'text-bitel-blue border-bitel-yellow bg-yellow-50'
                      : 'text-gray-600 border-transparent hover:bg-gray-50'
                  }`}
                >
                  {service.service_name}
                </button>
              ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">
              {company
                ? `No hay productos disponibles de ${company.company_name} en ${selectedService?.service_name}`
                : 'No hay productos disponibles'}
            </p>
            <a
              href="/latconecta_users/select"
              className="inline-block mt-4 text-bitel-blue hover:text-blue-700 font-semibold"
            >
              ← Volver a Selección
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <img
                  src={getImageUrl(product.product_photo, 'product')}
                  alt={product.product_name}
                  onError={(e) => (e.target.src = FALLBACK_IMAGES.product)}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold text-bitel-blue mb-2">{product.product_name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.product_description}</p>
                  <div className="flex justify-between items-center">
                    {product.product_amount_type === 'R' &&
                     product.product_base_price &&
                     product.product_base_price_max ? (
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Desde</div>
                        <div className="text-xl font-bold text-bitel-blue">
                          {product.product_currency} {parseFloat(product.product_base_price).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          hasta {parseFloat(product.product_base_price_max).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-bitel-blue">
                        {product.product_currency} {parseFloat(product.product_total_price || 0).toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="bg-bitel-yellow text-bitel-blue px-4 py-2 rounded-lg font-semibold hover:bg-bitel-yellow-dark transition-colors"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductDetailModal />
      <OperationsPanel />
      <PurchasePopup
        showPurchasePopup={showPurchasePopup}
        selectedProduct={selectedProduct}
        selectedService={selectedService}
        selectedVendorProduct={selectedVendorProduct}
        purchaseStep={purchaseStep}
        setPurchaseStep={setPurchaseStep}
        purchaseData={purchaseData}
        setPurchaseData={setPurchaseData}
        closePurchasePopup={closePurchasePopup}
        error={error}
        setError={setError}
        processing={processing}
        handleValidation={handleValidation}
        handlePaymentAndProvision={handlePaymentAndProvision}
        showNotification={showNotification}
        purchaseResult={purchaseResult}
        handleDownloadReceipt={handleDownloadReceipt}
        handleDownloadReceiptPDF={handleDownloadReceiptPDF}
        user={user}
        company={company}
      />
    </div>
  );
};

export default ShopView;
