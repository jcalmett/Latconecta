import { useState, useEffect } from 'react';
import { X, ShoppingCart, CreditCard, Smartphone, Check, AlertCircle, Loader2, Download, FileText } from 'lucide-react';
import servicesService from '../services/servicesService';
import productsService from '../services/productsService';
import purchasesService from '../services/purchasesService';
import apiSimulator from '../services/apiSimulatorService';
import { getImageUrl, FALLBACK_IMAGES } from '../utils/imageHelper';
import companiesService from '../services/companiesService';
import PurchasePopup from '../components/PurchasePopup';
import jsPDF from 'jspdf';  // ✅ SIN llaves
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

/**
 * ═══════════════════════════════════════════════════════════════════════
 * ✅ VERSIÓN MEJORADA: generateAndUploadReceiptPDF
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * MEJORAS IMPLEMENTADAS:
 * 1. ✅ Imagen del barcode se carga y muestra en el PDF
 * 2. ✅ Espaciado reducido para que smartphones + barcode quepan
 * 3. ✅ Ajuste dinámico según tipo de producto
 * 
 * IMPORT REQUERIDO (al inicio de ShopView.jsx):
 *   import jsPDF from 'jspdf';
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */

const generateAndUploadReceiptPDF = async (receiptData) => {
  try {
    console.log('📄 Generando PDF del recibo con jsPDF...');

    if (!receiptData || !receiptData.reference) {
      console.error('❌ ERROR: receiptData inválido');
      return null;
    }

    // Determinar etiqueta y destinatario
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

    // ✅ Detectar si necesita espaciado compacto
    const hasBarcode = !!(receiptData.barcode && receiptData.barcodeImage);
    const isSmartphone = receiptData.productType === 'smartphone';
    const needsCompactMode = hasBarcode || isSmartphone;

    // Espaciado dinámico
    const spacing = {
      small: needsCompactMode ? 2.5 : 3,
      medium: needsCompactMode ? 3 : 4,
      large: needsCompactMode ? 4 : 6
    };

    // Crear documento PDF (formato A6: 105mm x 148mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [105, 148]
    });

    // Configurar fuente
    doc.setFont('courier');
    
    let y = 8; // Posición Y inicial (reducida de 10 a 8)

    // HEADER
    doc.setFontSize(11);
    doc.setFont('courier', 'bold');
    doc.text('COMPROBANTE DE COMPRA', 52.5, y, { align: 'center' });
    y += 4;
    
    doc.setFontSize(10);
    doc.text('BITEL TELECOM', 52.5, y, { align: 'center' });
    y += 6;

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(10, y, 95, y);
    y += 5;

    // DATOS GENERALES
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    
    doc.text(`Fecha: ${new Date(receiptData.date).toLocaleString('es-PE')}`, 12, y);
    y += spacing.medium;
    doc.text(`Referencia: ${receiptData.reference}`, 12, y);
    y += spacing.medium;
    doc.text(`${labelDestinatario}: ${destinatario}`, 12, y);
    y += spacing.large;

    // Línea separadora
    doc.setLineWidth(0.3);
    doc.line(10, y, 95, y);
    y += 4;

    // PRODUCTO
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

    // Línea separadora
    doc.setLineWidth(0.3);
    doc.line(10, y, 95, y);
    y += 4;

    // MONTO
    doc.setFontSize(9);
    doc.setFont('courier', 'bold');
    doc.text('MONTO', 12, y);
    y += 4;

    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    
    // Monto a pagar
    doc.text('Monto a pagar:', 12, y);
    doc.text(`${receiptData.currency} ${receiptData.montoPagar.toFixed(2)}`, 93, y, { align: 'right' });
    y += spacing.medium;

    // Descuento (si existe)
    if (receiptData.descuento > 0) {
      doc.setTextColor(0, 128, 0); // Verde
      doc.text(`Descuento (${receiptData.porcentajeDescuento}%):`, 12, y);
      doc.text(`-${receiptData.currency} ${receiptData.descuento.toFixed(2)}`, 93, y, { align: 'right' });
      doc.setTextColor(0, 0, 0); // Negro
      y += spacing.medium;
    }

    // Comisión (si existe)
    if (receiptData.fee > 0) {
      doc.text('Comision:', 12, y);
      doc.text(`+${receiptData.currency} ${receiptData.fee.toFixed(2)}`, 93, y, { align: 'right' });
      y += spacing.medium;
    }

    // Línea antes del total
    doc.setLineWidth(0.5);
    doc.line(12, y, 93, y);
    y += 4;

    // TOTAL
    doc.setFontSize(10);
    doc.setFont('courier', 'bold');
    doc.text('PAGO TOTAL:', 12, y);
    doc.text(`${receiptData.currency} ${receiptData.totalAmount.toFixed(2)}`, 93, y, { align: 'right' });
    y += spacing.large;

    // Línea separadora
    doc.setLineWidth(0.3);
    doc.line(10, y, 95, y);
    y += 4;

    // ESTADO
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

    // BARCODE (si existe) - ✅ CON IMAGEN
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

      // ✅ CARGAR Y AGREGAR IMAGEN DEL BARCODE
      try {
        console.log('📷 Cargando imagen del barcode...');
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('✅ Imagen del barcode cargada');
            
            // Calcular dimensiones proporcionales
            const maxWidth = 75; // mm
            const maxHeight = 20; // mm
            let imgWidth = maxWidth;
            let imgHeight = (img.height / img.width) * maxWidth;
            
            if (imgHeight > maxHeight) {
              imgHeight = maxHeight;
              imgWidth = (img.width / img.height) * maxHeight;
            }
            
            // Centrar horizontalmente
            const x = (105 - imgWidth) / 2;
            
            // Agregar imagen al PDF
            doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
            y += imgHeight + 2;
            
            resolve();
          };
          
          img.onerror = (error) => {
            console.warn('⚠️ No se pudo cargar imagen del barcode:', error);
            y += 2; // Espacio mínimo si falla
            resolve(); // Continuar sin imagen
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

    // DATOS DE ENTREGA (smartphones)
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
      
      // Dirección puede ser larga, dividirla si es necesario
      const direccion = receiptData.deliveryAddress || 'N/A';
      if (direccion.length > 40) {
        const lineas = doc.splitTextToSize(`Dir: ${direccion}`, 80);
        lineas.forEach((linea, index) => {
          doc.text(linea, 12, y);
          y += spacing.small;
        });
      } else {
        doc.text(`Dir: ${direccion}`, 12, y);
        y += spacing.small;
      }
    }

    // FOOTER (posición dinámica)
    if (y < 135) {
      y = 140; // Posición fija si hay espacio
    } else {
      y += 2; // Pequeño margen si está cerca del final
    }
    
    doc.setLineWidth(0.5);
    doc.line(10, y, 95, y);
    y += 3;

    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text('Gracias por su compra', 52.5, y, { align: 'center' });

    console.log('✅ PDF creado con jsPDF');

    // Convertir a Blob
    const pdfBlob = doc.output('blob');
    
    console.log('✅ PDF generado:', (pdfBlob.size / 1024).toFixed(2), 'KB');

    if (pdfBlob.size < 10000) {
      console.warn('⚠️ PDF pequeño (<10 KB)');
    }

    // Subir PDF
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


  // Guardar compra en backend
  // Guardar compra en backend
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