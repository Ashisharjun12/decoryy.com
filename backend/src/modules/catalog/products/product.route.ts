import { Router } from "express";
import type { ProductController } from "@/modules/catalog/products/product.controller.js";
import {
    adminProductListQueryDto,
    cityPriceDto,
    createProductDto,
    mapAddonDto,
    patchProductDto,
    productAddonParamsDto,
    productCityPriceParamsDto,
    productIdParamsDto,
    publicProductGetQueryDto,
    publicProductListQueryDto,
} from "@/modules/catalog/products/product.dto.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

export function createProductPublicRouter(productController: ProductController) {
    const router = Router();
    router.get("/", validate(publicProductListQueryDto, "query"), productController.listPublic);
    router.get(
        "/:id",
        validate(productIdParamsDto, "params"),
        validate(publicProductGetQueryDto, "query"),
        productController.getPublic,
    );
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
    router.delete("/:id", validate(productIdParamsDto, "params"), productController.delete);
    router.get("/:id/city-prices", validate(productIdParamsDto, "params"), productController.listPrices);
    router.put(
        "/:id/city-prices",
        validate(productIdParamsDto, "params"),
        validate(cityPriceDto),
        productController.setPrice,
    );
    router.delete(
        "/:id/city-prices/:cityId",
        validate(productCityPriceParamsDto, "params"),
        productController.deletePrice,
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
