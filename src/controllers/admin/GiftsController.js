import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { CloudinaryService } from '../../services/CloudinaryServices.js';
import { MathUtils } from '../../utils/MathUtils.js';

class GiftsController {
  async getGiftsByCategory(req, res) {
    try {
      const [giftsRaw, settings] = await Promise.all([
        prisma.event_types.findMany({
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          include: {
            event_categories: {
              where: { deleted_at: null },
              orderBy: { created_at: 'desc' },
              include: { gifts: true },
            },
          },
        }),
        prisma.settings.findFirst({ select: { percentage_gift: true } })
      ]);

      const percentage = settings.percentage_gift;

      // Adiciona novo campo a cada gift
      const gifts = giftsRaw
        .map((type) => {
          const updatedCategories = type.event_categories.map((category) => {
            const updatedGifts = category.gifts.map((gift) => ({
              ...gift,
              pricePercentage: MathUtils.addPercentage(gift.price, percentage),
            }));

            return { ...category, gifts: updatedGifts };
          });

          return { ...type, event_categories: updatedCategories };
        })
        .filter((type) => type.event_categories.some((category) => category.gifts.length > 0));

      return res.status(200).json({
        success: true,
        giftsByCategory: FormatUtils.toCamelCase(gifts),
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao buscar presentes' });
    }
  }

  async getGifts(req, res) {
    try {
      const gifts = await prisma.gifts.findMany();
      return res.status(200).json(gifts);
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao buscar presentes' });
    }
  }

  async getGift(req, res) {
    try {
      const giftId = parseInt(req.params.gift_id);
      const gift = await prisma.gifts.findUnique({ where: { id: giftId } });

      return res.status(200).json({ success: true, gift: FormatUtils.toCamelCase(gift) });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao buscar presente' });
    }
  }

  async create(req, res) {
    try {
      const { name, description, price, eventCategoryId } = req.body;
      const image = req.file || null;
      const messages = [];

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length < 3) {
        messages.push('"Nome" é obrigatório e deve conter ao menos 3 caracteres.');
      }

      if (!description || typeof description !== 'string' || description.trim().length < 10) {
        messages.push('"Descrição" é obrigatório e deve conter ao menos 10 caracteres.');
      }

      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        messages.push('"Preço" é obrigatório e deve ser um número maior que zero.');
      }

      if (!eventCategoryId || isNaN(Number(eventCategoryId))) {
        messages.push('"Categoria do Evento" é obrigatório.');
      }

      if (!image) messages.push('"Imagem" é obrigatório.');

      if (messages.length > 0) {
        return res.status(400).json({
          success: false,
          message: messages.map(msg => `• ${msg}`).join('\n<br>'),
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

      const gift = await prisma.gifts.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          event_category_id: Number(eventCategoryId),
          price:  Number(price),
          image_url: resultUpload.secure_url,
          image_cdn: CloudinaryService.getAccountIndexOfWeek()
        }
      });

      return res.status(200).json({ success: true, gift: FormatUtils.toCamelCase(gift) });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao criar presente' });
    }
  }

  async updateGift(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, eventCategoryId } = req.body;
      const image = req.file || null;
      const numericPrice = Number(price);

      if (!name || !description || !numericPrice || !eventCategoryId) {
        return res.status(400).json({ success: false, message: "Preencha todos os campos" });
      }
      if (typeof numericPrice !== 'number' || numericPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Preço deve ser maior que zero' });
      }

      // Check gift
      const giftExists = await prisma.gifts.findUnique({ where: { id: parseInt(id) } });

      if (!giftExists) {
        return res.status(404).json({ success: false, message: "Presente não encontrado" });
      }

      const categoryExists = await prisma.event_categories.findUnique({ where: { id: parseInt(eventCategoryId) } });

      if (!categoryExists) {
        return res.status(404).json({ success: false, message: 'Categoria não encontrada' });
      }

      // Update image
      let imageUrl = giftExists.image_url;
      let imageCdn = giftExists.image_cdn;
        
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
      }  

      // Update gift
      const updatedGift = await prisma.gifts.update({
        where: { id: Number(id) },
        data: { 
          name, 
          description, 
          price: numericPrice, 
          event_category_id: parseInt(eventCategoryId),
          image_cdn: imageCdn,
          image_url: imageUrl
        }
      });

      return res.status(200).json({ success: true, data: updatedGift });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao atualizar o presente' });
    }
  }

  async removeGift(req, res) {
    try {
      const { id } = req.params;

      await prisma.gifts.delete({ where: { id: Number(id) } });

      return res.status(200).json({ success: true, message: 'Gift deletado com sucesso' });
    }
    catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao deletar o gift' });
    }
  }

  async linkGiftToEvent(req, res) {
    try {
      const { giftId, eventId } = req.body;
      const messages = [];

      if (!giftId || isNaN(Number(giftId))) {
        messages.push('"ID do presente" é obrigatório e deve ser um número válido.');
      }

      if (!eventId || isNaN(Number(eventId))) {
        messages.push('"ID do evento" é obrigatório e deve ser um número válido.');
      }

      if (messages.length > 0) {
        return res.status(400).json({
          success: false,
          message: messages.map(msg => `• ${msg}`).join('\n<br>'),
        });
      }

      // Verificações de existência
      const giftExists = await prisma.gifts.findUnique({ where: { id: Number(giftId) } });
      if (!giftExists) {
        return res.status(404).json({ success: false, message: 'Presente não encontrado.' });
      }

      const eventExists = await prisma.events.findUnique({ where: { id: Number(eventId) } });
      if (!eventExists) {
        return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
      }

      // Relacionamento 
      await prisma.event_gifts.create({
        data: { gift_id: Number(giftId), event_id: Number(eventId) },
      });

      return res.status(200).json({
        success: true,
        message: 'Presente vinculado ao evento com sucesso.',
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({
        success: false,
        message: 'Erro ao vincular presente ao evento.',
      });
    }
  }
}

export default GiftsController;