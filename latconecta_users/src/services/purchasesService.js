import apiClient from './apiClient';

class PurchasesService {
  async create(purchaseData) {
    return await apiClient.post('/purchases/create', purchaseData);
  }

  async validatePhone(productId, phoneNumber) {
    return await apiClient.post(`/purchases/validate-phone?product_id=${productId}&phone_number=${encodeURIComponent(phoneNumber)}`);
  }

  async validateAccount(productId, accountNumber) {
    return await apiClient.post(`/purchases/validate-account?product_id=${productId}&account_number=${encodeURIComponent(accountNumber)}`);
  }

  async checkBalance({ productId, productType, userSelectedAmount, billTotalDebt, billCurrency, paymentType, exchangeRate }) {
    const params = new URLSearchParams({ product_id: productId });
    if (productType          )   params.append('product_type', productType);
    if (userSelectedAmount != null) params.append('user_selected_amount', userSelectedAmount);
    if (billTotalDebt      != null) params.append('bill_total_debt', billTotalDebt);
    if (billCurrency            )   params.append('bill_currency', billCurrency);
    if (paymentType             )   params.append('payment_type', paymentType);
    if (exchangeRate       != null) params.append('exchange_rate', exchangeRate);
    return await apiClient.post(`/purchases/check-balance?${params.toString()}`);
  }

  async getById(purchaseId) {
    return await apiClient.get(`/purchases/${purchaseId}`);
  }

  async getAll() {
    return await apiClient.get('/purchases/');
  }
}

const purchasesService = new PurchasesService();
export default purchasesService;
