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
exports.deleteUserController = exports.updateCvController = exports.addUserController = exports.getUserController = exports.upload = void 0;
const users_1 = require("../../services/users");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../../database");
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = __importDefault(require("fs")); // For synchronous operations like existsSync
const uploadController_1 = require("../uploadController");
dotenv_1.default.config();
// Configuration Multer améliorée
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
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Type de fichier non autorisé"), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter
});
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
const getUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { login, password } = req.body;
    try {
        console.log("🔍 Recherche de l'utilisateur :", login);
        const result = yield (0, users_1.getUser)(login);
        if (!result || result.length === 0) {
            console.log("❌ Utilisateur non trouvé");
            return res.status(404).json({ error: true, message: "User not found" });
        }
        const user = result[0];
        // ✅ Vérification du mot de passe
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: true, message: "Invalid credentials" });
        }
        // ✅ Génération du token JWT
        const token = generateToken(user.id);
        res.status(200).json({ error: false, data: user, token });
    }
    catch (error) {
        console.error("Erreur serveur :", error);
        return res.status(500).json({ error: true, message: "Server error" });
    }
});
exports.getUserController = getUserController;
// ✅ Inscription d'un nouvel utilisateur
const addUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let client = null;
    let cvPath = null;
    try {
        const files = req.files;
        const image = ((_b = (_a = files === null || files === void 0 ? void 0 : files.image) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.filename) || null;
        const cvFile = (_c = files === null || files === void 0 ? void 0 : files.cv) === null || _c === void 0 ? void 0 : _c[0];
        let cv = null;
        let cv_embedding = null;
        if (cvFile) {
            // Get the actual path where Multer saved the file
            cv = cvFile.filename;
            cvPath = path_1.default.join(__dirname, '../../uploads', cvFile.filename);
            // Debugging logs
            console.log(`[CV PROCESSING] Expected CV path: ${cvPath}`);
            console.log(`[CV PROCESSING] File exists (immediate check): ${fs_1.default.existsSync(cvPath)}`);
            // Add a small delay to ensure file system consistency
            yield new Promise(resolve => setTimeout(resolve, 100));
            // Verify file exists with absolute path
            const absolutePath = path_1.default.resolve(cvPath);
            if (!fs_1.default.existsSync(absolutePath)) {
                const dirContents = yield promises_1.default.readdir(path_1.default.dirname(absolutePath));
                throw new Error(`CV file not found at ${absolutePath}. Directory contents: ${dirContents.join(', ')}`);
            }
            // Process the CV with normalized // In addUserController, after getting the processing result:
            const processingResult = yield (0, uploadController_1.extractCvText)(absolutePath, "temp_user_id");
            if (!processingResult.success) {
                throw new Error(`CV processing failed: ${processingResult.error}`);
            }
            // DEBUG: Verify embedding before passing to addUser
            console.log('[CONTROLLER] Embedding type:', typeof processingResult.embedding);
            console.log('[CONTROLLER] Is array?', Array.isArray(processingResult.embedding));
            if (processingResult.embedding) {
                console.log('[CONTROLLER] First 5 values:', processingResult.embedding.slice(0, 5));
            }
            cv_embedding = processingResult.embedding;
        }
        const { login, password, phone, gender, name, registerType, companyName, location, skills, experience, education } = req.body;
        // Validate required fields
        const requiredFields = ["login", "password", "gender", "name", "registerType"];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: true,
                message: `Missing fields: ${missingFields.join(", ")}`
            });
        }
        // Validate CV for applicants
        if (registerType === "applicant" && !cv) {
            return res.status(400).json({
                error: true,
                message: "CV required for applicants"
            });
        }
        // Check for existing user
        const existingUser = yield (0, users_1.getUser)(login);
        if (existingUser.length > 0) {
            return res.status(400).json({
                error: true,
                message: "User already exists"
            });
        }
        // Start transaction
        client = yield database_1.pool.connect();
        yield client.query("BEGIN");
        // Create user
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const newUser = yield (0, users_1.addUser)({
            login,
            password: hashedPassword,
            phone,
            gender,
            name,
            registerType,
            image,
            companyName,
            location,
            cv,
            cv_embedding,
            skills: skills ? JSON.parse(skills) : [],
            experience: experience ? JSON.parse(experience) : {},
            education: education ? JSON.parse(education) : {}
        }, client);
        yield client.query("COMMIT");
        // Generate token
        const token = generateToken(newUser.userId);
        res.status(201).json({
            error: false,
            message: "User created successfully",
            userId: newUser.userId,
            token
        });
    }
    catch (error) {
        // Clean up uploaded file if error occurred
        if (cvPath) {
            yield promises_1.default.unlink(cvPath).catch(console.error);
        }
        // Handle database transaction
        if (client) {
            yield client.query("ROLLBACK").catch(console.error);
            client.release();
        }
        const errorMessage = error instanceof Error ? error.message : "Server error";
        console.error("Error in addUserController:", error);
        res.status(500).json({
            error: true,
            message: errorMessage
        });
    }
});
exports.addUserController = addUserController;
const updateCvController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cvFile = req.file;
        const userId = req.user.id; // Depuis le middleware d'authentification
        if (!cvFile) {
            return res.status(400).json({ error: true, message: "CV file is required" });
        }
        const cvPath = path_1.default.join(__dirname, '../../uploads', cvFile.filename);
        const processingResult = yield (0, uploadController_1.extractCvText)(cvPath, userId);
        if (!processingResult.success) {
            return res.status(500).json({
                error: true,
                message: "CV processing failed",
                details: processingResult.error
            });
        }
        // Mettre à jour en base
        yield database_1.pool.query(`UPDATE applicant 
        SET cv = $1, cv_embedding = $2 
        WHERE user_id = $3`, [cvFile.filename, processingResult.embedding, userId]);
        res.status(200).json({
            error: false,
            message: "CV updated successfully"
        });
    }
    catch (error) {
        console.error("Update CV error:", error);
        res.status(500).json({
            error: true,
            message: error instanceof Error ? error.message : "Server error"
        });
    }
});
exports.updateCvController = updateCvController;
// ✅ Suppression d'un utilisateur
const deleteUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { login } = req.query;
    if (!login) {
        return res.status(400).json({ error: true, message: "Login is required" });
    }
    try {
        const deletedUser = yield (0, users_1.deleteUser)(login);
        if (!deletedUser) {
            return res.status(404).json({ error: true, message: "User not found" });
        }
        res.status(200).json({ error: false, message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Erreur serveur :", error);
        return res.status(500).json({ error: true, message: "Server error" });
    }
});
exports.deleteUserController = deleteUserController;
//# sourceMappingURL=index.js.map