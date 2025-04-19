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
exports.uploadMiddleware = exports.updateJobController = exports.deleteJobController = exports.addJobController = exports.getJobController = void 0;
// controllers/jobs.ts
const jobs_1 = require("../../services/jobs");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configuration de Multer pour enregistrer les fichiers localement
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Dossier où enregistrer les fichiers
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname)); // Nom unique
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const getJobController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const jobId = req.query.jobId ? parseInt(req.query.jobId) : undefined;
    if (jobId && isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid jobId format" });
    }
    try {
        const result = yield (0, jobs_1.getJob)(jobId);
        const startIndex = (page - 1) * pageSize;
        const paginatedJobs = result.slice(startIndex, startIndex + pageSize);
        res.status(200).json({
            data: paginatedJobs,
            total: result.length,
            page,
            pageSize,
        });
    }
    catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getJobController = getJobController;
const addJobController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, companyName, jobTitle, location, phone, salary, deadline, jobType, description, requirement, resposibilities, // Correction du nom de la variable
    field, } = req.body;
    const logo = req.file ? req.file.filename : null;
    try {
        yield (0, jobs_1.addJob)(email, companyName, jobTitle, location, phone, salary, deadline, jobType, description, requirement, resposibilities, field, logo);
        res.status(200).json({ message: "Job added successfully." });
    }
    catch (error) {
        console.error("Error adding job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.addJobController = addJobController;
const deleteJobController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.query.jobId ? parseInt(req.query.jobId) : undefined;
    if (!jobId || isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid or missing jobId" });
    }
    try {
        const deletedJob = yield (0, jobs_1.deleteJob)(jobId);
        if (!deletedJob) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.status(200).json({ message: "Job deleted successfully." });
    }
    catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteJobController = deleteJobController;
const updateJobController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = parseInt(req.body.jobId);
    if (!jobId || isNaN(jobId)) {
        return res.status(400).json({ error: "Invalid or missing jobId" });
    }
    const { email, companyName, jobTitle, location, phone, salary, deadline, jobType, description, requirement, resposibilities, // Correction du nom de la variable
    field, } = req.body;
    const logo = req.file ? req.file.filename : null;
    try {
        const updatedJob = yield (0, jobs_1.updateJob)(jobId, email, companyName, jobTitle, location, phone, salary, deadline, jobType, description, requirement, resposibilities, field, logo);
        if (!updatedJob) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.status(200).json({ message: "Job updated successfully", data: updatedJob });
    }
    catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateJobController = updateJobController;
// Middleware pour l'upload de fichier
exports.uploadMiddleware = upload.single("logo");
//# sourceMappingURL=index.js.map