import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';

const prisma = new PrismaClient();

class EventController {
  async getEvent(req, res) {
    try {
      const userId = parseInt(req.headers.user_id); 
      const eventId = parseInt(req.params.event_id); 
      console.log(req.params, '-------')
  
      const response = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId, },
        include: { event: true, },
      });

      if (!response.event) {
        return res.status(404).json({ uccess: false, message: 'Evento não encontrado.' });
      }

      const data = {
        id: response.event.id,
        title: response.event.title,
        subtitle: response.event.subtitle,
        titleDescription: response.event.title_description,
        description: response.event.description,
        color: response.event.color
      };
  
      return res.status(200).json({ success: true, message: 'Sucesso.', event: data });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar evento.' });
    }
  }  
  
  async updateEvent(req, res) {  
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id); 
      const { title, subtitle, titleDescription, description, color } = req.body;
      
      // Validation
      const messages = [];
      const titleValidation = ValidationUtils.title(title);
      const subtitleValidation = ValidationUtils.subtitle(subtitle);
      const titleDescriptionValidation = ValidationUtils.titleDescription(titleDescription);
      const descriptionValidation = ValidationUtils.description(description);
      const colorValidation = ValidationUtils.hexColor(color);
      
      if (titleValidation !== true) messages.push(titleValidation);
      if (subtitleValidation !== true) messages.push(subtitleValidation);
      if (titleDescriptionValidation !== true) messages.push(titleDescriptionValidation);
      if (descriptionValidation !== true) messages.push(descriptionValidation);
      if (colorValidation !== true) messages.push(colorValidation);
    
      if (messages.length > 0) {
        return res.status(400).json({
          success: false, 
          message: `${messages.map(error => `• ${error}`).join('\n <br>')}`
        });
      }
      
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Usuário não fornecido.' });
      }
  
      // Get event
      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true, }, 
      });
  
      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }
  
      // Update
      const updatedEvent = await prisma.events.update({
        where: { id: event.event.id }, 
        data: { title, subtitle, title_description: titleDescription, description, color },
      });

      const eventData = {
        id: updatedEvent.id,
        title: updatedEvent.title,
        subtitle: updatedEvent.subtitle,
        titleDescription: updatedEvent.title_description,
        description: updatedEvent.description,
        color: updatedEvent.color
      };
  
      return res.status(200).json({
        success: true, 
        message: 'Evento atualizado com sucesso!', 
        event: eventData,
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar evento.' });
    }
  }  
}

export default EventController;
