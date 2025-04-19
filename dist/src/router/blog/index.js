"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blog_1 = require("../../controllers/blog");
const multer_1 = __importDefault(require("multer"));
const router3 = express_1.default.Router();
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
 * /blogs:
 *   get:
 *     summary: get a the list of blogs
 *     tags: [Blogs]
 *     parameters:
 *        - in: query
 *          name: blogId
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
router3.route("/blogs").get(blog_1.getBlogController);
/**
 * @swagger
 * /addBlog:
 *   post:
 *     summary: Add a new blog
 *     tags: [Blogs]
 *     requestBody:
 *       description: blog name and description
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blogAuthor:
 *                 type: string
 *                 example: "Author"
 *                 required: true
 *               blogTitle:
 *                 type: string
 *                 example: "zzz"
 *                 required: true
 *               blogDate:
 *                 type: string
 *                 example: "1/2/2002"
 *                 required: false
 *               blogContent:
 *                 type: string
 *                 example: "cotenu de blog"
 *                 required: true
 *               blogImage:
 *                 type: Buffer
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: blog added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "blog added successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "blog not found"
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
router3.route("/addBlog").post(upload.single("blogImage"), blog_1.addBlogController);
/**
 * @swagger
 * /deleteBlog:
 *   delete:
 *     summary: Delete a blog by id
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: blogId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The blog deleted
 *     responses:
 *       200:
 *         description: blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "blog deleted successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "blog not found"
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
router3.route("/deleteBlog").delete(blog_1.deleteBlogController);
/**
 * @swagger
 * /updateBlog:
 *   put:
 *     summary: Update an existing blog
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blogId:
 *                 type: integer
 *                 example: 1
 *                 required: true
 *               blogAuthor:
 *                 type: string
 *                 example: "developer@example.com"
 *               blogTitle:
 *                 type: string
 *                 example: "ABC Corp"
 *               blogDate:
 *                 type: string
 *                 example: "2024-12-31"
 *               blogContent:
 *                 type: string
 *                 example: "New York"
 *               blogImage:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Internal server error
 */
router3.route("/updateBlog").put(upload.single("blogImage"), blog_1.updateBlogController);
exports.default = router3;
//# sourceMappingURL=index.js.map