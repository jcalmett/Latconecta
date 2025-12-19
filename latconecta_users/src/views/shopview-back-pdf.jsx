import { useState, useEffect } from 'react';
import { X, ShoppingCart, CreditCard, Smartphone, Check, AlertCircle, Loader2, Download, FileText } from 'lucide-react';
import servicesService from '../services/servicesService';
import productsService from '../services/productsService';
import purchasesService from '../services/purchasesService';
import apiSimulator from '../services/apiSimulatorService';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
import companiesService from '../services/companiesService';
import PurchasePopup from '../components/PurchasePopup';
import html2pdf from 'html2pdf.js';
import countriesService from '../services/countriesService';

const ShopView = ({ user, showNotification }) => {
  // Estados principales
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [company, setCompany] = useState(null);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);

  // Estados para flujo de compra
  const [purchaseStep, setPurchaseStep] = useState(1);
  const [purchaseData, setPurchaseData] = useState({
    // Validación
    phoneNumber: '',
    accountNumber: '',
    isValidated: false,
    validationData: null,
    
    // Tipo de producto
    productType: null,
    
    // Monto (para transferencias y bill payment)
    transferAmount: '',
    transferTotalToPay: 0,
    billPaymentAmount: 0,
    
    // Pago
    paymentMethod: null,
    
    // Delivery (smartphones)
    deliveryName: '',
    deliveryPhone: '',
    deliveryAddress: '',
    
    // Resultados
    payment_ref: null,
    provision_ref: null,
    reversal_ref: null,
    barcode: null,
    barcode_image: null,
  });
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Cargar servicios y productos
  useEffect(() => {
    loadData();
  }, []);

 const loadData = async () => {
  try {
    setLoading(true);
    
    // Cargar company
    const companyData = await companiesService.getActive();
    setCompany(Array.isArray(companyData) ? companyData[0] : companyData);
    
    // Cargar country
    const countryData = await countriesService.getActive();
    setCountry(Array.isArray(countryData) ? countryData[0] : countryData);
    
    const servicesData = await servicesService.getAll();

    // Filtrar solo servicios activos
    const activeServices = servicesData.filter(s => s.status === 'active');
    setServices(activeServices);

    if (activeServices.length > 0) {
      setSelectedService(activeServices[0]);
      await loadProducts(activeServices[0].service_id);
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

  const loadProducts = async (serviceId) => {
    try {
      const productsData = await productsService.getByService(serviceId);
      const activeProducts = Array.isArray(productsData) 
        ? productsData.filter(p => p.product_status === 'active')
        : [];
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
    await loadProducts(service.service_id);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleBuyClick = () => {
    const productType = detectProductType(selectedProduct);

    setShowProductDetail(false);
    setShowPurchasePopup(true);
    setPurchaseStep(1);
    setError(null);
    setPurchaseData({
      phoneNumber: '',
      accountNumber: '',
      isValidated: false,
      validationData: null,
      productType: productType,
      transferAmount: '',
      transferTotalToPay: 0,
      billPaymentAmount: 0,
      paymentMethod: null,
      deliveryName: user?.user_name || 'Cliente',
      deliveryPhone: '',
      deliveryAddress: '',
      payment_ref: null,
      provision_ref: null,
      reversal_ref: null,
      barcode: null,
      barcode_image: null,
    });
  };

  // Detectar tipo de producto
  const detectProductType = (product) => {
    const name = product.product_name?.toLowerCase() || '';
    const type = product.product_type?.toLowerCase() || '';
    
    if (type === 'bill_payment' || name.includes('recibo') || name.includes('pago')) {
      return 'bill_payment';
    }
    if (type === 'transfer' || name.includes('transferencia') || name.includes('yape')) {
      return 'transfer';
    }
    if (type === 'smartphone' || name.includes('smartphone') || name.includes('celular')) {
      return 'smartphone';
    }
    return 'topup';
  };

  // PASO 2: Validación
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

        if (apiSimulator.isEnabled()) {
          response = await apiSimulator.validateAccount(purchaseData.accountNumber);
        } else {
          throw new Error('API real no implementada aún');
        }

        if (response.status === 200) {
          const montoBase = parseFloat(response.data.monto_base);

          setPurchaseData(prev => ({
            ...prev,
            isValidated: true,
            billPaymentAmount: montoBase,
            validationData: {
              monto_base: montoBase,
              indicador: response.data.indicador,
              account_holder: response.data.account_holder
            }
          }));
          
          if (response.data.indicador === 'F' || response.data.indicador === 'T') {
            setPurchaseStep(3);
          } else {
            setPurchaseStep(2.6);
          }
        } else {
          setError(response.message || 'Cuenta inválida');
        }

      } else {
        if (!purchaseData.phoneNumber) {
          setError('Ingresa el número de teléfono');
          setProcessing(false);
          return;
        }

        if (apiSimulator.isEnabled()) {
          response = await apiSimulator.validatePhone(purchaseData.phoneNumber);
        } else {
          throw new Error('API real no implementada aún');
        }

        if (response.status === 200) {
          setPurchaseData(prev => ({
            ...prev,
            isValidated: true,
            validationData: { phone_valid: true }
          }));

          if (purchaseData.productType === 'smartphone') {
            setPurchaseStep(2.5);
          } else if (purchaseData.productType === 'transfer') {
            setPurchaseStep(2.7);
          } else {
            setPurchaseStep(3);
          }
        } else {
          setError(response.message || 'Teléfono inválido');
        }
      }

    } catch (err) {
      setError('Error en validación: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // PASO 3: Procesar pago y provisión
  const handlePaymentAndProvision = async () => {
    if (!purchaseData.paymentMethod) {
      setError('Selecciona un método de pago');
      return;
    }

    if (purchaseData.productType === 'transfer') {
      const amount = parseFloat(purchaseData.transferAmount);
      if (!amount || amount <= 0) {
        setError('Debes ingresar un monto mayor a cero');
        return;
      }
    }

    setPurchaseStep(4);
    setProcessing(true);
    setError(null);

    try {
      if (purchaseData.paymentMethod === 'card') {
        await processCardPayment();
      } else if (purchaseData.paymentMethod === 'barcode') {
        await processBarcodePayment();
      }
    } catch (err) {
      console.error('Error en pago:', err);
      setError('Error al procesar el pago: ' + err.message);
      setPurchaseResult({
        success: false,
        error: 'Error al procesar el pago: ' + err.message
      });
      setPurchaseStep(5);
      setProcessing(false);
    }
  };

  // Procesar pago con tarjeta
  const processCardPayment = async () => {
    try {
      let amountToPay = parseFloat(selectedProduct.product_total_price);
      
      if (purchaseData.productType === 'bill_payment' && purchaseData.validationData) {
        const montoAPagar = parseFloat(purchaseData.billPaymentAmount) || parseFloat(purchaseData.validationData.monto_base);
        const porcentajeDescuento = parseFloat(selectedProduct.product_discount_percentage) || 0;
        const descuento = montoAPagar * (porcentajeDescuento / 100);
        const fee = parseFloat(selectedProduct.product_fee) || 0;
        amountToPay = montoAPagar - descuento + fee;
      } else if (purchaseData.productType === 'transfer') {
        amountToPay = purchaseData.transferTotalToPay || parseFloat(purchaseData.transferAmount);
      }

      let paymentResponse;
      
      if (apiSimulator.isEnabled()) {
        paymentResponse = await apiSimulator.processCardPayment({
          amount: amountToPay,
          card_last_digits: '4532'
        });
      } else {
        throw new Error('API real no implementada aún');
      }

      if (paymentResponse.status !== 200) {
        setError(paymentResponse.message || 'Error al procesar pago con tarjeta');
        setPurchaseResult({
          success: false,
          error: paymentResponse.message || 'Error al procesar pago con tarjeta'
        });
        setPurchaseStep(5);
        setProcessing(false);
        return;
      }

      const payment_ref = paymentResponse.data.payment_ref;
      console.log('✅ Pago procesado:', payment_ref);

      let provisionResponse;
      
      if (apiSimulator.isEnabled()) {
        switch (purchaseData.productType) {
          case 'topup':
            provisionResponse = await apiSimulator.provisionTopUp({
              phone: purchaseData.phoneNumber,
              amount: amountToPay
            });
            break;
            
          case 'bill_payment':
            provisionResponse = await apiSimulator.payBill({
              account: purchaseData.accountNumber,
              amount: amountToPay
            });
            break;
            
          case 'transfer':
            provisionResponse = await apiSimulator.transferYape({
              phone: purchaseData.phoneNumber,
              amount: amountToPay
            });
            break;
            
          case 'smartphone':
            provisionResponse = await apiSimulator.orderSmartphone({
              phone: purchaseData.phoneNumber,
              product: selectedProduct.product_name,
              delivery: {
                name: purchaseData.deliveryName,
                phone: purchaseData.deliveryPhone,
                address: purchaseData.deliveryAddress
              }
            });
            break;
            
          default:
            throw new Error('Tipo de producto no soportado');
        }
      } else {
        throw new Error('API real no implementada aún');
      }

      if (provisionResponse.status === 200) {
        console.log('✅ Provisión exitosa');
        
        await savePurchase({
          payment_status: 'Paid',
          delivery_status: purchaseData.productType === 'smartphone' ? 'Ordered' : 'Success',
          payment_ref: payment_ref,
          provision_ref: provisionResponse.data.provision_ref,
          payment_method: 'card',
          amount_paid: amountToPay,
          vendor_response_code: String(provisionResponse.status),
        });

      } else {
        console.warn('⚠️ Provisión falló, revirtiendo...');
        
        let reversalResponse;
        
        if (apiSimulator.isEnabled()) {
          reversalResponse = await apiSimulator.reverseCardPayment(payment_ref);
        } else {
          throw new Error('API real no implementada aún');
        }

        if (reversalResponse.status === 200) {
          console.log('✅ Pago revertido');
          
          await savePurchase({
            payment_status: 'Reversed',
            delivery_status: 'Failed',
            payment_ref: payment_ref,
            reversal_ref: reversalResponse.data.reversal_ref,
            payment_method: 'card',
            error_message: provisionResponse.message,
            amount_paid: amountToPay,
            vendor_response_code: String(provisionResponse.status),
          });

        } else {
          console.error('🚨 ERROR CRÍTICO');
          
          await savePurchase({
            payment_status: 'Paid',
            delivery_status: 'Failed',
            payment_ref: payment_ref,
            requires_manual_intervention: true,
            payment_method: 'card',
            error_message: 'Provisión falló y no se pudo revertir',
            amount_paid: amountToPay,
            vendor_response_code: String(provisionResponse.status),
          });
        }
      }

    } catch (err) {
      throw err;
    }
  };

  // Procesar pago con barcode
  const processBarcodePayment = async () => {
    try {
      let amountToPay = parseFloat(selectedProduct.product_total_price);
      
      if (purchaseData.productType === 'bill_payment' && purchaseData.validationData) {
        const montoAPagar = parseFloat(purchaseData.billPaymentAmount) || parseFloat(purchaseData.validationData.monto_base);
        const porcentajeDescuento = parseFloat(selectedProduct.product_discount_percentage) || 0;
        const descuento = montoAPagar * (porcentajeDescuento / 100);
        const fee = parseFloat(selectedProduct.product_fee) || 0;
        amountToPay = montoAPagar - descuento + fee;
      } else if (purchaseData.productType === 'transfer') {
        amountToPay = purchaseData.transferTotalToPay || parseFloat(purchaseData.transferAmount);
      }

      let barcodeResponse;
      
      if (apiSimulator.isEnabled()) {
        barcodeResponse = await apiSimulator.generateBarcode({
          amount: amountToPay,
          purchase_id: Date.now()
        });
        
        if (barcodeResponse.status === 200 && barcodeResponse.data.barcode_image) {
          barcodeResponse.data.barcode_image = 'http://127.0.0.1:8100/uploads/test/Barcode.jpg';
        }
      } else {
        throw new Error('API real no implementada aún');
      }

      if (barcodeResponse.status !== 200) {
        setError(barcodeResponse.message || 'Error al generar código de barras');
        setPurchaseResult({
          success: false,
          error: barcodeResponse.message || 'Error al generar código de barras'
        });
        setPurchaseStep(5);
        setProcessing(false);
        return;
      }

      console.log('✅ Barcode generado');
      
      await savePurchase({
        payment_status: 'Pending',
        delivery_status: null,
        payment_method: 'barcode',
        barcode: barcodeResponse.data.barcode,
        barcode_image: barcodeResponse.data.barcode_image,
        barcode_expiration: barcodeResponse.data.expiration_date,
        amount_paid: amountToPay,
        vendor_response_code: String(barcodeResponse.status),
      });

    } catch (err) {
      throw err;
    }
  };


  /**
   * Genera PDF del recibo en formato A6 y lo sube al servidor
   */
  const generateAndUploadReceiptPDF = async (receiptData) => {
    try {
      console.log('📄 Generando PDF del recibo...');

      let labelDestinatario = '';
      let destinatario = '';
      if (receiptData.productType === 'bill_payment') {
        labelDestinatario = 'CUENTA PAGADA';
        destinatario = receiptData.accountNumber;
      } else if (receiptData.productType === 'smartphone') {
        labelDestinatario = 'NUMERO CONTACTO';
        destinatario = receiptData.phoneNumber;
      } else if (receiptData.productType === 'transfer') {
        labelDestinatario = 'NUMERO DESTINO';
        destinatario = receiptData.phoneNumber;
      } else {
        labelDestinatario = 'NUMERO RECARGADO';
        destinatario = receiptData.phoneNumber;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page { 
              size: 105mm 148mm;
              margin: 5mm;
            }
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 8px;
              font-size: 9px;
              width: 95mm;
            }
            .header {
              text-align: center;
              border-top: 2px double #000;
              border-bottom: 2px double #000;
              padding: 6px 0;
              margin-bottom: 8px;
            }
            .header h1 {
              margin: 2px 0;
              font-size: 11px;
            }
            .header .company {
              font-size: 10px;
              font-weight: bold;
            }
            .section {
              border-top: 1px solid #000;
              padding: 4px 0;
              margin: 4px 0;
            }
            .section-title {
              font-weight: bold;
              margin-bottom: 3px;
              font-size: 9px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
              font-size: 8px;
            }
            .total-row {
              border-top: 2px solid #000;
              padding-top: 4px;
              margin-top: 4px;
              font-weight: bold;
              font-size: 10px;
            }
            .footer {
              text-align: center;
              border-top: 2px double #000;
              padding-top: 6px;
              margin-top: 8px;
              font-size: 8px;
            }
            .barcode-section {
              text-align: center;
              margin: 6px 0;
            }
            .barcode-code {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              font-weight: bold;
              margin: 4px 0;
            }
            .barcode-img {
              max-width: 80mm;
              margin: 4px auto;
              display: block;
            }
            .warning {
              font-size: 7px;
              color: #ff8800;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>COMPROBANTE DE COMPRA</h1>
            <div class="company">BITEL TELECOM</div>
          </div>

          <div style="margin-bottom: 6px; font-size: 8px;">
            <div><strong>Fecha:</strong> ${new Date(receiptData.date).toLocaleString('es-PE')}</div>
            <div><strong>Referencia:</strong> ${receiptData.reference}</div>
            <div><strong>${labelDestinatario}:</strong> ${destinatario}</div>
          </div>

          <div class="section">
            <div class="section-title">PRODUCTO</div>
            <div style="font-size: 9px;">${receiptData.productName}</div>
            <div style="font-size: 7px;">Servicio: ${receiptData.serviceName}</div>
          </div>

          <div class="section">
            <div class="section-title">MONTO</div>
            <div class="row">
              <span>Monto a pagar:</span>
              <span>${receiptData.currency} ${receiptData.montoPagar.toFixed(2)}</span>
            </div>
            ${receiptData.descuento > 0 ? `
            <div class="row" style="color: green;">
              <span>Descuento (${receiptData.porcentajeDescuento}%):</span>
              <span>-${receiptData.currency} ${receiptData.descuento.toFixed(2)}</span>
            </div>
            ` : ''}
            ${receiptData.fee > 0 ? `
            <div class="row">
              <span>Comisión:</span>
              <span>+${receiptData.currency} ${receiptData.fee.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="row total-row">
              <span>PAGO TOTAL:</span>
              <span>${receiptData.currency} ${receiptData.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ESTADO</div>
            <div style="font-size: 8px;"><strong>Estado Pago:</strong> ${receiptData.paymentStatus}</div>
            ${receiptData.deliveryStatus ? `<div style="font-size: 8px;"><strong>Estado Provisión:</strong> ${receiptData.deliveryStatus}</div>` : ''}
            ${receiptData.paymentRef ? `<div style="font-size: 7px; margin-top: 2px;">Ref. Pago: ${receiptData.paymentRef}</div>` : ''}
            ${receiptData.provisionRef ? `<div style="font-size: 7px;">Ref. Provisión: ${receiptData.provisionRef}</div>` : ''}
          </div>

          ${receiptData.barcode ? `
          <div class="section barcode-section">
            <div class="section-title">CÓDIGO DE BARRAS</div>
            <div class="barcode-code">${receiptData.barcode}</div>
            <img src="${receiptData.barcodeImage}" alt="Barcode" class="barcode-img" crossorigin="anonymous" />
            <div class="warning">📍 Acérquese a tienda autorizada para pagar</div>
          </div>
          ` : ''}

          ${receiptData.productType === 'smartphone' ? `
          <div class="section">
            <div class="section-title">DATOS DE ENTREGA</div>
            <div style="font-size: 7px;">
              <div><strong>Teléfono:</strong> ${receiptData.deliveryPhone}</div>
              <div><strong>Nombre:</strong> ${receiptData.deliveryName}</div>
              <div><strong>Dirección:</strong> ${receiptData.deliveryAddress}</div>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            Gracias por su compra
          </div>
        </body>
        </html>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      const options = {
        margin: 0,
        filename: `recibo_${receiptData.reference}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: [105, 148], orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(options).from(tempDiv).outputPdf('blob');

      document.body.removeChild(tempDiv);

      const formData = new FormData();
      formData.append('file', pdfBlob, `recibo_${receiptData.reference}.pdf`);

      const token = localStorage.getItem('token') || localStorage.getItem('bitel_token');
      const response = await fetch('http://127.0.0.1:8100/api/v1/upload/receipts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir PDF al servidor');
      }

      const result = await response.json();
      console.log('✅ PDF generado y subido:', result.url);

      return result.url;

    } catch (error) {
      console.error('❌ Error al generar/subir PDF:', error);
      return null;
    }
  };


  // Guardar compra en backend
  const savePurchase = async (resultData) => {
    try {
      const timestamp = Date.now();
      const reference = `REF-${timestamp}`;

      // Calcular vendor fields
      const purchaseCurrency = selectedProduct.product_currency || 'PEN';
      const vendorCurrency = selectedProduct.product_vendpro_currency || 'USD';
      
      let purchaseVendorAmount = 0;
      let purchaseExchRate = 1.0;

      // Calcular vendor_amount según tipo de producto
      if (purchaseData.productType === 'topup' || purchaseData.productType === 'smartphone') {
        purchaseVendorAmount = parseFloat(selectedProduct.product_vendpro_amount || 0);
      } else if (purchaseData.productType === 'bill_payment') {
        if (purchaseData.validationData?.indicador === 'F' || purchaseData.validationData?.indicador === 'T') {
          purchaseVendorAmount = parseFloat(purchaseData.validationData.monto_base || 0);
        } else {
          const amount = parseFloat(purchaseData.billPaymentAmount || 0);
          if (purchaseCurrency === vendorCurrency) {
            purchaseVendorAmount = amount;
          } else {
            purchaseExchRate = parseFloat(country?.country_er_usd_pen || 1.0);
            purchaseVendorAmount = amount / purchaseExchRate;
          }
        }
      } else if (purchaseData.productType === 'transfer') {
        const amount = parseFloat(purchaseData.transferAmount || 0);
        if (purchaseCurrency === vendorCurrency) {
          purchaseVendorAmount = amount;
        } else {
          purchaseExchRate = parseFloat(country?.country_er_usd_pen || 1.0);
          purchaseVendorAmount = amount / purchaseExchRate;
        }
      }

      // Calcular exchange rate
      if (purchaseCurrency === vendorCurrency) {
        purchaseExchRate = 1.0;
      } else if (purchaseCurrency === 'USD' && vendorCurrency === 'PEN') {
        purchaseExchRate = parseFloat(country?.country_er_usd_pen || 1.0);
      }

      // Calcular balance
      const initialBalance = parseFloat(company?.company_credit_balance || 0);
      let finalBalance = initialBalance;

      if (resultData.payment_status === 'Paid' && resultData.delivery_status === 'Success') {
        finalBalance = initialBalance - purchaseVendorAmount;
      }

      // Timestamps vendor
      const vendor_date_petition = resultData.vendor_date_petition || new Date().toISOString();
      const vendor_date_response = resultData.vendor_date_response || new Date().toISOString();

      const purchasePayload = {
        purchase_reference: reference,
        purchase_phone_number: purchaseData.phoneNumber || purchaseData.accountNumber,
        purchase_product_id: selectedProduct.product_id,
        purchase_service_name: selectedService.service_name,
        purchase_product_name: selectedProduct.product_name,
        purchase_base_price: parseFloat(selectedProduct.product_base_price || 0),
        purchase_discount: parseFloat(selectedProduct.product_discount_amount || 0),
        purchase_fee: parseFloat(selectedProduct.product_fee || 0),
        purchase_total_amount: resultData.amount_paid || parseFloat(selectedProduct.product_total_price || 0),
        purchase_currency: purchaseCurrency,
        purchase_payment_method: resultData.payment_method,
        purchase_payment_status: resultData.payment_status,
        purchase_delivery_status: resultData.delivery_status,
        purchase_delivery_name: purchaseData.deliveryName || (user?.user_name) || 'Cliente Anónimo',
        purchase_delivery_phone: purchaseData.deliveryPhone || purchaseData.phoneNumber,
        purchase_delivery_address: purchaseData.deliveryAddress || 'N/A',
        purchase_barcode_code: resultData.barcode,
        purchase_barcode_image: resultData.barcode_image,
        purchase_product_type: purchaseData.productType,
        purchase_account_number: purchaseData.accountNumber,
        purchase_payment_ref: resultData.payment_ref,
        purchase_provision_ref: resultData.provision_ref,
        purchase_reversal_ref: resultData.reversal_ref,
        requires_manual_intervention: resultData.requires_manual_intervention || false,
        purchase_user_id: user?.user_id || null,
        created_by: user?.user_email || 'anonymous',
        
        // Campos vendor
        purchase_vendor_code: selectedProduct.product_vendor_code,
        purchase_vendpro_code: selectedProduct.product_vendpro_code,
        purchase_vendor_skuid: selectedProduct.product_vendpro_skuid,
        purchase_vendpro_country: selectedProduct.product_vendpro_country,
        purchase_vendpro_operator: selectedProduct.product_vendpro_operator,
        purchase_vendor_currency: vendorCurrency,
        purchase_vendor_amount: purchaseVendorAmount,
        purchase_exch_rate: purchaseExchRate,
        purchase_vendor_json: resultData.vendor_json || null,
        purchase_vendor_date_petition: vendor_date_petition,
        purchase_vendor_date_response: vendor_date_response,
        purchase_vendor_response_code: resultData.vendor_response_code || null,
        purchase_vendor_response_description: resultData.vendor_response_description || null,
        purchase_vendor_purchase_id: resultData.vendor_purchase_id || null,
        purchase_ip_petition: 'frontend',
        
        // Campos balance
        purchase_balance_currency: 'USD',
        purchase_initial_balance: initialBalance,
        purchase_final_balance: finalBalance,
      };

      console.log('📤 Enviando purchase:', purchasePayload);
      const result = await purchasesService.create(purchasePayload);
      console.log('✅ Purchase guardada:', result);

      // Calcular datos reales del pago
      let montoPagar = 0;
      let descuentoCalculado = 0;
      let feeCalculado = 0;
      
      if (purchaseData.productType === 'bill_payment' && purchaseData.validationData) {
        montoPagar = parseFloat(purchaseData.billPaymentAmount) || parseFloat(purchaseData.validationData.monto_base);
        const porcentajeDescuento = parseFloat(selectedProduct.product_discount_percentage) || 0;
        descuentoCalculado = montoPagar * (porcentajeDescuento / 100);
        feeCalculado = parseFloat(selectedProduct.product_fee) || 0;
      } else if (purchaseData.productType === 'transfer') {
        montoPagar = parseFloat(purchaseData.transferAmount) || 0;
        const porcentajeDescuento = parseFloat(selectedProduct.product_discount_percentage) || 0;
        descuentoCalculado = montoPagar * (porcentajeDescuento / 100);
        feeCalculado = parseFloat(selectedProduct.product_fee) || 0;
      } else {
        montoPagar = parseFloat(selectedProduct.product_base_price) || 0;
        const porcentajeDescuento = parseFloat(selectedProduct.product_discount_percentage) || 0;
        descuentoCalculado = montoPagar * (porcentajeDescuento / 100);
        feeCalculado = parseFloat(selectedProduct.product_fee) || 0;
      }

      // Generar y subir PDF del recibo
      let receiptPdfUrl = null;
      try {
        receiptPdfUrl = await generateAndUploadReceiptPDF({
          reference: result.purchase_reference || reference,
          date: result.purchase_date || new Date().toISOString(),
          phoneNumber: purchaseData.phoneNumber,
          accountNumber: purchaseData.accountNumber,
          productType: purchaseData.productType,
          productName: selectedProduct.product_name,
          serviceName: selectedService.service_name,
          currency: selectedProduct.product_currency || 'PEN',
          montoPagar: montoPagar,
          descuento: descuentoCalculado,
          fee: feeCalculado,
          totalAmount: parseFloat(result.purchase_total_amount || resultData.amount_paid),
          porcentajeDescuento: parseFloat(selectedProduct.product_discount_percentage) || 0,
          paymentStatus: resultData.payment_status,
          deliveryStatus: resultData.delivery_status,
          paymentRef: resultData.payment_ref,
          provisionRef: resultData.provision_ref,
          barcode: resultData.barcode,
          barcodeImage: resultData.barcode_image,
          deliveryPhone: purchaseData.deliveryPhone,
          deliveryName: purchaseData.deliveryName,
          deliveryAddress: purchaseData.deliveryAddress,
        });

        console.log('📄 PDF del recibo generado:', receiptPdfUrl);
      } catch (pdfError) {
        console.warn('⚠️ No se pudo generar PDF (continúa sin PDF):', pdfError);
      }

      // Actualizar compra con URL del PDF (si se generó)
      if (receiptPdfUrl && result.purchase_id) {
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('bitel_token');
          await fetch(`http://127.0.0.1:8100/api/v1/purchases/${result.purchase_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              purchase_receip_image: receiptPdfUrl
            })
          });
          console.log('✅ URL del PDF guardada en BD');
        } catch (updateError) {
          console.warn('⚠️ No se pudo actualizar URL del PDF:', updateError);
        }
      }
      
      const uiResult = {
        success: (resultData.payment_status === 'Paid' && 
                 (resultData.delivery_status === 'Success' || resultData.delivery_status === 'Ordered')) ||
                 (resultData.payment_status === 'Pending' && resultData.payment_method === 'barcode'),
        payment_status: resultData.payment_status,
        delivery_status: resultData.delivery_status,
        reference: result.purchase_reference || reference,
        amount: result.purchase_total_amount || resultData.amount_paid,
        date: result.purchase_date || new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        payment_ref: resultData.payment_ref,
        provision_ref: resultData.provision_ref,
        reversal_ref: resultData.reversal_ref,
        barcode: resultData.barcode,
        barcode_image: resultData.barcode_image,
        requires_manual_intervention: resultData.requires_manual_intervention,
        error_message: resultData.error_message,
        monto_pagar: montoPagar,
        descuento: descuentoCalculado,
        fee: feeCalculado,
        porcentaje_descuento: parseFloat(selectedProduct.product_discount_percentage) || 0,
        receipt_pdf_url: receiptPdfUrl,
      };

      console.log('✅ Resultado UI:', uiResult);
      setPurchaseResult(uiResult);
      setPurchaseStep(5);
      setProcessing(false);

    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setPurchaseResult({
        success: false,
        error: error.response?.data?.detail || error.message || 'Error al guardar la compra'
      });
      setPurchaseStep(5);
      setProcessing(false);
    }
  };


  // Modificar handleDownloadReceiptPDF para usar PDF guardado
  const handleDownloadReceiptPDF = () => {
    if (!purchaseResult) return;

    // Si ya hay PDF generado, abrir en nueva pestaña
    if (purchaseResult.receipt_pdf_url) {
      const fullUrl = `http://127.0.0.1:8100${purchaseResult.receipt_pdf_url}`;
      window.open(fullUrl, '_blank');
      return;
    }

    // Si no hay PDF, generar ahora (fallback)
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
      paymentStatus: purchaseResult.payment_status,
      deliveryStatus: purchaseResult.delivery_status,
      paymentRef: purchaseResult.payment_ref,
      provisionRef: purchaseResult.provision_ref,
      barcode: purchaseResult.barcode,
      barcodeImage: purchaseResult.barcode_image,
      deliveryPhone: purchaseData.deliveryPhone,
      deliveryName: purchaseData.deliveryName,
      deliveryAddress: purchaseData.deliveryAddress,
    }).then(pdfUrl => {
      if (pdfUrl) {
        const fullUrl = `http://127.0.0.1:8100${pdfUrl}`;
        window.open(fullUrl, '_blank');
        // Actualizar estado con URL
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

  // Descargar recibo TXT
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
           BITEL TELECOM
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
Estado Pago: ${purchaseResult.payment_status}
${purchaseResult.delivery_status ? `Estado Provisión: ${purchaseResult.delivery_status}` : ''}
${purchaseResult.requires_manual_intervention ? `Estado Devolución: No se pudo devolver el cobro` : ''}

${purchaseResult.payment_ref ? `Ref. Pago: ${purchaseResult.payment_ref}` : ''}
${purchaseResult.provision_ref ? `Ref. Provisión: ${purchaseResult.provision_ref}` : ''}
${purchaseResult.reversal_ref ? `Ref. Reversión: ${purchaseResult.reversal_ref}` : ''}
${purchaseResult.barcode ? `Código Barras: ${purchaseResult.barcode}` : ''}
${purchaseResult.requires_manual_intervention ? `
Si en 48 horas no recibe la devolución
comuníquese con soporte@latcom.co` : ''}

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

  // MODAL: Detalle de Producto
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
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Precio Base:</span>
                <span className="font-semibold">{selectedProduct.product_currency} {parseFloat(selectedProduct.product_base_price || 0).toFixed(2)}</span>
              </div>

              {parseFloat(selectedProduct.product_discount_percentage || 0) > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span>Descuento ({selectedProduct.product_discount_percentage}%):</span>
                  <span>-{selectedProduct.product_currency} {parseFloat(selectedProduct.product_discount_amount || 0).toFixed(2)}</span>
                </div>
              )}

              {parseFloat(selectedProduct.product_fee || 0) > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Comisión:</span>
                  <span>+{selectedProduct.product_currency} {parseFloat(selectedProduct.product_fee || 0).toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-bitel-blue">Total:</span>
                  <span className="text-3xl font-bold text-bitel-blue">
                    {selectedProduct.product_currency} {parseFloat(selectedProduct.product_total_price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
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
        <h1 className="text-4xl font-bold text-bitel-blue mb-8">Tienda Bitel</h1>

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
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hay productos disponibles</p>
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
                    <span className="text-2xl font-bold text-bitel-blue">
                      {product.product_currency} {parseFloat(product.product_total_price || 0).toFixed(2)}
                    </span>
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
      <PurchasePopup
        showPurchasePopup={showPurchasePopup}
        selectedProduct={selectedProduct}
        selectedService={selectedService}
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