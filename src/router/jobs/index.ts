import express from "express";
import { addJobController, deleteJobController, getJobController } from "../../controllers/jobs";


const router1 = express.Router();


/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: get a the list of jobs
 *     tags: [Jobs]
 *     parameters:
 *        - in: query
 *          name: jobTitle
 *          required: false
 *          schema:
 *            type: string
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
router1.route("/jobs").get(getJobController);

/**
 * @swagger
 * /addJob:
 *   post:
 *     summary: Add a new job
 *     tags: [Jobs]
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
 *                 type: string
 *                 example: "12345"
 *                 required: true
 *               deadline:
 *                 type: string
 *                 example: "2024-12-31"
 *                 required: true
 *               jobType:
 *                 type: string
 *                 example: "full time"
 *                 required: true
 *               phone:
 *                 type: string
 *                 example: "12565"
 *                 required: true
 *               description:
 *                 type: string
 *                 example: "full time"
 *                 required: true
 *               requirement:
 *                 type: string
 *                 example: "full time"
 *                 required: true
 *               resposibilities:
 *                 type: string
 *                 example: "full time"
 *                 required: true
 *               field:
 *                 type: string
 *                 example: "field sss"
 *                 required: true
 * 
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
router1.route("/addJob").post(addJobController);

/**
 * @swagger
 * /deleteJob:
 *   delete:
 *     summary: Delete a job by name
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: jobName
 *         schema:
 *           type: string
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
router1.route("/deleteJob").delete(deleteJobController);


export default router1;
