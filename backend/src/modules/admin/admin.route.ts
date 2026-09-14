import { Router } from "express";
import { geoCityAdminRouter, geoPincodeAdminRouter } from "@/modules/geo/index.js";
import { mediaAdminRouter, mediaFolderAdminRouter } from "@/modules/upload/index.js";
import {
    catalogAddonAdminRouter,
    catalogCategoryAdminRouter,
    catalogProductAdminRouter,
    catalogSectionAdminRouter,
} from "@/modules/catalog/index.js";
import { orderAdminRouter } from "@/modules/booking/index.js";
import { customerAdminRouter, vendorAdminRouter } from "@/modules/identity/index.js";
import { dashboardAdminRouter, settingsAdminRouter } from "@/modules/ops/index.js";
import { notificationTemplateAdminRouter } from "@/modules/notifications/index.js";
import { adminChatRouter } from "@/modules/chat/index.js";
import {
    createFinancialAdminRouter,
    FinancialAdminController,
} from "@/modules/payments/index.js";
import { promotionsAdminRouter } from "@/modules/promotions/index.js";
import { reviewsAdminRouter } from "@/modules/reviews/index.js";
import { cmsAdminRouter } from "@/modules/cms/index.js";
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
adminRouter.use("/orders", orderAdminRouter);
adminRouter.use("/vendors", vendorAdminRouter);
adminRouter.use("/customers", customerAdminRouter);
adminRouter.use("/dashboard", dashboardAdminRouter);
adminRouter.use("/settings", settingsAdminRouter);
adminRouter.use("/notification-templates", notificationTemplateAdminRouter);
adminRouter.use("/chat", adminChatRouter);
adminRouter.use("/financials", createFinancialAdminRouter(new FinancialAdminController()));
adminRouter.use("/promotions", promotionsAdminRouter);
adminRouter.use("/reviews", reviewsAdminRouter);
adminRouter.use("/cms", cmsAdminRouter);
