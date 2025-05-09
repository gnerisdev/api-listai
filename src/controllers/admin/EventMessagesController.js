import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const prisma = new PrismaClient();

class EventMessagesController {
  async getMessages(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const messages = await prisma.event_messages.findMany({ where: { event_id: eventId } });

      return res.status(200).json({
        success: true,
        messages: FormatUtils.toCamelCase(messages),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao recuperar mensagens do evento.'
      });
    }
  }

  async removeMessage(req, res) {
    try {
      const messageId = parseInt(req.params.message_id);  
      await prisma.event_messages.delete({ where: { id: messageId } });
  
      return res.status(200).json({
        success: true,
        message: 'Mensagem excluída com sucesso.',
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao excluir mensagem.',
      });
    }
  }
}

export default EventMessagesController;
