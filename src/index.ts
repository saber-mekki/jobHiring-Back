import express, { Application } from "express";
import { config } from "dotenv";
import registerRouter from "./router";
import registerMiddlewares from "./middlewares";
import { setupChatSocket as setupSocketHandlers } from "./sockets";

export const app: Application = express();

// Enregistrement des middlewares retourne maintenant le serveur HTTP
const server = registerMiddlewares(app);
registerRouter(app);

config();

const PORT: string | number = process.env.PORT || 5001;
const ENV: string = process.env.NODE_ENV || "development";

// Configuration des handlers Socket.IO
setupSocketHandlers(app.locals.io);

// Utilisation de server.listen au lieu de app.listen
server.listen(PORT, () =>
  console.log(
    ` 📡 Backend server: ` + ` Running in ${ENV} mode on port ${PORT}` + 
    ` | WebSocket: /socket.io/`
  )
);