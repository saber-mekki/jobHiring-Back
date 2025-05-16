
import { executeSQLQuery } from '../../database';
import { Request, Response } from 'express';
import { GetMessageHistory, MarkMessagesAsRead, GetUnreadCount, GetConversations } from '../../services/chat';

import { app } from '../../index';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const conversations = await GetConversations(userId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ 
      error: 'Échec de la récupération des conversations',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const otherUserId = parseInt(req.params.otherUserId);
    
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: 'ID utilisateur invalide' });
    }

    // Vérifier que les utilisateurs existent
    const userCheck = await executeSQLQuery(
      'SELECT id FROM "userTable" WHERE id = $1',
      [otherUserId]
    );
    
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const history = await GetMessageHistory(userId, otherUserId);
    res.json(history);
    
  } catch (error) {
    console.error('Erreur historique messages:', error);
    res.status(500).json({ 
      error: 'Échec de la récupération de l\'historique',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Modifiez la fonction markMessagesAsRead
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const messageIds = req.body.messageIds;
    await MarkMessagesAsRead(messageIds); // La logique d'émission est déjà dans le service
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const count = await GetUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};