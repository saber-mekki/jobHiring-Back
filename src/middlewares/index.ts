import cors from "cors";
import bodyParser from "body-parser";
import express, { Application } from "express";
import path from "path";
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authenticateSocket } from './socketAuth';

export default (app: Application) => {
  // Configuration CORS améliorée
  const corsOptions: cors.CorsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-Access-Token',
      'X-HTTP-Method-Override'
    ],
    credentials: true,
    maxAge: 86400, // Cache préflight 24h
    preflightContinue: false
  };

  // Appliquer CORS avant les autres middlewares
  app.use(cors(corsOptions));
  
  // Gérer explicitement les requêtes OPTIONS
  app.options('*', cors(corsOptions));

  // Middlewares standards
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  
  // Configuration des fichiers statiques
  app.use("/uploads", express.static(path.join(__dirname, '..', 'uploads')));

  // Création du serveur HTTP
  const server = http.createServer(app);
  
  // Configuration Socket.IO
  const io = new SocketIOServer(server, {
    cors: corsOptions
  });

  // Authentification Socket.IO
  io.use(authenticateSocket);

  // Stocker io dans app.locals pour y accéder dans les routes
  app.locals.io = io;

  return server;
};