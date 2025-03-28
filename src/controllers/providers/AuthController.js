import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// import Model from '../../models/providers/ProvidersModel.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';
import { LogUtils } from '../../utils/LogUtils.js';
import { TOKEN_KEY } from '../../environments/index.js';

class Auth {
  async register(req, res) {
    try {
      const data = { ...req.body };
      const messages = [];

      // Validation
      const validationName = ValidationUtils.fullName(data.name);
      if (validationName != true) messages.push(validationName);

      const validationCpf = ValidationUtils.cpf(data.cpf);
      if (validationCpf != true) messages.push(validationCpf);

      const validationEmail = ValidationUtils.email(data.email);
      if (validationEmail != true) messages.push(validationEmail);

      const validationPhoneNumber = ValidationUtils.phoneNumber(data.phoneNumber);
      if (validationPhoneNumber != true) messages.push(validationPhoneNumber);

      if (messages.length) {
        return res.status(400).json({
          success: false, message: `${messages.map(error => `• ${error}`).join('\n')}`
        });
      }

      // checks if the account exists
      const email = data.email
      // const findEmail = await Model.findOne({ email });
      // if (findEmail) {
      //   return res.status(400).json({ success: false, message: 'Email já cadastrado' });
      // } 

      // Create Provider
      // await Model.create({
      //   name: data.name,
      //   email: data.email,
      //   cpf: data.cpf,
      //   phoneNumber: data.phoneNumber,
      //   whatsappNumber: data.whatsappNumber,
      //   birthDate: data.birthDate,
      //   password: bcrypt.hashSync(data.password, 12), 
      // });

      return res.status(200).json({ success: true, message: 'Cadastro feito com sucesso!' });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      res.status(400).json({ 
        success: false, 
        message: 'Erro: confira os campos e tente novamente.' 
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

      // const company = await Model.findOne({ 'email': data.email.trim() })
      //   .select('name email password');

      // if (!company || !bcrypt.compareSync(data.password, company.password)) {
      //   return res.status(401).json({ success: false, message: 'Senha ou email incorreto!' });
      // }

      delete data?.subscription?.expirationTime;

      // await Model.findByIdAndUpdate(company._id, { subscription: data?.subscription });

      const token = jwt.sign(
        { id: company._id, email: company.email },
        TOKEN_KEY,
        { expiresIn: '200d' }
      );

      return res.status(200).json({ 
        success: true, 
        message: 'Logado.', 
        token, 
        id: company._id 
      });
    } catch (error) {
      console.log(error)

      LogUtils.errorLogger(error);
      return res
        .status(400)
        .json({ success: false, message: 'Houve um erro de comunicação na rede.' });
    }
  }
}

export default Auth;
