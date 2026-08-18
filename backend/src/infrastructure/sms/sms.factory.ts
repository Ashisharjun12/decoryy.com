import type { SmsPort } from "@/infrastructure/sms/sms.port.js";
import { Msg91Provider } from "@/infrastructure/sms/msg91.provider.js";

export class SmsFactory {
    private static instance: SmsPort | null = null;

    static getProvider(): SmsPort {
        if (this.instance) return this.instance;

        const name = (process.env.SMS_PROVIDER ?? "msg91").toLowerCase();
        switch (name) {
            case "msg91":
                this.instance = new Msg91Provider();
                return this.instance;
            default:
                throw new Error(`Unknown SMS_PROVIDER="${name}". Add a provider file; do not change SmsPort.`);
        }
    }
}
