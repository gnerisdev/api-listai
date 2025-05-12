import cron from 'node-cron';
import prisma from '#prisma';
import { MercadoPagoService } from '../services/MercadoPagoService.js';

const mercadoPagoService = new MercadoPagoService();

export function paymentStatusJob() {
  cron.schedule('*/1 * * * *', async () => {
    const pendingTransactions = await prisma.guest_transitions.findMany({
      where: { status: 'PENDING' }
    });

    if (pendingTransactions.length < 1) return;

    for (const item of pendingTransactions) {
      try {
        const transition = await mercadoPagoService.getPaymentByReference(item.reference);

        if (transition.status === 'approved') {
          await prisma.guest_transitions.update({
            where: { id: item.id },
            data: { status: 'APPROVED' }
          });
        } else if (transition.status === 'rejected') {
          await prisma.guest_transitions.update({
            where: { id: item.id },
            data: { status: 'RECUSED' }
          });
        } else if (transition.status === 'cancelled') {
          await prisma.guest_transitions.update({
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
