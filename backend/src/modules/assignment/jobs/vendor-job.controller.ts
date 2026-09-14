import type { Request } from "express";
import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { ApiError } from "@/shared/errors/apiError.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { IVendorJobService } from "@/modules/assignment/jobs/vendor-job.service.js";
import { parsePagination } from "@/shared/http/pagination.js";

export class VendorJobController {
    constructor(private readonly jobs: IVendorJobService) {}

    list = asyncHandler(async (req, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const pagination = parsePagination(req.query);
        const filter = req.query.filter as
            | "today"
            | "upcoming"
            | "completed"
            | "action"
            | undefined;
        const data = await this.jobs.listJobs(userId, filter, pagination);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    get = asyncHandler(async (req, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const orderId = paramOrderId(req);
        const data = await this.jobs.getJob(userId, orderId);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    accept = asyncHandler(async (req, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const orderId = paramOrderId(req);
        const data = await this.jobs.acceptJob(userId, orderId);
        res.status(200).json(new ApiResponse(200, data, "job accepted"));
    });

    decline = asyncHandler(async (req, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const orderId = paramOrderId(req);
        await this.jobs.declineJob(userId, orderId);
        res.status(200).json(new ApiResponse(200, { ok: true }, "job declined"));
    });

    markEnRoute = asyncHandler(async (req, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const orderId = paramOrderId(req);
        const data = await this.jobs.markEnRoute(userId, orderId);
        res.status(200).json(new ApiResponse(200, data, "marked en route"));
    });

    markOnSite = asyncHandler(async (req, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const orderId = paramOrderId(req);
        const data = await this.jobs.markOnSite(userId, orderId);
        res.status(200).json(new ApiResponse(200, data, "marked on site"));
    });

    sendDeliveryCode = asyncHandler(async (req, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const orderId = paramOrderId(req);
        const data = await this.jobs.sendDeliveryCode(userId, orderId);
        res.status(200).json(new ApiResponse(200, data, "delivery code sent"));
    });

    complete = asyncHandler(async (req, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const orderId = paramOrderId(req);
        const code = String(req.body?.code ?? "");
        const data = await this.jobs.completeJob(userId, orderId, code);
        res.status(200).json(new ApiResponse(200, data, "job completed"));
    });
}

function paramOrderId(req: Request): string {
    const id = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    return String(id ?? "");
}
