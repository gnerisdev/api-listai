import moment from 'moment-timezone';
import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const prisma = new PrismaClient();

class EventCategoriesController {
  async createCategory(req, res) {
    try {
      const { name, description, eventTypeId } = req.body;
      const messages = [];

      // Verify
      if (!name || name.trim() === '') messages.push('Nome é obrigatório.');
      if (!description || description.trim() === '') messages.push('Descrição é obrigatório.');
      if (!eventTypeId) messages.push('Nenhum tipo de evento associado.');
      if (messages.length > 0) {
        return res.status(400).json({
          success: false,
          message: `${messages.map(error => `• ${error}`).join('\n <br>')}`
        });
      }

      const category = await prisma.event_categories.create({
        data: {
          name: name.trim(),
          description: description,
          event_type_id: Number(eventTypeId)
        }
      });

      return res.status(200).json({
        success: true,
        eventCategory: FormatUtils.toCamelCase(category),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao salvar categoria.' });
    }
  }

  async updateCategory(req, res) {
    try {
      const eventCategoryId = parseInt(req.params.event_category_id);
      const { active, name, description, eventTypeId } = req.body;
      const messages = [];

      // Validate fields
      if (!name || name.trim() === '') messages.push('Nome é obrigatório.');
      if (!description || description.trim() === '') messages.push('Descrição é obrigatória.');

      if (messages.length > 0) {
        return res.status(400).json({
          success: false,
          message: messages.map(error => `• ${error}`).join('\n <br>')
        });
      }

      // Update
      const updatedCategory = await prisma.event_categories.update({
        where: { id: eventCategoryId },
        data: {
          name: name.trim(),
          description: description.trim(),
          event_type_id: parseInt(eventTypeId),
          active: JSON.parse(active)
        }
      });

      return res.status(200).json({
        success: true,
        eventCategory: FormatUtils.toCamelCase(updatedCategory),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Failed to update event type' });
    }
  }

  async deleteCategory(req, res) {
    try {
      const eventCategoryId = parseInt(req.params.event_category_id);

      await prisma.event_categories.update({
        where: { id: eventCategoryId },
        data: { delete_at: moment().tz('America/Sao_Paulo').toDate() }
      });

      return res.status(200).json({ success: true, message: 'Removido com sucesso.' });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao remover evento' });
    }
  }
}

export default EventCategoriesController;
