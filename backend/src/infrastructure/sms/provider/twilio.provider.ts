import twilio from "twilio";
import { _config } from "@/config/config.js";
import type { ISmsProvider, SmsMessage } from "@/infrastructure/sms/sms.interface.js";
import { logger } from "@/utils/logger.js";

const TEMPLATES: Record<string, (data: Record<string, string>) => string> = {
    login_otp: (data) => `Your Decory OTP is ${data.otp}. Valid for 5 minutes.`,
};

export class TwilioSmsProvider implements ISmsProvider {
    private readonly client: ReturnType<typeof twilio>;
    private readonly fromNumber: string | undefined;
    private readonly messagingServiceSid: string | undefined;

    constructor() {
        const accountSid = _config.TWILIO_ACCOUNT_SID;
        const authToken = _config.TWILIO_AUTH_TOKEN;
        this.fromNumber = _config.TWILIO_FROM_NUMBER || undefined;
        this.messagingServiceSid = _config.TWILIO_MESSAGING_SERVICE_SID || undefined;

        if (!accountSid || !authToken) {
            throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required when SMS_PROVIDER=twilio");
        }
        if (!this.messagingServiceSid && !this.fromNumber) {
            throw new Error("TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID is required when SMS_PROVIDER=twilio");
        }

        this.client = twilio(accountSid, authToken);
    }


    async send(message: SmsMessage): Promise<void> {
        const render = TEMPLATES[message.template];
        if (!render) {
            throw new Error(`Unknown SMS template "${message.template}"`);
        }

        const body = render(message.data);
        try {
            const result = await this.client.messages.create({
                to: message.to,
                body,
                ...(this.messagingServiceSid
                    ? { messagingServiceSid: this.messagingServiceSid }
                    : { from: this.fromNumber }),
            });
            logger.info({ sid: result.sid, to: message.to }, "Twilio SMS sent");
        } catch (err) {
            const twilioErr = err as { code?: number; message?: string; status?: number };
            throw new Error(
                `Twilio SMS failed code=${twilioErr.code ?? "unknown"} status=${twilioErr.status ?? "unknown"}: ${twilioErr.message ?? "send failed"}`,
            );
        }
    }
}
