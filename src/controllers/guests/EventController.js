import prisma from '#prisma';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { LogUtils } from '../../utils/LogUtils.js';
import { MathUtils } from '../../utils/MathUtils.js';

class EventController {
  async getEvent(req, res) {
    try {
      const slug = req.params.slug;  

      // Get event e settings
      const [event, settings] = await Promise.all([
        prisma.events.findFirst({
          where: { slug: slug, },
          include: { 
            event_gallery: true, 
            event_details: true,
            event_gifts: { select: { is_available: true, gift: true } },
          },
        }),
        prisma.settings.findFirst()
      ]);

      // Verify event e settings
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Evento não encontrado.' 
        });
      }

      if (!settings) {
        return res.status(404).json({ 
          success: false, 
          message: 'Erro ao carregar Evento.' 
        });
      }

      // Format data
      const gifts = event.event_gifts;
      const percentage = settings.percentage_gift;
      const formatGifts = gifts.map(item => {
        return {
          ...item.gift,
          is_available: item.is_available,
          price: MathUtils.addPercentage(item.gift.price, percentage),
        };
      });

      const data = {
        id: event.id,
        subtitle: event.subtitle,
        slug: event.slug,
        title: event.title,
        titleDescription: event.title_description,
        description: event.description,
        color: event.color,
        gallery: event.event_gallery,
        details: event.event_details[0],
        bannerUrl: event.banner_url,
        avatarUrl: event.avatar_url,
        gifts: formatGifts
      }
  
      return res.status(200).json({ 
        success: true, 
        message: 'Sucesso.', 
        event: FormatUtils.toCamelCase(data)
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error, 'Erro ao buscar evento.');
      return res.status(500).json({ success: false, message: 'Erro ao buscar evento.' });
    }
  }

  async sendMessage(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const { firstName, lastName, email, message } = req.body;
  
      if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos os campos são obrigatórios.' 
        });
      }
  
      const existing = await prisma.event_messages.findFirst({ where: { event_id: eventId, email } });
  
      if (existing) {
        return res.status(409).json({ 
          success: false, 
          message: 'Este e-mail já enviou uma mensagem para este evento.' 
        });
      }
  
      await prisma.event_messages.create({
        data: { event_id: eventId, first_name: firstName, last_name: lastName, email, message },
      });
  
      return res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso.' });
    } catch (error) {
      LogUtils.errorLogger(
        error, 
        `Erro ao enviar recado para o evento de ID: ${req.params.event_id || 'Desconhecido'}`
      );
      return res.status(500).json({ success: false, message: 'Erro ao enviar mensagem.' });
    }
  }
  
  async confirmPresence(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const { firstName, lastName, email, phoneNumber } = req.body;
      if (!firstName || !lastName || !email || !phoneNumber) {
        return res.status(400).json({ 
          success: false,
          message: 'Todos os campos são obrigatórios.' 
        });
      }
  
      const existing = await prisma.event_guests.findFirst({ where: { event_id: eventId, email } });
      if (existing) {
        return res.status(409).json({ 
          success: false, 
          message: 'Este e-mail já confirmou presença neste evento.' 
        });
      }
  
      await prisma.event_guests.create({ data: { 
        event_id: eventId, 
        first_name: firstName, 
        last_name: lastName, 
        phone_number: phoneNumber,
        email, 
      }});
  
      return res.status(200).json({ success: true, message: 'Presença confirmada com sucesso.' });
    } catch (error) {
      LogUtils.errorLogger(
        error, 
        `Erro ao confirmar presença recado para o evento de ID: ${req.params.event_id || 'Desconhecido'}`
      );
      return res.status(500).json({ success: false, message: 'Erro ao confirmar presença.' });
    }
  }  
}

export default EventController;
