import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';

const prisma = new PrismaClient();

class ServicesController {
  async getServices(req, res) {
    try {
      const services = await prisma.services.findMany({ where: { active: true } });
      return res.status(200).json({ success: true, services: FormatUtils.toCamelCase(services) });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar serviços' });
    }
  }

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
          success: 'http://localhost:3001/users/service-package',
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
}

export default ServicesController;
