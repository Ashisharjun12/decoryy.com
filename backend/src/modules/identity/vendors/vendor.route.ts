import { Router } from "express";
import type { VendorAdminController, VendorController } from "@/modules/identity/vendors/vendor.controller.js";
import {
    adminVendorIdParamsDto,
    adminVendorListQueryDto,
    adminVendorPatchDto,
    vendorCompleteShopImageParamsDto,
    vendorPresignShopImageDto,
    vendorPresignAvatarDto,
    vendorCompleteAvatarParamsDto,
    vendorProfilePatchDto,
    vendorDutyPatchDto,
    vendorReapplyDto,
    vendorRegisterDto,
} from "@/modules/identity/vendors/vendor.dto.js";
import {
    completeVendorJobDto,
    vendorJobOrderParamsDto,
    vendorJobsQueryDto,
} from "@/modules/assignment/jobs/vendor-job.dto.js";
import {
    registerPushDeviceDto,
    unregisterPushDeviceDto,
    vendorNotificationIdParamsDto,
    vendorNotificationsQueryDto,
} from "@/modules/notifications/devices/device.dto.js";
import type { VendorJobController } from "@/modules/assignment/jobs/vendor-job.controller.js";
import type { CollectionController } from "@/modules/payments/collections/collection.controller.js";
import type { PayoutMethodController } from "@/modules/payments/payout-methods/payout-method.controller.js";
import { createPayoutMethodRouter } from "@/modules/payments/payout-methods/payout-method.route.js";
import type { WalletController } from "@/modules/payments/wallets/wallet.controller.js";
import { createWalletRouter } from "@/modules/payments/wallets/wallet.route.js";
import type { VendorNotificationController } from "@/modules/notifications/vendor-notification.controller.js";
import { validate } from "@/shared/middlewares/validate.middleware.js";
import { authRequired } from "@/shared/middlewares/auth.middleware.js";
import { requireRole } from "@/shared/middlewares/requireRole.middleware.js";

export function createVendorRouter(
    vendorController: VendorController,
    vendorNotificationController: VendorNotificationController,
    vendorJobController: VendorJobController,
    collectionController: CollectionController,
    walletController: WalletController,
    payoutMethodController: PayoutMethodController,
) {
    const router = Router();
    router.post(
        "/register/presign-shop-image",
        validate(vendorPresignShopImageDto),
        vendorController.presignShopImage,
    );
    router.post(
        "/register/complete-shop-image/:uploadId",
        validate(vendorCompleteShopImageParamsDto, "params"),
        vendorController.completeShopImage,
    );
    router.post("/register", validate(vendorRegisterDto), vendorController.register);
    router.post(
        "/reapply",
        authRequired,
        requireRole("vendor"),
        validate(vendorReapplyDto),
        vendorController.reapply,
    );
    router.get(
        "/duty",
        authRequired,
        requireRole("vendor"),
        vendorController.getDuty,
    );
    router.patch(
        "/duty",
        authRequired,
        requireRole("vendor"),
        validate(vendorDutyPatchDto),
        vendorController.setDuty,
    );
    router.post(
        "/profile/presign-avatar",
        authRequired,
        requireRole("vendor"),
        validate(vendorPresignAvatarDto),
        vendorController.presignProfileAvatar,
    );
    router.post(
        "/profile/complete-avatar/:uploadId",
        authRequired,
        requireRole("vendor"),
        validate(vendorCompleteAvatarParamsDto, "params"),
        vendorController.completeProfileAvatar,
    );
    router.patch(
        "/profile",
        authRequired,
        requireRole("vendor"),
        validate(vendorProfilePatchDto),
        vendorController.patchProfile,
    );
    router.post(
        "/devices",
        authRequired,
        requireRole("vendor"),
        validate(registerPushDeviceDto),
        vendorNotificationController.registerDevice,
    );
    router.delete(
        "/devices",
        authRequired,
        requireRole("vendor"),
        validate(unregisterPushDeviceDto),
        vendorNotificationController.unregisterDevice,
    );
    router.get(
        "/notifications",
        authRequired,
        requireRole("vendor"),
        validate(vendorNotificationsQueryDto, "query"),
        vendorNotificationController.listInbox,
    );
    router.patch(
        "/notifications/read-all",
        authRequired,
        requireRole("vendor"),
        vendorNotificationController.markAllRead,
    );
    router.patch(
        "/notifications/:id/read",
        authRequired,
        requireRole("vendor"),
        validate(vendorNotificationIdParamsDto, "params"),
        vendorNotificationController.markRead,
    );
    router.get(
        "/jobs",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobsQueryDto, "query"),
        vendorJobController.list,
    );
    router.get(
        "/jobs/:orderId",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        vendorJobController.get,
    );
    router.post(
        "/jobs/:orderId/accept",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        vendorJobController.accept,
    );
    router.post(
        "/jobs/:orderId/decline",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        vendorJobController.decline,
    );
    router.post(
        "/jobs/:orderId/en-route",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        vendorJobController.markEnRoute,
    );
    router.post(
        "/jobs/:orderId/on-site",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        vendorJobController.markOnSite,
    );
    router.post(
        "/jobs/:orderId/send-delivery-code",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        vendorJobController.sendDeliveryCode,
    );
    router.post(
        "/jobs/:orderId/complete",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        validate(completeVendorJobDto),
        vendorJobController.complete,
    );
    router.get(
        "/jobs/:orderId/collect/status",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        collectionController.status,
    );
    router.post(
        "/jobs/:orderId/collect/cash",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        collectionController.collectCash,
    );
    router.post(
        "/jobs/:orderId/collect/online",
        authRequired,
        requireRole("vendor"),
        validate(vendorJobOrderParamsDto, "params"),
        collectionController.collectOnline,
    );
    router.use(
        "/wallet",
        authRequired,
        requireRole("vendor"),
        createWalletRouter(walletController),
    );
    router.use(
        "/payout-methods",
        authRequired,
        requireRole("vendor"),
        createPayoutMethodRouter(payoutMethodController),
    );
    return router;
}

export function createVendorAdminRouter(vendorAdminController: VendorAdminController) {
    const router = Router();
    router.get("/", validate(adminVendorListQueryDto, "query"), vendorAdminController.list);
    router.get("/:id", validate(adminVendorIdParamsDto, "params"), vendorAdminController.get);
    router.patch(
        "/:id",
        validate(adminVendorIdParamsDto, "params"),
        validate(adminVendorPatchDto),
        vendorAdminController.patch,
    );
    return router;
}
