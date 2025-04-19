"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = require("../../controllers/users");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const router = express_1.default.Router();
// Configuration Multer avancée
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        yield promises_1.default.mkdir(uploadDir, { recursive: true });
        console.log(`[MULTER] Destination directory: ${uploadDir}`);
        cb(null, uploadDir);
    }),
    filename: (req, file, cb) => {
        const uniqueName = `cv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path_1.default.extname(file.originalname)}`;
        console.log(`[MULTER] Generated filename: ${uniqueName}`);
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 10MB
});
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
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           example: "SecurePassword123!"
 *         phone:
 *           type: string
 *           example: "+33123456789"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         name:
 *           type: string
 *           example: "John Doe"
 *         registerType:
 *           type: string
 *           enum: [recruiter, applicant]
 *         companyName:
 *           type: string
 *           example: "Tech Corp"
 *         location:
 *           type: string
 *           example: "Paris, France"
 *         skills:
 *           type: string
 *           example: '["JavaScript", "React", "Node.js"]'
 *         experience:
 *           type: string
 *           example: '{"company": "ABC Corp", "position": "Developer", "years": 2}'
 *         education:
 *           type: string
 *           example: '{"degree": "Master", "university": "Sorbonne"}'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Error message"
 */
/**
 * @swagger
 * /register:
 *   post:
 *     tags: [Users]
 *     summary: Enregistre un nouvel utilisateur
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/User'
 *               - type: object
 *                 properties:
 *                   image:
 *                     type: string
 *                     format: binary
 *                   cv:
 *                     type: string
 *                     format: binary
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
 *                   example: "5f8d0d55b54764421b7156da"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Erreur de validation
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cv", maxCount: 1 }
]), users_1.addUserController);
/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     tags: [Users]
 *     summary: Authentifie un utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "SecurePassword123!"
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
 *       401:
 *         description: Non autorisé
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Utilisateur non trouvé
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", users_1.getUserController);
/**
 * @swagger
 * /api/v1/users/cv:
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
router.patch("/cv", upload.single("cv"));
/**
 * @swagger
 * /api/v1/users:
 *   delete:
 *     tags: [Users]
 *     summary: Supprime un utilisateur
 *     parameters:
 *       - in: query
 *         name: login
 *         schema:
 *           type: string
 *         required: true
 *         example: "user@example.com"
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
router.delete("/", users_1.deleteUserController);
exports.default = router;
//# sourceMappingURL=index.js.map