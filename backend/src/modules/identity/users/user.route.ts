import { Router } from "express";
import type { AuthController } from "@/modules/identity/auth/auth.controller.js";
import { authRequired } from "@/shared/middlewares/auth.middleware.js";

export function createUserRouter(authController: AuthController) {
    const router = Router();
    router.get("/me", authRequired, authController.me);
    return router;
}
