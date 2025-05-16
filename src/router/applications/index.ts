// routes/applications.ts
import express from "express";
import {
  applyToJobController,
  getMyApplicationsController,
  getJobApplicationsController,
  updateApplicationStatusController
} from "../../controllers/applications";
import {authenticateToken, isRecruiter} from "../../middlewares/authMiddleware"

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         application_id:
 *           type: integer
 *           example: 123
 *         job_id:
 *           type: integer
 *           example: 456
 *         job_title:
 *           type: string
 *           example: "Développeur Fullstack"
 *         company_name:
 *           type: string
 *           example: "Tech Corp"
 *         applied_at:
 *           type: string
 *           format: date-time
 *           example: "2024-03-20T14:30:00Z"
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           example: "pending"
 *         match_score:
 *           type: number
 *           example: 85.5
 * 
 *     ApplicationStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           example: "accepted"
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Gestion des candidatures
 */

/**
 * @swagger
 * /applications/{jobId}/apply:
 *   post:
 *     tags: [Applications]
 *     summary: Postuler à une offre d'emploi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 456
 *     responses:
 *       201:
 *         description: Candidature envoyée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Requête invalide
 *       409:
 *         description: Candidature déjà existante
 *       500:
 *         description: Erreur serveur
 */
router.post("/:jobId/apply", authenticateToken, applyToJobController);

/**
 * @swagger
 * /applications/me:
 *   get:
 *     tags: [Applications]
 *     summary: Récupérer mes candidatures
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des candidatures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get("/me", authenticateToken, getMyApplicationsController);

/**
 * @swagger
 * /applications/{jobId}:
 *   get:
 *     tags: [Applications]
 *     summary: Récupérer les candidatures pour un job (Recruteur)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 456
 *     responses:
 *       200:
 *         description: Liste des candidatures
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Job introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get("/:jobId", authenticateToken, getJobApplicationsController);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Modifier le statut d'une candidature (Recruteur)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationStatus'
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       403:
 *         description: Action non autorisée
 *       404:
 *         description: Candidature introuvable
 *       500:
 *         description: Erreur serveur
 */
router.patch("/:id/status", authenticateToken,isRecruiter, updateApplicationStatusController);

export default router;