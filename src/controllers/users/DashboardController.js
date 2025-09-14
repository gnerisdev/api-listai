import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';

class DashboardController {
  async retrieveEventData(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);       

      const [guests, payout, messages] = await Promise.all([
        prisma.event_guests.count({ where: { event_id: eventId } }),
        prisma.payout_requests.count({ where: { event_id: eventId } }),
        prisma.event_messages.count({ where: { event_id: eventId } }),
      ]);

      return res.status(200).json({
        success: true,
        totals: { guests, payout, messages },
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar totais do dashboard' });
    }
  }
}

export default DashboardController;