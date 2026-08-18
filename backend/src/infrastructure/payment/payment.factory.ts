import type { PaymentPort } from "@/infrastructure/payment/payment.port.js";
import { RazorpayProvider } from "@/infrastructure/payment/razorpay.provider.js";

export class PaymentFactory {
    private static instance: PaymentPort | null = null;

    static getProvider(): PaymentPort {
        if (this.instance) return this.instance;

        const name = (process.env.PAYMENT_PROVIDER ?? "razorpay").toLowerCase();
        switch (name) {
            case "razorpay":
                this.instance = new RazorpayProvider();
                return this.instance;
            default:
                throw new Error(`Unknown PAYMENT_PROVIDER="${name}". Add a provider file; do not change PaymentPort.`);
        }
    }
}
