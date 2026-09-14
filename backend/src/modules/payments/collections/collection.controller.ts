import type { Request } from "express";
import { VendorRepository } from "@/modules/identity/vendors/vendor.repository.js";
import { ApiError } from "@/shared/errors/apiError.js";
import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { CollectionService } from "@/modules/payments/collections/collection.service.js";

export class CollectionController {
    private readonly vendors = new VendorRepository();

    constructor(private readonly collections: CollectionService) {}

    private async vendorIdForUser(userId: string): Promise<string> {
        const vendor = await this.vendors.findByUserId(userId);
        if (!vendor) throw ApiError.forbidden("vendor profile not found");
        return vendor.id;
    }

    status = asyncHandler(async (req: Request, res) => {
        const orderId = String(req.params.orderId);
        const data = await this.collections.getStatus(orderId);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    collectCash = asyncHandler(async (req: Request, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const vendorId = await this.vendorIdForUser(userId);
        const data = await this.collections.collectCash(String(req.params.orderId), vendorId);
        res.status(200).json(new ApiResponse(200, data, "cash collected"));
    });

    collectOnline = asyncHandler(async (req: Request, res) => {
        const userId = req.actor?.id;
        if (!userId) throw ApiError.unauthorized();
        const vendorId = await this.vendorIdForUser(userId);
        const data = await this.collections.collectOnline(String(req.params.orderId), vendorId);
        res.status(200).json(new ApiResponse(200, data, "collection qr created"));
    });
}
