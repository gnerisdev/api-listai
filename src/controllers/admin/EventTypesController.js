import moment from 'moment-timezone';
import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { CloudinaryService } from '../../services/CloudinaryServices.js';

class EventTypesController {
  async getEventTypes(req, res) {
    try {
      const eventTypes = await prisma.event_types.findMany({ where: { deleted_at: null } });

      return res.status(200).json({
        success: true,
        eventTypes: FormatUtils.toCamelCase(eventTypes)
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({
        success: false,
        message: 'Erro ao buscar categorias de presente'
      });
    }
  }

  async getEventTypesWithCategories(req, res) {
    try {
      const eventTypes = await prisma.event_types.findMany({
        include: { event_categories: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' } 
        }},
        where: { deleted_at: null },
        orderBy: { created_at: 'desc' }
      });

      return res.status(200).json({
        success: true,
        eventTypes: FormatUtils.toCamelCase(eventTypes)
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({
        success: false,
        message: 'Erro ao buscar categorias de presente'
      });
    }
  }

  async addEventType(req, res) {
    try {
      const { name, description } = req.body;
      const image = req.file || null;
      const messages = [];

      // Verify
      if (!name || name.trim() === '') messages.push('Nome é obrigatório.');
      if (!description || description.trim() === '') messages.push('Descrição é obrigatório.');
      if (!image) messages.push('A imagem é obrigatório.');
      if (messages.length > 0) {
        return res.status(400).json({
          success: false,
          message: `${messages.map(error => `• ${error}`).join('\n <br>')}`
        });
      }

      // Upload Cloudinary
      const cloudinary = CloudinaryService.getInstance();
      const resultUpload = await cloudinary.uploader.upload(image.path, { resource_type: 'auto' });

      if (!resultUpload.secure_url) {
        return res.status(400).json({
          success: false,
          message: 'Falha ao criar tipo de evento devido a um erro no envio da imagem.'
        });
      }

      const eventType = await prisma.event_types.create({
        data: {
          name: name.trim(),
          description: description,
          image_url: resultUpload.secure_url,
          image_cdn: CloudinaryService.getAccountIndexOfWeek()
        }
      });

      return res.status(200).json({
        success: true,
        eventType: FormatUtils.toCamelCase(eventType),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({
        success: false,
        message: 'Erro ao salvar tipo de evento',
      });
    }
  }

  async updateEventType(req, res) {
    try {
      const eventTypeId = parseInt(req.params.event_type_id);
      const { name, description, active } = req.body;
      const image = req.file || null;
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
  
      // Get existing event type
      const existingEventType = await prisma.event_types.findUniqueOrThrow({
        where: { id: eventTypeId }
      });
  
      let imageUrl = existingEventType.image_url;
      let imageCdn = existingEventType.image_cdn;
  
      if (image) {  
        if (!imageUrl || !imageCdn) { 
          return res.status(500).json({ 
            success: false, 
            message: 'Dados da imagem não encontrados ou incompletos.' 
          });
        }

        const cloudinary = CloudinaryService.getInstance(Number(imageCdn));

        // Delete image
        if (imageUrl) {
          const publicId = CloudinaryService.getPublicId(imageUrl);
          const response = await cloudinary.uploader.destroy(publicId, { resource_type:  'image' });

          console.log(response, publicId)
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
            message: 'Falha ao atualizar devido a um erro no envio da imagem.' 
          });
        }
  
        imageUrl = resultUpload.secure_url;
      }
  
      // Update event type
      const updatedEventType = await prisma.event_types.update({
        where: { id: eventTypeId },
        data: {
          active: JSON.parse(active),
          name: name.trim(),
          description: description.trim(),
          image_url: imageUrl,
          image_cdn: imageCdn
        }
      });
  
      return res.status(200).json({
        success: true,
        eventType: FormatUtils.toCamelCase(updatedEventType)
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(400).json({
        success: false,
        message: 'Failed to update event type'
      });
    }
  }

  async deleteEventType(req, res) {
    try {
      const eventTypeId = parseInt(req.params.event_type_id);
     
      await prisma.event_types.update({
        where: { id: eventTypeId },
        data: { deleted_at: moment().tz('America/Sao_Paulo').toDate() }
      });

      return res.status(200).json({ success: true, message: 'Removido com sucesso.' });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao remover tipo de evento.' });
    }
  }
}

export default EventTypesController;
