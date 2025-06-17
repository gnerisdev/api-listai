import cron from 'node-cron';
import prisma from '#prisma';
import { MercadoPagoService } from '../services/MercadoPagoService.js';
import { EmailService } from '../services/EmailService.js';

const mercadoPagoService = new MercadoPagoService();
const emailService = new EmailService();

export function paymentStatusJob() {
  cron.schedule('*/25 * * * *', async () => {
    console.log('Job Payments Mercado Livre');
    
    const pendingTransactions = await prisma.event_gift_transactions.findMany({
      where: { status: 'PENDING' }
    });

    if (pendingTransactions.length < 1) return;

    for (const item of pendingTransactions) {
      try {
        if (!item.reference) continue;
        const transition = await mercadoPagoService.getPaymentByReference(item.reference);

        if (!transition?.status) continue;

        if (transition.status === 'approved') {
          try {
            const transactionItemsData = transition.additional_info.items.map(mpItem => ({
              event_gift_transaction_id: item.id,
              gift_id: Number(mpItem.id),
              quantity: Number(mpItem.quantity),
              gift_name: mpItem.title,
              unit_price: Number(mpItem.unit_price)
            }));

            await prisma.$transaction(async (prismaTransaction) => {
              await prismaTransaction.event_gift_transactions.update({
                where: { id: item.id },
                data: { status: 'APPROVED' }
              });

              await prismaTransaction.event_gift_transaction_items.createMany({
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
      } catch (error) {
        console.error(`Erro ao processar transação ${item.id}:`, error);
      }
    }
  });
}
