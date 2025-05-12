import prisma from '#prisma';
import { CloudinaryService } from '../../services/CloudinaryServices.js';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const cloudinary = CloudinaryService.getInstance();

class GalleryController {
  async getGallery(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const userId = parseInt(req.headers.user_id);

      // Verify user permission event
      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Item não encontrado.' });
      }

      // Get gallery
      console.log(eventId)
      const gallery = await prisma.event_gallery.findMany({ where: { event_id: eventId } });

      return res.status(200).json({ success: true, gallery: FormatUtils.toCamelCase(gallery) });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar imagens da galeria.' });
    }
  }

  async addMedia(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const userId = parseInt(req.headers.user_id);
      const file = req.file;
      const fileType = req.body.fileType;

      // Checks if the user has permission on the event
      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });
  
      if (!event) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }

      if (!fileType) {
        return res.status(400).json({ success: false, message: 'Tipo de arquivo não suportado.' });
      }
  
      // Get services for type
      const servicesPaid = await prisma.event_services.aggregate({
        where: { event_id: eventId, services: { type: fileType } },
        _sum: { quantity: true }
      });

      const servicesDefault = await prisma.services.aggregate({
        where: { type: fileType, active: true, is_default: true },
        _sum: { quantity: true }
      });

      const allowedQuantity = (servicesPaid._sum.quantity + servicesDefault._sum.quantity) || 0;
  
      // Count items
      const currentCount = await prisma.event_gallery.count({
        where: { event_id: eventId, type: fileType }
      });
  
      if (currentCount >= allowedQuantity) {
        return res.status(403).json({
          success: false,
          message: `Limite de ${fileType === 'image' ? 'imagens' : 'vídeos'} atingido.`
        });
      }
  
      // Upload Cloudinary
      const result = await cloudinary.uploader.upload(file.path, { resource_type: 'auto' });

      // Save
      await prisma.event_gallery.create({
        data: {
          event_id: eventId,
          url: result.secure_url,
          cdn: CloudinaryService.getAccountIndexOfWeek(),
          type: result.resource_type,
        },
      });
  
      const gallery = await prisma.event_gallery.findMany({ where: { event_id: eventId } });
  
      return res.status(201).json({ success: true, gallery: FormatUtils.toCamelCase(gallery) });
    } catch (error) {
      console.log(error)
      // LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao adicionar a imagem.' });
    }
  }
}

export default GalleryController;
