import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';

const prisma = new PrismaClient();

class ServicesController {
  async initiatePayment(req, res) {
    try {
      const serviceId = parseInt(req.body.serviceId);
      const eventId = parseInt(req.body.eventId);
      const userId = parseInt(req.headers.user_id);
      const service = await prisma.services.findUnique({ where: { id: serviceId } });

      const reference = `user_${userId}_service_${service.id}_event_${eventId}`;
      const mercadoPagoService = new MercadoPagoService();
      const preference = await mercadoPagoService.getPreference(
        {
          title: service.name,
          description: service.description,
          unit_price: service.price,
          currency_id: 'BRL',
          quantity: 1
        },
        {
          success: 'https://localhost:3001/users/service-package',
          failure: 'http://localhost:3001/users/service-package',
          pending: 'http://localhost:3001/users/service-package'
        },
        reference
      );

      // save transition
      await prisma.user_transitions.create({
        data: {
          service_id: service.id,
          total_price: service.price,
          reference: reference,
          user_id: userId,
          event_id: eventId,
          status: 'PENDING'
        }
      });

      return res.status(200).json({ success: true, paymentLink: preference.init_point });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao serviços' });
    }
  }

  // Webhook Mercado Pago
  async paymentNotificationMercadoPago(req, res) {
    try {
      const paymentId = req.body?.data?.id;

      const mercadoPago = new MercadoPagoService();
      const payment = await mercadoPago.getPaymentById(paymentId);

      if (payment.external_reference) {
        const transition = await prisma.user_transitions.findFirst({
          where: { reference: payment.external_reference }
        });

        payment.status = 'approved'

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

export default ServicesController;
