import { db } from "@/db/postgres-client.js";
import { ApiError } from "@/shared/errors/apiError.js";
import type { IAssignmentRepository } from "@/modules/assignment/assignments/assignment.repository.js";
import type { IOrderRepository } from "@/modules/booking/orders/order.repository.js";
import type { Order } from "@/modules/booking/orders/order.schema.js";
import type { PublicOrder } from "@/modules/booking/orders/order.service.js";
import { assertTransition } from "@/modules/booking/domain/order-status.js";
import {
    assertDeliveryCodeSendRateLimit,
    consumeDeliveryCode,
    generateDeliveryCode,
    hasDeliveryCodePending,
    saveDeliveryCode,
} from "@/modules/booking/delivery/delivery-code.store.js";
import { BOOKING_STATUS_EVENT } from "@/modules/booking/lib/booking.events.js";
import type { IVendorRepository } from "@/modules/identity/vendors/vendor.repository.js";
import type { INotificationService } from "@/modules/notifications/notification.service.js";
import { bookingTrackUrl } from "@/modules/notifications/lib/render.js";
import { formatBookingSchedule } from "@/modules/notifications/templates/email/booking-confirmed.render.js";
import type { RealtimePort } from "@/infrastructure/realtime/realtime.port.js";
import type { PaginationQuery } from "@/shared/http/pagination.js";
import { logger } from "@/utils/logger.js";
import type { IVendorJobRepository, VendorJobRow } from "@/modules/assignment/jobs/vendor-job.repository.js";
import type { IBookingChatService } from "@/modules/chat/services/booking-chat.service.js";
import { getQueues } from "@/infrastructure/queue/bull.connection.js";
import { orderFinancialService } from "@/modules/payments/order-financials/order-financial.service.js";
import { ledgerService } from "@/modules/payments/ledger/ledger.service.js";

export type VendorJobSummary = {
    id: string;
    orderRef: string;
    packageName: string;
    customerName: string;
    area: string;
    slotLabel: string;
    scheduledAt: string;
    status: string;
    paymentMethod: string;
    subtotalPaise: number;
    itemCount: number;
    needsAction: boolean;
    vendorResponse: "pending" | "accepted" | "declined";
    primaryImageUrl: string | null;
};

export type VendorJobDetail = VendorJobSummary & {
    addressLine: string;
    customer: { name: string; phone: string };
    delivery: {
        address: string;
        landmark: string | null;
        cityName: string;
        pincode: string;
    };
    items: Array<{
        id: string;
        name: string;
        imageUrl: string | null;
        quantity: number;
        productPaise: number;
        addonsPaise: number;
        lineTotalPaise: number;
        addons: Array<{ id: string; name: string; quantity: number; pricePaise: number }>;
    }>;
    canChat: boolean;
    deliveryCodeSent: boolean;
    collectionStatus: string;
    collectionMethod: string | null;
    requiresCollection: boolean;
    vendorSharePaise: number | null;
    platformFeePaise: number | null;
};

export interface IVendorJobService {
    listJobs(
        userId: string,
        filter: "today" | "upcoming" | "completed" | "action" | undefined,
        pagination: PaginationQuery,
    ): Promise<{ items: VendorJobSummary[]; total: number }>;
    getJob(userId: string, orderId: string): Promise<VendorJobDetail>;
    acceptJob(userId: string, orderId: string): Promise<VendorJobDetail>;
    declineJob(userId: string, orderId: string): Promise<void>;
    markEnRoute(userId: string, orderId: string): Promise<VendorJobDetail>;
    markOnSite(userId: string, orderId: string): Promise<VendorJobDetail>;
    sendDeliveryCode(userId: string, orderId: string): Promise<VendorJobDetail>;
    completeJob(userId: string, orderId: string, code: string): Promise<VendorJobDetail>;
}

function toSummary(row: VendorJobRow): VendorJobSummary {
    const addressParts = [row.cityName, row.pincode].filter(Boolean);
    return {
        id: row.orderId,
        orderRef: row.reference,
        packageName: row.primaryName || "Decoration package",
        customerName: row.customerName,
        area: addressParts.join(" · "),
        slotLabel: formatBookingSchedule(row.scheduledAt.toISOString()),
        scheduledAt: row.scheduledAt.toISOString(),
        status: row.status,
        paymentMethod: row.paymentMethod,
        subtotalPaise: row.subtotalPaise,
        itemCount: row.itemCount,
        needsAction: row.vendorResponse === "pending",
        vendorResponse: row.vendorResponse,
        primaryImageUrl: row.primaryImageUrl,
    };
}

const TRIP_BLOCKED_STATUSES = new Set(["CANCELLED", "COMPLETED", "DISPUTED"]);

export class VendorJobService implements IVendorJobService {
    constructor(
        private readonly jobs: IVendorJobRepository,
        private readonly vendors: IVendorRepository,
        private readonly assignments: IAssignmentRepository,
        private readonly orders: IOrderRepository,
        private readonly notifications: INotificationService,
        private readonly reloadOrder: (orderId: string) => Promise<PublicOrder>,
        private readonly bookingChat?: IBookingChatService,
        private readonly realtime?: RealtimePort,
    ) {}

    private async vendorIdForUser(userId: string): Promise<string> {
        const vendor = await this.vendors.findByUserId(userId);
        if (!vendor || vendor.onboardingStatus !== "ACTIVE") {
            throw ApiError.forbidden("vendor access required");
        }
        return vendor.id;
    }

    private async assertActiveVendorJob(vendorId: string, orderId: string): Promise<Order> {
        const order = await this.orders.findById(orderId);
        if (!order) {
            throw ApiError.notFound("order not found");
        }
        if (TRIP_BLOCKED_STATUSES.has(order.status)) {
            throw ApiError.conflict(`order is ${order.status.toLowerCase()}`);
        }

        const assignment = await this.assignments.findActiveByOrderId(orderId);
        if (
            !assignment ||
            assignment.vendorId !== vendorId ||
            assignment.vendorResponse !== "accepted"
        ) {
            throw ApiError.conflict("job is not active for this vendor");
        }

        return order;
    }

    private async buildJobDetail(
        vendorId: string,
        orderId: string,
        row: VendorJobRow,
    ): Promise<VendorJobDetail> {
        const items = await this.jobs.loadOrderItems(orderId);
        const summary = toSummary(row);
        const deliveryAddress = [row.addressLine, row.landmark].filter(Boolean).join(", ");
        const deliveryCodeSent = await hasDeliveryCodePending(orderId);
        const order = await this.orders.findById(orderId);
        const collectionStatus = order?.collectionStatus ?? "not_required";
        const collectionMethod = order?.collectionMethod ?? null;
        const requiresCollection =
            order?.paymentMethod === "COD" && collectionStatus === "pending";
        const financials = await orderFinancialService.getByOrderId(orderId);
        return {
            ...summary,
            addressLine: deliveryAddress,
            customer: { name: row.customerName, phone: row.customerPhone },
            delivery: {
                address: row.addressLine,
                landmark: row.landmark,
                cityName: row.cityName,
                pincode: row.pincode,
            },
            items,
            canChat:
                row.vendorResponse === "accepted" &&
                row.status !== "COMPLETED" &&
                row.status !== "CANCELLED",
            deliveryCodeSent,
            collectionStatus,
            collectionMethod,
            requiresCollection,
            vendorSharePaise: financials?.vendorSharePaise ?? null,
            platformFeePaise: financials?.platformFeePaise ?? null,
        };
    }

    private async publishBookingStatus(customerUserId: string, orderId: string, status: string) {
        if (!this.realtime) return;
        try {
            await this.realtime.publish({
                userId: customerUserId,
                event: BOOKING_STATUS_EVENT,
                payload: { orderId, status },
            });
        } catch (err) {
            logger.error({ err, orderId, status }, "booking status realtime publish failed");
        }
    }

    private formatDeliveryAddress(order: PublicOrder): string {
        const parts = [order.delivery.address];
        if (order.delivery.landmark) {
            parts.push(order.delivery.landmark);
        }
        parts.push(`${order.delivery.cityName} ${order.delivery.pincode}`);
        return parts.filter(Boolean).join(", ");
    }

    private async vendorContact(vendorId: string): Promise<{ vendorName: string; vendorPhone: string }> {
        return {
            vendorName: await this.getVendorName(vendorId),
            vendorPhone: (await this.getVendorPhone(vendorId)) ?? "",
        };
    }

    private async notifyTripEvent(
        event: "VENDOR_EN_ROUTE" | "VENDOR_ON_SITE" | "DELIVERY_CODE" | "BOOKING_COMPLETED",
        order: PublicOrder,
        customerUserId: string,
        idempotencyKey: string,
        extra: Record<string, string> = {},
    ) {
        const vendorName = extra.vendorName ?? "Your decorator";
        try {
            await this.notifications.notify({
                event,
                userId: customerUserId,
                recipient: {
                    email: order.customer.email,
                    phone: order.customer.phone,
                },
                data: {
                    customerName: order.customer.name,
                    orderRef: order.reference,
                    bookingId: order.id,
                    orderId: order.id,
                    trackUrl: bookingTrackUrl(order.id),
                    scheduledAt: order.scheduledAt,
                    vendorName,
                    vendorPhone: extra.vendorPhone ?? "",
                    address: this.formatDeliveryAddress(order),
                    cityName: order.delivery.cityName,
                    ...extra,
                },
                idempotencyKey,
            });
        } catch (err) {
            logger.error({ err, orderId: order.id, event }, "trip notification failed");
        }
    }

    async listJobs(
        userId: string,
        filter: "today" | "upcoming" | "completed" | "action" | undefined,
        pagination: PaginationQuery,
    ) {
        const vendorId = await this.vendorIdForUser(userId);
        const result = await this.jobs.listForVendor(vendorId, filter, pagination);
        return {
            items: result.items.map(toSummary),
            total: result.total,
        };
    }

    async getJob(userId: string, orderId: string): Promise<VendorJobDetail> {
        const vendorId = await this.vendorIdForUser(userId);
        const row = await this.jobs.findJobForVendor(vendorId, orderId);
        if (!row) {
            throw ApiError.notFound("job not found");
        }
        return this.buildJobDetail(vendorId, orderId, row);
    }

    async acceptJob(userId: string, orderId: string): Promise<VendorJobDetail> {
        const vendorId = await this.vendorIdForUser(userId);
        const vendor = await this.vendors.findById(vendorId);
        if (!vendor?.isOnDuty) {
            throw ApiError.conflict("go online to accept bookings");
        }
        const assignment = await this.assignments.findActiveByOrderId(orderId);
        if (!assignment || assignment.vendorId !== vendorId || assignment.vendorResponse !== "pending") {
            throw ApiError.conflict("assignment is not pending for this vendor");
        }

        await db.transaction(async (tx) => {
            const updated = await this.assignments.respondToAssignment(
                assignment.id,
                vendorId,
                "accepted",
                tx,
            );
            if (!updated) {
                throw ApiError.conflict("could not accept job");
            }
            const assigned = await this.orders.markAssigned(orderId, tx);
            if (!assigned) {
                throw ApiError.conflict("order could not be assigned");
            }
        });

        const order = await this.reloadOrder(orderId);
        const dbOrder = await this.orders.findById(orderId);
        const vendorName = await this.getVendorName(vendorId);
        const vendorPhone = (await this.getVendorPhone(vendorId)) ?? "";

        try {
            await this.notifications.notify({
                event: "BOOKING_ASSIGNED",
                userId: dbOrder?.userId ?? undefined,
                recipient: {
                    email: order.customer.email,
                    phone: order.customer.phone,
                },
                data: {
                    customerName: order.customer.name,
                    orderRef: order.reference,
                    bookingId: order.id,
                    trackUrl: bookingTrackUrl(order.id),
                    scheduledAt: formatBookingSchedule(order.scheduledAt),
                    address: [
                        order.delivery.address,
                        order.delivery.landmark,
                        order.delivery.cityName,
                        order.delivery.pincode,
                    ]
                        .filter(Boolean)
                        .join(", "),
                    vendorName,
                    vendorPhone,
                },
                idempotencyKey: `booking-assigned:${orderId}`,
            });
        } catch (err) {
            logger.error({ err, orderId }, "booking assigned email failed");
        }

        try {
            await this.bookingChat?.ensureBookingConversation(orderId);
        } catch (err) {
            logger.error({ err, orderId }, "ensure booking conversation failed");
        }

        return this.getJob(userId, orderId);
    }

    async declineJob(userId: string, orderId: string): Promise<void> {
        const vendorId = await this.vendorIdForUser(userId);
        const assignment = await this.assignments.findActiveByOrderId(orderId);
        if (!assignment || assignment.vendorId !== vendorId || assignment.vendorResponse !== "pending") {
            throw ApiError.conflict("assignment is not pending for this vendor");
        }

        const updated = await this.assignments.respondToAssignment(
            assignment.id,
            vendorId,
            "declined",
        );
        if (!updated) {
            throw ApiError.conflict("could not decline job");
        }
    }

    async markEnRoute(userId: string, orderId: string): Promise<VendorJobDetail> {
        const vendorId = await this.vendorIdForUser(userId);
        const order = await this.assertActiveVendorJob(vendorId, orderId);

        if (order.status === "EN_ROUTE") {
            return this.getJob(userId, orderId);
        }

        assertTransition(order.status, "EN_ROUTE");
        const updated = await this.orders.markEnRoute(orderId);
        if (!updated) {
            throw ApiError.conflict("order could not be marked en route");
        }

        const publicOrder = await this.reloadOrder(orderId);
        const { vendorName, vendorPhone } = await this.vendorContact(vendorId);
        await this.notifyTripEvent(
            "VENDOR_EN_ROUTE",
            publicOrder,
            order.userId,
            `trip:en-route:${orderId}`,
            { vendorName, vendorPhone },
        );
        await this.publishBookingStatus(order.userId, orderId, "EN_ROUTE");

        return this.getJob(userId, orderId);
    }

    async markOnSite(userId: string, orderId: string): Promise<VendorJobDetail> {
        const vendorId = await this.vendorIdForUser(userId);
        const order = await this.assertActiveVendorJob(vendorId, orderId);

        if (order.status === "ON_SITE") {
            return this.getJob(userId, orderId);
        }

        assertTransition(order.status, "ON_SITE");
        const updated = await this.orders.markOnSite(orderId);
        if (!updated) {
            throw ApiError.conflict("order could not be marked on site");
        }

        const publicOrder = await this.reloadOrder(orderId);
        const { vendorName, vendorPhone } = await this.vendorContact(vendorId);
        await this.notifyTripEvent(
            "VENDOR_ON_SITE",
            publicOrder,
            order.userId,
            `trip:on-site:${orderId}`,
            { vendorName, vendorPhone },
        );
        await this.publishBookingStatus(order.userId, orderId, "ON_SITE");

        return this.getJob(userId, orderId);
    }

    async sendDeliveryCode(userId: string, orderId: string): Promise<VendorJobDetail> {
        const vendorId = await this.vendorIdForUser(userId);
        const order = await this.assertActiveVendorJob(vendorId, orderId);

        if (order.status !== "ON_SITE") {
            throw ApiError.conflict("delivery code can only be sent when on site");
        }

        if (order.paymentMethod === "COD" && order.collectionStatus === "pending") {
            throw ApiError.conflict("collect payment before sending delivery code");
        }

        await assertDeliveryCodeSendRateLimit(orderId);
        const code = generateDeliveryCode();
        const sentAt = await saveDeliveryCode(orderId, code, vendorId);

        const publicOrder = await this.reloadOrder(orderId);
        const { vendorName, vendorPhone } = await this.vendorContact(vendorId);
        await this.notifyTripEvent(
            "DELIVERY_CODE",
            publicOrder,
            order.userId,
            `delivery-code:${orderId}:${sentAt}`,
            { vendorName, vendorPhone, code },
        );

        return this.getJob(userId, orderId);
    }

    async completeJob(userId: string, orderId: string, code: string): Promise<VendorJobDetail> {
        const vendorId = await this.vendorIdForUser(userId);
        const order = await this.assertActiveVendorJob(vendorId, orderId);

        if (order.status === "COMPLETED") {
            return this.getJob(userId, orderId);
        }

        if (order.status !== "ON_SITE") {
            throw ApiError.conflict("order must be on site to complete");
        }

        const codePending = await hasDeliveryCodePending(orderId);
        if (!codePending) {
            throw ApiError.conflict("delivery code not sent");
        }

        await consumeDeliveryCode(orderId, code.trim());

        const updated = await this.orders.markCompleted(orderId);
        if (!updated) {
            throw ApiError.conflict("order could not be completed");
        }

        const publicOrder = await this.reloadOrder(orderId);
        const { vendorName, vendorPhone } = await this.vendorContact(vendorId);
        await this.notifyTripEvent(
            "BOOKING_COMPLETED",
            publicOrder,
            order.userId,
            `trip:completed:${orderId}`,
            { vendorName, vendorPhone },
        );
        await this.publishBookingStatus(order.userId, orderId, "COMPLETED");

        try {
            await this.bookingChat?.closeBookingConversation(orderId);
        } catch (err) {
            logger.error({ err, orderId }, "close booking conversation failed");
        }

        try {
            const posted = await ledgerService.postOnComplete(orderId, vendorId);
            if (!posted) {
                logger.info({ orderId, vendorId }, "ledger post-on-complete skipped (already posted)");
            }
        } catch (err) {
            logger.error({ err, orderId, vendorId }, "ledger post-on-complete failed; enqueueing retry");
            try {
                const queues = getQueues();
                await queues.ledgerPostOnComplete.add(
                    "post-on-complete",
                    { orderId },
                    { jobId: `ledger-complete:${orderId}`, removeOnComplete: true },
                );
            } catch (enqueueErr) {
                logger.error({ enqueueErr, orderId }, "ledger post-on-complete enqueue failed");
            }
        }

        return this.getJob(userId, orderId);
    }

    private async getVendorName(vendorId: string): Promise<string> {
        const detail = await this.vendors.findAdminDetail(vendorId);
        return detail?.name ?? "Your decorator";
    }

    private async getVendorPhone(vendorId: string): Promise<string | null> {
        const detail = await this.vendors.findAdminDetail(vendorId);
        return detail?.phone ?? null;
    }
}
