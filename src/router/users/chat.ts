import express from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import {
  getChatHistory,
  markMessagesAsRead,
  getUnreadCount,
  getConversations
} from '../../controllers/chat';
import { getUserDetails } from '../../controllers/admin';
import rateLimit from 'express-rate-limit';

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
});

const router = express.Router();
router.get(
  '/history/:otherUserId',
  authenticateToken,
  chatLimiter,
  getChatHistory
);
router.get("/users/:id", authenticateToken, getUserDetails);

router.post('/messages/read', authenticateToken, markMessagesAsRead);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.get('/conversations', authenticateToken, getConversations);

export default router;