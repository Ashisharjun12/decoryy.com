import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { MastraServer } from "@mastra/express";
import { errorHandler } from "@/shared/errors/apiHandler.js";
import { httpLogger } from "@/shared/middlewares/logger.middleware.js";
import mastra from "@/mastra/index.js";
import { authRouter, userRouter, vendorRouter } from "@/modules/identity/index.js";
import { geoRouter } from "@/modules/geo/index.js";
import { catalogRouter } from "@/modules/catalog/index.js";
import { adminRouter } from "@/modules/admin/index.js";

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

    this.app.use("/api/v1/auth", authRouter);
    this.app.use("/api/v1/vendor", vendorRouter);
    this.app.use("/api/v1/user", userRouter);
    this.app.use("/api/v1/geo", geoRouter);
    this.app.use("/api/v1/catalog", catalogRouter);
    this.app.use("/api/v1/admin", adminRouter);
  }

  private setupErrorHandling() {
    this.app.use(errorHandler);
  }

  getApp(): Application {
    return this.app;
  }
}

export default App;
