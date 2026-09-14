import { _config } from "@/config/config.js";
import type { ISmsProvider, SmsMessage } from "@/infrastructure/sms/sms.interface.js";
import { logger } from "@/utils/logger.js";

type Fast2SmsResponse = {
    return: boolean;
    request_id?: string;
    message?: string | string[];
    status_code?: number;
};

export class Fast2SmsProvider implements ISmsProvider {
    private readonly apiKey: string;
    private readonly route: string;
    private readonly senderId: string | undefined;

    constructor() {
        const apiKey = _config.FAST2SMS_API_KEY;
        if (!apiKey) {
            throw new Error("FAST2SMS_API_KEY is required when SMS_PROVIDER=fast2sms");
        }
        this.apiKey = apiKey;
        this.route = (_config.FAST2SMS_ROUTE || "q").toLowerCase();
        this.senderId = _config.FAST2SMS_SENDER_ID || undefined;
    }

    async send(message: SmsMessage): Promise<void> {
        const mobile = this.toIndianMobile(message.to);

        try {
            const payload = this.route === "dlt"
                ? this.buildDltPayload(mobile, message.body)
                : {
                      route: "q",
                      message: message.body,
                      numbers: mobile,
                  };

            const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
                method: "POST",
                headers: {
                    Authorization: this.apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = (await response.json()) as Fast2SmsResponse;

            if (!result.return) {
                const errMsg = Array.isArray(result.message)
                    ? result.message.join(", ")
                    : result.message ?? "send failed";
                throw new Error(
                    `Fast2SMS failed status=${result.status_code ?? response.status}: ${errMsg}`,
                );
            }

            logger.info({ requestId: result.request_id, to: message.to }, "Fast2SMS sent");
        } catch (err) {
            if (err instanceof Error && err.message.startsWith("Fast2SMS")) {
                throw err;
            }
            throw new Error(
                `Fast2SMS SMS failed: ${err instanceof Error ? err.message : "send failed"}`,
            );
        }
    }

    /** +91XXXXXXXXXX → 10-digit local number */
    private toIndianMobile(to: string): string {
        const digits = to.replace(/\D/g, "");
        if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
        if (digits.length === 10) return digits;
        throw new Error(`Fast2SMS: invalid Indian mobile "${to}"`);
    }

    private buildDltPayload(mobile: string, _body: string) {
        if (!this.senderId) {
            throw new Error("FAST2SMS_SENDER_ID is required when FAST2SMS_ROUTE=dlt");
        }
        throw new Error(
            "FAST2SMS_ROUTE=dlt is not configured yet — use FAST2SMS_ROUTE=q for testing or add DLT template mapping",
        );
    }
}
