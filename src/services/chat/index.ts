import { executeSQLQuery } from '../../database';
import { app } from '../../index'; 
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
}
export interface Conversation {
  userId: number;
  userName: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export const saveMessage = async (data: {
  senderId: number;
  receiverId: number;
  content: string;
}): Promise<Message> => {
  if (!data.content?.trim()) throw new Error('Message content cannot be empty');

  const query = `
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, sender_id, receiver_id, content, timestamp, is_read
  `;

  const result = await executeSQLQuery(query, [
    data.senderId,
    data.receiverId,
    data.content
  ]);

  const savedMessage = {
    id: result.rows[0].id,
    senderId: result.rows[0].sender_id,
    receiverId: result.rows[0].receiver_id,
    content: result.rows[0].content,
    timestamp: result.rows[0].timestamp,
    isRead: result.rows[0].is_read
  };

  // AJOUT : Émission Socket.IO
  app.locals.io
    .to(`user_${data.receiverId}`)
    .to(`user_${data.senderId}`)
    .emit('newMessage', savedMessage);

  return savedMessage;
};

export const GetMessageHistory = async (
  userId: number,
  otherUserId: number
): Promise<Message[]> => {
  const query = `
    SELECT 
      m.id,
      m.sender_id as "senderId",
      m.receiver_id as "receiverId",
      m.content,
      m.timestamp,
      m.is_read as "isRead",
      u1.name as "senderName",
      u2.name as "receiverName"
    FROM messages m
    JOIN public."userTable" u1 ON m.sender_id = u1.id
    JOIN public."userTable" u2 ON m.receiver_id = u2.id
    WHERE (m.sender_id = $1 AND m.receiver_id = $2)
       OR (m.sender_id = $2 AND m.receiver_id = $1)
    ORDER BY m.timestamp ASC
  `;
  
  const result = await executeSQLQuery(query, [userId, otherUserId]);
  
  return result.rows.map(row => ({
    id: row.id,
    senderId: row.senderId,
    receiverId: row.receiverId,
    content: row.content,
    timestamp: row.timestamp,
    isRead: row.isRead,
    senderName: row.senderName,
    receiverName: row.receiverName
  }));
};
export const MarkMessagesAsRead = async (messageIds: number[]) => {
  const query = `UPDATE messages SET is_read = true WHERE id = ANY($1) RETURNING id`;
  const result = await executeSQLQuery(query, [messageIds]);

  // Récupération des expéditeurs ET destinataires concernés
  const participantsResult = await executeSQLQuery(
    `SELECT DISTINCT sender_id, receiver_id 
     FROM messages 
     WHERE id = ANY($1)`,
    [messageIds]
  );

  // Émission à tous les participants concernés
  participantsResult.rows.forEach(participant => {
    app.locals.io.to(`user_${participant.sender_id}`).emit('messagesRead', messageIds);
    app.locals.io.to(`user_${participant.receiver_id}`).emit('messagesRead', messageIds);
  });

  return result;
};
  
  export const GetUnreadCount = async (userId: number) => {
    const query = `
      SELECT COUNT(*) 
      FROM messages
      WHERE receiver_id = $1 AND is_read = false
    `;
    
    const result = await executeSQLQuery(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  };


  export const GetConversations = async (userId: number) => {
    const query = `
      SELECT DISTINCT ON (u.id)
        u.id as "userId",
        u.name as "userName",
        m.content as "lastMessage",
        m.timestamp,
        COUNT(*) OVER(PARTITION BY u.id) as "messageCount"
      FROM messages m
      JOIN public."userTable" u ON u.id = CASE 
        WHEN m.sender_id = $1 THEN m.receiver_id 
        ELSE m.sender_id 
      END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY u.id, m.timestamp DESC
    `;
  
    const result = await executeSQLQuery(query, [userId]);
    return result.rows.map(row => ({
      userId: row.userId,
      userName: row.userName,
      lastMessage: row.lastMessage,
      timestamp: row.timestamp,
      messageCount: parseInt(row.messageCount, 10)
    }));
  };