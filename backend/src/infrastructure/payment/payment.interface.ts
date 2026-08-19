export type CreateIntentInput = {
    orderId: string;
    amountPaise: number;
    receipt: string;
};

export type CreateIntentResult = {
    provider: string;
    providerRef: string;
    payload: Record<string, unknown>;
};

export type WebhookEvent = {
    provider: string;
    providerRef: string;
    orderId: string;
    amountPaise: number;
    status: "captured" | "failed" | "refunded";
    raw: unknown;
};

export type RefundInput = {
    providerRef: string;
    amountPaise: number;
    idempotencyKey: string;
};

/**
 * Stable payment API. Razorpay today, Cashfree later — do not delete these methods.
 * COD is NOT a provider; it is an order payment_method + ledger lines.
 */
export interface IPaymentProvider {
    createIntent(input: CreateIntentInput): Promise<CreateIntentResult>;
    verifyWebhook(headers: Record<string, string | string[] | undefined>, rawBody: Buffer | string): Promise<WebhookEvent>;
    refund(input: RefundInput): Promise<void>;
}
