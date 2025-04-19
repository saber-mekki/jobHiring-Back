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
exports.uploadMiddleware = exports.updateBlogController = exports.deleteBlogController = exports.addBlogController = exports.getBlogController = void 0;
const blog_1 = require("../../services/blog");
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
const getBlogController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const blogId = req.query.blogId ? parseInt(req.query.blogId) : undefined;
    try {
        if (blogId && isNaN(blogId)) {
            return res.status(400).json({ error: "Invalid blogId format" });
        }
        const result = yield (0, blog_1.getBlog)(blogId);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedBlogs = result.slice(startIndex, endIndex);
        res.status(200).json({
            data: paginatedBlogs,
            total: result.length,
            page,
            pageSize
        });
    }
    catch (error) {
        console.error("Error fetching blogs:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getBlogController = getBlogController;
const addBlogController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogAuthor, blogTitle, blogDate, blogContent, } = req.body;
    const blogImage = req.file ? req.file.filename : null;
    try {
        yield (0, blog_1.addBlog)(blogAuthor, blogTitle, blogDate, blogContent, blogImage);
        res.status(200).send("blog added successfully.");
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});
exports.addBlogController = addBlogController;
const deleteBlogController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogId = req.query.blogId ? parseInt(req.query.blogId) : undefined;
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ error: "Invalid or missing blogId" });
    }
    try {
        const deletedBlog = yield (0, blog_1.deleteBlog)(blogId);
        if (!deletedBlog) {
            return res.status(404).json({ error: "blog not found" });
        }
        res.status(200).send("blog deleted successfully.");
    }
    catch (error) {
        console.error("Error deleting blog:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteBlogController = deleteBlogController;
const updateBlogController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogId = req.body.blogId;
    const { blogAuthor, blogTitle, blogDate, blogContent } = req.body;
    const blogImage = req.file ? req.file.filename : null;
    if (!blogId || isNaN(blogId)) {
        return res.status(400).json({ error: "Invalid or missing blogId" });
    }
    try {
        const updatedBlog = yield (0, blog_1.updateBlog)(blogId, blogAuthor, blogTitle, blogDate, blogContent, blogImage);
        if (!updatedBlog) {
            return res.status(404).json({ error: "blog not found" });
        }
        res.status(200).json({ message: "blog updated successfully", data: updatedBlog });
    }
    catch (error) {
        console.error("Error updating blog:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateBlogController = updateBlogController;
exports.uploadMiddleware = upload.single("logo");
//# sourceMappingURL=index.js.map