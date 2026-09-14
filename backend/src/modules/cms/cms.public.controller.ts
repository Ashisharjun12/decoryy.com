import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { CmsPublicService } from "@/modules/cms/cms.public.service.js";

export class CmsPublicController {
    constructor(private readonly cms: CmsPublicService) {}

    getHome = asyncHandler(async (req, res) => {
        const data = await this.cms.getHome({
            cityId: typeof req.query.cityId === "string" ? req.query.cityId : undefined,
            platform: typeof req.query.platform === "string" ? req.query.platform : "web",
        });
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });
}
