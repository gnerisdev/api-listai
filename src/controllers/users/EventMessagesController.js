import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class EventMessagesController {
  async getMessages(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);

      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }

      const messages = await prisma.event_messages.findMany({ where: { event_id: eventId } });

      return res.status(200).json({
        success: true,
        messages: FormatUtils.toCamelCase(messages),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao recuperar lista de confirmados.'
      });
    }
  }

  async removeMessage(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);
      const messageId = parseInt(req.params.message_id);
  
      const event = await prisma.users_events.findFirst({ where: { user_id: userId, event_id: eventId } });
      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }
  
      // Remove
      await prisma.event_messages.delete({ where: { id: messageId } });
  
      return res.status(200).json({
        success: true,
        message: 'Convidado removido com sucesso.',
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover convidado.',
      });
    }
  }
  
}

export default EventMessagesController;
