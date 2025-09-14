import moment from 'moment-timezone';
import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { SERVICE_TYPES } from '../../constant/serviceTypesConstant.js';

class ServicesController {
  async getServices(req, res) {
    try {
      const services = await prisma.services.findMany({
        where: { deleted_at: null },
        orderBy: { id: 'desc' }
      });

      return res.status(200).json({
        success: true,
        services: FormatUtils.toCamelCase(services)
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao buscar os serviços.' });
    }
  }

  async getServiceTypes(req, res) {
    try {
      return res.status(200).json({ success: true, serviceTypes: SERVICE_TYPES });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao buscar tipos de serviço.' });
    }
  }

  async getService(req, res) {
    try {
      const serviceId = parseInt(req.params.service_id);
      const service = await prisma.services.findUnique({ where: { id: serviceId } });

      if (!service) {
        return res.status(404).json({ 
          success: true, 
          message: 'Serviço não encontrado!'
        });
      }

      return res.status(200).json({ success: true, service: FormatUtils.toCamelCase(service) });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao buscar os serviços.' });
    }
  }

  async validateServiceData({ name, description, price, type, quantity }) {
    const messages = [];

    if (!name || name.trim() === '') messages.push('Nome é obrigatório.');
    if (!description || description.trim() === '') messages.push('Descrição é obrigatória.');
    if (typeof price !== 'number') messages.push('Preço inválido.');
    if (typeof quantity !== 'number') messages.push('Quantidade inválida.');
    const validTypes = SERVICE_TYPES.map(s => s.value);
    if (!validTypes.includes(type)) messages.push('Tipo de serviço inválido.');

    return messages;
  }

  create = async (req, res) => {
    try {
      const { name, description, price, type, quantity } = req.body;

      const messages = this.validateServiceData({ name, description, price, type, quantity });
      if (messages.length > 0) {
        return res.status(400).json({
          success: false,
          message: messages.map(msg => `• ${msg}`).join('\n <br>'),
        });
      }

      const service = await prisma.services.create({
        data: {
          name,
          description,
          price,
          type,
          quantity,
          is_default: price === 0 ? true : false
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Serviço criado com sucesso!',
        service: FormatUtils.toCamelCase(service)
      });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao criar o serviço.' });
    }
  };

  update = async (req, res) => {
    try {
      const serviceId = parseInt(req.params.service_id);
      const { name, description, price, type, quantity, active } = req.body;
      const messages = this.validateServiceData({ name, description, price, type, quantity });
      if (messages.length > 0) {
        return res.status(400).json({
          success: false,
          message: messages.map(msg => `• ${msg}`).join('\n <br>'),
        });
      }

      const service = await prisma.services.update({
        where: { id: serviceId },
        data: {
          name,
          description,
          price,
          type,
          quantity,
          active: JSON.parse(active),
          is_default: price === 0 ? true : false
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Serviço atualizado com sucesso!',
        service: FormatUtils.toCamelCase(service)
      });
    } catch (error) {
      console.log(error);
      LogUtils.errorLogger(error);
      res.status(400).json({ success: false, message: 'Erro ao atualizar o serviço.' });
    }
  };

  async remove(req, res) {
    try {
      const serviced = parseInt(req.params.service_id);

      await prisma.services.update({
        where: { id: serviced },
        data: { deleted_at: moment().tz('America/Sao_Paulo').toDate() }
      });

      return res.status(200).json({ success: true, message: 'Removido com sucesso.' });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao remover serviço de evento.' });
    }
  }
}

export default ServicesController;