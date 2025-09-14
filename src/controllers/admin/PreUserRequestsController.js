import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class PreUserRequestsController {
  async getUserEventRequests(req, res) {
    try {
      let { limite, page } = req.query;

      limite = parseInt(limite);
      page = parseInt(page);

      if (!limite || limite < 1 || limite > 20) limite = 20;
      if (!page) page = 1;
      
      const userEventRequestsCount = await prisma.pre_user_requests.count();

      const userEventRequests = await prisma.pre_user_requests.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
          payment_link: true,
          payment_status: true,
          account_created: true,
          created_at: true,
          event_info_json: true
        },
        orderBy: { created_at: 'desc' },
        skip: (limite * (page - 1)),
        take: limite
      });

      return res.status(200).json({
        success: true,
        userEventRequests: FormatUtils.toCamelCase(userEventRequests),
        page: Number(page),
        totalPages: Math.ceil(userEventRequestsCount / limite)
      });
    } catch (error) {
      LogUtils.errorLogger(error, 'Erro ao buscar solicitações de evento');
      return res
        .status(500)
        .json({ success: false, message: 'Erro ao buscar solicitações de evento' });
    }
  }


  async getInfo(req, res) {
    try {
      const { id } = req.params;
      const userEventRequests = await prisma.pre_user_requests.findUnique({ 
        where: { id: Number(id) },
        select: { event_info_json: true }
      });

      const info = userEventRequests.event_info_json;

      if (!info) {
        return res.status(404).json({ 
          success: false, 
          message: 'As informações iniciais do evento ainda não foram preenchidas.' 
        });
      }

      const eventType = await prisma.event_types.findUnique({ 
        where: { id: Number(info.eventTypeId) },
        include: { event_categories: { where: { id:  Number(info.eventCategoryId) } } }
      });

      const eventCategory = eventType.event_categories[0];

      delete eventType.event_categories

      const gifts = await prisma.gifts.findMany({ 
        where: { id: { in: info.gifts?.map(id => Number(id)) } } 
      });

      const response = { success: true, infoEvent: { gifts, eventCategory, eventType } };

      return res.status(200).json(FormatUtils.toCamelCase(response));
    } catch (error) {
      LogUtils.errorLogger(error, 'Erro ao buscar informações da solictação de evento');
      return res
        .status(500)
        .json({ success: false, message: 'Erro ao buscar informações da solictação de evento' });
    }
  }
}

export default PreUserRequestsController;
