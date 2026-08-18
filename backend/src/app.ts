import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { MastraServer } from "@mastra/express";
import { errorHandler } from "@/shared/errors/apiHandler.js";
import { httpLogger } from "@/shared/middlewares/logger.middleware.js";
import mastra from "@/mastra/index.js";

class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.app.set("trust proxy", 1);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  async setupMastra(): Promise<void> {
    const server = new MastraServer({ app: this.app, mastra });
    await server.init();
  }

  private setupMiddleware() {
    const corsOption = {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    };

    this.app.use(helmet());
    this.app.use(cors(corsOption));
    this.app.use(httpLogger);
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes() {
    this.app.get("/health", (_req, res) => {
      res.status(200).json({ message: "Decoryy is Live" });
    });
  }

  private setupErrorHandling() {
    this.app.use(errorHandler);
  }

  getApp(): Application {
    return this.app;
  }
}

export default App;