import { useState } from 'react';
import purchasesService from '../services/purchasesService';

export const usePurchase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validatePhone = async (phoneNumber, serviceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.validatePhone(phoneNumber, serviceId);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const validateAccount = async (accountNumber, serviceId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.validateAccount(accountNumber, serviceId);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const createPurchase = async (purchaseData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.create(purchaseData);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const processPayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.processPayment(paymentData);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const generateBarcode = async (barcodeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.generateBarcode(barcodeData);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const provisionService = async (purchaseId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.provisionService(purchaseId);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const reverseTransaction = async (purchaseId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.reverseTransaction(purchaseId, reason);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const getMyPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchasesService.getMyPurchases();
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    loading,
    error,
    validatePhone,
    validateAccount,
    createPurchase,
    processPayment,
    generateBarcode,
    provisionService,
    reverseTransaction,
    getMyPurchases
  };
};