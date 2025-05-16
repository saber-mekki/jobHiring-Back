// sockets/chat.ts
import { Server } from 'socket.io';
import { MarkMessagesAsRead, saveMessage } from '../services/chat';
import { authenticateSocket } from '../middlewares/socketAuth';

export const setupChatSocket = (io: Server) => {
  const chatNamespace = io.of('/chat');
  
  chatNamespace.use(authenticateSocket);
  
  chatNamespace.on('connection', (socket) => {
    const userId = socket.data.user.id;
    console.log(`User ${userId} connected to chat`);
  
    // ✅ Join a personal room (for private messaging)
    socket.join(String(userId));
  
    socket.on('send_message', async (message) => {
      try {
        const savedMessage = await saveMessage({
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content
        });
  
        console.log('log', savedMessage);
  
        // ✅ Emit to both sender and receiver rooms
        chatNamespace.to(String(message.senderId)).emit('receive_message', savedMessage);
        chatNamespace.to(String(message.receiverId)).emit('receive_message', savedMessage);
      } catch (error) {
        console.error('Erreur sauvegarde message:', error);
        socket.emit('message_error', {
          error: 'Échec de l\'envoi du message'
        });
      }
    });
    // Dans la connexion socket
    socket.on('mark_as_read', async (messageIds: number[]) => {
      try {
        await MarkMessagesAsRead(messageIds);
      } catch (error) {
        console.error('Erreur lecture messages:', error);
      }
    });
    
  
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from chat`);
    });
  });
  
};