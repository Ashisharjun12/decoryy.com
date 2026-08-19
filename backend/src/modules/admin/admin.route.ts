import { Router } from "express";
import { geoCityAdminRouter, geoPincodeAdminRouter } from "@/modules/geo/index.js";
import { authRequired } from "@/shared/middlewares/auth.middleware.js";
import { requireRole } from "@/shared/middlewares/requireRole.middleware.js";

export const adminRouter = Router();
adminRouter.use(authRequired, requireRole("admin"));
adminRouter.use("/cities", geoCityAdminRouter);
adminRouter.use("/pincodes", geoPincodeAdminRouter);
