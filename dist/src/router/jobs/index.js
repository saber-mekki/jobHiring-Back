"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const jobs_1 = require("../../controllers/jobs");
const router1 = express_1.default.Router();
// Configuration de multer pour stocker les fichiers sur disque
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Sauvegarde les fichiers dans le dossier "uploads"
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Renommer le fichier pour éviter les conflits
    },
});
const upload = (0, multer_1.default)({ storage: storage });
/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get the list of jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: jobId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *       500:
 *         description: Internal server error
 */
router1.route("/jobs").get(jobs_1.getJobController);
/**
 * @swagger
 * /addJob:
 *   post:
 *     summary: Add a new job
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               companyName:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               location:
 *                 type: string
 *               salary:
 *                 type: string
 *               deadline:
 *                 type: string
 *               jobType:
 *                 type: string
 *               phone:
 *                 type: string
 *               description:
 *                 type: string
 *               requirement:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *               field:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Job added successfully
 *       500:
 *         description: Internal server error
 */
router1.route("/addJob").post(upload.single("logo"), jobs_1.addJobController);
/**
 * @swagger
 * /deleteJob:
 *   delete:
 *     summary: Delete a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The job ID to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router1.route("/deleteJob").delete(jobs_1.deleteJobController);
/**
 * @swagger
 * /updateJob:
 *   put:
 *     summary: Update an existing job
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: integer
 *               email:
 *                 type: string
 *               companyName:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               location:
 *                 type: string
 *               salary:
 *                 type: string
 *               deadline:
 *                 type: string
 *               jobType:
 *                 type: string
 *               phone:
 *                 type: string
 *               description:
 *                 type: string
 *               requirement:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *               field:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router1.route("/updateJob").put(upload.single("logo"), jobs_1.updateJobController);
exports.default = router1;
//# sourceMappingURL=index.js.map