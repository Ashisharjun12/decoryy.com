import { _config } from "@/config/config.js";
import type { ISmsProvider } from "@/infrastructure/sms/sms.interface.js";
import { CircuitBreakerSms } from "@/infrastructure/sms/circuit-breaker-sms.js";
import { DevSmsProvider } from "@/infrastructure/sms/provider/dev.provider.js";
import { Fast2SmsProvider } from "@/infrastructure/sms/provider/fast2sms.provider.js";
import { TwilioSmsProvider } from "@/infrastructure/sms/provider/twilio.provider.js";

export class SmsFactory {
    private static instance: ISmsProvider | null = null;

    static getProvider(): ISmsProvider {
        if (this.instance) return this.instance;

        const name = (_config.SMS_PROVIDER || "dev").toLowerCase();
        switch (name) {
            case "dev":
                this.instance = new DevSmsProvider();
                return this.instance;
            case "twilio":
                this.instance = new CircuitBreakerSms(new TwilioSmsProvider());
                return this.instance;
            case "fast2sms":
                this.instance = new CircuitBreakerSms(new Fast2SmsProvider());
                return this.instance;
            default:
                throw new Error(`Unknown SMS_PROVIDER="${name}". Add a provider file; do not change ISmsProvider.`);
        }
    }
}
