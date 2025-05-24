import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class UserController {
  async fetchUserProfile(req, res) {  
    try {
      const userId = parseInt(req.headers['x-user-id']);
  
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

      delete user.events;

      return res.status(200).json({
        success: true,
        message: 'Perfil carregado com sucesso!',
        event: FormatUtils.toCamelCase(event),
        user
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar perfil.' });
    }
  }
}

export default UserController;
