import type { Request } from "express";
import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { CmsBanner } from "@/modules/cms/banners/banner.schema.js";
import type { CmsBannerService } from "@/modules/cms/banners/banner.service.js";
import type { CmsTestimonialService } from "@/modules/cms/testimonials/testimonial.service.js";

export class CmsAdminController {
    constructor(
        private readonly banners: CmsBannerService,
        private readonly testimonials: CmsTestimonialService,
    ) {}

    listBanners = asyncHandler(async (req, res) => {
        const data = await this.banners.listAdmin(req.query);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    getBanner = asyncHandler(async (req, res) => {
        const data = await this.banners.getAdmin(paramId(req));
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    createBanner = asyncHandler(async (req, res) => {
        const data = await this.banners.create(req.body);
        res.status(201).json(new ApiResponse(201, data, "created"));
    });

    patchBanner = asyncHandler(async (req, res) => {
        const data = await this.banners.patch(paramId(req), req.body);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    deleteBanner = asyncHandler(async (req, res) => {
        const data = await this.banners.delete(paramId(req));
        res.status(200).json(new ApiResponse(200, data, "deleted"));
    });

    reorderBanners = asyncHandler(async (req, res) => {
        const { placement, ids } = req.body as { placement: string; ids: string[] };
        const data = await this.banners.reorder(placement as CmsBanner["placement"], ids);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    listTestimonials = asyncHandler(async (req, res) => {
        const data = await this.testimonials.listAdmin(req.query);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    getTestimonial = asyncHandler(async (req, res) => {
        const data = await this.testimonials.getAdmin(paramId(req));
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    createTestimonial = asyncHandler(async (req, res) => {
        const data = await this.testimonials.create(req.body);
        res.status(201).json(new ApiResponse(201, data, "created"));
    });

    patchTestimonial = asyncHandler(async (req, res) => {
        const data = await this.testimonials.patch(paramId(req), req.body);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    deleteTestimonial = asyncHandler(async (req, res) => {
        const data = await this.testimonials.delete(paramId(req));
        res.status(200).json(new ApiResponse(200, data, "deleted"));
    });
}

function paramId(req: Request): string {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    return String(id ?? "");
}
