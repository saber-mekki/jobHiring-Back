
import express from "express";
import {
  getAllUsers,
  getUserDetails,
  banUserController,
  unbanUserController,
  promoteToAdminController,
  demoteAdminController,
  getAllJobs,
  approveJobController,
  rejectJobController,
  getAdminStats,
  registerAdmin,
  loginAdmin,
  getJobDetails,
  updateReportStatusController,
  getReportDetailsController,
  getAllReportsController
} from "../../controllers/admin";
import { authenticateToken, isAdmin, isSuperAdmin } from '../../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminLogin:
 *       type: object
 *       required:
 *         - login
 *         - password
 *       properties:
 *         login:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "AdminPassword123!"
 * 
 *     AdminRegister:
 *       allOf:
 *         - $ref: '#/components/schemas/AdminLogin'
 *         - type: object
 *           properties:
 *             superAdminCode:
 *               type: string
 *               description: Code secret pour la création de super-admin
 */

// Routes publiques
/**
 * @swagger
 * /admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: Connexion administrateur
 *     description: Authentification d'un administrateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLogin'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Authentification échouée
 *       500:
 *         description: Erreur serveur
 */
router.post("/login", loginAdmin);

/**
 * @swagger
 * /admin/register:
 *   post:
 *     tags: [Admin]
 *     summary: Enregistrement administrateur
 *     description: Création d'un compte administrateur (nécessite un code super-admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminRegister'
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
 *       400:
 *         description: Données invalides ou code super-admin incorrect
 *       409:
 *         description: L'administrateur existe déjà
 *       500:
 *         description: Erreur serveur
 */
router.post("/register", registerAdmin);

// Middleware pour les routes protégées
router.use(authenticateToken, isAdmin);

// Routes protégées
/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Statistiques d'administration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: integer
 *                   example: 150
 *                 jobs:
 *                   type: integer
 *                   example: 45
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Droits insuffisants
 *       500:
 *         description: Erreur serveur
 */
router.get("/stats", authenticateToken, isAdmin, getAdminStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Liste tous les utilisateurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get("/users", authenticateToken, isAdmin, getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Détails d'un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/users/:id", authenticateToken, isAdmin, getUserDetails);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   patch:
 *     tags: [Admin]
 *     summary: Bannir un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur banni
 *       403:
 *         description: Action non autorisée
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch("/users/:id/ban", banUserController);
// Ajoutez cette route dans votre fichier de routes admin.ts
/**
 * @swagger
 * /admin/jobs/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Détails d'une offre d'emploi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du job
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/jobs/:id", authenticateToken, isAdmin, getJobDetails);

/**
 * @swagger
 * /admin/users/{id}/unban:
 *   patch:
 *     tags: [Admin]
 *     summary: Débannir un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur débanni
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch("/users/:id/unban", unbanUserController);
// Gestion des jobs
/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     tags: [Admin]
 *     summary: Liste toutes les offres d'emploi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       500:
 *         description: Erreur serveur
 */
router.get("/jobs",authenticateToken, isAdmin, getAllJobs);


// Routes super-admin
router.use(isAdmin);

/**
 * @swagger
 * /admin/users/{id}/promote:
 *   patch:
 *     tags: [Admin]
 *     summary: Promouvoir en administrateur
 *     description: Nécessite les droits super-admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion réussie
 *       403:
 *         description: Droits insuffisants
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch("/users/:id/promote", promoteToAdminController);

/**
 * @swagger
 * /admin/users/{id}/demote:
 *   patch:
 *     tags: [Admin]
 *     summary: Rétrograder un administrateur
 *     description: Nécessite les droits super-admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rétrogradation réussie
 *       403:
 *         description: Action non autorisée
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch("/users/:id/demote", demoteAdminController);


/**
 * @swagger
 * /admin/jobs/{id}/approve:
 *   patch:
 *     tags: [Admin]
 *     summary: Approuver une offre d'emploi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job approuvé
 *       404:
 *         description: Job non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch("/jobs/:id/approve", authenticateToken, isAdmin,approveJobController);

/**
 * @swagger
 * /admin/jobs/{id}/reject:
 *   patch:
 *     tags: [Admin]
 *     summary: Rejeter une offre d'emploi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job rejeté
 *       404:
 *         description: Job non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch("/jobs/:id/reject", authenticateToken, isAdmin,  rejectJobController);
// Add to admin.ts routes file after other routes
/**
 * @swagger
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Get all reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, under_review, resolved]
 *         description: Filter by status
 *       - in: query
 *         name: itemType
 *         schema:
 *           type: string
 *           enum: [user, job, blog]
 *         description: Filter by item type
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/reports", authenticateToken, isAdmin, getAllReportsController);

/**
 * @swagger
 * /admin/reports/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get report details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportDetails'
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get("/reports/:id", authenticateToken, isAdmin, getReportDetailsController);

/**
 * @swagger
 * /admin/reports/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update report status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, under_review, resolved]
 *               adminNotes:
 *                 type: string
 *               actionTaken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.patch("/reports/:id", authenticateToken, isAdmin, updateReportStatusController);

export default router;
