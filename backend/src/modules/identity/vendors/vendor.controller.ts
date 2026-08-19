import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { IAuthService } from "@/modules/identity/auth/auth.service.js";

export class VendorController {
    constructor(private readonly authService: IAuthService) {}

    register = asyncHandler(async (req, res) => {
        const data = await this.authService.registerVendor(
            req.body,
            req.ip || req.socket.remoteAddress,
        );
        res.status(200).json(new ApiResponse(200, data, "otp sent"));
    });
}
