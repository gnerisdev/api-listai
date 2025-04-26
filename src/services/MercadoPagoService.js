import mercadopago from "mercadopago";
import { MP_ACCESS_TOKEN } from '../environments/index.js';

export class MercadoPagoService {
  constructor() {
    mercadopago.configure({ access_token: MP_ACCESS_TOKEN });
  }

  async getPreference(service, back_urls, external_reference) {
    try {
      const preference = { 
        items: [service], 
        back_urls, 
        auto_return: 'approved',
        external_reference 
      };
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
}
