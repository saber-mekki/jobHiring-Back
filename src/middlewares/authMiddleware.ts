import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {  getUserById } from "../services/users";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) throw new Error('JWT_SECRET manquant dans .env');

// Interface étendue pour inclure les propriétés admin
export interface AuthRequest extends Request {
  user?: {
    id: string;
    isAdmin?: boolean;
    adminRole?: string;
    isBanned?: boolean;
    bannedReason?: string;
    registerType?: string;
    // Ajouter d'autres propriétés utilisateur si nécessaire
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('[DEBUG] SECRET_KEY:', SECRET_KEY?.substring(0, 3) + '...');
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
    const decoded = jwt.verify(token, SECRET_KEY) as 
    {
      id: string;
      role: string;
      adminRole?: string;
    };
    console.log('[AUTH] Token décodé :', decoded);
    const user = await getUserById(decoded.id);
    
    if (!user) {
      return res.status(403).json({ 
        error: true, 
        message: "Utilisateur non trouvé" 
      });
    }

    // Vérifier si l'utilisateur est banni
    if (user.is_banned) {
      return res.status(403).json({ 
        error: true, 
        message: "Compte suspendu",
        reason: user.banned_reason
      });
    }
    
// Modifier la vérification du rôle
const isAdmin = decoded.role === 'admin' || user.admin_role === 'admin';
    const adminRole = decoded.adminRole || user.admin_role;

if (!isAdmin && req.path.startsWith('/admin')) {
  return res.status(403).json({ 
    error: true, 
    message: "Accès administrateur requis" 
  });
}

    // Ajouter les infos utilisateur à la requête
    req.user = {
      id: user.id,
      isAdmin,
      adminRole,
      isBanned: user.is_banned,
      bannedReason: user.banned_reason,
      registerType: user.registerType
    };

    next();
  } catch (error) {
    console.error('[AUTH] Erreur de token :', error, 'Token reçu :', token);
    return res.status(403).json({ 
      error: true, 
      message: error instanceof jwt.TokenExpiredError 
        ? "Token expiré" 
        : "Token invalide" 
    });
  }
};

// Middleware pour vérifier les droits admin
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ 
      error: true, 
      message: "Accès réservé aux administrateurs" 
    });
  }
  next();
};

// Middleware pour vérifier les droits super admin
export const isSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.adminRole !== 'superadmin') {
    return res.status(403).json({ 
      error: true, 
      message: "Accès réservé aux super administrateurs" 
    });
  }
  next();
};

// Middleware pour vérifier que l'utilisateur n'est pas banne
export const isNotBanned = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.isBanned) {
    return res.status(403).json({ 
      error: true, 
      message: "Votre compte a été suspendu",
      reason: req.user.bannedReason
    });
  }
  next();
};

// Middleware pour vérifier le type d'utilisateur
export const checkUserType = (types: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.registerType || !types.includes(req.user.registerType)) {
      return res.status(403).json({ 
        error: true, 
        message: `Accès réservé aux ${types.join(' ou ')}` 
      });
    }
    next();
  };
};
// Dans authMiddleware.ts
export const isRecruiter = checkUserType(['recruiter']);