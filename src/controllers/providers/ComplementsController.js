import Model from '../../models/ComplementsModel.js';
import { LogUtils } from '../../utils/LogUtils.js';


class ComplementsController {
  async createComplement(data, company) {

    try {
      const errors = [];
  
      data.forEach((item, index) => {
        const options = [...item.options];
        let optionErrors = 0;
  
        if (!item?.name.trim().length) errors.push('O nome do complemento não pode ficar em branco');
        if (item?.isRequired) {
          if (item?.min < 0) errors.push('Quantidade mínima inválida');
          if (item?.max <= 0) errors.push('Quantidade máxima deve ser igual ou maior que 1');
        }
  
        options.forEach((option, i) => {
          if (!option?.name.trim().length) optionErrors++;
        });
  
        if (optionErrors) {
          throw new Error(
            'O nome da opção de complemento não pode ficar em branco. ' +
            'Verifique suas opções do complemento ' +
            item.name
          );
        }

        delete data[index]['_id'];
        data[index]['company'] = company;
      });
  
      if (errors.length) throw new Error(errors.join('. \n '));
      const complements = await Model.insertMany(data);
  
      if (complements.length === 0) throw new Error('Nenhum complemento foi inserido.');
      const ids = complements.map(doc => doc._id);
  
      return ids;
    } catch (error) {
      LogUtils.errorLogger(error);
      throw new Error('Não foi possível criar o complemento');
    }
  }

  async create(req, res) {
    try {
      const companyId = req.headers.companyid;
      const data = [...req.body];
      const errors = [];

      data.forEach((item, index) => {
        const options = [...item.options];
        let optionErrors = 0;

        if (!item?.name.trim().length) errors.push('O nome do complemento não pode ficar em branco');
        if (item?.isRequired) {
          if (item?.min < 0) errors.push('Quantidade mínima inválida');
          if (item?.max <= 0) errors.push('Quantidade máxima deve ser igual ou maior que 1');
        }

        if (options.length < 1) errors.push('Opções de completo vazia');;

        options.forEach((option, i) => {
          if (!option?.name.trim().length) optionErrors++;
        });

        if (optionErrors) errors.push(
          'O nome da opção de complemento não pode ficar em branco.'
          + 'Verifique suas opções do complemento '
          + item.name
        );

        data[index]['company'] = companyId;
        delete data[index]['_id'];
      });

      if (errors.length) return res.status(200).json({ success: false, message: errors.join('. \n ') });

      const complements = await Model.insertMany(data);

      if (complements.length == 0) return res.status(200).json(complements[0]);

      const ids = complements.map(doc => doc._id);

      return res.status(200).json(ids);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Falha na requisição, tente novamente mais tarde' });
    }
  }

  async updateComplements(data) {
    try {
      const companyId = data.companyId;
      const errors = [];
      const ids = [];

      data.forEach((item, index) => {
        const options = [...item.options];
        let optionErrors = 0;

        if (!item?.name.trim().length) errors.push('O nome do complemento não pode ficar em branco');
        if (item?.isRequired) {
          if (item?.min < 0) errors.push('Quantidade mínima inválida');
          if (item?.max <= 0) errors.push('Quantidade máxima deve ser igual ou maior que 1');
        }

        options.forEach((option, i) => {
          if (!option?.name.trim().length) optionErrors++;
        });

        if (optionErrors) errors.push(
          'O nome da opção de complemento não pode ficar em branco.'
          + 'Verifique suas opções do complemento '
          + item.name
        );

        data[index]['company'] = companyId;
      });

      if (errors.length) {
        return { success: false, message: errors.join('. \n ') };
      }

      for (const complement of data) {
        const result = await Model.findByIdAndUpdate(
          complement._id, complement, { new: true }
        );      
      }

      return { success: true };
    } catch (error) {
      LogUtils.errorLogger(error);
      return { success: false, message: 'Falha na requisição, tente novamente mais tarde' };
    }
  }

  async udpadte(req, res) {
    try {
      const companyId = req.headers.companyid;
      const data = [...req.body];

      const updateResult = await this.updateComplements({ companyId, data });

      if (updateResult.success) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ success: false, message: updateResult.message });
      }
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Falha na requisição, tente novamente mais tarde' });
    }
  }
}

export default ComplementsController;