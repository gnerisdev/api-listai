import prisma from '#prisma';
import moment from 'moment-timezone';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class PayoutsController {
  async getPayouts(req, res) {
    try {
      const { status } = req.query;
      const whereClause = {};

      if (status) whereClause.status = status.toUpperCase();

      const payouts = await prisma.payout_requests.findMany({
        where: whereClause,
        include: { event: true, user: true },
        orderBy: { created_at: 'desc' },
      });

      return res.status(200).json({ success: true, payouts: FormatUtils.toCamelCase(payouts) });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar lista de repasses.',
      });
    }
  }
 
  async concludePayout(req, res) {
    try {
      const { id } = req.params;
      const { paidAmount } = req.body; 
      const parsedPaidAmount = parseFloat(paidAmount);

      if (isNaN(parsedPaidAmount) || parsedPaidAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Valor de repasse inválido.' });
      }

      const updatedPayout = await prisma.payout_requests.update({
        where: { id: parseInt(id) },
        data: {
          status: 'PAID',
          paid_amount: parsedPaidAmount,
          paid_at: moment().tz('America/Sao_Paulo').toDate(),
        },
        include: { event: true, user: true },
      });

      if (!updatedPayout) {
        return res.status(404).json({ success: false, message: 'Repasse não encontrado.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Repasse concluído com sucesso.',
        payout: FormatUtils.toCamelCase(updatedPayout),
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao concluir o repasse.',
      });
    }
  }
}

export default PayoutsController;