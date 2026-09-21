import { Router } from "express";
import { MapsController } from "@/modules/maps/maps.controller.js";
import {
    placeDetailsBodyDto,
    placeIdParamsDto,
    placesAutocompleteQueryDto,
} from "@/modules/maps/maps.dto.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

const controller = new MapsController();

export function createMapsPublicRouter() {
    const router = Router();
    router.get("/sdk-config", controller.sdkConfig);
    router.get(
        "/places/autocomplete",
        validate(placesAutocompleteQueryDto, "query"),
        controller.autocomplete,
    );
    router.post(
        "/places/:placeId",
        validate(placeIdParamsDto, "params"),
        validate(placeDetailsBodyDto),
        controller.placeDetails,
    );
    return router;
}
