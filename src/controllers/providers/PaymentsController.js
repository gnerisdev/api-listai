import Model from '../../models/CompanyModel.js';
import { METHODCATEGORY } from '../../constant/methods.js';
import { LogUtils } from '../../utils/LogUtils.js';


class PaymentsController {
  getMethodInCategory = async (req, res) => {
    try {
      return res.status(200).json(METHODCATEGORY);
    } catch (error) {
      LogUtils.errorLogger(error);
    }
  };

  async updateCredentialsMercadoPago(req, res) {
    try {
      const companyId = req.headers.companyid;
      const { publicKey, accessToken } = req.body;

      if (!publicKey || !accessToken) {
        return res.status(400).json({ success: false, message: 'As credênciais estão vazias' });
      }

      await Model.findByIdAndUpdate(companyId, {
        $set: {
          'settingsPayment.mercadoPago.publicKey': publicKey,
          'settingsPayment.mercadoPago.accessToken': accessToken
        }
      });

      return res.status(200).json({ publicKey: true, accessToken: true });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false });
    }
  };

  async updatePix(req, res) {
    try {
      const companyId = req.headers.companyid;
      const { key, keyType, active, name, city } = req.body;

      const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const validatePhone = (phone) => (phone.replace(/\D/g, '').length !== 11) ? false : true;
      const validateCPF = (cpf) => (cpf.replace(/\D/g, '').length !== 11) ? false : true;

      if (active) {
        if (!['aleatorio', 'email', 'telefone', 'cpf'].includes(keyType)) {
          return res.status(400).json({ success: false, message: 'Tipo de chave inválido' });
        }

        if (!name || name === '') {
          return res.status(400).json({ success: false, message: 'Nome do titular vazio' });
        } 

        if (keyType === 'email' && !validateEmail(key)) {
          return res.status(400).json({ success: false, message: 'E-mail inválido' });
        } else if (keyType === 'telefone') {
          const phoneDigits = key.replace(/\D/g, '');
          if (!validatePhone(phoneDigits)) {
            return res.status(400).json({ success: false, message: 'Telefone inválido' });
          }
        } else if (keyType === 'cpf' && !validateCPF(key)) {
          return res.status(400).json({ success: false, message: 'CPF inválido' });
        }

        if (!city || city === '') {
          return res.status(400).json({ success: false, message: 'Nome da cidade vazio' });
        } 
      }

      await Model.findByIdAndUpdate(companyId, { $set: { 'settingsPayment.pix': { key, keyType, active, name, city } } });

      return res.status(200).json({ key, keyType,  name, city, active });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false });
    }
  }

  async updatePaymentsMethods(req, res) {
    try {
      const companyId = req.headers.companyid;
      const data = req.body;

      if (data.length < 1) {
        return res.status(200).json({
          success: false,
          message: 'Não é permitido desativar todas as formas de pagamentos'
        });
      }

      const response = await Model.findByIdAndUpdate(
        companyId,
        { $set: { 'settingsPayment.methods': data } },
        { new: true }
      );

      return res.status(200).json(response.settingsPayment.methods);
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false });
    }
  }

  async updatePaymentsMethods(req, res) {
    try {
      const companyId = req.headers.companyid;
      const data = req.body;

      if (data.length < 1) {
        return res.status(200).json({
          success: false,
          message: 'Não é permitido desativar todas as formas de pagamentos'
        });
      }

      const response = await Model.findByIdAndUpdate(
        companyId,
        { $set: { 'settingsPayment.methods': data } },
        { new: true }
      );

      return res.status(200).json(response.settingsPayment.methods);
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false });
    }
  }

  async getPaymentOptions(req, res) {
    try {
      const companyId = req.headers.companyid;
      const credentialsMP = { accessToken: false, publicKey: true };

      const response = await Model.findById(companyId, 'paymentsMethods paymentOnline');

      if (response?.paymentOnline?.credentialsMP?.accessToken) {
        credentialsMP.accessToken = true;
      }

      if (response?.paymentOnline?.credentialsMP?.publicKey) {
        credentialsMP.publicKey = true;
      }

      response.paymentOnline.credentialsMP = credentialsMP;

      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ success: false });
    }
  }
}

export default PaymentsController;
