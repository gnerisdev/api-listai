import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();


class AuthController {

    static async login(req, res) {
        try {

            const { email, password } = req.body;
    
            if (!email || !password) {
                return res.status(400).json({
                success: false,
                message: 'E-mail e senha são obrigatórios',
                });
            }

            const admin = await prisma.admins.findUnique({
                where: { email },
            });
        
            if (!admin) {
                return res.status(400).json({
                success: false,
                message: 'Verifique suas credenciais e tente novamente',
                });
            }
        
            if (!admin.active) {
                return res.status(403).json({
                success: false,
                message: 'Conta desabilitada. Entre em contato com o suporte!',
                });
            }

            
            const passwordMatch = await bcrypt.compare(password, admin.password);
            console.log("Senha confere?", passwordMatch);
            console.log("Senha digitada:", password);
            console.log("Senha hash no banco:", admin.password);
            if (!passwordMatch) {
                return res.status(400).json({
                success: false,
                message: 'Verifique suas credenciais e tente novamente',
                });
            }

            const token = jwt.sign(
                {
                id: admin.id,
                email: admin.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            const { password: _, ...adminData } = admin;
            return res.status(200).json({
                success: true,
                message: 'Login bem-sucedido',
                token,
                admin: adminData,
            });

            }catch (error) {
                console.error('Login error:', error);
                return res.status(500).json({
                success: false,
                message: 'Server error',
                });
            }
        }
        static async verifyToken(req, res, next) {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso não fornecido',
            });
            }

            try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.admin = decoded;
            next();
            } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido ou expirado',
            });
        }
    }
}


export default AuthController;
