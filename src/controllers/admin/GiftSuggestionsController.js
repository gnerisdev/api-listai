import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class GiftSuggestionsController {
  async getSuggestions(req, res) {
    try {
      let { eventId, page=1, limit=20 } = req.query;
      page = parseInt(page);
      limit = parseInt(limit) > 20 ? 20 : parseInt(limit);

      const whereClause = {};
      if (eventId) whereClause.event_id = Number(eventId);

      const count = await prisma.gift_suggestions.count({ where: whereClause });
      const totalPages = Math.ceil(count / Number(limit));

      const gift = await prisma.gift_suggestions.findMany({ 
        where: whereClause,
        skip: ((page - 1) * limit),
        take: limit
      });

      return res.status(200).json({ 
        success: true, 
        giftSuggestions: FormatUtils.toCamelCase(gift),
        page: Number(page),
        totalPages: totalPages,
      });
    } catch (error) {
      LogUtils.errorLogger(error, 'Erro ao buscar sugestões de presente');
      res.status(400).json({ 
        success: false, 
        message: 'Erro ao buscar sugestões de presente' 
      });
    }
  }

  async removeSuggestions(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do presente não fornecido'
        });
      }

      await prisma.gift_suggestions.delete({ where: { id } });

      return res.status(200).json({ 
        success: true, 
        message: 'Sugestão deletado com sucesso.' 
      });
    }
    catch (error) {
      LogUtils.errorLogger(
        error, 
        'Erro ao deletar sugestão de presente'
      );

      res.status(400).json({ 
        success: false, 
        message: 'Erro ao deletar sugestão de presente' 
      });
    }
  }
}

export default GiftSuggestionsController;