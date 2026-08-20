import { Router } from "express";
import type { AddonController } from "@/modules/catalog/addons/addon.controller.js";
import {
    addonCityPriceDto,
    addonIdParamsDto,
    adminAddonListQueryDto,
    createAddonDto,
    patchAddonDto,
} from "@/modules/catalog/addons/addon.dto.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

export function createAddonAdminRouter(addonController: AddonController) {
    const router = Router();
    router.get("/", validate(adminAddonListQueryDto, "query"), addonController.listAdmin);
    router.post("/", validate(createAddonDto), addonController.create);
    router.patch(
        "/:id",
        validate(addonIdParamsDto, "params"),
        validate(patchAddonDto),
        addonController.patch,
    );
    router.get("/:id/city-prices", validate(addonIdParamsDto, "params"), addonController.listPrices);
    router.put(
        "/:id/city-prices",
        validate(addonIdParamsDto, "params"),
        validate(addonCityPriceDto),
        addonController.setPrice,
    );
    return router;
}
