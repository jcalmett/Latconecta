/**
 * API Simulator Service
 * Simula respuestas de APIs externas basándose en configuración guardada
 *
 * Uso:
 * import apiSimulator from './services/apiSimulatorService';
 *
 * const response = await apiSimulator.call('VALNUMTEL', { phone: '999888777' });
 */

class ApiSimulatorService {
  constructor() {
    this.enabled = import.meta.env.VITE_API_SIMULATOR === 'true';
    this.configKey = 'apiSimulatorConfig';
  }

  /**
   * Obtiene la configuración guardada del simulador
   */
  getConfig() {
    try {
      const config = localStorage.getItem(this.configKey);
      return config ? JSON.parse(config) : {};
    } catch (error) {
      console.error('Error al leer configuración del simulador:', error);
      return {};
    }
  }

  /**
   * Verifica si el simulador está activo
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Simula una llamada a API
   * @param {string} apiName - Nombre de la API (ej: 'VALNUMTEL', 'APICARD')
   * @param {object} requestData - Datos de la petición
   * @returns {Promise<object>} Respuesta simulada
   */
  async call(apiName, requestData = {}) {
    // Si el simulador no está habilitado, lanzar error
    if (!this.enabled) {
      throw new Error('API Simulator no está habilitado. Configurar VITE_API_SIMULATOR=true en .env');
    }

    // Simular delay de red (100-500ms)
    const delay = Math.random() * 400 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Obtener configuración de la API
    const config = this.getConfig();
    const apiConfig = config[apiName];

    if (!apiConfig) {
      console.warn(`API ${apiName} no tiene configuración en el simulador`);
      return this._defaultSuccessResponse(apiName, requestData);
    }

    // Retornar respuesta según configuración
    if (apiConfig.status === 'success') {
      return this._buildSuccessResponse(apiName, apiConfig, requestData);
    } else {
      return this._buildErrorResponse(apiName, apiConfig);
    }
  }

  /**
   * Construye respuesta exitosa según el tipo de API
   */
  _buildSuccessResponse(apiName, config, requestData) {
    const baseResponse = {
      status: 200,
      message: 'Operación exitosa',
      timestamp: new Date().toISOString()
    };

    switch (apiName) {
      case 'VALNUMTEL':
        return {
          ...baseResponse,
          data: {
            valid: true,
            phone_number: requestData.phone_number
          }
        };

      case 'VALNUMCTA':
        // ✅ MEJORADO: Usar valores configurados si existen
        return {
          ...baseResponse,
          data: {
            valid: true,
            account_number: requestData.account_number || '123456789',
            monto_base: config.monto_base !== undefined ? parseFloat(config.monto_base) : 85.50,
            indicador: config.indicador || 'R',  // 'T' = Total, 'R' = Rango permitido
            account_holder: config.account_holder || 'Juan Pérez (Simulado)'
          }
        };

      case 'APIRECARGA':
      case 'APIPAGOREC':
      case 'APIYAPE':
      case 'APISMART':
        return {
          ...baseResponse,
          data: {
            provision_ref: config.provision_ref || `PROV-${apiName}-${Date.now()}`,
            provision_status: 'completed'
          }
        };

      case 'APICARD':
        return {
          ...baseResponse,
          data: {
            payment_ref: config.payment_ref || `PAY-CARD-${Date.now()}`,
            payment_status: 'approved',
            card_last_digits: requestData.card_last_digits || '4532'
          }
        };

      case 'APIREVCARD':
        return {
          ...baseResponse,
          data: {
            reversal_ref: config.reversal_ref || `REV-CARD-${Date.now()}`,
            reversal_status: 'completed',
            original_payment_ref: requestData.payment_ref
          }
        };

      case 'APIBARC':
        return {
          ...baseResponse,
          data: {
            barcode: config.barcode || `BC${Date.now()}`,
            barcode_image: config.barcode_image || 'https://via.placeholder.com/300x100?text=BARCODE',
            expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
          }
        };

      default:
        return baseResponse;
    }
  }

  /**
   * Construye respuesta de error
   */
  _buildErrorResponse(apiName, config) {
    return {
      status: 400,
      error: true,
      message: config.errorMessage || `Error en ${apiName}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Respuesta por defecto si no hay configuración
   */
  _defaultSuccessResponse(apiName, requestData) {
    const baseResponse = {
      status: 200,
      message: `Respuesta por defecto de ${apiName}`,
      timestamp: new Date().toISOString()
    };

    // Respuestas específicas por tipo de API
    switch (apiName) {
      case 'VALNUMTEL':
        return {
          ...baseResponse,
          data: {
            valid: true,
            phone_number: requestData.phone_number || '999888777'
          }
        };

      case 'VALNUMCTA':
        return {
          ...baseResponse,
          data: {
            valid: true,
            account_number: requestData.account_number || '123456789',
            monto_base: 85.50,  // ✅ Valor por defecto
            indicador: 'R',     // ✅ 'T' = Total, 'R' = Rango permitido
            account_holder: 'Juan Pérez (Simulado por defecto)'
          }
        };

      case 'APICARD':
        return {
          ...baseResponse,
          data: {
            success: true,
            payment_ref: `PAY-${Date.now()}`,
            card_last_digits: '4532'
          }
        };

      case 'BARCODE':
        return {
          ...baseResponse,
          data: {
            success: true,
            barcode: `BC${Date.now()}`,
            barcode_image: `https://barcode.example.com/BC${Date.now()}.png`
          }
        };

      default:
        return {
          ...baseResponse,
          data: { ...requestData }
        };
    }
  }

  /**
   * Métodos específicos para cada API (helpers)
   */

  async validatePhone(phoneNumber) {
    return this.call('VALNUMTEL', { phone_number: phoneNumber });
  }

  async validateAccount(accountNumber) {
    return this.call('VALNUMCTA', { account_number: accountNumber });
  }

  async provisionTopUp(data) {
    return this.call('APIRECARGA', data);
  }

  async payBill(data) {
    return this.call('APIPAGOREC', data);
  }

  async transferYape(data) {
    return this.call('APIYAPE', data);
  }

  async orderSmartphone(data) {
    return this.call('APISMART', data);
  }

  async processCardPayment(data) {
    return this.call('APICARD', data);
  }

  async reverseCardPayment(paymentRef) {
    return this.call('APIREVCARD', { payment_ref: paymentRef });
  }

  async generateBarcode(data) {
    return this.call('APIBARC', data);
  }

  /**
   * Simula un flujo completo de compra
   * Útil para testing de escenarios complejos
   */
  async simulatePurchaseFlow(productType, paymentMethod) {
    const flow = {
      productType,
      paymentMethod,
      steps: [],
      success: true
    };

    try {
      // 1. Validación
      let validationResult;
      if (productType === 'bill_payment') {
        validationResult = await this.validateAccount('123456789');
        flow.steps.push({ step: 'validation', api: 'VALNUMCTA', result: validationResult });
      } else {
        validationResult = await this.validatePhone('999888777');
        flow.steps.push({ step: 'validation', api: 'VALNUMTEL', result: validationResult });
      }

      if (validationResult.status !== 200) {
        flow.success = false;
        return flow;
      }

      // 2. Pago
      let paymentResult;
      if (paymentMethod === 'card') {
        paymentResult = await this.processCardPayment({ amount: 50.00 });
        flow.steps.push({ step: 'payment', api: 'APICARD', result: paymentResult });

        if (paymentResult.status !== 200) {
          flow.success = false;
          return flow;
        }

        // 3. Provisión
        let provisionResult;
        switch (productType) {
          case 'topup':
            provisionResult = await this.provisionTopUp({ phone: '999888777' });
            flow.steps.push({ step: 'provision', api: 'APIRECARGA', result: provisionResult });
            break;
          case 'bill_payment':
            provisionResult = await this.payBill({ account: '123456789' });
            flow.steps.push({ step: 'provision', api: 'APIPAGOREC', result: provisionResult });
            break;
          case 'transfer':
            provisionResult = await this.transferYape({ phone: '999888777' });
            flow.steps.push({ step: 'provision', api: 'APIYAPE', result: provisionResult });
            break;
          case 'smartphone':
            provisionResult = await this.orderSmartphone({ phone: '999888777' });
            flow.steps.push({ step: 'provision', api: 'APISMART', result: provisionResult });
            break;
        }

        // Si la provisión falla, intentar reversión
        if (provisionResult.status !== 200) {
          const reversalResult = await this.reverseCardPayment(paymentResult.data.payment_ref);
          flow.steps.push({ step: 'reversal', api: 'APIREVCARD', result: reversalResult });
          flow.success = false;
        }

      } else if (paymentMethod === 'barcode') {
        const barcodeResult = await this.generateBarcode({ amount: 50.00 });
        flow.steps.push({ step: 'barcode', api: 'APIBARC', result: barcodeResult });
        flow.success = barcodeResult.status === 200;
      }

      return flow;

    } catch (error) {
      flow.success = false;
      flow.error = error.message;
      return flow;
    }
  }
}

// Exportar instancia única (singleton)
const apiSimulator = new ApiSimulatorService();
export default apiSimulator;