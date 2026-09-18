import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { CmsPublicService } from "@/modules/cms/cms.public.service.js";
import type { SiteShellService } from "@/modules/brand/site-shell.service.js";

export class CmsPublicController {
    constructor(
        private readonly cms: CmsPublicService,
        private readonly siteShell: SiteShellService,
    ) {}

    getSiteShell = asyncHandler(async (req, res) => {
        const data = await this.siteShell.get({
            platform: typeof req.query.platform === "string" ? req.query.platform : "web",
        });
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    getHome = asyncHandler(async (req, res) => {
        const data = await this.cms.getHome({
            cityId: typeof req.query.cityId === "string" ? req.query.cityId : undefined,
            pincode: typeof req.query.pincode === "string" ? req.query.pincode : undefined,
            platform: typeof req.query.platform === "string" ? req.query.platform : "web",
        });
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });
}
