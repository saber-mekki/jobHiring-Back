import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET ;
if (!SECRET_KEY) throw new Error('JWT_SECRET manquant dans .env');

// ✅ Export explicite de l'interface
export interface AuthRequest extends Request {
  user?: {
    id: string;
    // Ajouter d'autres propriétés utilisateur si nécessaire
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('[DEBUG] SECRET_KEY:', SECRET_KEY?.substring(0, 3) + '...'); // Log partiel du secret
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: true, 
      message: "Authorization header required" 
    });
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ 
      error: true, 
      message: "Format d'authentification invalide. Utilisez: Bearer <token>" 
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    console.log('[AUTH] Token décodé :', decoded);
    req.user = decoded; // ✅ Typage fort
    next();
  } catch (error) {
    console.error('[AUTH] Erreur de token :',  'Token reçu :', token); // <-- Log d'erreur détaillé
    return res.status(403).json({ 
      error: true, 
      message: error instanceof jwt.TokenExpiredError 
        ? "Token expiré" 
        : "Token invalide" 
    });
  }
};