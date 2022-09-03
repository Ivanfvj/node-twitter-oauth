import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

// read env vars from .env file
dotenv.config();

// configure module-alias to use @src on imports
import "./alias";
import config from "./config";
import Router from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import DatabaseConnection from "./db";

async function start() {
  const databaseConnection = new DatabaseConnection(config.mongo);
  await databaseConnection.initialize();

  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors({ credentials: true }));
  app.use(helmet());
  app.use(morgan("dev"));

  // App router
  app.use("/", Router);

  // Error handler middleware
  app.use(errorHandler);

  const server = app.listen(config.server.PORT, () => {
    console.log(
      `Server running at ${config.server.DOMAIN}:${config.server.PORT}`
    );
  });
}

// Start the app
start();
