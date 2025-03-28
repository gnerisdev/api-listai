import mercadopago from "mercadopago";

export class NotificationService {
  #accessToken = 'TEST-1944498221096339-010600-f3917d8d9a0242baa5b2236a9d4ac87e-225270724';

  constructor() {
    this.mp = mercadopago.configure({ access_token: accessToken });
  }

  async getPreferenceId(products) {
    try {
      const preference = {
        items: products.map((item) => ({
          title: item.name, 
          unit_price: item.priceTotal, 
          quantity: item.quantity
        }))
      };
      const response = await this.mp.preferences.create(preference);

      return response.body.id;
    } catch (error) {
      console.error('erroo ', error);
    }
  }
}
