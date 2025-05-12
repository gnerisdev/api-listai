import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';

class MercadoPagoController {
  async paymentNotification(req, res) {
    try {
      const paymentId = req.body?.data?.id;

      const mercadoPago = new MercadoPagoService();
      const payment = await mercadoPago.getPaymentById(paymentId);

      if (payment.external_reference) {
        const transition = await prisma.user_transitions.findFirst({
          where: { reference: payment.external_reference }
        });

        payment.status = 'approved'

        console.log(payment)

        if (payment.status === 'approved') {
          await prisma.$transaction(async () => {
            const service = await prisma.services.findUnique({ where: { id: transition.service_id } });
            const data = {
              total_price: service.price,
              quantity: service.quantity,
              service_id: service.id,
              user_transition_id: transition.id,
              event_id: transition.event_id,
            };

            await prisma.event_services.upsert({
              where: { user_transition_id: transition.id }, 
              update: data, create: data
            });

            await prisma.user_transitions.update({
              where: { id: transition.id }, 
              data: { status: 'APPROVED' }
            });
          });
        }

        if (payment.status === 'rejected') {
          await prisma.user_transitions.update({
            where: { id: transition.id },
            data: { status: 'RECUSED' }
          });
        }
      }
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
    } finally {
      res.sendStatus(200);
    }
  }
}

export default MercadoPagoController;
