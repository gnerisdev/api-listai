import { NotificationService } from '../../services/NotificationService.js';
import { EmailService } from '../../services/EmailService.js';
import { MenuService } from '../../services/MenuService.js';
import { PixService } from '../../services/PixService.js';
import { LogUtils } from '../../utils/LogUtils.js';
import CompanyModel from '../../models/CompanyModel.js';
import OrdersModel from '../../models/OrdersModel.js';
import CartModel from '../../models/CartModel.js';
import ProductsModel from '../../models/ProductsModel.js';


export class CartController {
  constructor() {
    this.menuService = new MenuService();
  }

  addClientData = async (req, res) => {
    try {
      const { cartId, client } = req.body;

      const updateCart = await CartModel.findByIdAndUpdate(
        cartId,
        { $set: { client: client } },
        { new: true }
      ).lean();

      return res.status(200).json({ ...updateCart });
    } catch (error) {
      LogUtils.errorLogger(error);
    }
  };

  addAddressData = async (req, res) => {
    try {
      const { cartId, address } = req.body;

      const updateCart = await CartModel.findByIdAndUpdate(
        cartId,
        { $set: { address: address } },
        { new: true }
      );

      return res.status(200).json({ success: true, ...updateCart });
    } catch (error) {
      LogUtils.errorLogger(error);
    }
  };

  setDeliveryType = async (req, res) => {
    try {
      const { cartId, deliveryType } = req.body;

      if (deliveryType !== 'delivery' && deliveryType !== 'pickup') {
        return res.status(400).json({
          success: false,
          message: 'Tipo de entrega inválido'
        });
      }

      const cart = await CartModel.findById(cartId);

      if (deliveryType === 'delivery') {
        if (
          !cart.address.street
          || !cart.address.district
          || !cart.address.city
          || !cart.address.number
        ) {
          return res.status(400).json({
            success: false,
            message: 'Endereço não encontrado'
          });
        }
      }

      if (deliveryType === 'pickup') {
        const updateCart = await CartModel.findByIdAndUpdate(
          cartId,
          { $set: { deliveryType, total: cart.subtotal, address: {} } },
          { new: true }
        ).lean();
        return res.status(200).json(updateCart);
      }

      const updateCart = await CartModel.findByIdAndUpdate(
        cartId,
        { $set: { deliveryType } },
        { new: true }
      ).lean();

      return res.status(200).json(updateCart);
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({
        success: false,
        message: 'Erro ao adicionar tipo de entrega'
      });
    }
  };

  estimateValue = async (req, res) => {
    try {
      const cart = req.body;
      const estimate = await this.menuService.estimateValue(cart.products);
      const company = await CompanyModel.findById(cart.companyId).select('settingsDelivery');

      if (company.settingsDelivery.deliveryOption === 'fixed') {
        estimate.total = estimate.subtotal + company.settingsDelivery.fixedValue;
      } else {
        estimate.total = estimate.subtotal;
      }

      const cartFind = await CartModel.findById(cart?._id).lean();

      if (cartFind?._id) {
        cartFind.total = estimate.subtotal;
        cartFind.address = {};
        
        if (
          company.settingsDelivery.deliveryOption === 'fixed'
          && cartFind && cartFind.address
        ) {
          cartFind.address.price = company.settingsDelivery.fixedValue;
          estimate.total = estimate.subtotal + cartFind.address.price;
        }

        if (
          company.settingsDelivery.deliveryOption === 'automatic'
          && typeof cartFind?.address?.price === 'number'
        ) {
          estimate.total = estimate.subtotal + cartFind.address.price;
        }

        if (company.settingsDelivery.deliveryOption === 'customerPickup') {
          estimate.total = estimate.subtotal;
        }

        const cartUpdate = await CartModel.findByIdAndUpdate(
          cart._id,
          {
            $set: {
              products: estimate.products,
              total: estimate.total,
              subtotal: estimate.subtotal,
              "address.price": (cartFind?.address?.price || 0),
              "address.deliveryOption": company.settingsDelivery.deliveryOption
            },
          },
          { new: true }
        );

        return res.status(200).json(cartUpdate);
      }

      const newCart = await CartModel.create(estimate);

      return res.status(200).json(newCart);
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ error: 'An error occurred' });
    }
  };

  calculateFreight = async (req, res) => {
    /**
     *    address: { street: string, number: number, zipCode: string, district: string, city: string },
     *    cartId: string,
     *  **/

    try {
      const { cartId, companyId, address: addressData } = req.body;

      const company = await CompanyModel.findById(companyId).select('address settingsDelivery');

      if (company.settingsDelivery.deliveryOption === 'customerPickup') {
        const addressClient = { ...addressData, deliveryOption: 'customerPickup' };
        const updateCart = await CartModel.findByIdAndUpdate(
          cartId,
          { $set: { address: addressClient, company: companyId } },
          { new: true }
        ).lean();

        return res.status(200).json(updateCart);
      }

      if (company.settingsDelivery.deliveryOption === 'fixed') {
        const addressClient = {
          ...addressData,
          deliveryOption: 'fixed',
          price: company.settingsDelivery.fixedValue,
        };

        const updateCart = await CartModel.findByIdAndUpdate(
          cartId,
          [
            { $set: { address: addressClient, company: companyId } },
            { $set: { total: { $add: ["$subtotal", addressClient.price] } } }
          ],
          { new: true }
        ).lean();

        return res.status(200).json(updateCart);
      }

      if (company.settingsDelivery.deliveryOption === 'automatic') {
        let addressClient;

        if (addressData?.zipCode) {
          addressClient = await this.menuService.calculateDeliveryFee(
            company.address,
            addressData,
            company.settingsDelivery.kmValue,
            company.settingsDelivery.minValue
          );
        } else {
          addressClient = this.menuService.addAddressManual(addressData);
        }

        const updateCart = await CartModel.findByIdAndUpdate(
          cartId,
          [
            { $set: { address: addressClient, company: companyId } },
            { $set: { total: { $add: ["$subtotal", addressClient.price] } } }
          ],
          { new: true }
        ).lean();

        return res.status(200).json(updateCart);
      }
    } catch (error) {
      LogUtils.errorLogger(error);
    }
  };

  getPaymentOptions = async (req, res) => {
    try {
      const { companyId, cartId } = req.body;
      const company = await CompanyModel.findById(companyId, 'settingsPayment fantasyName');
      const cart = await CartModel.findById(cartId, 'total');
      let pix = null;

      if (!cart) {
        res.status(404).json({ success: false, message: 'Carrinho não encontrado' });
        return;
      }

      if (company.settingsPayment.pix.active) {
        pix = new PixService(
          company.settingsPayment.pix.key,
          `Pedido loja ${company.fantasyName} - Meu apetite`,
          company.settingsPayment.pix.name,
          company.settingsPayment.pix.city,
          '1',
          cart.total
        );
      }

      return res.status(200).json({
        inDelivery: { active: true, methods: company.settingsPayment.methods },
        mercadoPago: { active: false, preferenceId: '' },
        pix: {
          active: company.settingsPayment.pix.active,
          code: pix ? pix.getPayload() : null
        },
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false });
    }
  };

  async finishOrder(req, res) {
    let company, cart, order;

    try {
      const {
        cartId,
        companyId,
        paymentType,
        paymentMethod,
        deliveryType,
      } = req.body;

      if (!paymentMethod || !paymentType) {
        return res.status(400).json({
          success: false,
          message: 'Método de pagamento não informado',
        });
      }

      if (!deliveryType) {
        return res.status(400).json({
          success: false,
          message: 'Opção de entrega não informada',
        });
      }

      cart = await CartModel.findById(cartId).lean().exec();

      company = await CompanyModel.findById(companyId)
        .select('fantasyName custom address subscription storeUrl settingsPayment email whatsapp')
        .lean();

      if (deliveryType !== 'pickup' && (
        !cart?.address?.street
        || !cart?.address?.number
        || !cart?.address?.city
        || !cart?.address?.district
      )) {
        return res.status(400).json({
          success: false,
          message: 'Endereço de entrega não informado ou incompleto',
        });
      }

      const productIds = new Set(cart.products.map((cartProduct) => cartProduct.productId));
      const products = await ProductsModel.find({ company: companyId, _id: { $in: Array.from(productIds) } })
        .select('_id')
        .lean();

      if (products.length !== Array.from(productIds).length) {
        return res.status(400).json({
          success: false,
          message: 'Erro ao finalizar pedido, limpe a sacola e tente novamente',
        });
      }

      if (deliveryType === 'pickup' && cart?.address) {
        cart.total = cart.subtotal;
        delete cart.address;
      }

      const orderRequest = {
        ...cart,
        paymentType,
        paymentMethod,
        deliveryType,
        company: company._id,
        status: { name: 'OrderReceived', label: 'Pedido Recebido' },
      };

      orderRequest.paymentMethod = company.settingsPayment.methods
        .find((item) => item.id === paymentMethod);

      if (paymentType === 'online' && paymentMethod === 'pix') {
        orderRequest.status.name = 'WaitingForPaymentConfirmation';
        orderRequest.status.label = 'Aguardando Pagamento';
      }

      delete orderRequest._id;

      order = await OrdersModel.create(orderRequest);

      try {
        if (company?.subscription?.endpoint) {
          const notificationService = new NotificationService(
            company.subscription.endpoint,
            company.subscription.keys
          );

          await notificationService.send('Novo pedido!', 'Você tem um novo pedido');
        }

        await new EmailService().sendEmailOrder(
          { to: company.email, subject: 'Novo pedido!' },
          order
        );

        await new EmailService().sendEmailOrder(
          { to: order.client.email.trim(), subject: 'Novo pedido!' },
          order,
          company
        );
      } catch (error) {
        LogUtils.errorLogger(error);
      }

      res.status(200).json(order);
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({
        success: false,
        message: 'Erro ao finalizar o pedido',
      });
    }
  }
}
