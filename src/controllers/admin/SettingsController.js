import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class SettingsController { 
  async getSettings(req, res) {
    try {
      const settings = await prisma.settings.findFirst();

      return res.status(200).json({ 
        success: true, 
        settings: FormatUtils.toCamelCase(settings)
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao buscar configurações.' });
    }
  } 

  async updateSettings(req, res) {
    try {
      let { percentageGift, color, colorSecondary } = req.body;
      percentageGift = parseInt(percentageGift);

      // Validation
      if (!percentageGift || !color || !colorSecondary) {
        return res.status(400).json({ 
          success: false, message: 'Todos os campos são obrigatórios.' 
        });
      }

      if (percentageGift < 0 || percentageGift > 100) {
        return res.status(400).json({
          success: false, message: 'Porcentagem deve estar entre 0 e 100.'
        });
      }

      // Update settings
      const settings = await prisma.settings.update({
        where: { id: 1 },
        data: { 
          percentage_gift: percentageGift, 
          color: color,
          color_secondary: colorSecondary 
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Configurações atualizadas com sucesso!',
        settings: FormatUtils.toCamelCase(settings)
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao atualizar configurações.' });
    }
  }
}

export default SettingsController;