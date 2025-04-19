import { addComment, deleteComment, getComment, updateComment } from "../../services/comment";
import { Request, Response } from "express";import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où enregistrer les fichiers
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
  },
});

const upload = multer({ storage: storage });


export const getCommentController = async (req: Request, res: Response) => {
  const page: number = parseInt(req.query.page as string) || 1;
  const pageSize: number = parseInt(req.query.pageSize as string) || 10;
  const commentBlogId: number | undefined = req.query.commentBlogId ? parseInt(req.query.commentBlogId as string) : undefined;

  try {
      if (commentBlogId && isNaN(commentBlogId)) {
          return res.status(400).json({ error: "Invalid commentBlogId format" });
      }

      const result = await getComment(commentBlogId);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedComments = result.slice(startIndex, endIndex);

      res.status(200).json({
          data: paginatedComments,
          total: result.length,
          page,
          pageSize
      });
  } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

export const addCommentController = async (req: Request, res: Response) => {
  const { commentAuthor,
     commentBlogId,
      commentDate,
       commentContent
     } = req.body;
     const commentAuthorImage = req.file ? req.file.filename : null;

  if (!commentAuthor || !commentBlogId || !commentDate || !commentContent) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const newComment = await addComment(commentAuthor, commentBlogId, commentDate, commentContent,commentAuthorImage);
      res.status(201).json({ message: "Comment added successfully", data: newComment });
  } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCommentController = async (req: Request, res: Response) => {
  const commentId = req.query.commentId ? parseInt(req.query.commentId as string) : undefined;

  if (!commentId || isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid or missing commentId" });
  }

  try {
      const deletedComment = await deleteComment(commentId);
      if (!deletedComment) {
          return res.status(404).json({ error: "Comment not found" });
      }
      res.status(200).json({ message: "Comment deleted successfully", data: deletedComment });
  } catch (error) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCommentController = async (req: Request, res: Response) => {
  const { commentId,
     commentAuthor,
      commentDate, 
      commentContent
     } = req.body;
      const commentAuthorImage = req.file ? req.file.filename : null;


  if (!commentId || isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid or missing commentId" });
  }

  if (!commentAuthor || !commentDate || !commentContent) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const updatedComment = await updateComment(commentId, commentAuthor, commentDate, commentContent,commentAuthorImage);
      if (!updatedComment) {
          return res.status(404).json({ error: "Comment not found" });
      }
      res.status(200).json({ message: "Comment updated successfully", data: updatedComment });
  } catch (error) {
      console.error("Error updating comment:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};
export const uploadMiddleware = upload.single("logo");

