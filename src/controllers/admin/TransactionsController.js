import prisma from '#prisma';
import moment from 'moment-timezone';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';

const mercadoPagoService = new MercadoPagoService();

class TransactionsController {
  async getTransactions(req, res) {
    try {
      const { status } = req.query;
      const whereClause = {};

      if (status) whereClause.status = status.toUpperCase();

      const transactions = await prisma.event_gift_transactions.findMany({
        where: whereClause,
        include: { event: { select: { id: true } } },
        orderBy: { created_at: 'desc' },
      });

      return res.status(200).json({
        success: true,
        transactions: FormatUtils.toCamelCase(transactions),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar lista de repasses.',
      });
    }
  }

  async getInfoPayment(req, res) {
    try {
      const id = parseInt(req.params.id);
      const transaction = await prisma.event_gift_transactions.findUniqueOrThrow({ where: { id } });
      const payment = await mercadoPagoService.getPaymentByReference(transaction.reference);

      return res.status(200).json({ success: true, payment: payment || null });
    } catch (error) {
      console.log(error)
      const titleError = 'Erro ao buscar informações de pagamento.';
      LogUtils.errorLogger(error, titleError);
      return res.status(500).json({ success: false, message: titleError});
    }
  }

  async changeStatus(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const transitionStatus = ['APPROVED', 'PENDING', 'RECUSED', 'CANCELLED'];
      console.log(req.body, '---------');

      // Verify
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação e novo status são obrigatórios.',
        });
      }

      if (!transitionStatus.includes(status.toUpperCase())) {
        return res.status(400).json({ success: false, message: `Status inválido.` });
      }

      // Get Transaction
      const transaction = await prisma.event_gift_transactions.findFirst({ where: { id } });

      // Get Payment MP
      const payment = await mercadoPagoService.getPaymentByReference(transaction.reference);
      let paymentIems;

      if (payment?.additional_info) {
        paymentIems = payment.additional_info.items.map(mpItem => ({
          event_gift_transaction_id: id,
          gift_id: Number(mpItem.id),
          quantity: Number(mpItem.quantity),
          gift_name: mpItem.title,
          unit_price: Number(mpItem.unit_price)
        }));
      }

      // Change status
      await prisma.$transaction(async (tx) => {
        await tx.event_gift_transactions.update({
          where: { id: id },
          data: { status: status.toUpperCase() }
        });

        if (status === 'APPROVED') {
          await tx.event_gift_transaction_items.findFirst({ where: { event_gift_transaction_id: id } });

          if (paymentIems?.length > 0) {
            await tx.event_gift_transaction_items.createMany({ data: paymentIems });
          }
        } else {
          await tx.event_gift_transaction_items
            .deleteMany({ where: { event_gift_transaction_id: id } });
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Status da transação atualizado com sucesso.',
      });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error, 'Erro ao atualizar o status da transação.');

      return res.status(500).json({
        success: false,
        message: 'Erro ao concluir o repasse.',
      });
    }
  }
}

export default TransactionsController;