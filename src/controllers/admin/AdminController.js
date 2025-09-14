import prisma from '#prisma';
import bcrypt from 'bcryptjs';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';
import SettingsController from './SettingsController.js';

class AdminController {
  async fetchAdmin(req, res) {  
    try {
      const adminId = parseInt(req.headers['x-admin-id']);
  
      if (!adminId) {
        return res.status(400).json({ success: false, message: 'Usuário não fornecido.' });
      }

      const [admin, settings] = await Promise.all([
        prisma.admins.findUnique({
          where: { id: adminId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
            active: true,
          },
        }),
        prisma.settings.findFirst(),
      ])
        
      if (!admin) return res.status(404).json({ 
        success: false, message: 'Administrador não encontrado.' 
      });
    
      return res.status(200).json({
        success: true, 
        message: 'Perfil carregado com sucesso!', 
        admin: FormatUtils.toCamelCase(admin),
        color: settings.color,
        colorSecondary: settings.color_secondary
      });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar perfil.' });
    }
  }

  async changePassword(req, res) {
    try {
      const adminId = parseInt(req.headers['x-admin-id']);
      const { currentPassword, newPassword } = req.body;  
      if (!adminId) return res.status(400).json({ 
        success: false, message: 'Usuário não fornecido.' 
      });

      // Validation password
      const validationPassword = ValidationUtils.password(newPassword);
      if (validationPassword !== true) {
        return res.status(400).json({ 
          success: false, 
          message: validationPassword 
            || 'A senha precisa ter no mínimo 8 caracteres, pelo menos uma letra e um número.' 
        });
      }

      // Verify if password is correct
      const admin = await prisma.admins.findUnique({
        where: { id: adminId },
        select: { password: true },
      });

      if (!admin) return res.status(404).json({
        success: false, message: 'Administrador não encontrado.'
      }); 

      if (!bcrypt.compareSync(currentPassword, admin.password)) {
        return res.status(400).json({ success: false, message: 'Senha atual incorreta.' });
      }

      // Hash new password
      const hashedPassword = bcrypt.hashSync(newPassword, 12);

      await prisma.admins.update({
        where: { id: adminId },
        data: { password: hashedPassword },
      });

      return res.status(200).json({ success: true, message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.log(error)
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao alterar senha.' });
    }
  }
}

export default AdminController;
