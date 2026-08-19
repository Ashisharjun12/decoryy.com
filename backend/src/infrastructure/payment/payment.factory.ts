import type { IPaymentProvider } from "@/infrastructure/payment/payment.interface.js";
import { RazorpayProvider } from "@/infrastructure/payment/provider/razorpay.provider.js";

export class PaymentFactory {
    private static instance: IPaymentProvider | null = null;

    static getProvider(): IPaymentProvider {
        if (this.instance) return this.instance;

        const name = (process.env.PAYMENT_PROVIDER ?? "razorpay").toLowerCase();
        switch (name) {
            case "razorpay":
                this.instance = new RazorpayProvider();
                return this.instance;
            default:
                throw new Error(`Unknown PAYMENT_PROVIDER="${name}". Add a provider file; do not change IPaymentProvider.`);
        }
    }
}
