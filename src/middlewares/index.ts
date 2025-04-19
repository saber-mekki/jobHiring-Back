import cors from "cors";
import bodyParser from "body-parser";
import express from "express";

import { Application, json } from "express";
import path from "path";
//import morgan from "morgan";

export default (app: Application) => {
  app.use(cors(
    {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  ));
  app.use(json());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
   app.use("/uploads", express.static("uploads"));
   app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

  //app.use(morgan("dev"));
};
