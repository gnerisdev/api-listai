import prisma from '#prisma';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_KEY } from '../../environments/index.js';
import { FormatUtils } from "../../utils/FormatUtils.js";

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "E-mail e senha são obrigatórios",
        });
      }

      const admin = await prisma.admins.findUnique({ where: { email } });
      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Verifique suas credenciais e tente novamente",
        });
      }

      if (!admin.active) {
        return res.status(403).json({ success: false, message: "Conta desabilitada" });
      }

      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          message: "Verifique suas credenciais e tente novamente",
        });
      }

      const token = jwt.sign({ id: admin.id, email: admin.email }, TOKEN_KEY, { expiresIn: "1d" });

      delete admin.password;

      return res.status(200).json({
        success: true,
        message: "Login bem-sucedido",
        admin: FormatUtils.toCamelCase(admin),
        token,
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: "Erro ao fazer login" });
    }
  }
}

export default AuthController;