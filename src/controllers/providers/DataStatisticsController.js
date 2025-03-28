import mongoose from 'mongoose';
import moment from 'moment-timezone';
import OrdersModel from '../../models/OrdersModel.js';

class DataStatisticsController {

  getFinancialData = async (req, res) => {
    try {
      const companyId = req.headers.companyid;
      const period = req.query.period; // Este é o parâmetro adicionado para especificar o período (day, week, month)

      let startDate, endDate;
      switch (period) {
        case 'day':
          startDate = moment().startOf('day');
          endDate = moment().endOf('day');
          break;
        case 'week':
          startDate = moment().startOf('week');
          endDate = moment().endOf('week');
          break;
        case 'month':
          startDate = moment().startOf('month');
          endDate = moment().endOf('month');
          break;
        default:
          startDate = moment().startOf('month');
          endDate = moment().endOf('month');
      }

      const orders = await OrdersModel.find({
        'company': companyId,
        'status.name': 'Concluded',
        'date': { $gte: startDate.toDate(), $lte: endDate.toDate() }
      });

      const totalOrdersPeriod = orders.length;
      const totalValuePeriod = orders.reduce((total, order) => total + order.total, 0);
      const totalItemsSoldPeriod = orders.reduce((total, order) => {
        return total + order.products.reduce((itemTotal, product) => itemTotal + product.quantity, 0);
      }, 0);

      const ordersBriefInfo = orders.map(order => ({
        id: order.id,
        date: order.date,
        client: order.client.name,
        delivery: order.deliveryType === 'delivery'?'Sim':'Não',
        totalValue: order.total,
        totalItems: order.products.reduce((itemTotal, product) => itemTotal + product.quantity, 0),
      }));

      return res.status(200).json({
        ordersBriefInfo,
        totalOrdersPeriod,
        totalValuePeriod,
        totalItemsSoldPeriod,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error. Please check the server logs for more details.' });
    }
  };

  groupOrdersByPeriod(orders, period) {
    const groupedOrders = orders.reduce((result, order) => {
      const periodKey = moment(order.date).startOf(period).toISOString();
      result[periodKey] = result[periodKey] || [];
      result[periodKey].push(order);
      return result;
    }, {});

    return Object.values(groupedOrders);
  }

  async getOrdersdashboard(req, res) {
    try {
      const company = req.headers.companyid;
      const currentDate = new Date();
      const sevenDaysAgo = moment(currentDate).subtract(7, 'days').toDate();

      const orders = await OrdersModel.aggregate([
        {
          $match: {
            'company': mongoose.Types.ObjectId(company),
            date: { $gte: sevenDaysAgo, $lte: currentDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            quantity: { $sum: 1 }
          }
        },
        { $project: { _id: 0, date: '$_id', quantity: 1 } }
      ]);

      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter os produtos.' });
    }
  }

  async getTopSellingProducts(req, res) {
    try {
      const company = req.headers.companyid;
      const currentDate = new Date();
      const sevenDaysAgo = moment(currentDate).subtract(7, 'days').toDate();

      const products = await OrdersModel.aggregate([
        {
          $match: {
            'company': mongoose.Types.ObjectId(company),
            date: { $gte: sevenDaysAgo, $lte: currentDate }
          }
        },
        { $unwind: '$products' },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              productId: '$products.productId',
              productName: '$products.productName'
            },
            quantity: { $sum: '$products.quantity' }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id.date',
            productName: '$_id.productName',
            quantity: 1
          }
        }
      ]);

      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter os produtos' });
    }
  }
}

export default DataStatisticsController;
