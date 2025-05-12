import mercadopago from "mercadopago";
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

  async getPaymentByReference(reference) {
    try {
      const response = await mercadopago.payment.search({
        qs: { external_reference: reference }
      });

      const [payment] = response.body.results;
      return payment || null;
    } catch (error) {
      throw error;
    }
  }
}
