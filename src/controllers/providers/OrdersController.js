import Model from '../../models/OrdersModel.js';
import { getStatus } from '../../utils/orderStatus.js';

class OrdersController {
  async getOrders(req, res) {
    const company = req.headers.companyid;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const searchTerm = req.query.searchTerm || '';
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const selectedStatus = req.query.status || '';
  
    try {
      let query = { company };
  
      if (searchTerm) {
        query = {
          ...query,
          $or: [
            { 'client.name': { $regex: searchTerm, $options: 'i' } },
            { id: isNaN(searchTerm) ? -1 : parseInt(searchTerm) } 
          ]
        };
      }
  
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate + 'T23:59:59.999Z') 
        };
      } else if (startDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(startDate + 'T23:59:59.999Z') 
        };
      } else if (endDate) {
        query.date = { $lte: new Date(endDate + 'T23:59:59.999Z') }; 
      }
      
      if (selectedStatus) query['status.name'] = selectedStatus;

      const totalOrders = await Model.countDocuments(query);
      const totalPages = Math.ceil(totalOrders / perPage);
      const orders = await Model.find(query)
        .sort({ date: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
  
      return res.status(200).json({ orders, totalPages, page });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter os pedidos.' });
    }
  }
  
  async updateOrderStatus(req, res) {
    const company = req.headers.companyid;
    const { orderId, status } = req.body;

    try {
      const existingOrder = await Model.findOne({ _id: orderId });

      if (!existingOrder) {
        return res.status(404).json({ success: false, message: 'Pedido não encontrado.' });
      }

      if (String(existingOrder.company) !== company) {
        return res.status(404).json({ success: false, message: 'Falha ao alterar o status' });
      }

      await Model.findByIdAndUpdate(orderId, { $set: { status: getStatus(status) } })

      return res.status(200).json({ success: true, message: 'Pedido atualizado.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar o status do pedido.' });
    }
  }
}

export default OrdersController;
