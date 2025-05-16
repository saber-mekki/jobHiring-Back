import { addBlog, deleteBlog, getBlog, updateBlog } from "../../services/blog";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/"); // Path to uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

export const getBlogController = async (req: Request, res: Response) => {
  const page: number = parseInt(req.query.page as string) || 1;
  const pageSize: number = parseInt(req.query.pageSize as string) || 10;
  const blogId: number | undefined = req.query.blogId ? parseInt(req.query.blogId as string) : undefined;

  try {
    if (blogId && isNaN(blogId)) {
      return res.status(400).json({ error: "Invalid blogId format" });
    }

    const result = await getBlog(blogId);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBlogs = result.slice(startIndex, endIndex);

    res.status(200).json({
      data: paginatedBlogs,
      total: result.length,
      page,
      pageSize
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addBlogController = async (req: Request, res: Response) => {
  try {
    // Extract data from request body
    const {
      blogAuthor,
      blogTitle,
      blogDate,
      blogContent,
      authorId,
    } = req.body;

    // Get the image filename if it exists
    const blogImage = req.file ? req.file.filename : null;

    // Validate required fields
    if (!blogAuthor || !blogTitle || !blogContent) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Parse authorId as number (if it's a string in the request)
    const parsedAuthorId = typeof authorId === 'string' ? parseInt(authorId) : authorId;

    // Add the blog
    const result = await addBlog(
      blogAuthor,
      blogTitle,
      blogDate,
      blogContent,
      parsedAuthorId,
      blogImage
    );

    res.status(200).json({ 
      message: "Blog added successfully", 
      data: result 
    });
  } catch (error) {
    console.error("Error adding blog:", error);
    res.status(500).json({ error: "Internal server error"});
  }
};

export const deleteBlogController = async (req: Request, res: Response) => {
  const blogId = req.query.blogId ? parseInt(req.query.blogId as string) : undefined;

  if (!blogId || isNaN(blogId)) {
    return res.status(400).json({ error: "Invalid or missing blogId" });
  }

  try {
    const deletedBlog = await deleteBlog(blogId);
    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateBlogController = async (req: Request, res: Response) => {
  try {
    const blogId = parseInt(req.body.blogId);
    const {
      blogAuthor,
      blogTitle,
      blogDate,
      blogContent
    } = req.body;
    const blogImage = req.file ? req.file.filename : null;

    if (!blogId || isNaN(blogId)) {
      return res.status(400).json({ error: "Invalid or missing blogId" });
    }

    const updatedBlog = await updateBlog(
      blogId,
      blogAuthor,
      blogTitle,
      blogDate,
      blogContent,
      blogImage
    );
    
    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.status(200).json({ message: "Blog updated successfully", data: updatedBlog });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ error: "Internal server error"});
  }
};

export const uploadMiddleware = upload.single("blogImage");