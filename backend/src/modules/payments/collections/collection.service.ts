import { eq } from "drizzle-orm";
import { db } from "@/db/postgres-client.js";
import { PaymentFactory } from "@/infrastructure/payment/payment.factory.js";
import { OrderRepository } from "@/modules/booking/orders/order.repository.js";
import { orders } from "@/modules/booking/orders/order.schema.js";
import { activeOnlineProvider } from "@/modules/ops/settings/payment-methods.js";
import { settingService } from "@/modules/ops/index.js";
import { CollectionRepository } from "@/modules/payments/collections/collection.repository.js";
import { ledgerService } from "@/modules/payments/ledger/ledger.service.js";
import { ApiError } from "@/shared/errors/apiError.js";

const QR_TTL_MS = 15 * 60 * 1000;

export type CollectionStatusDto = {
    collectionStatus: string;
    collectionMethod: string | null;
    collectedAt: string | null;
    activeSession: {
        provider: string;
        qrImageUrl?: string;
        qrBase64?: string;
        shareUrl?: string;
        expiresAt: string;
    } | null;
};

export class CollectionService {
    private readonly collections = new CollectionRepository();
    private readonly orders = new OrderRepository();

    async getStatus(orderId: string): Promise<CollectionStatusDto> {
        const order = await this.orders.findById(orderId);
        if (!order) throw ApiError.notFound("order not found");

        const active = await this.collections.findActiveByOrderId(orderId);
        const payload = active?.qrPayload as Record<string, string> | undefined;

        return {
            collectionStatus: order.collectionStatus,
            collectionMethod: order.collectionMethod,
            collectedAt: order.collectedAt?.toISOString() ?? null,
            activeSession: active
                ? {
                      provider: active.provider,
                      qrImageUrl: payload?.qrImageUrl,
                      qrBase64: payload?.qrBase64,
                      shareUrl: payload?.shareUrl,
                      expiresAt: active.expiresAt.toISOString(),
                  }
                : null,
        };
    }

    async collectCash(orderId: string, vendorId: string): Promise<CollectionStatusDto> {
        const order = await this.assertCodCollectable(orderId, vendorId);
        if (order.collectionStatus === "collected_cash") {
            return this.getStatus(orderId);
        }
        if (order.collectionStatus !== "pending") {
            throw ApiError.conflict("collection already settled");
        }

        await this.collections.expireActiveForOrder(orderId);
        await db
            .update(orders)
            .set({
                collectionStatus: "collected_cash",
                collectionMethod: "cash",
                collectedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

        return this.getStatus(orderId);
    }

    async collectOnline(orderId: string, vendorId: string): Promise<CollectionStatusDto> {
        const order = await this.assertCodCollectable(orderId, vendorId);
        if (order.collectionStatus === "collected_online") {
            return this.getStatus(orderId);
        }
        if (order.collectionStatus === "collected_cash") {
            throw ApiError.conflict("cash already collected for this order");
        }

        const platform = await settingService.getPaymentMethods();
        const providerName = activeOnlineProvider(platform);
        if (!providerName) {
            throw ApiError.badRequest("online collection is not enabled");
        }

        const existing = await this.collections.findActiveByOrderId(orderId);
        if (existing && existing.expiresAt > new Date()) {
            return this.getStatus(orderId);
        }

        await this.collections.expireActiveForOrder(orderId);
        const provider = PaymentFactory.getProvider(providerName);
        const qr = await provider.createCollectQr({
            orderId,
            amountPaise: order.subtotalPaise,
            receipt: order.reference,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                email: order.customerEmail,
            },
        });

        const expiresAt = new Date(Date.now() + QR_TTL_MS);
        await this.collections.create({
            orderId,
            provider: providerName,
            providerRef: qr.providerRef,
            amountPaise: order.subtotalPaise,
            status: "created",
            expiresAt,
            qrPayload: {
                qrImageUrl: qr.qrImageUrl,
                qrBase64: qr.qrBase64,
                shareUrl: qr.shareUrl,
            },
        });

        return this.getStatus(orderId);
    }

    async handleQrPayment(
        providerRef: string,
        paymentId: string,
        amountPaise: number,
    ): Promise<void> {
        const session = await this.collections.findByProviderRef(providerRef);
        if (!session) return;
        if (session.status === "paid") return;

        const order = await this.orders.findById(session.orderId);
        if (!order) return;

        await ledgerService.postPaymentCaptured(session.orderId, paymentId, amountPaise);
        await this.collections.markPaid(session.id, paymentId);

        await db
            .update(orders)
            .set({
                collectionStatus: "collected_online",
                collectionMethod: "online",
                collectedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(orders.id, session.orderId));
    }

    private async assertCodCollectable(orderId: string, vendorId: string) {
        const order = await this.orders.findById(orderId);
        if (!order) throw ApiError.notFound("order not found");
        if (order.paymentMethod !== "COD") {
            throw ApiError.badRequest("collection is only required for COD orders");
        }
        if (order.status !== "ON_SITE") {
            throw ApiError.conflict("collection is only available when on site");
        }
        return order;
    }
}

export const collectionService = new CollectionService();
