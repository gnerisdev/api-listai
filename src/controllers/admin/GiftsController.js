import { PrismaClient } from '@prisma/client';
import { LogUtils } from '../../utils/LogUtils.js'
const prisma = new PrismaClient();

export class GiftsController {
  async getGifts(req, res) {
    try {
      const gifts = await prisma.gifts.findMany();

      return res.status(200).json(gifts);
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: '' });
    }
  }

  async registerGift(req, res) {
    try {

      const { name, description, price, event_categories_id } = req.body
      console.log(name, description, price, event_categories_id);

      if (!name || !description || !price || !event_categories_id) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios.'
        });
      }

      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'preço precisa ser maior que 0'
        });
      }
      const registerGift = await prisma.gifts.create({
        data: {
          name,
          description,
          price,
          event_categories_id
        }
        /*name:name, 
        description:description, 
        price:price, 
        event_categories_id:event_categories_id
        */
      });

      console.log(req.body)

      return res.status(200).json({
        success: true,
        message: "Gift registrado com sucesso!",
        data: registerGift
      });

    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({
        success: false,
        message: 'Erro ao criar o Gift',
        erro: error.message
      })
    }
  }

  async updateGift(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, event_categories_id } = req.body

      // Verifica se todos os campos foram preenchidos
      if (!name || !description || !price || !event_categories_id) {
        return res.status(400).json({
          success: false,
          message: "Preencha todos os campos"
        });
      }
      // Verifica se o preço é um número válido maior que 0
      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Preço deve ser maior que 0'
        });
      }
      // Verifica se o presente existe
      const giftExists = await prisma.gifts.findUnique({
        where: { id: Number(id) }
      });

      if (!giftExists) {
        return res.status(404).json({
          success: false,
          message: "Presente não encontrado"
        });
      }
      const categoryExists = await prisma.event_categories.findUnique({
        where: { id: event_categories_id }
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }
      // Atualiza o presente no banco de dados
      const updatedGift = await prisma.gifts.update({
        where: { id: Number(id) },
        data: {
          name,
          description,
          price,
          event_categories_id
        }
      });

      // Responde com o presente atualizado
      return res.status(200).json({
        success: true,
        data: updatedGift
      });

    } catch (error) {
      // Log de erro
      LogUtils.errorLogger(error);
      return res.status(400).json({
        success: false,
        message: 'Erro ao atualizar o presente'
      });
    }
  }

  async removeGift(req, res) {
    try {
      const {id} = req.params;

      const existGifts = await prisma.gifts.findUnique({
        where: {id: Number(id)} 
      });

      if(!existGifts){
        return res.status(404).json({
          success: false,
          message: "Gifst não encontado"
        })
      }

      await prisma.gifts.delete({
        where: {id: Number(id)}
      })
      return res.status(200).json({
        sucesso: true,
        message: "Gift deletado com sucesso"
      });

    } 
    catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ 
        success: false, 
        message: 'Erro ao deletar o gift' 
      });
    }
  }
}
