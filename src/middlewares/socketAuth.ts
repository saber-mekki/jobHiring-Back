import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

interface DecodedToken extends jwt.JwtPayload {
  id: number;
}

export const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    if (typeof decoded === 'string' || !decoded.id || typeof decoded.id !== 'number') {
      return next(new Error('Invalid token structure'));
    }

    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};