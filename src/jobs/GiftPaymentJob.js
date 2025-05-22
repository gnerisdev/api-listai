import cron from 'node-cron';
import prisma from '#prisma';
import { MercadoPagoService } from '../services/MercadoPagoService.js';

const mercadoPagoService = new MercadoPagoService();

export function paymentStatusJob() {
  cron.schedule('*/100 * * * *', async () => {
    const pendingTransactions = await prisma.event_gift_transactions.findMany({
      where: { status: 'PENDING' }
    });

    if (pendingTransactions.length < 1) return;

    for (const item of pendingTransactions) {
      try {
        const transition = await mercadoPagoService.getPaymentByReference(item.reference);

        if (!transition?.status) continue;

        if (transition.status === 'approved') {
          await prisma.event_gift_transactions.update({
            where: { id: item.id },
            data: { status: 'APPROVED' }
          });
        } else if (transition.status === 'rejected') {
          await prisma.event_gift_transactions.update({
            where: { id: item.id },
            data: { status: 'RECUSED' }
          });
        } else if (transition.status === 'cancelled') {
          await prisma.event_gift_transactions.update({
            where: { id: item.id },
            data: { status: 'CANCELLED' }
          });
        }
      } catch (error) {
        console.error(`Erro ao processar transação ${item.id}:`, error);
      }
    }
  });
}
