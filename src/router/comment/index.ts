import express from "express";
import { addCommentController, deleteCommentController, getCommentController,updateCommentController } from "../../controllers/comment";

import multer from "multer";


const router4 = express.Router();

// Configuration de multer pour stocker les fichiers sur disque
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Sauvegarde les fichiers dans le dossier "uploads"
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Renommer le fichier pour éviter les conflits
  },
});

const upload = multer({ storage: storage });
/**
 * @swagger
 * /comment:
 *   get:
 *     summary: get a the list of comments
 *     tags: [Comments]
 *     parameters:
 *        - in: query
 *          name: commentId
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
router4.route("/comment").get(getCommentController);

/**
 * @swagger
 * /addComment:
 *   post:
 *     summary: Add a new Comment
 *     tags: [Comments]
 *     requestBody:
 *       description: comment name and description
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentAuthor:
 *                 type: string
 *                 example: "Author"
 *                 required: true
 *               commentDate:
 *                 type: string
 *                 example: "1/2/2002"
 *                 required: false
 *               commentContent:
 *                 type: string
 *                 example: "cotenu de commentaire"
 *                 required: true
 *               commentBlogId:
 *                 type: integer
 *                 example: 1
 *                 required: true
 *               commentAuthorImage:
 *                 type: string
 *                 format: binary
 * 
 *     responses:
 *       200:
 *         description: comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "comment added successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "comment not found"
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
router4.route("/addComment").post(upload.single("commentAuthorImage"),addCommentController);

/**
 * @swagger
 * /deleteComment:
 *   delete:
 *     summary: Delete a comment by id
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: commentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The comment deleted
 *     responses:
 *       200:
 *         description: comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "comment deleted successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "comment not found"
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
router4.route("/deleteComment").delete(deleteCommentController);

/**
 * @swagger
 * /updateComment:
 *   put:
 *     summary: Update an existing comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentId:
 *                 type: integer
 *                 example: 1
 *                 required: true
 *               commentAuthor:
 *                 type: string
 *                 example: "developer@example.com"
 *               commentDate:
 *                 type: string
 *                 example: "2024-12-31"
 *               commentContent:
 *                 type: string
 *                 example: "New York"
 *               commentAuthorImage:
 *                 type: string
 *                 format: binary
 *               
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router4.route("/updateComment").put(upload.single("commentAuthorImage"),updateCommentController);



export default router4;