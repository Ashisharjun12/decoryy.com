import { CmsAdminController } from "@/modules/cms/cms.admin.controller.js";
import { createCmsAdminRouter } from "@/modules/cms/cms.admin.route.js";
import { CmsPublicController } from "@/modules/cms/cms.public.controller.js";
import { createCmsPublicRouter } from "@/modules/cms/cms.public.route.js";
import { CmsPublicService } from "@/modules/cms/cms.public.service.js";
import { CmsBannerRepository } from "@/modules/cms/banners/banner.repository.js";
import { CmsBannerService } from "@/modules/cms/banners/banner.service.js";
import { CmsTestimonialRepository } from "@/modules/cms/testimonials/testimonial.repository.js";
import { CmsTestimonialService } from "@/modules/cms/testimonials/testimonial.service.js";

const bannerRepository = new CmsBannerRepository();
const testimonialRepository = new CmsTestimonialRepository();

export const cmsBannerService = new CmsBannerService(bannerRepository);
export const cmsTestimonialService = new CmsTestimonialService(testimonialRepository);
export const cmsPublicService = new CmsPublicService(bannerRepository, testimonialRepository);

const cmsAdminController = new CmsAdminController(cmsBannerService, cmsTestimonialService);
export const cmsAdminRouter = createCmsAdminRouter(cmsAdminController);

export const cmsPublicController = new CmsPublicController(cmsPublicService);
export const cmsPublicRouter = createCmsPublicRouter(cmsPublicController);
