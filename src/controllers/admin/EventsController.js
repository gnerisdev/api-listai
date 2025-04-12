import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const prisma = new PrismaClient();

class EventsController {
  async getEvents(req, res) {
    try {
      const { filters } = req.body;

      const events = await prisma.events.findMany({ include: { users: { include: { user: true} } } });
      const eventsData = events.map(event => ({
        ...event,
        userName: `${event.users[0].user.first_name} ${event.users[0].user.last_name}`,
        userId: event.users[0].user_id
      }));

      return res.status(200).json({ success: true, events: FormatUtils.toCamelCase(eventsData) });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar eventos.' });
    }
  }

  async getDetails(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const event = await prisma.events.findUnique({ 
        where: { id: eventId },
        include: { event_details: true }
      });

      if (!event) {
        return res.status(404).json({ success: true, message: 'Erro ao buscar dados.' });
      }

      let details;
      if (event.event_details.length > 0) {
        details = event.event_details[0];
        details.event_date = FormatUtils.toDate(details.event_date);  
        details.start_time = FormatUtils.toTime(details.start_time);
        details.end_time = FormatUtils.toTime(details.end_time);
      }

      event.details = details; 
      delete event.event_details;
  
      return res.status(200).json({ success: true, event: FormatUtils.toCamelCase(event) });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar detalhes de eventos.' });
    }
  }
  
  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.user_id);
      const { first_name, last_name, email, phone_number, active } = req.body;

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: { first_name, last_name, email, phone_number, active },
      });

      return res.status(200).json({ success: true, message: 'Usuário atualizado com sucesso.', user: updatedUser });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar usuário.' });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.user_id);
      await prisma.users.delete({ where: { id: userId } });
      return res.status(200).json({ success: true, message: 'Usuário removido com sucesso.' });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao remover usuário.' });
    }
  }

  async getUserEvents(req, res) {
    try {
      const userId = parseInt(req.params.user_id);
  
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          events: {
            select: {
              event: {
                select: {
                  id: true,
                  title: true,
                  subtitle: true,
                  date: true,
                  location: true,
                  description: true,
                  color: true,
                },
              },
            },
          },
        },
      });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }
  
      const events = user.events.map((userEvent) => ({
        id: userEvent.event.id,
        title: userEvent.event.title,
        subtitle: userEvent.event.subtitle,
        date: userEvent.event.date,
        location: userEvent.event.location,
        description: userEvent.event.description,
        color: userEvent.event.color,
      }));
  
      return res.status(200).json({ success: true, events });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar eventos do usuário.' });
    }
  }
  
}

export default EventsController;
