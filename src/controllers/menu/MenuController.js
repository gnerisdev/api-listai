import mongoose from 'mongoose';
import moment from 'moment-timezone';
// import CompanyModel from '../../models/CompanyModel.js';
// import OrdersModel from '../../models/OrdersModel.js';
// import CategoriesModel from '../../models/CategoriesModel.js';
import { MenuService } from '../../services/MenuService.js';
import { LogUtils } from '../../utils/LogUtils.js';

export class MenuController {
  constructor() {
    this.menuService = new MenuService;
  }

  async getCollections(req, res) {
    try {
      const storeUrl = req.params?.storeUrl;
      const company = await CompanyModel.findOne({ storeUrl });

      if (!company) return res.status(404).json({ success: false, message: 'Loja não encontrada' });

      const productsWithCategories = await CategoriesModel.aggregate([
        {
          $match: { company: mongoose.Types.ObjectId(company._id), isActive: true }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products',
          },
        },
        {
          $project: {
            title: 1,
            products: {
              $filter: {
                input: '$products',
                as: 'product',
                cond: { $eq: ['$$product.isActive', true] },
              },
            },
          },
        },
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'complements',
            localField: 'products.complements',
            foreignField: '_id',
            as: 'products.complements',
          },
        },
        {
          $group: {
            _id: '$_id', title: { $first: '$title' }, products: { $push: '$products' }
          },
        },
      ]);

      return res.status(200).json(productsWithCategories);
    } catch (error) {
      LogUtils.errorLogger(error);
    }
  }

  async getCompany(req, res) {
    try {
      const storeUrl = req.params?.storeUrl;
      const store = await CompanyModel.findOne({ storeUrl })
        .select(
          'fantasyName description settings custom address settingsDelivery settingsPayment storeUrl online'
        )
        .lean();

      if (!store || !store.online) {
        return res.status(404).json({ success: false, message: 'Cárdapio não encontrado' });
      }

      const time = moment().tz('America/Sao_Paulo');
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const openDay = store.settings.openingHours[days[time.day()]];
      const hour = moment(time.format('HH:mm'), 'HH:mm');

      if (
        hour.isSameOrAfter(moment(openDay.open, 'HH:mm'))
        && hour.isSameOrBefore(moment(openDay.close, 'HH:mm'))
      ) {
        store.isOpen = true;
      } else {
        store.isOpen = false;
      }

      return res.status(200).json(store);
    } catch (error) {
      console.error(error);
    }
  }

  async getStoreView(req, res) {
    try {
      const storeUrl = req.params?.storeUrl;
      const store = await CompanyModel.findByIdAndUpdate(
        storeUrl,
        { $inc: { views: 1 } },
        { new: true }
      ).select('fantasyName custom address subscription storeUrl');
      return res.status(200).json(store);
    } catch (error) {
      console.error(error);
    }
  }

  async getOrder(req, res) {
    try {
      const { storeUrl, orderId } = req.params;

      const company = await CompanyModel.findOne({ storeUrl }).select(
        'fantasyName custom address subscription storeUrl whatsapp settingsPayment'
      )
      .lean();

      if (!company._id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Não foi possível encontrar a loja' 
        });
      }

      const order = await OrdersModel.findOne({ id: orderId, company: company._id });

      if (!order._id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Não foi possível encontrar o pedido' 
        });
      }

      return res.status(200).json({ order, company });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ error: 'Erro ao obter os produtos.' });
    }
  }
}
