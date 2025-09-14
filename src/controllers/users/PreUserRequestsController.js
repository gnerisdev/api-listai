import prisma from '#prisma';
import bcrypt from 'bcryptjs';
import { LogUtils } from '../../utils/LogUtils.js';
import { MercadoPagoService } from '../../services/MercadoPagoService.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';

const mercadoPagoService = new MercadoPagoService();

class PreUserRequestsController {
  async saveUser(req, res) {
    let preUserRequest;
    const messages = [];

    try {
      const { firstName, lastName, phoneNumber, email, password } = req.body;
      // Check if all fields are filled
      if (!firstName || !lastName || !phoneNumber || !email || !password) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos!' });
      }

      const validationPassword = ValidationUtils.password(password);
      const validationPhoneNumber = ValidationUtils.phoneNumber(phoneNumber);
      const validationEmail = ValidationUtils.email(email);

      if (validationPhoneNumber !== true) messages.push(validationPhoneNumber);
      if (validationPassword !== true) messages.push(validationPassword);
      if (validationEmail !== true) messages.push(validationEmail);

      if (messages.length) {
        return res.status(400).json({
          success: false,
          message: `${messages.map(error => `• ${error}`).join('\n <br>')}`
        });
      }

      // Check if user already exists
      const existing = await prisma.pre_user_requests.findFirst({ where: { email } });

      if (existing) {
        return res.status(409).json({ success: false, message: 'Usuário ja cadastrado!' });
      }

      // Register
      preUserRequest = await prisma.pre_user_requests.create({
        data: {
          name: firstName.trim() + ' ' + lastName.trim(),
          phone_number: phoneNumber.replace(/\D/g, ''),
          email: email,
          password: bcrypt.hashSync(password, 12),
        }
      });

      // Get settings
      const settings = await prisma.settings.findFirst({ select: { list_creation_fee: true } });

      // Genarate payment link
      const reference = `pre_user_request_${preUserRequest.id}`;

      const preference = await mercadoPagoService.getPreference({
        items: [{
          id: preUserRequest.id,
          title: 'Listaí Presentes',
          description: 'Finalize o pagamento para ativar sua lista de presentes personalizada',
          unit_price: settings.list_creation_fee,
          quantity: 1,
          currency_id: 'BRL'
          // picture_url: '',
        }],
        payer: { email, first_name: firstName, last_name: lastName },
        back_urls: {
          success: `https://users.listai.com.br/pre-register`,
          failure: `https://users.listai.com.br/register`,
          pending: `https://users.listai.com.br/pre-register`,
        },
        external_reference: reference,
        auto_return: 'approved',
        binary_mode: true
      });

      // Save preference id
      await prisma.pre_user_requests.update({
        where: { id: preUserRequest.id },
        data: { payment_link: preference.init_point, payment_reference: reference }
      });

      return res.status(200).json({ success: true, paymentLink: preference.init_point });
    } catch (error) {
      // Delete if error
      if (preUserRequest) {
        prisma.pre_user_requests.delete({ where: { id: preUserRequest.id } })
          .then(() => console.log('Pre user request deleted'))
          .catch((error) => console.log(error));
      }

      LogUtils.errorLogger(error, 'Erro ao fazer cadastro de usuário');
      return res
        .status(500)
        .json({
          success: false,
          message: 'Erro ao fazer cadastro! Caso o erro persista, entre em contato com o suporte.'
        });
    }
  }

  async getUserRequest(req, res) {
    try {
      const { email } = req.body;

      let userRequest = await prisma.pre_user_requests.findUnique({
        where: { email: email },
        select: {
          id: true,
          email: true,
          payment_link: true,
          payment_reference: true,
          payment_status: true,
          account_created: true,
          event_info_json: true
        }
      });

      if (!userRequest) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado!' });
      }

      if (userRequest.account_created) {
        return res.status(404).json({
          success: false,
          accountCreated: true,
          message: 'Cadastro concluído! Vá até o painel do usuário e faça login para começar a usar a plataforma.'
        });
      }

      const payment = await mercadoPagoService
        .getPaymentByReference(userRequest.payment_reference, 'last');

      // Update payment status
      if (payment) {
        let status = userRequest.payment_status;

        if (payment.status === 'approved') status = 'APPROVED';
        if (payment.status === 'pending') status = 'PENDING';
        if (payment.status === 'rejected') status = 'RECUSED';
        if (payment.status === 'cancelled') status = 'CANCELLED';

        await prisma.pre_user_requests.update({
          where: { id: userRequest.id },
          data: { payment_status: status }
        });

        userRequest.payment_status = status;
      }

      if (userRequest.event_info_json) userRequest.has_event_info = true;
      delete userRequest.event_info_json;

      return res.status(200).json({
        success: true,
        userRequest: FormatUtils.toCamelCase(userRequest)
      });
    } catch (error) {
      LogUtils.errorLogger(error, 'Erro ao buscar usuário pré-cadastrado');
      return res
        .status(500)
        .json({ success: false, message: 'Erro ao buscar usuário pré-cadastrado' });
    }
  }

  async generatePayment(req, res) {
    const { email } = req.body;

    try {
      // Check if user already exists
      const userRequest = await prisma.pre_user_requests.findFirst({ where: { email } });

      if (!userRequest) {
        return res.status(404).json({ success: false, message: 'Email não encontrado!' });
      }

      if (userRequest.payment_status === 'PENDING') {
        return res.status(400).json({ success: false, message: 'Pagamento pendente!' });
      }

      // Get settings
      const settings = await prisma.settings.findFirst({ select: { list_creation_fee: true } });

      // Genarate payment link
      const reference = `pre_user_request_${userRequest.id}`;

      const preference = await mercadoPagoService.getPreference({
        items: [{
          title: 'Listaí Presentes',
          description: 'Finalize o pagamento para ativar sua lista de presentes personalizada',
          unit_price: settings.list_creation_fee,
          quantity: 1,
          currency_id: 'BRL'
        }],
        payer: { email },
        back_urls: {
          success: `https://users.listai.com.br/pre-register`,
          failure: `https://users.listai.com.br/register`,
          pending: `https://users.listai.com.br/pre-register`,
        },
        external_reference: reference,
        auto_return: 'all',
        binary_mode: true,
        payment_methods: { excluded_payment_types: [{ id: 'ticket' }] }
      });

      // Save preference id
      await prisma.pre_user_requests.update({
        where: { id: userRequest.id },
        data: { payment_link: preference.init_point, payment_reference: reference }
      });

      return res.status(200).json({ success: true, paymentLink: preference.init_point });
    } catch (error) {
      LogUtils.errorLogger(error, `Erro ao gerar pagamento da lista de presentes ${email ? ' - ' + email : ''}`);
      return res
        .status(500)
        .json({ success: false, message: 'Erro ao gerar pagamento.' });
    }
  }

  async saveEventInfo(req, res) {
    try {
      const {
        eventTypeId,
        eventCategoryId,
        giftDeliveryPreference,
        weekAfterParty,
        gifts,
        title,
        email,
        password
      } = req.body;

      // Check if all fields are filled
      const parsedEventCategoryId = parseInt(eventCategoryId, 10);
      if (isNaN(parsedEventCategoryId) || parsedEventCategoryId <= 0) {
        return res.status(400).json({ success: false, message: 'O campo "Evento" é inválido.' });
      }

      const parsedEventTypeId = parseInt(eventTypeId, 10);
      if (isNaN(parsedEventTypeId) || parsedEventTypeId <= 0) {
        return res.status(400).json({ success: false, message: 'O campo "Tipo de evento" é inválido.' });
      }

      const allowedGiftDeliveryPreferences = ['weekOfParty', 'weekAfterParty', 'cash'];
      if (!giftDeliveryPreference || !allowedGiftDeliveryPreferences.includes(giftDeliveryPreference)) {
        return res.status(400).json({ success: false, message: 'O campo "Forma de recebimento dos presentes" é inválido.' });
      }

      if (!Array.isArray(gifts) || gifts.some(gift => typeof gift !== 'number' || gift <= 0)) {
        return res.status(400).json({ success: false, message: 'Os presentes selecionados são inválidos.' });
      }

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'O campo title é inválido.' });
      }

      if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ success: false, message: 'O campo de "senha" é inválido.' });
      }

      // Get event info
      const userRequest = await prisma.pre_user_requests.findFirst({ where: { email } });

      if (!userRequest) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado!' });
      }

      if (userRequest.event_info_json) {
        return res.status(400).json({ success: false, message: 'Informações do evento ja foram salvas!' });
      }

      // Compare password
      const passwordMatch = await bcrypt.compare(password, userRequest.password);
      if (!passwordMatch) return res.status(400).json({ success: false, message: 'Senha incorreta!' });

      // Save info
      await prisma.pre_user_requests.update({
        where: { id: userRequest.id },
        data: {
          event_info_json: {
            eventTypeId: parsedEventTypeId,
            eventCategoryId: parsedEventCategoryId,
            giftDeliveryPreference,
            weekAfterParty,
            gifts,
            title,
          }
        }
      });

      return res.status(200).json({ success: true, message: 'Informações do evento salvas com sucesso.' });

    } catch (error) {
      LogUtils.errorLogger(error, 'Erro ao salvar informações do evento');
      return res
        .status(500)
        .json({ success: false, message: 'Erro ao salvar informações do evento.' });
    }
  }
}

export default PreUserRequestsController;
