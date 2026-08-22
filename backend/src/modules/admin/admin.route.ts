import { Router } from "express";
import { geoCityAdminRouter, geoPincodeAdminRouter } from "@/modules/geo/index.js";
import { mediaAdminRouter, mediaFolderAdminRouter } from "@/modules/upload/index.js";
import {
    catalogAddonAdminRouter,
    catalogCategoryAdminRouter,
    catalogProductAdminRouter,
    catalogSectionAdminRouter,
} from "@/modules/catalog/index.js";
import { authRequired } from "@/shared/middlewares/auth.middleware.js";
import { requireRole } from "@/shared/middlewares/requireRole.middleware.js";

export const adminRouter = Router();
adminRouter.use(authRequired, requireRole("admin"));
adminRouter.use("/cities", geoCityAdminRouter);
adminRouter.use("/pincodes", geoPincodeAdminRouter);
adminRouter.use("/uploads", mediaAdminRouter);
adminRouter.use("/media-folders", mediaFolderAdminRouter);
adminRouter.use("/categories", catalogCategoryAdminRouter);
adminRouter.use("/products", catalogProductAdminRouter);
adminRouter.use("/addons", catalogAddonAdminRouter);
adminRouter.use("/sections", catalogSectionAdminRouter);
