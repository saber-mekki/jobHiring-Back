import express from "express";
import { addJobController, deleteJobController, getJobController } from "../../controllers/jobs";


const router = express.Router();


/**
 * @swagger
 * /addJob:
 *   post:
 *     summary: Add a new job
 *     tags: [User]
 *     requestBody:
 *       description: job name and description
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "developper"
 *                 required: true
 *               companyName:
 *                 type: string
 *                 example: "zzz"
 *                 required: true
 *               jobTitle:
 *                 type: string
 *                 example: "job"
 *                 required: false
 *               location:
 *                 type: string
 *                 example: "frontend developper"
 *                 required: true
 *               salary:
 *                 type: number
 *                 example: "12345"
 *                 required: true
 *               deadline:
 *                 type: string
 *                 example: "frontend developper"
 *                 required: true
 *               jobType:
 *                 type: string
 *                 example: "full time"
 *                 required: true
 *               phone:
 *                 type: number
 *                 example: "12565"
 *                 required: true
 *               id:
 *                 type: number
 *                 example: "12"
 *                 required: true
 *     responses:
 *       200:
 *         description: Job added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job added successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Job not found"
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
router.route("/addJob").post(addJobController);

/**
 * @swagger
 * /getJob:
 *   get:
 *     summary: get a job by name
 *     tags: [User]
 *     requestBody:
 *       description: job description
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *                 example: "12"
 *                 required: true
 *               name:
 *                 type: string
 *                 example: "developper"
 *                 required: true
 *               location:
 *                 type: string
 *                 example: "golaa"
 *                 required: true
 *               salary:
 *                 type: string
 *                 example: "1000 $"
 *                 required: false
 *               subject:
 *                 type: string
 *                 example: "frontend developper"
 *                 required: true
 *               description:
 *                 type: string
 *                 example: "x"
 *                 required: true
 *     responses:
 *       200:
 *         description: Job getted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
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
router.route("/getJob").get(getJobController);

/**
 * @swagger
 * /deleteJob:
 *   delete:
 *     summary: Delete a job by id
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: The job deleted
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "job deleted successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "job not found"
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
router.route("/deleteJob").delete(deleteJobController);


export default router;
