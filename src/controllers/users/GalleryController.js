import prisma from '#prisma';
import { CloudinaryService } from '../../services/CloudinaryServices.js';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

const cloudinary = CloudinaryService.getInstance();

class GalleryController {
  async getGallery(req, res) {
    try {
      const eventId = parseInt(req.params.event_id);
      const userId = parseInt(req.headers['x-user-id']);

      const event = await prisma.users_events.findFirst({
        where: { user_id: userId, event_id: eventId },
        include: { event: true },
      });
      
      if (!event) {
        return res.status(404).json({ success: false, message: 'Item não encontrado.' });
      }

      const [gallery, eventServices, defaultServices] = await Promise.all([
        prisma.event_gallery.findMany({ where: { event_id: eventId } }),
        prisma.event_services.findMany({
          where: { event_id: eventId, service: { type: { in: ['video', 'image'] } } },
          select: { quantity: true,  service: { select: { type: true } } }
        }),        
        prisma.services.findMany({
          where: { type: { in: ['video', 'image'] },  active: true,  is_default: true },
          select: {  quantity: true, type: true }
        })
      ]);

      let videoQuantity = 0;
      let imageQuantity = 0;

      for (const item of eventServices) {
        if (item.service && item.service.type === 'video') {
          videoQuantity += item.quantity || 0;
        } else if (item.service && item.service.type === 'image') {
          imageQuantity += item.quantity || 0;
        }
      }

      for (const item of defaultServices) {
        if (item.type === 'video') {
          videoQuantity += item.quantity || 0;
        } else if (item.type === 'image') {
          imageQuantity += item.quantity || 0;
        }
      }
  
      return res.status(200).json({ 
        success: true, 
        gallery: FormatUtils.toCamelCase(gallery),
        videoQuantity: videoQuantity,
        imageQuantity: imageQuantity  
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar imagens da galeria.' });
    }
  }

  async addMedia(req, res) {
    try {
      const MAX_SIZE_MB = 10;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

      const eventId = parseInt(req.params.event_id);
      const userId = parseInt(req.headers['x-user-id']);
      const file = req.file;
      const fileType = req.body.fileType;

      // Verify file
      if (!file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado.' });
      }

      // Verify size
      if (file.size > MAX_SIZE_BYTES) {
        return res.status(400).json({
          success: false,
          message: `O arquivo excede o tamanho máximo permitido de ${MAX_SIZE_MB}MB.`
        });
      }

      // Permission
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

      // Limite de imagens/vídeos
      const servicesPaid = await prisma.event_services.aggregate({
        where: { event_id: eventId, service: { type: fileType } },
        _sum: { quantity: true }
      });

      const servicesDefault = await prisma.services.aggregate({
        where: { type: fileType, active: true, is_default: true },
        _sum: { quantity: true }
      });

      const allowedQuantity = (servicesPaid._sum.quantity + servicesDefault._sum.quantity) || 0;

      const currentCount = await prisma.event_gallery.count({
        where: { event_id: eventId, type: fileType }
      });

      if (currentCount >= allowedQuantity) {
        return res.status(403).json({
          success: false,
          message: `Limite de ${fileType === 'image' ? 'imagens' : 'vídeos'} atingido.`
        });
      }

      // Upload para Cloudinary
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

      return res.status(201).json({ 
        success: true, 
        message: 'Salvo com sucesso!' 
      });
    } catch (error) {
      LogUtils.errorLogger(error);

      let errorMessage = 'Erro ao adicionar a imagem ou vídeo.';

      if (error?.http_code && error?.message) {
        const message = error.message.toLowerCase();

        if (message.includes('invalid image')) {
          errorMessage = 'O arquivo de imagem é inválido ou corrompido.';
        } else if (message.includes('too large') || message.includes('max file size')) {
          errorMessage = 'O arquivo excede o tamanho máximo permitido de 10MB.';
        } else if (message.includes('unsupported')) {
          errorMessage = 'O formato do arquivo não é suportado.';
        } else if (message.includes('missing required parameter')) {
          errorMessage = 'Nenhum arquivo foi enviado.';
        } else if (error.http_code === 401) {
          errorMessage = 'Você não está autorizado a realizar essa ação.';
        } else if (error.http_code === 403) {
          errorMessage = 'Você não tem permissão para enviar esse tipo de arquivo.';
        } else if (error.http_code === 404) {
          errorMessage = 'O recurso não foi encontrado.';
        } else if (error.http_code === 409) {
          errorMessage = 'Este arquivo já foi enviado anteriormente.';
        } else if (error.http_code === 500) {
          errorMessage = 'Erro interno ao processar o envio. Tente novamente mais tarde.';
        } else {
          errorMessage = `Erro ao enviar mídia`;
        }
      }

      return res.status(500).json({ success: false, message: errorMessage });
    }
  }
}

export default GalleryController;
