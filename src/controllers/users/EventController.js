import prisma from '#prisma';
import { CloudinaryService } from '../../services/CloudinaryServices.js';
import { LogUtils } from '../../utils/LogUtils.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';

class EventController {
  async getEvent(req, res) {
    try {
      const userId = parseInt(req.headers['x-user-id']); 
      const eventId = parseInt(req.params.event_id);   
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
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar evento.' });
    }
  }  
  
  async updateEvent(req, res) {  
    try {
      const userId = parseInt(req.headers['x-user-id']);
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
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar evento.' });
    }
  }  

  async uploadImage(req, res) {  
    try {
      const userId = parseInt(req.headers['x-user-id']);
      const eventId = parseInt(req.params.event_id); 
      const image = req.file || null; 
      const type = req.params.type; 

      if (type !== 'banner' && type !== 'avatar') {
        return res.status(400).json({ success: true, message: 'Tipo de imagem inválido!' });
      }
  
      // Verify permission
      const userEvent = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true, }, 
      });

      if (!userEvent) {
        return res.status(404).json({ 
          success: false, 
          message: 'Não foi possível atualizar a imagem desse evento' 
        });
      }

      const event = userEvent.event;

      // Update image
      let imageUrl = event[`${type}_url`];
      let imageCdn = event[`${type}_cdn`];
        
      if (!image) {
        return res.status(404).json({ success: false, message: "Imagem não encontrada." });
      }
            
      const cloudinary = CloudinaryService.getInstance(Number(imageCdn));   

      // Delete image
      if (imageUrl) {
        if (!imageCdn) { 
          return res.status(500).json({ 
            success: false, 
            message: 'Dados da imagem não encontrados ou incompletos.' 
          });
        }

        const publicId = CloudinaryService.getPublicId(imageUrl);
        const response = await cloudinary.uploader.destroy(publicId, { resource_type:  'image' });

        if (response.result !== 'ok') { 
          return res.status(500).json({ 
            success: false, 
            message: 'Erro ao atualizar imagem.' 
          });
        }
      }
      
      // Upload new image
      const resultUpload = await cloudinary.uploader.upload(image.path, { resource_type: 'auto' });
      if (!resultUpload.secure_url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Falha ao criar atualizar devido a um erro no envio da imagem.' 
        });
      }
      
      imageUrl = resultUpload.secure_url;
      imageCdn = imageCdn || CloudinaryService.getAccountIndexOfWeek();

      // Update event
      await prisma.events.update({
        where: { id: event.id }, 
        data: { 
          [`${type}_url`]: imageUrl, 
          [`${type}_cdn`]: imageCdn 
        },
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Imagem atualizado com sucesso!',
        [`${type}Url`]: imageUrl, 
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar evento.' });
    }
  }  
}

export default EventController;
