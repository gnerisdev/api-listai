import { PrismaClient } from '@prisma/client';

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
      
      return res.status(200).json({  });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: '' });
    }
  }

  async updateGift(req, res) {
    try {

      return res.status(200).json({ });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: '' });
    }
  }

  async removeGift(req, res) {
    try {

      return res.status(200).json({ });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: '' });
    }
  }
}
