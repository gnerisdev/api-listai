import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ValidationUtils } from '../../utils/ValidationUtils.js';
import { LogUtils } from '../../utils/LogUtils.js';
import { TOKEN_KEY } from '../../environments/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AuthController {
  async register(req, res) {  
    const data = { ...req.body };
    const messages = [];
  
    console.log(data);
  
    // Validation
    if (!data.title) messages.push('Título do evento é obrigatório.');
    if (!data.slug) messages.push('Url do evento é obrigatório.');
    if (!data.event) messages.push('Evento é obrigatório.');
  
    const validationFirstName = ValidationUtils.firstName(data.firstName);
    const validationLastName = ValidationUtils.lastName(data.lastName);
    const validationEmail = ValidationUtils.email(data.email);
    const validationPhoneNumber = ValidationUtils.phoneNumber(data.phoneNumber);
    const validationPassword = ValidationUtils.password(data.password);
    data.phoneNumber = data.phoneNumber.replace(/\D/g, ''); 

    if (validationFirstName !== true) messages.push(validationFirstName);
    if (validationLastName !== true) messages.push(validationLastName);
    if (validationEmail !== true) messages.push(validationEmail);
    if (validationPhoneNumber !== true) messages.push(validationPhoneNumber);
    if (validationPassword !== true) messages.push(validationPassword);
  
    if (messages.length) {
      return res.status(400).json({
        success: false, 
        message: `${messages.map(error => `• ${error}`).join('\n <br>')}`
      });
    }
  
    try {
      const result = await prisma.$transaction(async (prisma) => {
        // Verify email
        const email = data.email;
        const findEmail = await prisma.users.findUnique({ where: { email: email } });
  
        if (findEmail) throw new Error('Email já cadastrado');
  
        // Create user
        const user = await prisma.users.create({
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone_number: data.phoneNumber,
            source: data.source,
            password: bcrypt.hashSync(data.password, 12),
          },
        });
  
        // Create event
        const event = await prisma.events.create({
          data: {
            title: data.title,
            subtitle: data.subtitle,
            slug: data.slug,
            event_categories_id: Number(data.event)
          },
        });
  
        // Link the user and event
        await prisma.users_events.create({ data: { user_id: user.id, event_id: event.id } });
  
        // Associating multiple gifts from giftList
        if (Array.isArray(data.giftList) && data.giftList.length > 0) {
          const giftAssociations = data.giftList.map(giftId => ({
            event_id: event.id,
            gift_id: giftId,
          }));
  
          // Create records in events_gifts for each gift
          await prisma.events_gifts.createMany({ data: giftAssociations });
        }

        return user;
      });
  
      return res.status(200).json({ success: true, message: 'Cadastro feito com sucesso!' });
      
    } catch (error) {
      console.log(error)
      return res.status(400).json({
        success: false,
        message: `Erro ao fazer cadastro.`
      });
    }
  }  

  async login(req, res) {
    try {
      const data = { ...req.body };

      //Validation
      if (!ValidationUtils.email(data.email.trim())) {
        return res.status(401).json({ success: false, message: 'Email inválido!' });
      }

      const user = await prisma.users.findUnique({ where: { 'email': data.email.trim() } });

      if (!user || !bcrypt.compareSync(data.password, user.password)) {
        return res.status(401).json({ success: false, message: 'Senha ou email incorreto!' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email }, 
        TOKEN_KEY,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Logado!',
        token,
        id: user.id,
        name: user.first_name + ' ' + user.last_name
      });
    } catch (error) {
      console.log(error);

      LogUtils.errorLogger(error);
      return res
        .status(400)
        .json({ success: false, message: 'Houve um erro de comunicação na rede.' });
    }
  }

  async getEventTypes(req, res) {
    try {
      const eventTypes = await prisma.event_types.findMany();

      return res.status(200).json(eventTypes);
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      res.status(400).json({
        success: false,
        message: 'Erro: confira os campos e tente novamente.'
      });
    }
  }

  async getEventCategories(req, res) {
    try {
      const eventTypeId = req.query.event_type_id;
      const eventCategories = await prisma.event_categories.findMany({
        where: { event_type_id: Number(eventTypeId) },
      });

      return res.status(200).json(eventCategories);
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({
        success: false,
        message: 'Erro ao buscar categoria de evento.'
      });
    }
  }
  async fetchGiftsSlug(req, res) {
    try {
      const { event_categories_id, slug } = req.query;
  
      // Verify slug
      const findSlug = await prisma.events.findUnique({ where: { slug: slug } });
  
      if (findSlug) {
        return res.status(400).json({ 
          slug_available: false, 
          message: 'O link está em uso, por favor, crie outro' 
        });
      }

      // Get gifts
      const gifts = await prisma.gifts.findMany({
        where: { event_categories_id: Number(event_categories_id) },
      });
        
      return res.status(200).json({ gifts, slug_available: true });
    } catch (error) {
      LogUtils.errorLogger(error);
      res.status(400).json({
        success: false,
        message: 'Erro ao buscar dados.',
      });
    }
  }  
}

export default AuthController;
