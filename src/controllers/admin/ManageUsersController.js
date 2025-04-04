import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';

const prisma = new PrismaClient();

class ManageUsersController {
  async listUsers(req, res) {
    try {
      const users = await prisma.users.findMany();
      const usersData = users.map(user => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        active: user.active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));

      return res.status(200).json({ success: true, users: usersData });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao listar usuários.' });
    }
  }

  async getUser(req, res) {
    try {
      const userId = parseInt(req.params.user_id);
      const user = await prisma.users.findUnique({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }

      const userData = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        active: user.active,
      };

      return res.status(200).json({ success: true, user: userData });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuário.' });
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

export default ManageUsersController;
