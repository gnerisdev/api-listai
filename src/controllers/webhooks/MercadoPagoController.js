import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';

class MercadoPagoController {
  async paymentNotification(req, res) {
    try {
      const paymentId = req.body?.data?.id;

      const mercadoPago = new MercadoPagoService();
      const payment = await mercadoPago.getPaymentById(paymentId);

      console.log(payment, payment.external_reference.includes('guest_transaction'))
      if (payment.external_reference.includes('guest_transaction')) {
        GiftPayment(payment);
      }
    } catch(error) {
      console.log(error);
      LogUtils.errorLogger(error);
    } finally {
      res.sendStatus(200);
    }
  }

  async GiftPayment(payment) {
    if (!payment?.status) continue;

    if (payment.status === 'approved') {
      try {
        const transactionItemsData = payment.additional_info.items.map(mpItem => ({
          event_gift_transaction_id: item.id,
          gift_id: Number(mpItem.id),
          quantity: Number(mpItem.quantity),
          gift_name: mpItem.title,
          unit_price: Number(mpItem.unit_price)
        }));

        await prisma.$transaction(async (tx) => {
          await tx.event_gift_transactions.update({
            where: { id: item.id },
            data: { status: 'APPROVED' }
          });

          await tx.event_gift_transaction_items.createMany({
            data: transactionItemsData,
          });

          // Notify client
          emailService.confirmationGift(
            { to: item.guest_email, subject: 'Presente confirmado!' },
            { 
              name: item.guest_name, 
              email: item.guest_email, 
              items: transactionItemsData,
              totalValue: item.total_price
            }
          );
        });
      } catch (error) {
        console.error(`Erro ao processar transação para ID ${item.id}:`, error);
      }
    } else if (transition.status === 'rejected') {
      await prisma.$transaction(async (tx) => {
        await tx.event_gift_transactions.update({
          where: { id: item.id },
          data: { status: 'RECUSED' }
        });

        // Update gifts available
        const giftIds = transition.additional_info.items.map(item => item.id);
        await tx.event_gifts.updateMany({
          where: { id: { in: giftIds } },
          data: { is_available: true },
        });
      });
    }
  }
}

export default MercadoPagoController;
