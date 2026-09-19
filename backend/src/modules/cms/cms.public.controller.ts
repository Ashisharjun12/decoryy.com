import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { CachedCmsPublicService } from "@/modules/cms/cached-cms-public.service.js";
import type { CachedSiteShellService } from "@/modules/brand/cached-site-shell.service.js";

export class CmsPublicController {
    constructor(
        private readonly cms: CachedCmsPublicService,
        private readonly siteShell: CachedSiteShellService,
    ) {}

    getSiteShell = asyncHandler(async (req, res) => {
        const data = await this.siteShell.get({
            platform: typeof req.query.platform === "string" ? req.query.platform : "web",
        });
        res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    getHome = asyncHandler(async (req, res) => {
        const data = await this.cms.getHome({
            cityId: typeof req.query.cityId === "string" ? req.query.cityId : undefined,
            pincode: typeof req.query.pincode === "string" ? req.query.pincode : undefined,
            platform: typeof req.query.platform === "string" ? req.query.platform : "web",
        });
        res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });
}
