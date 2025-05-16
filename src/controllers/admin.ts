import { Request, Response } from "express";
import {
    getAllUsers as getAllUsersService,
  banUser,
  unbanUser,
  promoteToAdmin,
  demoteAdmin,
  approveJob,
  rejectJob,
  GetAdminStats,
  getUser,
  getUserById,
  createAdmin,
   adminLogin, 
   GetAllJobs,
   GetJobDetails,
   updateReportStatus,
   getReportDetails,
   getAllReports,
   handleContentRemoval,
   handleAccountSuspension,
   handleUserWarning
} from "../services/users";
import { pool } from "../database";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const stats = await GetAdminStats(); // Utilisation du service
    
    res.status(200).json({
      success: true,
      data: {
        users: stats.totalUsers,
        jobs: stats.totalJobs,
        activeJobs: stats.activeJobs,
        admins: stats.totalAdmins
      }
    });
  } catch (error) {
    console.error("Error in getAdminStats controller:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};



export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, gender, invitationCode } = req.body;

    // Vérification des champs requis
    const requiredFields = ['email', 'password', 'name', 'invitationCode'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: true,
        message: `Champs manquants: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS'
      });
    }

    // Vérification renforcée du code d'invitation
    if (invitationCode !== process.env.ADMIN_INVITATION_CODE) {
      return res.status(403).json({
        error: true,
        message: "Code d'invitation invalide ou expiré",
        code: 'INVALID_INVITATION_CODE'
      });
    }
    const existingUser = await getUser(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: true,
        message: "User already exists" 
      });
    }

    // Création de l'admin avec transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await createAdmin({ 
        email, 
        password,
        name,
        phone: phone || null,
        gender: gender || 'other',
        role: 'admin'
      }, client);

      await client.query('COMMIT');
      
      // Génération du token JWT sécurisé
      const token = jwt.sign(
        { 
          id: result.userId,
          role: 'admin', // Ajouter le rôle dans le payload
          iss: 'hiring-platform',
          aud: process.env.JWT_ADMIN_AUDIENCE
        }, 
        process.env.JWT_SECRET!, // Utiliser le même secret que partout
        { 
          expiresIn: '1h',
          algorithm: (process.env.JWT_ALGORITHM || 'HS256') as jwt.Algorithm
        }
      );

      res.status(201).json({
        success: true,
        token,
        userId: result.userId,
        role: 'admin',
        expiresIn: 3600 // 1 heure en secondes
      });
      

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('[ADMIN] Registration error:', error);
    
    // Gestion d'erreur améliorée
    const statusCode = error.code === 'USER_EXISTS' ? 409 : 500;
    const errorMessage = error.code ? error.message : 'Erreur serveur';

    res.status(statusCode).json({
      error: true,
      code: error.code || 'SERVER_ERROR',
      message: errorMessage
    });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: true,
        message: "Email et password sont requis" 
      });
    }

    const admin = await adminLogin(email, password);

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: admin.id, 
        role: 'admin',
        adminRole: admin.role
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      userId: admin.id,
      role: admin.role
    });
  } catch (error: any) {
    res.status(401).json({
      error: true,
      message: error.message
    });
  }
};





export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllUsersService(Number(page), Number(limit));
    
    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ 
        error: true,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      data: user 
    });
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const banUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await banUser(Number(id), reason);
    if (!result) {
      return res.status(404).json({ 
        error: true,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      message: "User banned successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error in banUserController:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const unbanUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await unbanUser(Number(id));
    if (!result) {
      return res.status(404).json({ 
        error: true,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      message: "User unbanned successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error in unbanUserController:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const promoteToAdminController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await promoteToAdmin(String(id));
    if (!result) {
      return res.status(404).json({ 
        error: true,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      message: "User promoted to admin successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error in promoteToAdminController:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const demoteAdminController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await demoteAdmin(String(id));
    if (!result) {
      return res.status(404).json({ 
        error: true,
        message: "User not found or not an admin" 
      });
    }

    res.status(200).json({ 
      error: false,
      message: "Admin privileges removed successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error in demoteAdminController:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};


export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, approved } = req.query;
    
    // Convertir approved en boolean si défini
    const approvedBool = approved === 'true' 
      ? true 
      : approved === 'false' 
        ? false 
        : undefined;

    const result = await GetAllJobs(
      Number(page),
      Number(limit),
      approvedBool
    );

    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error("Error in getAllJobs:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};
// Ajoutez ce contrôleur dans votre fichier admin.ts (controller)
export const getJobDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await GetJobDetails(id); // Utilise la fonction que nous venons d'ajouter
    
    if (!job) {
      return res.status(404).json({ 
        error: true,
        message: "Job not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      data: job 
    });
  } catch (error) {
    console.error("Error in getJobDetails:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const approveJobController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id; // Supposant que l'ID admin est dans le token JWT

    const result = await approveJob(Number(id), adminId);
    if (!result) {
      return res.status(404).json({ 
        error: true,
        message: "Job not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      message: "Job approved successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error in approveJobController:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const rejectJobController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await rejectJob(Number(id));
    if (!result) {
      return res.status(404).json({ 
        error: true,
        message: "Job not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      message: "Job rejected successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error in rejectJobController:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};
// Add to admin.ts controller file
export const getAllReportsController = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, itemType } = req.query;
    
    const result = await getAllReports(
      Number(page),
      Number(limit),
      status as string,
      itemType as string
    );

    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error("Error in getAllReports:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const getReportDetailsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await getReportDetails(Number(id));
    
    if (!report) {
      return res.status(404).json({ 
        error: true,
        message: "Report not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      data: report 
    });
  } catch (error) {
    console.error("Error in getReportDetails:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const updateReportStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, actionTaken } = req.body;
    const adminId = req.user.id;

    // Validation de base
    if (!['pending', 'resolved', 'under_review'].includes(status)) {
      return res.status(400).json({ error: true, message: "Statut invalide" });
    }

    // Récupération du rapport complet
    const report = await getReportDetails(Number(id));
    if (!report) {
      return res.status(404).json({ error: true, message: "Rapport non trouvé" });
    }

    // Exécution des actions
    if (actionTaken) {
      switch (actionTaken) {
        case 'content_removed':
          await handleContentRemoval(report, adminNotes);
          break;

        case 'user_warned':
          await handleUserWarning(report, adminNotes);
          break;

        case 'account_suspended':
          await handleAccountSuspension(report, adminNotes, adminId);
          break;

        
      }
    }

    // Mise à jour du statut
    const result = await updateReportStatus(
      Number(id),
      'resolved', // Force le statut à résolu pour les actions finales
      adminNotes,
      actionTaken
    );

    res.status(200).json({ 
      error: false,
      message: "Action effectuée avec succès",
      data: result 
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(500).json({ 
      error: true,
      message: "Erreur serveur" 
    });
  }
};