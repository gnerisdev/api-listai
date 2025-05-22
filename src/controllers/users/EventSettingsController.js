import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class EventSettingsController {
  async getSettings(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const userId = parseInt(req.headers['user_id']);

      // Verify permission
      const userEvent = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId }
      });

      if (!userEvent) {
        return res.status(403).json({ success: false, message: 'Evento não encontrado.' });
      }

      // Get settings
      const eventSettings = await prisma.events.findFirst({
        where: { id: eventId },
        select: {
          slug: true,
          show_gift_list: true,
          show_guest_messages: true,
          show_event_info: true,
          allow_guest_confirmation: true
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Configurações do evento recuperadas com sucesso.',
        settings: FormatUtils.toCamelCase(eventSettings),
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar configurações.' });
    }
  }

  async update(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const userId = parseInt(req.headers.user_id);
      const {
        showGiftList,
        showGuestMessages,
        showEventInfo,
        allowGuestConfirmation,
        slug,
        password 
      } = req.body;

      const userEvent = await prisma.users_events.findFirst({ 
        where: { user_id: userId, event_id: eventId }
      });

      if (!userEvent) {
        return res.status(403).json({ success: false, message: 'Evento não encontrado ou você não tem permissão para atualizá-lo.' });
      }

      const currentEventSettings = await prisma.events.findUnique({
        where: { id: eventId },
        select: { slug: true, password: true },
      });

      if (!currentEventSettings) {
        return res.status(404).json({ 
          success: false, 
          message: 'Configurações do evento não encontradas.' 
        });
      }

      if (slug && slug !== currentEventSettings.slug) {
        const existingEventWithSlug = await prisma.events.findUnique({ where: { slug: slug } });

        if (existingEventWithSlug && existingEventWithSlug.id !== eventId) {
          return res.status(409).json({ 
            success: false, 
            message: 'Esta URL já está em uso por outro evento. Por favor, escolha outro.' 
          });
        }
      }

      const updateData = {
        show_gift_list: showGiftList,
        show_guest_messages: showGuestMessages,
        show_event_info: showEventInfo,
        allow_guest_confirmation: allowGuestConfirmation,
      };

      if (slug && slug !== currentEventSettings.slug) updateData.slug = slug;
      if (password) updateData.password = password; 

      await prisma.events.update({ where: { id: eventId }, data: updateData });

      return res.status(200).json({ success: true, message: 'Configurações do evento atualizadas com sucesso.' });

    } catch (error) {
      console.error(error);
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar configurações do evento.' });
    }
  }
}

export default EventSettingsController;
