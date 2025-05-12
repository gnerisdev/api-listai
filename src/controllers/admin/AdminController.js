import prisma from '#prisma';
import { LogUtils } from '../../utils/LogUtils.js';
import { FormatUtils } from '../../utils/FormatUtils.js';

class AdminController {
  async fetchAdmin(req, res) {  
    try {
      const adminId = parseInt(req.headers.admin_id);
  
      if (!adminId) {
        return res.status(400).json({ success: false, message: 'Usuário não fornecido.' });
      }
  
      const admin = await prisma.admins.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          active: true,
        },
      });
      
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Administrador não encontrado.' });
      }

      return res.status(200).json({
        success: true, 
        message: 'Perfil carregado com sucesso!', 
        admin: FormatUtils.toCamelCase(admin)
      });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ success: false, message: 'Erro ao carregar perfil.' });
    }
  }
}

export default AdminController;
