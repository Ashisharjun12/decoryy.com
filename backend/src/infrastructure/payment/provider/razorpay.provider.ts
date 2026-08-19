import type {
    CreateIntentInput,
    CreateIntentResult,
    IPaymentProvider,
    RefundInput,
    WebhookEvent,
} from "@/infrastructure/payment/payment.interface.js";

export class RazorpayProvider implements IPaymentProvider {
    async createIntent(_input: CreateIntentInput): Promise<CreateIntentResult> {
        throw new Error("RazorpayProvider.createIntent is not implemented yet");
    }

    async verifyWebhook(
        _headers: Record<string, string | string[] | undefined>,
        _rawBody: Buffer | string,
    ): Promise<WebhookEvent> {
        throw new Error("RazorpayProvider.verifyWebhook is not implemented yet");
    }

    async refund(_input: RefundInput): Promise<void> {
        throw new Error("RazorpayProvider.refund is not implemented yet");
    }
}
