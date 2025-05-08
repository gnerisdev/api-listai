import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const prisma = new PrismaClient();

class EventsController {
  async getEvents(req, res) {
    try {
      const { 
        id,
        title, 
        slug, 
        active, 
        startDate, 
        endDate, 
        dateFilterType, 
        page = 1, 
        limit = 20 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Filter
      const filters = [];
      if (id) filters.push({ id:  Number(id) });
      if (title) filters.push({ title: { contains: title } });
      if (slug) filters.push({ slug: { contains: slug } });
      if (active !== undefined) filters.push({ active: JSON.parse(active) });
            
      // Filter Details
      const filtersDetails = [];
      if (dateFilterType === 'eventDate' && startDate && endDate) {
        filtersDetails.push({ 
          event_date: {  gte: new Date(startDate), lte: new Date(endDate) } 
        });
      } else if (dateFilterType === 'createdAt' && startDate && endDate) {
        filters.push({ 
          created_at: { gte: new Date(startDate), lte: new Date(endDate) }
        });
      }

      const where = filters.length > 0 ? { AND: filters } : {};

      const [events, total] = await Promise.all([
        prisma.events.findMany({
          where, skip,
          take: Number(limit),
          orderBy: { created_at: 'desc' },
          include: { 
            users: { include: { 
              user: { select: { id: true, first_name: true, last_name: true } } 
            }},
            event_details: filtersDetails.length > 0
              ? { where: { AND: filtersDetails } }
              : true 
          }
        }), 
        prisma.events.count({ where }), 
      ]);

      const eventsFormatted = events.map(event => {
        const user = event.users[0]?.user || null;
        delete event.users; 
        return { ...event, user };
      });

      return res.status(200).json({
        success: true,
        events: FormatUtils.toCamelCase(eventsFormatted),
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        total,
      });

    } catch (error) {
      LogUtils.errorLogger(error);
      return res
        .status(500)
        .json({ success: false, message: 'Erro ao buscar evento(s).' });
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
