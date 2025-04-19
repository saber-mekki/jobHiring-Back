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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matching_1 = require("../../services/ai/matching");
const router5 = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     JobWithScore:
 *       type: object
 *       properties:
 *         jobId:
 *           type: integer
 *         jobTitle:
 *           type: string
 *         companyName:
 *           type: string
 *         matchScore:
 *           type: number
 *           format: float
 *           description: Similarity score between 0-100
 *
 *     ApplicantWithScore:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         matchScore:
 *           type: number
 *           format: float
 *           description: Similarity score between 0-100
 */
/**
 * @swagger
 * /{id}/recommendations:
 *   get:
 *     summary: Get AI-powered job recommendations for applicant
 *     tags: [Matching]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Applicant ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of recommendations to return
 *     responses:
 *       200:
 *         description: List of recommended jobs with match scores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobWithScore'
 *       404:
 *         description: Applicant not found
 *       500:
 *         description: Internal server error
 */
router5.get('/:id/recommendations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicantId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 10;
        if (isNaN(applicantId)) {
            return res.status(400).json({ error: 'Invalid applicant ID' });
        }
        const recommendations = yield (0, matching_1.getJobRecommendations)(applicantId, limit);
        res.json(recommendations);
    }
    catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
/**
 * @swagger
 * /{id}/applicants:
 *   get:
 *     summary: Get top applicants for a job (AI-powered matching)
 *     tags: [Matching]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of applicants to return
 *     responses:
 *       200:
 *         description: List of applicants with match scores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApplicantWithScore'
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router5.get('/:id/applicants', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 50;
        if (isNaN(jobId)) {
            return res.status(400).json({ error: 'Invalid job ID' });
        }
        const applicants = yield (0, matching_1.getApplicantRanking)(jobId, limit);
        res.json(applicants);
    }
    catch (error) {
        console.error('Applicant ranking error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
exports.default = router5;
//# sourceMappingURL=index.js.map