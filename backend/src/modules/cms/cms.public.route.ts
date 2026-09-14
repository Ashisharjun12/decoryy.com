import { Router } from "express";
import type { CmsPublicController } from "@/modules/cms/cms.public.controller.js";
import { homeCmsQueryDto } from "@/modules/cms/cms.dto.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

export function createCmsPublicRouter(controller: CmsPublicController) {
    const router = Router();
    router.get("/home", validate(homeCmsQueryDto, "query"), controller.getHome);
    return router;
}
