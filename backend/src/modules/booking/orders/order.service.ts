import { randomBytes } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/postgres-client.js";
import { ApiError } from "@/shared/errors/apiError.js";
import { addons } from "@/modules/catalog/addons/addon.schema.js";
import { displayUrl } from "@/modules/upload/media/media.public.js";
import { uploads } from "@/modules/upload/media/media.schema.js";
import { getProductForCity, priceQuote } from "@/modules/catalog/index.js";
import { AddonRepository } from "@/modules/catalog/addons/addon.repository.js";
import { CartRepository } from "@/modules/booking/carts/cart.repository.js";
import type { AdminCreateOrderInput } from "@/modules/booking/orders/order.admin.dto.js";
import type { AdminOrderListQuery, CreateOrderInput } from "@/modules/booking/orders/order.dto.js";
import type { CustomerProvisioner } from "@/modules/identity/users/customer-provisioner.service.js";
import type {
    AdminOrderListFilter,
    IOrderRepository,
    OrderInsertPayload,
    OrderItemInsert,
} from "@/modules/booking/orders/order.repository.js";
import type { OrderWithItems } from "@/modules/booking/orders/order.repository.js";
import {
    ORDER_STATUSES,
    type OrderStatus,
} from "@/modules/booking/domain/order-status.js";
import { assertBookableSlot } from "@/modules/booking/slots/slot.service.js";
import { assertServiceable, getActiveCityById } from "@/modules/geo/index.js";
import { parsePagination, type Paginated } from "@/shared/http/pagination.js";
import type { INotificationService } from "@/modules/notifications/notification.service.js";
import { bookingTrackUrl } from "@/modules/notifications/lib/render.js";
import { settingService } from "@/modules/ops/index.js";
import { activeOnlineProvider } from "@/modules/ops/settings/payment-methods.js";
import type { IAssignmentRepository } from "@/modules/assignment/assignments/assignment.repository.js";
import type { CheckoutPayload, IPaymentIntentService } from "@/modules/payments/intents/payment-intent.service.js";
import { orderFinancialService } from "@/modules/payments/order-financials/order-financial.service.js";
import { promotionService } from "@/modules/promotions/index.js";
import type { PromotionLine } from "@/modules/promotions/promotion.service.js";
import { orderPayablePaise } from "@/modules/booking/orders/order-totals.js";
import { hasDeliveryCodePending } from "@/modules/booking/delivery/delivery-code.store.js";
import type {
    CustomerReviewService,
    SubmitOrderReviewInput,
} from "@/modules/reviews/customer-reviews/customer-review.service.js";
import { logger } from "@/utils/logger.js";

const ACTIVE_TRIP_STATUSES = new Set(["ASSIGNED", "EN_ROUTE", "ON_SITE"]);

export type PublicOrderAddon = {
    id: string;
    name: string;
    pricePaise: number;
    quantity: number;
    imageUrl?: string | null;
};

export type PublicOrderItem = {
    id: string;
    productId: string;
    name: string;
    imageUrl: string | null;
    quantity: number;
    productPaise: number;
    addonsPaise: number;
    lineTotalPaise: number;
    addons: PublicOrderAddon[];
};

export type PublicOrderReview = {
    id: string;
    rating: number;
    body: string;
    reviewedAt: string;
};

export type PublicOrderReviewMeta = {
    canReview: boolean;
    reviewSubmitted: boolean;
    review: PublicOrderReview | null;
};

export type PublicOrderSummary = {
    id: string;
    reference: string;
    status: string;
    scheduledAt: string;
    subtotalPaise: number;
    cityName: string;
    pincode: string;
    primaryName: string;
    primaryImageUrl: string | null;
    itemCount: number;
    canReview: boolean;
    reviewSubmitted: boolean;
};

export type PublicAdminOrderSummary = PublicOrderSummary & {
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    source: string;
    assigneeName: string | null;
    createdAt: string;
};

export type PublicAssignee = {
    id: string;
    name: string;
    phone: string | null;
    pincode: string;
    cityName: string;
    vendorResponse?: "pending" | "accepted" | "declined";
};

export type PublicOrder = {
    id: string;
    reference: string;
    status: string;
    paymentMethod: string;
    cityId: string;
    pincode: string;
    scheduledAt: string;
    subtotalPaise: number;
    discountPaise: number;
    totalPaise: number;
    couponCode: string | null;
    customer: {
        name: string;
        phone: string;
        email: string;
    };
    delivery: {
        address: string;
        landmark: string | null;
        cityName: string;
        pincode: string;
    };
    items: PublicOrderItem[];
    createdAt: string;
    source?: string;
    adminNotes?: string | null;
    assignee?: PublicAssignee | null;
    deliveryCodePending?: boolean;
    canReview: boolean;
    reviewSubmitted: boolean;
    review: PublicOrderReview | null;
};

type OrderLineInput = {
    productId: string;
    quantity: number;
    addonIds: string[];
};

export type CreateOrderResult = {
    order: PublicOrder;
    checkout?: CheckoutPayload;
};

export interface IOrderService {
    listForUser(
        userId: string,
        query: { page?: unknown; limit?: unknown },
    ): Promise<Paginated<PublicOrderSummary>>;
    listAdmin(query: AdminOrderListQuery): Promise<Paginated<PublicAdminOrderSummary>>;
    createFromCart(userId: string, input: CreateOrderInput): Promise<CreateOrderResult>;
    createAdminOrder(adminId: string, input: AdminCreateOrderInput): Promise<CreateOrderResult>;
    getForUser(userId: string, orderId: string): Promise<PublicOrder>;
    submitReview(
        userId: string,
        orderId: string,
        input: SubmitOrderReviewInput,
    ): Promise<PublicOrderReviewMeta>;
    getForAdmin(orderId: string): Promise<PublicOrder>;
    toPublic(order: OrderWithItems): PublicOrder;
    sendBookingConfirmedEmail(userId: string, order: PublicOrder): Promise<void>;
}

function makeReference(): string {
    const d = new Date();
    const y = String(d.getFullYear()).slice(-2);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rand = randomBytes(3).toString("hex").toUpperCase();
    return `DCY-${y}${m}${day}-${rand}`;
}

function normalizePincode(value: string): string {
    return value.replace(/\D/g, "").slice(0, 6);
}

const VALID_STATUSES = new Set<string>(ORDER_STATUSES);

function parseAdminStatuses(query: AdminOrderListQuery): OrderStatus[] | undefined {
    if (query.needsAssign === "true") {
        return ["CONFIRMED"];
    }
    const raw = query.status?.trim();
    if (!raw) return undefined;
    const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
    if (!parts.length) return undefined;
    for (const part of parts) {
        if (!VALID_STATUSES.has(part)) {
            throw ApiError.badRequest("invalid status");
        }
    }
    return parts as OrderStatus[];
}

function toAdminListFilter(query: AdminOrderListQuery): AdminOrderListFilter {
    return {
        q: query.q,
        statuses: parseAdminStatuses(query),
        cityId: query.cityId,
        paymentMethod: query.paymentMethod,
        sort: query.sort,
        userId: query.userId,
        vendorId: query.vendorId,
    };
}

function toPublicReview(
    review: { id: string; rating: number; body: string; reviewedAt: Date } | null | undefined,
): PublicOrderReview | null {
    if (!review) return null;
    return {
        id: review.id,
        rating: review.rating,
        body: review.body,
        reviewedAt: review.reviewedAt.toISOString(),
    };
}

function reviewMeta(
    status: string,
    review: { id: string; rating: number; body: string; reviewedAt: Date } | null | undefined,
): PublicOrderReviewMeta {
    const reviewSubmitted = Boolean(review);
    return {
        canReview: status === "COMPLETED" && !reviewSubmitted,
        reviewSubmitted,
        review: toPublicReview(review),
    };
}

export class OrderService implements IOrderService {
    private readonly carts = new CartRepository();
    private readonly addons = new AddonRepository();

    constructor(
        private readonly orders: IOrderRepository,
        private readonly notifications: INotificationService,
        private readonly payments?: IPaymentIntentService,
        private readonly assignments?: IAssignmentRepository,
        private readonly customers?: CustomerProvisioner,
        private readonly customerReviews?: CustomerReviewService,
    ) {}

    async listForUser(
        userId: string,
        query: { page?: unknown; limit?: unknown },
    ): Promise<Paginated<PublicOrderSummary>> {
        const pagination = parsePagination(query);
        const result = await this.orders.listForUser(userId, pagination);
        const reviewsByOrder = this.customerReviews
            ? await this.customerReviews.findByOrderIds(result.items.map((row) => row.id))
            : new Map();
        return {
            items: result.items.map((row) => {
                const meta = reviewMeta(row.status, reviewsByOrder.get(row.id));
                return {
                    id: row.id,
                    reference: row.reference,
                    status: row.status,
                    scheduledAt: row.scheduledAt.toISOString(),
                    subtotalPaise: row.subtotalPaise,
                    cityName: row.cityName,
                    pincode: row.pincode,
                    primaryName: row.primaryName,
                    primaryImageUrl: row.primaryImageUrl,
                    itemCount: row.itemCount,
                    canReview: meta.canReview,
                    reviewSubmitted: meta.reviewSubmitted,
                };
            }),
            page: pagination.page,
            limit: pagination.limit,
            total: result.total,
        };
    }

    async listAdmin(query: AdminOrderListQuery): Promise<Paginated<PublicAdminOrderSummary>> {
        const pagination = parsePagination(query);
        const filter = toAdminListFilter(query);
        const result = await this.orders.listAdmin(filter, pagination);
        const assignees = this.assignments
            ? await this.assignments.findAssigneesByOrderIds(result.items.map((row) => row.id))
            : new Map();
        return {
            items: result.items.map((row) => ({
                id: row.id,
                reference: row.reference,
                status: row.status,
                scheduledAt: row.scheduledAt.toISOString(),
                subtotalPaise: row.subtotalPaise,
                cityName: row.cityName,
                pincode: row.pincode,
                primaryName: row.primaryName,
                primaryImageUrl: row.primaryImageUrl,
                itemCount: row.itemCount,
                customerName: row.customerName,
                customerPhone: row.customerPhone,
                paymentMethod: row.paymentMethod,
                source: row.source,
                assigneeName: assignees.get(row.id)?.name ?? null,
                createdAt: row.createdAt.toISOString(),
                canReview: false,
                reviewSubmitted: false,
            })),
            page: pagination.page,
            limit: pagination.limit,
            total: result.total,
        };
    }

    async createFromCart(userId: string, input: CreateOrderInput): Promise<CreateOrderResult> {
        const existing = await this.orders.findByIdempotency(userId, input.idempotencyKey);
        if (existing) {
            const loaded = await this.orders.loadWithItems(existing.id);
            if (!loaded) throw ApiError.notFound("order not found");
            const order = this.toPublic(loaded);
            if (existing.status === "PENDING_PAYMENT") {
                if (!this.payments) {
                    throw ApiError.badRequest("online payment is not available");
                }
                const checkout = await this.payments.startCheckout(loaded);
                return { order, checkout };
            }
            return { order };
        }

        const isOnline = input.paymentMethod === "online";
        if (isOnline && !this.payments) {
            throw ApiError.badRequest("online payment is not available");
        }

        const platform = await settingService.getPaymentMethods();
        if (isOnline) {
            if (!platform.online) {
                throw ApiError.badRequest("online payment is not enabled on the platform");
            }
            if (!activeOnlineProvider(platform)) {
                throw ApiError.badRequest("no online payment provider is enabled");
            }
        } else if (!platform.cod) {
            throw ApiError.badRequest("cash on delivery is not enabled on the platform");
        }

        const cart = await this.carts.findByUserId(userId);
        if (!cart) {
            throw ApiError.badRequest("bag is empty");
        }

        const loaded = await this.carts.loadWithItems(cart.id);
        if (!loaded?.items.length) {
            throw ApiError.badRequest("bag is empty");
        }

        if (!loaded.cityId) {
            throw ApiError.badRequest("set bag city first");
        }

        assertBookableSlot(loaded.scheduledAt);

        const deliveryPin = normalizePincode(input.delivery.pincode);
        const resolved = await assertServiceable(deliveryPin);
        if (resolved.city.id !== input.delivery.cityId) {
            throw ApiError.badRequest("delivery PIN does not match bag city");
        }
        if (resolved.city.id !== loaded.cityId) {
            throw ApiError.badRequest("delivery PIN does not match bag city");
        }

        const cartPin = loaded.pincode ? normalizePincode(loaded.pincode) : null;
        if (cartPin && cartPin !== deliveryPin) {
            throw ApiError.badRequest("PIN must match bag");
        }

        const city = await getActiveCityById(loaded.cityId);
        const cityName = city.name;

        const { items, subtotalPaise } = await this.buildLineSnapshotsFromItems(
            loaded.cityId,
            loaded.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                addonIds: item.addons.map((row) => row.addonId),
            })),
        );

        for (const item of loaded.items) {
            const product = await getProductForCity(item.productId, loaded.cityId);
            if (isOnline && !product.paymentOnline) {
                throw ApiError.badRequest("one or more items do not support online payment");
            }
            if (!isOnline && !product.paymentCod) {
                throw ApiError.badRequest("one or more items do not support cash on delivery");
            }
        }

        const promotionLines = await this.buildPromotionLines(loaded.cityId, items);
        let discountPaise = 0;
        let couponId: string | null = null;
        let couponCode: string | null = null;
        let redemption: {
            couponId: string;
            userId: string;
            code: string;
            discountPaise: number;
        } | null = null;

        if (loaded.appliedCouponId) {
            const validated = await promotionService.validateAppliedCoupon(loaded.appliedCouponId, {
                cityId: loaded.cityId,
                subtotalPaise,
                lines: promotionLines,
                userId,
                paymentMethod: input.paymentMethod,
                requirePaymentMethod: true,
            });
            await promotionService.assertUsageLimits(validated.coupon, userId);
            discountPaise = validated.discountPaise;
            couponId = validated.coupon.id;
            couponCode = validated.coupon.code;
            redemption = {
                couponId: validated.coupon.id,
                userId,
                code: validated.coupon.code,
                discountPaise,
            };
        }

        const payload: OrderInsertPayload = {
            reference: makeReference(),
            userId,
            status: isOnline ? "PENDING_PAYMENT" : "CONFIRMED",
            paymentMethod: isOnline ? "ONLINE" : "COD",
            cityId: loaded.cityId,
            pincode: deliveryPin,
            scheduledAt: loaded.scheduledAt!,
            subtotalPaise,
            discountPaise,
            couponId,
            couponCode,
            customerName: input.customer.name.trim(),
            customerPhone: input.customer.phone.trim(),
            customerEmail: input.customer.email.trim(),
            addressLine: input.delivery.address.trim(),
            landmark: input.delivery.landmark?.trim() || null,
            cityName,
            source: "web",
            idempotencyKey: input.idempotencyKey,
            items,
        };

        const created = await this.orders.createWithItemsAndRedemption(
            payload,
            cart.id,
            redemption,
            { clearCart: !isOnline },
        );
        await orderFinancialService.snapshotForOrder(
            created.id,
            orderPayablePaise(created),
            created.discountPaise,
        );
        const publicOrder = this.toPublic(created);
        if (isOnline) {
            const checkout = await this.payments!.startCheckout(created);
            return { order: publicOrder, checkout };
        }
        await this.sendBookingConfirmedEmail(userId, publicOrder);
        return { order: publicOrder };
    }

    async createAdminOrder(adminId: string, input: AdminCreateOrderInput): Promise<CreateOrderResult> {
        if (!this.customers) {
            throw ApiError.internalServerError("admin booking is not configured");
        }

        await this.assertOfflinePaymentAllowed();

        const user = await this.customers.findOrCreateForAdminBooking({
            phone: input.customer.phone,
            name: input.customer.name,
            email: input.customer.email,
        });

        const existing = await this.orders.findByIdempotency(user.id, input.idempotencyKey);
        if (existing) {
            const loaded = await this.orders.loadWithItems(existing.id);
            if (!loaded) throw ApiError.notFound("order not found");
            return { order: this.toPublic(loaded) };
        }

        const scheduledAt = new Date(input.scheduledAt);
        assertBookableSlot(scheduledAt);

        const deliveryPin = normalizePincode(input.delivery.pincode);
        const resolved = await assertServiceable(deliveryPin);
        if (resolved.city.id !== input.delivery.cityId) {
            throw ApiError.badRequest("delivery PIN does not match city");
        }

        const city = await getActiveCityById(input.delivery.cityId);
        const { items, subtotalPaise } = await this.buildLineSnapshotsFromItems(
            input.delivery.cityId,
            input.items,
        );

        for (const line of input.items) {
            const product = await getProductForCity(line.productId, input.delivery.cityId);
            if (!product.paymentCod) {
                throw ApiError.badRequest("one or more items do not support offline payment");
            }
        }

        const paymentMethod = input.paymentMethod === "prepaid" ? "PREPAID" : "COD";
        const customerPhone = this.customers.toOrderPhone(input.customer.phone);
        const customerEmail = input.customer.email?.trim() ?? "";

        const payload: OrderInsertPayload = {
            reference: makeReference(),
            userId: user.id,
            status: "CONFIRMED",
            paymentMethod,
            source: "admin",
            createdByAdminId: adminId,
            adminNotes: input.adminNotes?.trim() || null,
            cityId: input.delivery.cityId,
            pincode: deliveryPin,
            scheduledAt,
            subtotalPaise,
            customerName: input.customer.name.trim(),
            customerPhone,
            customerEmail,
            addressLine: input.delivery.address.trim(),
            landmark: input.delivery.landmark?.trim() || null,
            cityName: city.name,
            idempotencyKey: input.idempotencyKey,
            items,
        };

        const created = await this.orders.insertOrderWithItems(payload);
        await orderFinancialService.snapshotForOrder(
            created.id,
            orderPayablePaise(created),
            created.discountPaise,
        );
        const publicOrder = this.toPublic(created);
        await this.sendBookingConfirmedEmail(user.id, publicOrder);
        return { order: publicOrder };
    }

    async getForUser(userId: string, orderId: string): Promise<PublicOrder> {
        const order = await this.orders.findByIdForUser(orderId, userId);
        if (!order) {
            throw ApiError.notFound("order not found");
        }
        const loaded = await this.orders.loadWithItems(orderId);
        if (!loaded) {
            throw ApiError.notFound("order not found");
        }
        const assignee =
            ACTIVE_TRIP_STATUSES.has(loaded.status) && this.assignments
                ? await this.assignments.findAssigneeByOrderId(orderId)
                : null;
        const publicOrder = await this.enrichAddonImages(this.toPublic(loaded));
        const deliveryCodePending =
            loaded.status === "ON_SITE" ? await hasDeliveryCodePending(orderId) : false;
        const review = this.customerReviews
            ? await this.customerReviews.findByOrderId(orderId)
            : null;
        const meta = reviewMeta(loaded.status, review);
        return {
            ...publicOrder,
            assignee: assignee ?? null,
            deliveryCodePending,
            canReview: meta.canReview,
            reviewSubmitted: meta.reviewSubmitted,
            review: meta.review,
        };
    }

    async submitReview(
        userId: string,
        orderId: string,
        input: SubmitOrderReviewInput,
    ): Promise<PublicOrderReviewMeta> {
        if (!this.customerReviews) {
            throw ApiError.badRequest("reviews are not available");
        }
        const order = await this.orders.findByIdForUser(orderId, userId);
        if (!order) {
            throw ApiError.notFound("order not found");
        }
        if (order.status !== "COMPLETED") {
            throw ApiError.badRequest("only completed bookings can be reviewed");
        }
        const loaded = await this.orders.loadWithItems(orderId);
        if (!loaded) {
            throw ApiError.notFound("order not found");
        }

        const productIds = [...new Set(loaded.items.map((item) => item.productId))];
        let productId = input.productId;
        if (!productId) {
            if (productIds.length === 1) {
                productId = productIds[0];
            } else {
                throw ApiError.badRequest("productId is required when the booking has multiple items");
            }
        } else if (!productIds.includes(productId)) {
            throw ApiError.badRequest("product not found in this booking");
        }

        const publicOrder = await this.enrichAddonImages(this.toPublic(loaded));
        const review = await this.customerReviews.createFromCustomerOrder(userId, orderId, {
            rating: input.rating,
            body: input.body,
            productId,
            reviewerName: publicOrder.customer.name,
            reviewerCity: publicOrder.delivery.cityName,
        });
        return reviewMeta("COMPLETED", review);
    }

    async getForAdmin(orderId: string): Promise<PublicOrder> {
        const order = await this.orders.findById(orderId);
        if (!order) {
            throw ApiError.notFound("order not found");
        }
        const loaded = await this.orders.loadWithItems(orderId);
        if (!loaded) {
            throw ApiError.notFound("order not found");
        }
        const assignee = this.assignments
            ? await this.assignments.findAssigneeForAdminByOrderId(orderId)
            : null;
        const publicOrder = await this.enrichAddonImages(this.toPublic(loaded));
        return {
            ...publicOrder,
            assignee: assignee ?? null,
        };
    }

    private async enrichAddonImages(order: PublicOrder): Promise<PublicOrder> {
        const addonIds = [
            ...new Set(order.items.flatMap((item) => item.addons.map((addon) => addon.id))),
        ];
        if (addonIds.length === 0) {
            return order;
        }

        const rows = await db
            .select({
                addonId: addons.id,
                upload: uploads,
            })
            .from(addons)
            .leftJoin(uploads, eq(addons.imageUploadId, uploads.id))
            .where(inArray(addons.id, addonIds));

        const imageByAddonId = new Map<string, string | null>();
        for (const row of rows) {
            imageByAddonId.set(row.addonId, row.upload ? displayUrl(row.upload) : null);
        }

        return {
            ...order,
            items: order.items.map((item) => ({
                ...item,
                addons: item.addons.map((addon) => ({
                    ...addon,
                    imageUrl: imageByAddonId.get(addon.id) ?? null,
                })),
            })),
        };
    }

    private async assertOfflinePaymentAllowed(): Promise<void> {
        const platform = await settingService.getPaymentMethods();
        if (!platform.cod) {
            throw ApiError.badRequest("cash on delivery is not enabled on the platform");
        }
    }

    private async buildLineSnapshotsFromItems(
        cityId: string,
        lines: OrderLineInput[],
    ): Promise<{ items: OrderItemInsert[]; subtotalPaise: number }> {
        const items: OrderItemInsert[] = [];
        let subtotalPaise = 0;

        for (const line of lines) {
            const addonIds = line.addonIds;
            let quote;
            try {
                quote = await priceQuote(line.productId, cityId, addonIds);
            } catch {
                throw ApiError.badRequest(`unable to price product ${line.productId}`);
            }

            const product = await getProductForCity(line.productId, cityId);
            const imageUrl =
                product.images?.find((img) => img.kind === "image")?.url ??
                product.images?.[0]?.url ??
                null;

            const priceByAddon: Record<string, number> = {};
            for (const addonId of addonIds) {
                try {
                    const single = await priceQuote(line.productId, cityId, [addonId]);
                    priceByAddon[addonId] = single.addonsPaise;
                } catch {
                    throw ApiError.badRequest(`unable to price add-on for product ${line.productId}`);
                }
            }

            const lineTotalPaise = quote.totalPaise * line.quantity;
            subtotalPaise += lineTotalPaise;

            const addonSnapshots = await Promise.all(
                addonIds.map(async (addonId) => {
                    const addon = await this.addons.findById(addonId);
                    return {
                        addonId,
                        addonName: addon?.name ?? "Add-on",
                        pricePaise: priceByAddon[addonId] ?? 0,
                        quantity: 1,
                    };
                }),
            );

            items.push({
                productId: line.productId,
                productName: product.name,
                imageUrl,
                quantity: line.quantity,
                productPaise: quote.productPaise,
                addonsPaise: quote.addonsPaise,
                lineTotalPaise,
                addons: addonSnapshots,
            });
        }

        return { items, subtotalPaise };
    }

    private async buildPromotionLines(
        cityId: string,
        items: OrderItemInsert[],
    ): Promise<PromotionLine[]> {
        const lines: PromotionLine[] = [];
        for (const item of items) {
            const product = await getProductForCity(item.productId, cityId);
            lines.push({
                productId: item.productId,
                categoryId: product.categoryId,
                lineTotalPaise: item.lineTotalPaise,
            });
        }
        return lines;
    }

    toPublic(order: OrderWithItems): PublicOrder {
        return {
            id: order.id,
            reference: order.reference,
            status: order.status,
            paymentMethod: order.paymentMethod,
            cityId: order.cityId,
            pincode: order.pincode,
            scheduledAt: order.scheduledAt.toISOString(),
            subtotalPaise: order.subtotalPaise,
            discountPaise: order.discountPaise ?? 0,
            totalPaise: orderPayablePaise(order),
            couponCode: order.couponCode ?? null,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                email: order.customerEmail,
            },
            delivery: {
                address: order.addressLine,
                landmark: order.landmark,
                cityName: order.cityName,
                pincode: order.pincode,
            },
            source: order.source,
            adminNotes: order.adminNotes,
            items: order.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                name: item.productName,
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                productPaise: item.productPaise,
                addonsPaise: item.addonsPaise,
                lineTotalPaise: item.lineTotalPaise,
                addons: item.addons.map((addon) => ({
                    id: addon.addonId,
                    name: addon.addonName,
                    pricePaise: addon.pricePaise,
                    quantity: addon.quantity,
                })),
            })),
            createdAt: order.createdAt.toISOString(),
            canReview: false,
            reviewSubmitted: false,
            review: null,
        };
    }

    async sendBookingConfirmedEmail(userId: string, order: PublicOrder): Promise<void> {
        try {
            const email = order.customer.email?.trim();
            await this.notifications.notify({
                event: "BOOKING_CONFIRMED",
                userId,
                recipient: {
                    email: email || undefined,
                    phone: order.customer.phone,
                },
                data: {
                    customerName: order.customer.name,
                    orderId: order.reference,
                    orderRef: order.reference,
                    bookingId: order.id,
                    trackUrl: bookingTrackUrl(order.id),
                    scheduledAt: order.scheduledAt,
                    city: order.delivery.cityName,
                    address: [
                        order.delivery.address,
                        order.delivery.landmark,
                        order.delivery.cityName,
                        order.delivery.pincode,
                    ]
                        .filter(Boolean)
                        .join(", "),
                    totalPaise: String(order.subtotalPaise),
                    itemsJson: JSON.stringify(
                        order.items.map((item) => ({
                            name: item.name,
                            imageUrl: item.imageUrl,
                            quantity: item.quantity,
                            lineTotalPaise: item.lineTotalPaise,
                        })),
                    ),
                },
                idempotencyKey: `booking-confirmed:${order.id}`,
            });
        } catch (err) {
            logger.error({ err, orderId: order.id }, "booking confirmed email failed");
        }
    }
}
