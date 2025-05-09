import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';

const prisma = new PrismaClient();

class EventSettingsController {
  async getSettings(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const userId = parseInt(req.headers['user_id']);

      if (!userId || isNaN(userId) || !eventId || isNaN(eventId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'IDs de usuário ou evento inválidos.' 
        });
      }
      const userEvent = await prisma.users_events.findFirst({
        where: { 
          user_id: userId, 
          event_id: eventId 
        }
      });

      if (!userEvent) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso não autorizado.' 
        });
      }

      const eventSettings = await prisma.event_settings.findFirst({
        where: {
          user_id: userId,
          event_id: eventId,
        },
        include: {
          event: true
        },
      });
      
      if (!eventSettings) {
        eventSettings = await prisma.event_settings.create({
          data: {
            user_id: userId,
            event_id: eventId,
            show_gift_list: true,
            show_guest_messages: true,
            show_event_info: true,
            allow_guest_confirmation: true
          },
          include: {
            event: true
          }
        });
      }
    
      const event = await prisma.users_events.findFirst({
        where: { 
          user_id: userId, 
          event_id: eventId 
        },
        include: { 
          event: true 
        },
      });

      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Evento não encontrado.' 
        });
      }

      if (!eventSettings) {
        return res.status(404).json({ 
          success: false, 
          message: 'Configurações do evento não encontradas.' 
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Configurações do evento recuperadas com sucesso.',
        eventSettings: {
          id: eventSettings.id,
          event_id: eventSettings.event_id,
          show_gift_list: eventSettings.show_gift_list,
          show_guest_messages: eventSettings.show_guest_messages,
          show_event_info: eventSettings.show_event_info,
          allow_guest_confirmation: eventSettings.allow_guest_confirmation,
        },
  
      });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar configurações do evento.' 
      });
    }
  }

  async update(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const { 
        show_gift_list, 
        show_guest_messages, 
        show_event_info, 
        allow_guest_confirmation } = req.body;

      if (!eventId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Evento não fornecido.' 
        });
      }

      if (typeof show_gift_list !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Valor de show_gift_list inválido.' });
      }

      if (typeof show_guest_messages !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Valor de show_guest_messages inválido.' });
      }

      if (typeof show_event_info !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Valor de show_event_info inválido.' });
      }

      if (typeof allow_guest_confirmation !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Valor de allow_guest_confirmation inválido.' });
      }

      const existingSettings = await prisma.event_settings.findUnique({ where: { event_id: eventId } });

      if (!existingSettings) {
        return res.status(404).json({ success: false, message: 'Configurações do evento não encontradas.' });
      }

      const updatedSettings = await prisma.event_settings.update({
        where: { event_id: eventId },
        data: {
          show_gift_list,
          show_guest_messages,
          show_event_info,
          allow_guest_confirmation,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Configurações do evento atualizadas com sucesso.',
        eventSettings: {
          id: updatedSettings.id,
          event_id: updatedSettings.event_id,
          show_gift_list: updatedSettings.show_gift_list,
          show_guest_messages: updatedSettings.show_guest_messages,
          show_event_info: updatedSettings.show_event_info,
          allow_guest_confirmation: updatedSettings.allow_guest_confirmation,
        }
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar configurações do evento.' });
    }
  }
}

export default EventSettingsController;
