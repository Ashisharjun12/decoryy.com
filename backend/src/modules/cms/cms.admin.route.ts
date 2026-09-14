import { Router } from "express";
import type { CmsAdminController } from "@/modules/cms/cms.admin.controller.js";
import {
    cmsIdParamsDto,
    createCmsBannerDto,
    createCmsTestimonialDto,
    listCmsBannersQueryDto,
    listCmsTestimonialsQueryDto,
    patchCmsBannerDto,
    patchCmsTestimonialDto,
    reorderCmsBannersDto,
} from "@/modules/cms/cms.dto.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

export function createCmsAdminRouter(controller: CmsAdminController) {
    const router = Router();
    router.get("/banners", validate(listCmsBannersQueryDto, "query"), controller.listBanners);
    router.put("/banners/reorder", validate(reorderCmsBannersDto), controller.reorderBanners);
    router.get("/banners/:id", validate(cmsIdParamsDto, "params"), controller.getBanner);
    router.post("/banners", validate(createCmsBannerDto), controller.createBanner);
    router.patch(
        "/banners/:id",
        validate(cmsIdParamsDto, "params"),
        validate(patchCmsBannerDto),
        controller.patchBanner,
    );
    router.delete("/banners/:id", validate(cmsIdParamsDto, "params"), controller.deleteBanner);

    router.get(
        "/testimonials",
        validate(listCmsTestimonialsQueryDto, "query"),
        controller.listTestimonials,
    );
    router.get("/testimonials/:id", validate(cmsIdParamsDto, "params"), controller.getTestimonial);
    router.post("/testimonials", validate(createCmsTestimonialDto), controller.createTestimonial);
    router.patch(
        "/testimonials/:id",
        validate(cmsIdParamsDto, "params"),
        validate(patchCmsTestimonialDto),
        controller.patchTestimonial,
    );
    router.delete("/testimonials/:id", validate(cmsIdParamsDto, "params"), controller.deleteTestimonial);
    return router;
}
