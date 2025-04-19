"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const interview_1 = require("../../controllers/interview");
const router2 = express_1.default.Router();
/**
 * @swagger
 * /interviews:
 *   get:
 *     summary: get a the list of interviews
 *     tags: [Interview]
 *     parameters:
 *        - in: query
 *          name: jobId
 *          required: false
 *          schema:
 *            type: any
 *        - in: query
 *          name: page
 *          required: false
 *          schema:
 *            type: string
 *        - in: query
 *          name: pageSize
 *          required: false
 *          schema:
 *            type: string
 *     responses:
 *       200:
 *         description: ok
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *       500:
 *         description: error
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *
 *
 */
router2.route("/interviews").get(interview_1.getInterviewController);
/**
 * @swagger
 * /addInterview:
 *   post:
 *     summary: Add a new interview
 *     tags: [Interview]
 *     requestBody:
 *       description: interview details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "aa@gmail.com"
 *                 required: true
 *               jobId:
 *                 type: number
 *                 example: "1"
 *                 required: false
 *               firstName:
 *                 type: string
 *                 example: "firstname"
 *                 required: true
 *               lastName:
 *                 type: string
 *                 example: "lastnaame"
 *                 required: true
 *               nationality:
 *                 type: string
 *                 example: "tounsi"
 *                 required: true
 *               seekedSalary:
 *                 type: string
 *                 example: "2000"
 *                 required: true
 *               phone:
 *                 type: string
 *                 example: "12565"
 *                 required: true
 *               description:
 *                 type: string
 *                 example: "descriptionnnn"
 *                 required: true
 *               jobType:
 *                 type: string
 *                 example: "full time"
 *                 required: true
 *
 *     responses:
 *       200:
 *         description: interview added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "interview added successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "interview not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router2.route("/addInterview").post(interview_1.addInterviewController);
exports.default = router2;
//# sourceMappingURL=index.js.map