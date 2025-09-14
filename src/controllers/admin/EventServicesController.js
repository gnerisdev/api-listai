import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class EventServicesController {
  async getDefaultServices(req, res) {
    try {
      const allServices = await prisma.services.findMany({
        where: { deleted_at: null, active: true, is_default: true },
      });

      return res.status(200).json({
        success: true,
        servicesDefault: FormatUtils.toCamelCase(allServices),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar serviços disponíveis.' });
    }
  }

  async getContractedServices(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);

      if (isNaN(eventId)) {
        return res.status(400).json({ success: false, message: 'ID do evento inválido.' });
      }

      const contractedServices = await prisma.event_services.findMany({
        where: { event_id: eventId },
        include: { service: true },
      });

      return res.status(200).json({
        success: true,
        contractedServices: FormatUtils.toCamelCase(contractedServices.map(item => item.service)),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar serviços contratados do evento.' });
    }
  }

  async getPendingPaymentServices(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);

      if (isNaN(eventId)) {
        return res.status(400).json({ success: false, message: 'ID do evento inválido.' });
      }

      const pendingTransactions = await prisma.event_service_transactions.findMany({
        where: { event_id: eventId, status: 'PENDING' },
        include: { service: true },
      });

      const pendingServices = pendingTransactions.map(item => ({
        ...item.service,
        expiration_at: item.expiration_at,
        transaction_status: item.status
      }));

      return res.status(200).json({
        success: true,
        pendingServices: FormatUtils.toCamelCase(pendingServices),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar serviços pendentes de pagamento.' });
    }
  }
}

export default EventServicesController;