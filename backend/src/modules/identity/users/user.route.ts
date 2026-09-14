import { Router } from "express";
import type { AuthController } from "@/modules/identity/auth/auth.controller.js";
import type { UserController } from "@/modules/identity/users/user.controller.js";
import { linkGoogleDto, linkPhoneDto } from "@/modules/identity/users/user.dto.js";
import {
    vendorNotificationIdParamsDto,
    vendorNotificationsQueryDto,
} from "@/modules/notifications/devices/device.dto.js";
import type { UserNotificationController } from "@/modules/notifications/user-notification.controller.js";
import { authRequired } from "@/shared/middlewares/auth.middleware.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";

export function createUserRouter(
    authController: AuthController,
    userController: UserController,
    userNotificationController: UserNotificationController,
) {
    const router = Router();
    router.get("/me", authRequired, authController.me);
    router.post("/link-phone", authRequired, validate(linkPhoneDto), userController.linkPhone);
    router.post("/link-google", authRequired, validate(linkGoogleDto), userController.linkGoogle);
    router.get(
        "/notifications",
        authRequired,
        validate(vendorNotificationsQueryDto, "query"),
        userNotificationController.listInbox,
    );
    router.patch(
        "/notifications/read-all",
        authRequired,
        userNotificationController.markAllRead,
    );
    router.patch(
        "/notifications/:id/read",
        authRequired,
        validate(vendorNotificationIdParamsDto, "params"),
        userNotificationController.markRead,
    );
    return router;
}
