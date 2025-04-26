import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const prisma = new PrismaClient();

class EventGuestsController {
  async getConfirmPresence(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);

      // Verify user permission event
      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }

      const confirmations = await prisma.event_guests.findMany({ where: { event_id: eventId } });

      return res.status(200).json({
        success: true,
        guests: FormatUtils.toCamelCase(confirmations),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao recuperar lista de confirmados.'
      });
    }
  }
}

export default EventGuestsController;
