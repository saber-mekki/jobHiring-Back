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
exports.uploadMiddleware = exports.updateCommentController = exports.deleteCommentController = exports.addCommentController = exports.getCommentController = void 0;
const comment_1 = require("../../services/comment");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Dossier où enregistrer les fichiers
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname)); // Nom unique
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const getCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const commentBlogId = req.query.commentBlogId ? parseInt(req.query.commentBlogId) : undefined;
    try {
        if (commentBlogId && isNaN(commentBlogId)) {
            return res.status(400).json({ error: "Invalid commentBlogId format" });
        }
        const result = yield (0, comment_1.getComment)(commentBlogId);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedComments = result.slice(startIndex, endIndex);
        res.status(200).json({
            data: paginatedComments,
            total: result.length,
            page,
            pageSize
        });
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getCommentController = getCommentController;
const addCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentAuthor, commentBlogId, commentDate, commentContent } = req.body;
    const commentAuthorImage = req.file ? req.file.filename : null;
    if (!commentAuthor || !commentBlogId || !commentDate || !commentContent) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const newComment = yield (0, comment_1.addComment)(commentAuthor, commentBlogId, commentDate, commentContent, commentAuthorImage);
        res.status(201).json({ message: "Comment added successfully", data: newComment });
    }
    catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.addCommentController = addCommentController;
const deleteCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = req.query.commentId ? parseInt(req.query.commentId) : undefined;
    if (!commentId || isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid or missing commentId" });
    }
    try {
        const deletedComment = yield (0, comment_1.deleteComment)(commentId);
        if (!deletedComment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json({ message: "Comment deleted successfully", data: deletedComment });
    }
    catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteCommentController = deleteCommentController;
const updateCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId, commentAuthor, commentDate, commentContent } = req.body;
    const commentAuthorImage = req.file ? req.file.filename : null;
    if (!commentId || isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid or missing commentId" });
    }
    if (!commentAuthor || !commentDate || !commentContent) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const updatedComment = yield (0, comment_1.updateComment)(commentId, commentAuthor, commentDate, commentContent, commentAuthorImage);
        if (!updatedComment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        res.status(200).json({ message: "Comment updated successfully", data: updatedComment });
    }
    catch (error) {
        console.error("Error updating comment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateCommentController = updateCommentController;
exports.uploadMiddleware = upload.single("logo");
//# sourceMappingURL=index.js.map