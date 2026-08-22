import { Router } from "express";
import type { AuthController } from "@/modules/identity/auth/auth.controller.js";
import type { UserController } from "@/modules/identity/users/user.controller.js";
import { linkGoogleDto, linkPhoneDto } from "@/modules/identity/users/user.dto.js";
import { authRequired } from "@/shared/middlewares/auth.middleware.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

export function createUserRouter(
    authController: AuthController,
    userController: UserController,
) {
    const router = Router();
    router.get("/me", authRequired, authController.me);
    router.post("/link-phone", authRequired, validate(linkPhoneDto), userController.linkPhone);
    router.post("/link-google", authRequired, validate(linkGoogleDto), userController.linkGoogle);
    return router;
}
