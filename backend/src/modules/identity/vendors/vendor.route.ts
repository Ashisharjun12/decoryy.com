import { Router } from "express";
import type { VendorController } from "@/modules/identity/vendors/vendor.controller.js";
import { vendorRegisterDto } from "@/modules/identity/vendors/vendor.dto.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

export function createVendorRouter(vendorController: VendorController) {
    const router = Router();
    router.post("/register", validate(vendorRegisterDto), vendorController.register);
    return router;
}
