import { Router } from "express";
import type { ProductController } from "@/modules/catalog/products/product.controller.js";
import {
    adminProductListQueryDto,
    cityPriceDto,
    createProductDto,
    mapAddonDto,
    patchProductDto,
    productAddonParamsDto,
    productIdParamsDto,
    publicProductListQueryDto,
} from "@/modules/catalog/products/product.dto.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

export function createProductPublicRouter(productController: ProductController) {
    const router = Router();
    router.get("/", validate(publicProductListQueryDto, "query"), productController.listPublic);
    return router;
}

export function createProductAdminRouter(productController: ProductController) {
    const router = Router();
    router.get("/", validate(adminProductListQueryDto, "query"), productController.listAdmin);
    router.post("/", validate(createProductDto), productController.create);
    router.get("/:id", validate(productIdParamsDto, "params"), productController.getAdmin);
    router.patch(
        "/:id",
        validate(productIdParamsDto, "params"),
        validate(patchProductDto),
        productController.patch,
    );
    router.get("/:id/city-prices", validate(productIdParamsDto, "params"), productController.listPrices);
    router.put(
        "/:id/city-prices",
        validate(productIdParamsDto, "params"),
        validate(cityPriceDto),
        productController.setPrice,
    );
    router.post(
        "/:id/addons",
        validate(productIdParamsDto, "params"),
        validate(mapAddonDto),
        productController.mapAddon,
    );
    router.delete(
        "/:id/addons/:addonId",
        validate(productAddonParamsDto, "params"),
        productController.unmapAddon,
    );
    return router;
}
