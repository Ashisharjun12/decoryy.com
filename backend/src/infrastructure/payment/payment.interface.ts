export type CreateIntentInput = {
    orderId: string;
    amountPaise: number;
    receipt: string;
    customer?: {
        name: string;
        phone: string;
        email: string;
    };
};

export type CreateIntentResult = {
    provider: string;
    providerRef: string;
    payload: Record<string, unknown>;
};

export type WebhookEvent = {
    provider: string;
    providerRef: string;
    providerPaymentId: string;
    orderId: string;
    amountPaise: number;
    status: "captured" | "failed" | "refunded";
    kind: "checkout" | "collection";
    raw: unknown;
};

export type CreateCollectQrInput = {
    orderId: string;
    amountPaise: number;
    receipt: string;
    customer: {
        name: string;
        phone: string;
        email?: string;
    };
};

export type CreateCollectQrResult = {
    providerRef: string;
    qrImageUrl?: string;
    qrBase64?: string;
    shareUrl?: string;
};

export type RefundInput = {
    providerRef: string;
    amountPaise: number;
    idempotencyKey: string;
};

export type VerifyClientPaymentInput =
    | {
          provider: "razorpay";
          orderId: string;
          amountPaise: number;
          razorpayOrderId: string;
          razorpayPaymentId: string;
          razorpaySignature: string;
      }
    | {
          provider: "cashfree";
          orderId: string;
          amountPaise: number;
      };

export type VerifyClientPaymentResult = {
    providerPaymentId: string;
    providerRef: string;
};

/**
 * Stable payment API. Razorpay today, Cashfree later — do not delete these methods.
 * COD is NOT a provider; it is an order payment_method + ledger lines.
 */
export interface IPaymentProvider {
    readonly name: "razorpay" | "cashfree";
    createIntent(input: CreateIntentInput): Promise<CreateIntentResult>;
    createCollectQr(input: CreateCollectQrInput): Promise<CreateCollectQrResult>;
    verifyClientPayment(input: VerifyClientPaymentInput): Promise<VerifyClientPaymentResult>;
    verifyWebhook(headers: Record<string, string | string[] | undefined>, rawBody: Buffer | string): Promise<WebhookEvent>;
    refund(input: RefundInput): Promise<void>;
}
