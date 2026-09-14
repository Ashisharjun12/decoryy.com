import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { ISettingService } from "@/modules/ops/settings/setting.service.js";

export class SettingController {
    constructor(private readonly settings: ISettingService) {}

    getNotifications = asyncHandler(async (_req, res) => {
        const data = await this.settings.getNotificationChannels();
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    patchNotifications = asyncHandler(async (req, res) => {
        const data = await this.settings.patchNotificationChannels(req.body);
        res.status(200).json(new ApiResponse(200, data, "notification channels updated"));
    });

    getPayments = asyncHandler(async (_req, res) => {
        const data = await this.settings.getPaymentMethods();
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    patchPayments = asyncHandler(async (req, res) => {
        const data = await this.settings.patchPaymentMethods(req.body);
        res.status(200).json(new ApiResponse(200, data, "payment methods updated"));
    });

    getPayoutPolicy = asyncHandler(async (_req, res) => {
        const data = await this.settings.getPayoutPolicy();
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    patchPayoutPolicy = asyncHandler(async (req, res) => {
        const data = await this.settings.patchPayoutPolicy(req.body);
        res.status(200).json(new ApiResponse(200, data, "payout policy updated"));
    });
}
