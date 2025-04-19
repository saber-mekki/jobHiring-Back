import express from "express";
import {
  addUserController,
  deleteUserController,
  getUserController,
  updateUserController,
  verifyEmailController,
  resendVerificationEmail
} from "../../controllers/users";
import multer from "multer";
import path from "path";
import {authenticateToken} from "../../middlewares/authMiddleware"


  import fs from 'fs/promises';

const router = express.Router();

// Configuration Multer avancée
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé"), false); 
    }
  }
});
router.post("/resend-verification", resendVerificationEmail);
router.get("/verify-email/:token", verifyEmailController);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - login
 *         - password
 *         - gender
 *         - name
 *         - registerType
 *       properties:
 *         login:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: "SecurePassword123!"
 *         phone:
 *           type: string
 *           example: "+33123456789"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           example: "male"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         registerType:
 *           type: string
 *           enum: [recruiter, applicant]
 *           example: "applicant"
 *         image:
 *           type: string
 *           format: binary
 *           description: Photo de profil
 *         cv:
 *           type: string
 *           format: binary
 *           description: CV (pour candidats)
 *         company_name:
 *           type: string
 *           example: "Tech Corp"
 *         company_website:
 *           type: string
 *           format: uri
 *           example: "https://techcorp.com"
 *         company_industry:
 *           type: string
 *           example: "IT Services"
 *         company_size:
 *           type: string
 *           example: "50-200"
 *         company_founded_year:
 *           type: integer
 *           example: 2010
 *         company_linkedin:
 *           type: string
 *           format: uri
 *           example: "https://linkedin.com/company/techcorp"
 *         company_address:
 *           type: string
 *           example: "123 Tech Street"
 *         company_city:
 *           type: string
 *           example: "Paris"
 *         company_state:
 *           type: string
 *           example: "Île-de-France"
 *         company_country:
 *           type: string
 *           example: "France"
 *         company_postal_code:
 *           type: string
 *           example: "75001"
 *         company_description:
 *           type: string
 *           example: "description of company"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["JavaScript", "React", "Node.js"]
 *           style: form
 *           explode: true
 *         experience:
 *           type: object
 *           properties:
 *             company:
 *               type: string
 *             position:
 *               type: string
 *             years:
 *               type: number
 *           example:
 *             company: "ABC Corp"
 *             position: "Developer"
 *             years: 2
 *         education:
 *           type: object
 *           properties:
 *             degree:
 *               type: string
 *             university:
 *               type: string
 *           example:
 *             degree: "Master"
 *             university: "Sorbonne"
 * 
 *     UserRegister:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             image:
 *               type: string
 *               format: binary
 *             cv:
 *               type: string
 *               format: binary
 * 
 *     UserLogin:
 *       type: object
 *       required:
 *         - login
 *         - password
 *       properties:
 *         login:
 *           type: string
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           example: "SecurePassword123!"
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Error message"
 *         details:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Password too short", "Invalid email format"]
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Enregistre un nouvel utilisateur
 *     description: |
 *       Crée un nouveau compte utilisateur (recruteur ou candidat).
 *       Les champs requis diffèrent selon le type d'inscription.
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                   example: "5f8d0d55b54764421b7156da"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: L'utilisateur existe déjà
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/register",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cv", maxCount: 1 }
  ]),
  addUserController
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Authentifie un utilisateur
 *     description: Connecte un utilisateur et retourne un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé (identifiants incorrects)
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post("/login", getUserController);
/**
 * @swagger
 * /users/cv:
 *   patch:
 *     tags: [Users]
 *     summary: Met à jour le CV d'un candidat
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: cv
 *         type: file
 *         required: true
 *     responses:
 *       200:
 *         description: CV mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.patch(
  "/cv",
  upload.single("cv")
);


/**
 * @swagger
 * /users:
 *   delete:
 *     tags: [Users]
 *     summary: Supprime un utilisateur
 *     parameters:
 *       - in: query
 *         name: login
 *         required: true
 *         schema:
 *           type: string
 *           example: "user@example.com"
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Requête invalide
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Utilisateur non trouvé
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/", deleteUserController);
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     UserUpdate:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *         phone:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         name:
 *           type: string
 *         image:
 *           type: string
 *           format: binary
 *         cv:
 *           type: string
 *           format: binary
 *         company_name:
 *           type: string
 *         company_website:
 *           type: string
 *         company_industry:
 *           type: string
 *         company_size:
 *           type: string
 *         company_founded_year:
 *           type: number
 *         company_linkedin:
 *           type: string
 *         company_address:
 *           type: string
 *         company_city:
 *           type: string
 *         company_state:
 *           type: string
 *         company_country:
 *           type: string
 *         company_postal_code:
 *           type: string
 *         skills:
 *           type: string
 *           example: '["JavaScript", "React"]'
 *         experience:
 *           type: string
 *           example: '{"company": "ABC Corp", "position": "Developer"}'
 *         education:
 *           type: string
 *           example: '{"degree": "Master", "university": "Sorbonne"}'
 */

/**
 * @swagger
 * /users/{login}:
 *   put:
 *     tags: [Users]
 *     summary: Mettre à jour un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: login
 *         required: true
 *         schema:
 *           type: string
 *         description: Email de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put(
  "/:login",
  authenticateToken,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cv", maxCount: 1 }
  ]),
  updateUserController
);


export default router;
