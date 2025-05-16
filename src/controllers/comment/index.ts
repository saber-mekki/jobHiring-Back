import { addComment, deleteComment, getComment, updateComment, likeComment } from "../../services/comment";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/"); // Dossier où enregistrer les fichiers
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
  const commentId: number | undefined = req.query.commentId ? parseInt(req.query.commentId as string) : undefined;
  const userId = req.user?.id;
    try {
    
      if (commentBlogId && isNaN(commentBlogId)) {
          return res.status(400).json({ error: "Invalid commentBlogId format" });
      }

      const result = await getComment(commentBlogId, commentId, userId);
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
  const { 
    userId,
    commentAuthor,
    commentBlogId,
    commentDate,
    commentContent,
    parent_comment_id,
    commentAuthorImage
  } = req.body;
  

  if (!commentAuthor || !commentBlogId || !commentDate || !commentContent) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const newComment = await addComment(
        userId,
        commentAuthor, 
        commentBlogId, 
        commentDate, 
        commentContent, 
        commentAuthorImage, 
        parent_comment_id || null
      );
      
      res.status(201).json({ message: "Comment added successfully", data: newComment });
  } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};
// controllers/comment.ts
export const likeCommentController = async (req: Request, res: Response) => {
    const { commentId, userId } = req.body;

    if (!commentId || !userId || isNaN(commentId) || isNaN(userId)) {
        return res.status(400).json({ error: "Paramètres invalides" });
    }

    try {
        const updatedComment = await likeComment(Number(commentId), Number(userId));
        
        if (!updatedComment) {
            return res.status(404).json({ error: "Commentaire introuvable" });
        }
        
        res.status(200).json({ 
            message: "Like mis à jour",
            data: {
                likes: updatedComment.likes,
                hasLiked: updatedComment.has_liked
            }
        });
    } catch (error) {
        console.error("Erreur like:", error);
        res.status(500).json({ error: "Erreur serveur" });
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
  const { 
    commentId,
    commentAuthor,
    commentDate, 
    commentContent,
    commentAuthorImage
  } = req.body;
  

  if (!commentId || isNaN(commentId)) {
      return res.status(400).json({ error: "Invalid or missing commentId" });
  }

  if (!commentAuthor || !commentDate || !commentContent) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const updatedComment = await updateComment(
        commentId, 
        commentAuthor, 
        commentDate, 
        commentContent, 
        commentAuthorImage
      );
      
      if (!updatedComment) {
          return res.status(404).json({ error: "Comment not found" });
      }
      
      res.status(200).json({ message: "Comment updated successfully", data: updatedComment });
  } catch (error) {
      console.error("Error updating comment:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

