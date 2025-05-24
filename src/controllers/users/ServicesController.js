import moment from 'moment-timezone';
import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';

class ServicesController {
  async getServices(req, res) {
    try {
      const userId = parseInt(req.headers['x-user-id']);
      const eventId = parseInt(req.params.event_id);

      const services = await prisma.services.findMany({ where: { active: true } });
      const servicesContracted  = await prisma.event_services.findMany({ 
        where: { event_id: eventId },
        include: { service: true },
      });

      const servicesDefault = [];
      const servicesTurbo = [];

      for (const service of services) {
        service.is_default ? servicesDefault.push(service) : servicesTurbo.push(service);
      }

      return res.status(200).json({ 
        success: true, 
        services: FormatUtils.toCamelCase({
          turbo: servicesTurbo,
          default: servicesDefault,
          contracted: servicesContracted.map(item => item.service)
        }) 
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar serviços' });
    }
  }

  async getPendingPaymentServices(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);

      if (isNaN(eventId)) {
        return res.status(400).json({ success: false, message: 'ID do evento inválido.' });
      }

      const pendingServices = await prisma.event_service_transactions.findMany({
        where: { event_id: eventId, status: 'PENDING', },
        include: { service: true },
      });

      const data = pendingServices.map(item => ({ 
        ...item.service, 
        expiration_at: item.expiration_at 
      }));

      return res.status(200).json({
        success: true,
        pendingServices: FormatUtils.toCamelCase(data),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar serviços pendentes de pagamento.' });
    }
  }

  async initiatePayment(req, res) {
    try {
      const serviceId = parseInt(req.body.serviceId);
      const eventId = parseInt(req.body.eventId);
      const service = await prisma.services.findUnique({ where: { id: serviceId } });

      // Expiration Date
      const expirationDate =  moment().tz('America/Sao_Paulo').add(2, 'hours').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

      // save transition
      const eventServiceTransaction = await prisma.event_service_transactions.create({
        data: {
          service_id: service.id,
          event_id: eventId,
          total_price: service.price,
          reference: '',
          expiration_at: expirationDate,
          status: 'PENDING'
        }
      });

      // Reference
      const reference = `event_service_transaction_${eventServiceTransaction.id}`;

      await prisma.event_service_transactions.update({
        where: { id: eventServiceTransaction.id },
        data: { reference }
      });

      // Init payment Mercado Pago
      const mercadoPagoService = new MercadoPagoService();
      const preference = await mercadoPagoService.getPreference({
        items: [{
          title: service.name,
          description: service.description,
          unit_price: service.price,
          currency_id: 'BRL',
          quantity: 1
        }],
        back_urls: {
          success: 'https://painel.mimon.com.br/',
          failure: 'https://painel.mimon.com.br/',
          pending: 'https://painel.mimon.com.br/'
        },
        external_reference: reference,
        auto_return: 'approved',
        expiration_date_to: expirationDate
      });

      return res.status(200).json({ success: true, paymentLink: preference.init_point });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao serviços' });
    }
  }
}

export default ServicesController;
