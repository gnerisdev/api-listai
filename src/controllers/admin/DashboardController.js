import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';

class DashboardController {
  async retrieveEventData(req, res) {
    try {
      const [totalEvents, totalGifts, totalPendingPayouts] = await Promise.all([
        prisma.events.count({ where: { active: true } }),
        prisma.gifts.count({ where: { active: true } }),
        prisma.payout_requests.count({ where: { status: 'PENDING' } }),
      ]);

      return res.status(200).json({
        success: true,
        totals: {
          events: totalEvents,
          gifts: totalGifts,
          pendingPayouts: totalPendingPayouts,
        },
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar totais do dashboard' });
    }
  }
}

export default DashboardController;