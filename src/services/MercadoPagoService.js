import mercadopago from 'mercadopago';
import { MP_ACCESS_TOKEN } from '../environments/index.js';

export class MercadoPagoService {
  constructor() {
    mercadopago.configure({ access_token: MP_ACCESS_TOKEN });
  }

  async getPreference(preference) {
    try {
      const response = await mercadopago.preferences.create(preference);
      return response.body;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentById(payment_id) {
    try {
      const response = await mercadopago.payment.findById(payment_id);
      return response.body;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentByReference(reference, resultType = 'fisrt' /* 'fisrt' | 'last' | 'all' */) {
    try {
      const response = await mercadopago.payment.search({
        qs: { external_reference: reference }
      });

      if (resultType === 'fisrt') return response.body.results[0] || null;
      if (resultType === 'last')  return response.body.results[response.body.results.length - 1] || null;
      if (resultType === 'all')   return response.body.results;
    } catch (error) {
      throw error;
    }
  }

  async getAllPayments(filters = {}) {
    try {
      const response = await mercadopago.payment.search({ qs: filters });
      return response.body.results;
    } catch (error) {
      throw error;
    }
  }
}
