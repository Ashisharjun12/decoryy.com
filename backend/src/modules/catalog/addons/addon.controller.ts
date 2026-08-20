import { ApiResponse } from "@/shared/errors/apiResponse.js";
import { asyncHandler } from "@/shared/middlewares/asyncHandler.js";
import type { IAddonService } from "@/modules/catalog/addons/addon.service.js";
import type { ICityPriceService } from "@/modules/catalog/pricing/city-price.service.js";

export class AddonController {
    constructor(
        private readonly addons: IAddonService,
        private readonly prices: ICityPriceService,
    ) {}

    listAdmin = asyncHandler(async (req, res) => {
        const data = await this.addons.listAdmin(req.query);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    create = asyncHandler(async (req, res) => {
        const data = await this.addons.create(req.body);
        res.status(200).json(new ApiResponse(200, data, "addon created"));
    });

    patch = asyncHandler(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await this.addons.patch(id, req.body);
        res.status(200).json(new ApiResponse(200, data, "addon updated"));
    });

    listPrices = asyncHandler(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await this.prices.listAddonPrices(id);
        res.status(200).json(new ApiResponse(200, data, "ok"));
    });

    setPrice = asyncHandler(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await this.prices.setAddonPrice(id, req.body.cityId, req.body.pricePaise);
        res.status(200).json(new ApiResponse(200, data, "price saved"));
    });
}
