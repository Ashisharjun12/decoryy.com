import { createHmac, timingSafeEqual } from "node:crypto";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { _config } from "@/config/config.js";
import { paymentWebhookUrl } from "@/lib/api-public-url.js";
import { ApiError } from "@/shared/errors/apiError.js";
import {
    cashfreePhone,
    paymentCustomerEmail,
} from "@/infrastructure/payment/payment-customer.js";
import type {
    CreateCollectQrInput,
    CreateCollectQrResult,
    CreateIntentInput,
    CreateIntentResult,
    IPaymentProvider,
    RefundInput,
    VerifyClientPaymentInput,
    VerifyClientPaymentResult,
    WebhookEvent,
} from "@/infrastructure/payment/payment.interface.js";

function cashfreeEnvironment(): CFEnvironment {
    const env = (_config.CASHFREE_ENV || "sandbox").toLowerCase();
    return env === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
}

function requireKeys(): { clientId: string; clientSecret: string } {
    const clientId = _config.CASHFREE_KEY_ID?.trim();
    const clientSecret = _config.CASHFREE_KEY_SECRET?.trim();
    if (!clientId || !clientSecret) {
        throw ApiError.badRequest("cashfree is not configured");
    }
    return { clientId, clientSecret };
}

function webhookSecret(): string {
    const secret = _config.CASHFREE_WEBHOOK_SECRET?.trim();
    if (!secret) {
        throw ApiError.internalServerError("cashfree webhook secret is not configured");
    }
    return secret;
}

function client(): Cashfree {
    const { clientId, clientSecret } = requireKeys();
    return new Cashfree(cashfreeEnvironment(), clientId, clientSecret);
}

function toRupees(amountPaise: number): number {
    return Number((amountPaise / 100).toFixed(2));
}

function asBodyString(rawBody: Buffer | string): string {
    return typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
}

export class CashfreeProvider implements IPaymentProvider {
    readonly name = "cashfree" as const;

    async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
        const customer = input.customer;
        const response = await client().PGCreateOrder({
            order_id: input.orderId,
            order_amount: toRupees(input.amountPaise),
            order_currency: "INR",
            customer_details: {
                customer_id: input.orderId,
                customer_name: customer?.name ?? "Customer",
                customer_email: customer?.email ?? "customer@decoryy.com",
                customer_phone: customer ? cashfreePhone(customer.phone) : cashfreePhone("9876543210"),
            },
            order_meta: {
                return_url: `${_config.WEB_APP_ORIGIN}/checkout/success/${input.orderId}`,
            },
        });

        const data = response.data;
        const providerRef = String(data.cf_order_id ?? data.order_id ?? input.orderId);
        const paymentSessionId = data.payment_session_id;
        if (!paymentSessionId) {
            throw ApiError.internalServerError("cashfree did not return a payment session");
        }

        return {
            provider: this.name,
            providerRef,
            payload: {
                paymentSessionId,
                orderId: input.orderId,
                environment: (_config.CASHFREE_ENV || "sandbox").toLowerCase(),
                amountPaise: input.amountPaise,
            },
        };
    }

    async createCollectQr(input: CreateCollectQrInput): Promise<CreateCollectQrResult> {
        const linkId = `collect-${input.orderId}-${Date.now()}`;
        const response = await client().PGCreateLink({
            link_id: linkId,
            link_amount: toRupees(input.amountPaise),
            link_currency: "INR",
            link_purpose: `COD collection ${input.receipt}`,
            customer_details: {
                customer_name: input.customer.name,
                customer_email: paymentCustomerEmail(input.customer.email),
                customer_phone: cashfreePhone(input.customer.phone),
            },
            link_meta: {
                notify_url: paymentWebhookUrl("cashfree"),
            },
            link_notes: {
                decory_order_id: input.orderId,
                decory_kind: "collection",
            },
        });

        const data = response.data;
        return {
            providerRef: String(data.link_id ?? linkId),
            qrBase64: typeof data.link_qrcode === "string" ? data.link_qrcode : undefined,
            shareUrl: typeof data.link_url === "string" ? data.link_url : undefined,
        };
    }

    async verifyClientPayment(input: VerifyClientPaymentInput): Promise<VerifyClientPaymentResult> {
        if (input.provider !== "cashfree") {
            throw ApiError.badRequest("invalid payment provider");
        }
        const response = await client().PGFetchOrder(input.orderId);
        const data = response.data;
        const status = String(data.order_status ?? "").toUpperCase();
        if (status !== "PAID") {
            throw ApiError.badRequest("payment not completed");
        }
        const paidPaise = Math.round(Number(data.order_amount ?? 0) * 100);
        if (paidPaise !== input.amountPaise) {
            throw ApiError.badRequest("payment amount mismatch");
        }
        return {
            providerPaymentId: String(data.cf_order_id ?? input.orderId),
            providerRef: String(data.cf_order_id ?? input.orderId),
        };
    }

    async verifyWebhook(
        headers: Record<string, string | string[] | undefined>,
        rawBody: Buffer | string,
    ): Promise<WebhookEvent> {
        const body = asBodyString(rawBody);
        const signature = String(headers["x-webhook-signature"] ?? headers["x-cf-signature"] ?? "");
        const timestamp = String(headers["x-webhook-timestamp"] ?? "");
        const signedPayload = `${timestamp}${body}`;
        const expected = createHmac("sha256", webhookSecret()).update(signedPayload).digest("base64");
        const valid =
            signature.length === expected.length &&
            timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
        if (!valid) {
            throw ApiError.unauthorized("invalid cashfree webhook signature");
        }

        const payload = JSON.parse(body) as {
            type?: string;
            data?: {
                order?: { order_id?: string; order_amount?: number; cf_order_id?: string };
                payment?: { cf_payment_id?: string; payment_amount?: number };
                link?: { link_id?: string; link_amount?: number; link_notes?: Record<string, string> };
            };
        };

        const type = String(payload.type ?? "").toUpperCase();
        const order = payload.data?.order;
        const payment = payload.data?.payment;
        const link = payload.data?.link;

        if (link?.link_notes?.decory_kind === "collection" || type.includes("LINK")) {
            const orderId = link?.link_notes?.decory_order_id ?? "";
            const amountPaise = Math.round(Number(link?.link_amount ?? payment?.payment_amount ?? 0) * 100);
            const providerPaymentId = String(payment?.cf_payment_id ?? link?.link_id ?? "");
            const providerRef = String(link?.link_id ?? "");
            if (!orderId || !providerPaymentId || !amountPaise) {
                throw ApiError.badRequest("unsupported cashfree collection webhook");
            }
            return {
                provider: this.name,
                providerRef,
                providerPaymentId,
                orderId,
                amountPaise,
                status: "captured",
                kind: "collection",
                raw: payload,
            };
        }

        const orderId = String(order?.order_id ?? "");
        const amountPaise = Math.round(Number(order?.order_amount ?? payment?.payment_amount ?? 0) * 100);
        const providerPaymentId = String(payment?.cf_payment_id ?? order?.cf_order_id ?? "");
        const providerRef = String(order?.cf_order_id ?? orderId);
        if (!orderId || !providerPaymentId || !amountPaise) {
            throw ApiError.badRequest("unsupported cashfree webhook payload");
        }

        const status = type.includes("SUCCESS") || type.includes("PAID") ? "captured" : "failed";
        return {
            provider: this.name,
            providerRef,
            providerPaymentId,
            orderId,
            amountPaise,
            status,
            kind: "checkout",
            raw: payload,
        };
    }

    async refund(input: RefundInput): Promise<void> {
        await client().PGOrderCreateRefund(input.providerRef, {
            refund_amount: toRupees(input.amountPaise),
            refund_id: input.idempotencyKey,
            refund_note: "decory refund",
        });
    }
}
