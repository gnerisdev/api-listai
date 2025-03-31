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
      console.log({ title, subtitle, titleDescription, description, color })
  
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

  async getEventDetails(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id);
  
      // Validation
      if (!userId || !eventId) {
        return res.status(400).json({ success: false, message: 'Parâmetros ausentes ou inválidos.' });
      }
  
      // Verify user permission event
      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });
  
      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }
  
      const eventDetails = await prisma.event_details.findFirst({ where: { event_id: eventId } });
  
      return res.status(200).json({
        success: true,
        message: 'Detalhes do evento recuperados com sucesso!',
        eventDetails,
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao recuperar os detalhes do evento.' 
      });
    }
  }
  

  async createEventDetails(req, res) {
    try {
      const userId = parseInt(req.headers.user_id);
      const eventId = parseInt(req.params.event_id); 
      const { 
        date, 
        startTime, 
        endTime, 
        eventType, 
        location, 
        zipCode, 
        fullAddress, 
        transmissionLink, 
        transmissionPassword 
      } = req.body;
  
      let messages = [];
    
      if (!userId) messages.push('Usuário não fornecido.');  
      if (!eventId) messages.push('ID do evento não fornecido.');  
      if (!date || isNaN(new Date(date))) messages.push('Data do evento inválida.');  
      if (!startTime || isNaN(new Date(startTime))) messages.push('Hora de início inválida.');  
      if (!endTime || isNaN(new Date(endTime)))  messages.push('Hora de término inválida.');
      if (new Date(startTime) >= new Date(endTime)) {
        messages.push('A hora de início não pode ser posterior ou igual à hora de término.');
      }
      if (!eventType || !['in-person', 'virtual'].includes(eventType)) {
        messages.push('Tipo de evento inválido. Deve ser "in-person" ou "virtual".');
      }
  
      if (eventType === 'in-person') {
        if (!location || location.length < 5) {
          messages.push('Localização inválida. O nome do local precisa ter pelo menos 5 caracteres.');
        }
        if (!zipCode || zipCode.length < 5) messages.push('CEP inválido.');  
        if (!fullAddress || fullAddress.length < 5) messages.push('Endereço completo inválido.');
      }
  
      if (eventType === 'virtual') {
        if (!transmissionLink || !/^https?:\/\/[^\s]+$/.test(transmissionLink)) messages.push('Link de transmissão inválido.');
        if (!transmissionPassword || transmissionPassword.length < 6) {
          messages.push('Senha de transmissão inválida. A senha deve ter pelo menos 6 caracteres.');
        }
      }
  
      if (messages.length > 0) {
        return res.status(400).json({
          success: false, 
          message: `${messages.map(error => `• ${error}`).join('\n <br>')}`
        });
      }
  
      // Verificação do usuário e evento
      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });
  
      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }
  
      // Criar detalhes do evento
      const createdEventDetail = await prisma.event_details.create({
        data: {
          event_id: eventId,
          event_date: new Date(date),  
          start_time: new Date(startTime),  
          end_time: new Date(endTime),      
          event_type: eventType,
          event_location: eventType === 'in-person' ? location : null,
          postal_code: zipCode,
          full_address: eventType === 'in-person' ? fullAddress : null,
          transmission_link: eventType === 'virtual' ? transmissionLink : null,
          transmission_password: eventType === 'virtual' ? transmissionPassword : null,
        }
      });
  
      return res.status(200).json({
        success: true,
        message: 'Detalhes do evento criados com sucesso!',
        eventDetail: createdEventDetail,
      });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao criar detalhes do evento.' });
    }
  }
  
}

export default EventController;
