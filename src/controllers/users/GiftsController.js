import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const prisma = new PrismaClient();

class GiftsController {
  async getGifts(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);

      // Verify user e event
      const response = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId, },
        include: { event: true, },
      });

      if (!response.event) {
        return res.status(404).json({ uccess: false, message: 'Evento não encontrado.' });
      }

      // Gets gifts by event
      const events = await prisma.events_gifts.findMany({
        where: { event_id: eventId, deleted_at: null },
        include: { gift: true },
      });

      // Get GiftSuggestions
      const giftSuggestions = await prisma.gift_suggestions.findMany({
        where: { event_id: eventId, user_id: userId }
      });

      const gifts = events.map(item => (item.gift));

      return res.status(200).json({ success: true, message: 'Sucesso.', gifts, giftSuggestions });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar lista de presentes.' });
    }
  }

  async addGiftSuggestion(req, res) {
    try {
      const userId = Number(req.headers.user_id);
      const eventId = Number(req.params.event_id);
      const { title, description } = req.body;

      if (!title || title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: 'Nome do presente é obrigatório.'
        });
      }

      const userEvent = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!userEvent || !userEvent.event) {
        return res.status(404).json({
          success: false,
          message: 'Evento não encontrado ou usuário não participa deste evento.'
        });
      }

      await prisma.gift_suggestions.create({
        data: {
          event_id: eventId,
          user_id: userId,
          title: title.trim(),
          description: description?.trim()
        }
      });

      const giftSuggestions = await prisma.gift_suggestions.findMany({
        where: {
          event_id: eventId,
          user_id: userId,
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Sugestão de presente adicionada com sucesso.',
        giftSuggestions: giftSuggestions,
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao adicionar sugestão de presente.'
      });
    }
  }

  async removeGift(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);
      const giftId = parseInt(req.params.gift_id);

      const eventOwner = await prisma.users_events.findFirst({ 
        where: { event_id: eventId, user_id: userId } 
      });
      if (!eventOwner) {
        return res.status(403).json({ 
          success: false,
          message: 'Apenas o criador do evento pode remover itens da lista de presentes.' 
        });
      }

      const activeGiftsCount = await prisma.events_gifts.count({
        where: { event_id: eventId, deleted_at: null }
      });
      if (activeGiftsCount <= 4) {
        return res.status(400).json({
          success: false,
          message: 'Você precisa ter no mínimo quatro presentes para manter sua lista ativa.'
        });
      }

      await prisma.events_gifts.update({
        where: { event_id_gift_id: { event_id: eventId, gift_id: giftId } },
        data: { deleted_at: new Date() }
      });

      const eventGifts = await prisma.events_gifts.findMany({
        where: { event_id: eventId, deleted_at: null },
        include: { gift: true },
      });
      const gifts = eventGifts.map(item => (item.gift));

      return res.status(200).json({ 
        success: true, 
        message: 'Sucesso.', 
        gifts: FormatUtils.toCamelCase(gifts) 
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao remover item.' });
    }
  }
}

export default GiftsController;
