import jwt from "jsonwebtoken";
import { TOKEN_KEY } from "../environments/index.js";

const userAuthMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];
  
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    const token = authorizationHeader.substring(7);
    try {
      jwt.verify(token, TOKEN_KEY);
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }
};

export default userAuthMiddleware;