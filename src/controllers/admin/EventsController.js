import moment from 'moment-timezone';
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

  async getEvent(req, res) {
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

  async updatedEvent(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const {
        title,
        subtitle,
        slug,
        active,
        titleDescription,
        description,
        color,
        details,
      } = req.body;

      // Check slug 
      const findSlug = await prisma.events.findFirst({ where: { 
        slug: slug,
        id: { not: eventId }
      }});

      if (findSlug) {
        return res.status(400).json({ 
          success: false, 
          message: 'A URL informada já está cadastrada.' 
        });
      }

      // Format Details data
      const detailsData = {
        event_date: details?.eventDate
          ? moment.tz(details.eventDate, 'YYYY-MM-DD', 'America/Sao_Paulo').toDate()
          : undefined,
        start_time: details?.startTime
          ? moment.tz(details.startTime, 'HH:mm', 'America/Sao_Paulo').toDate()
          : undefined,
        end_time: details?.endTime
          ? moment.tz(details.endTime, 'HH:mm', 'America/Sao_Paulo').toDate()
          : undefined,
        event_location: details?.eventLocation,
        event_type: details?.eventType,
        full_address: details?.fullAddress,
        latitude: details?.latitude || null,
        longitude: details?.longitude || null,
        postal_code: details?.postalCode || null,
        transmission: details?.transmission,
        transmission_link: details?.transmissionLink,
        transmission_password: details?.transmissionPassword,
        updated_at: moment().tz('America/Sao_Paulo').toDate(),
      };

      // Save
      const [eventUpdate, detailsUpdate] = await Promise.all([
        prisma.events.update({
          where: { id: eventId },
          data: {
            title,
            subtitle,
            slug,
            active: JSON.parse(active),
            title_description: titleDescription,
            description,
            color,
            updated_at: moment().tz('America/Sao_Paulo').toDate(),
          },
        }),
        prisma.event_details.upsert({
          where: { id: details.id || -1 },
          update: detailsData,
          create: {
            ...detailsData, 
            event_id: eventId,
            created_at: moment().tz('America/Sao_Paulo').toDate() 
          },
        })
      ]);

      return res.status(200).json({ success: true, message: 'Evento atualizado.' });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      return res
        .status(500)
        .json({ success: false, message: 'Erro ao atualizar evento.' });
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
}

export default EventsController;
