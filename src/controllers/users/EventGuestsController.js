import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const prisma = new PrismaClient();

class EventGuestsController {
  async getConfirmPresence(req, res) {
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

      const confirmations = await prisma.event_guests.findMany({
        where: { event_id: eventId },
      });

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

  async saveGuest(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);
      const guestId = parseInt(req.params.guest_id);

      const { firstName, lastName, email, phoneNumber } = req.body;

      if (!firstName || !lastName || !email || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios não preenchidos.'
        });
      }

      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }

      let guest;

      if (guestId) {
        // Update
        guest = await prisma.event_guests.update({
          where: { id: guestId },
          data: {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phoneNumber,
          },
        });
      } else {
        // Create
        guest = await prisma.event_guests.create({
          data: {
            event_id: eventId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phoneNumber,
          },
        });
      }

      return res.status(200).json({
        success: true,
        guest: FormatUtils.toCamelCase(guest),
        message: guestId 
          ? 'Convidado atualizado com sucesso.' 
          : 'Convidado adicionado com sucesso.',
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar convidado.',
      });
    }
  }

  async removeGuest(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);
      const guestId = parseInt(req.params.guest_id);
  
      const event = await prisma.users_events.findFirst({ where: { user_id: userId, event_id: eventId } });
      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }
  
      const guest = await prisma.event_guests.findFirst({  where: { id: guestId, event_id: eventId } });
      if (!guest) {
        return res.status(404).json({ success: false, message: 'Convidado não encontrado.' });
      }
  
      // Remove
      await prisma.event_guests.delete({ where: { id: guestId } });
  
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

export default EventGuestsController;
