import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';

const prisma = new PrismaClient();

class UserController {
  async fetchUserProfile(req, res) {  
    try {
      const userId = parseInt(req.headers.user_id);
  
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Usuário não fornecido.' });
      }
  
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          active: true,
          events: {
            include: { event: true, },
            orderBy: { created_at: 'desc', },
            take: 1, 
          },
        },
      });
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }
  
      let event;
      if (user.last_event_id) {
        event = user.events.find(event => event.id === user.last_event_id).event;
      } else {
        event = user.events[0].event;
      }

      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }

      const eventData = {
        id: event.id,
        title: event.title,
        subtitle: event.subtitle,
        titleDescription: event.title_description,
        description: event.description,
        color: event.color
      };

      delete user.events;

      return res.status(200).json({
        success: true,
        message: 'Perfil carregado com sucesso!',
        event: eventData,
        user
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar perfil.' });
    }
  }
}

export default UserController;
