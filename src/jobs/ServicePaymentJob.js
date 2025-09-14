import cron from 'node-cron';
import prisma from '#prisma';
import moment from 'moment';
import { MercadoPagoService } from '../services/MercadoPagoService.js';

const mercadoPagoService = new MercadoPagoService();

export function updateEventServiceTransaction() {
  const now = moment();

  cron.schedule('*/200 * * * *', async () => {
    const pendingTransactions = await prisma.event_service_transactions.findMany({
      where: { status: 'PENDING' }
    });

    if (pendingTransactions.length < 1) return;

    for (const item of pendingTransactions) {
      try {
        if (!item?.reference) continue;

        const transition = await mercadoPagoService.getPaymentByReference(item.reference);

        if (!transition && moment(item.expiration_at).isBefore(now)) {
          await prisma.event_service_transactions.delete({ where: { id: item.id } });
          continue;
        }

        if (!transition) continue;

        if (transition.status === 'approved') {
          await prisma.event_service_transactions.update({
            where: { id: item.id },
            data: { status: 'APPROVED' }
          });

          await prisma.event_services.create({
            data: { 
              event_id: item.event_id,
              service_id: item.service_id,
              event_service_transaction_id: item.id,
              total_price: item.total_price,
              quantity: 1
            }
          });
        } else if (transition.status === 'rejected') {
          await prisma.event_service_transactions.update({
            where: { id: item.id },
            data: { status: 'RECUSED' }
          });
        } else if (transition.status === 'cancelled') {
          await prisma.event_service_transactions.update({
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

export function checkApprovedTransactionsForEventService() {
  cron.schedule('*/205 * * * *', async () => { 
    try {
      const status = 'APPROVED';
      const result = await prisma.$queryRaw`
        SELECT * FROM event_service_transactions
        WHERE status = ${status}
        AND id NOT IN (SELECT event_service_transaction_id FROM event_services)
      `;

      if (result.length <= 0) return;
        
      for (const item of result) {
        await prisma.event_services.create({
          data: {
            event_id: item.event_id,
            service_id: item.service_id,
            event_service_transaction_id: item.id,
            total_price: item.total_price,
            quantity: 1
          }
        });
      } 
    } catch (error) {
      console.error('Erro geral no cron job de verificação de transações aprovadas:', error);
    }

    console.log('Verificação de transações APROVADAS sem event_service concluída.');
  });
}