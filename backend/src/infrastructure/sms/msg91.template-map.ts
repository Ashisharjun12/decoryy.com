import { _config } from "@/config/config.js";
import type { NotificationEvent } from "@/modules/notifications/policy/events.js";

export type Msg91TemplateRoute = {
    templateId: string;
    /** Ordered keys read from eventData for MSG91 var1, var2, … */
    variableKeys: string[];
};

function envTemplateId(key: string): string | null {
    const value = process.env[key]?.trim();
    return value ? value : null;
}

function route(templateEnvKey: string, variableKeys: string[]): Msg91TemplateRoute | null {
    const templateId = envTemplateId(templateEnvKey);
    if (!templateId) return null;
    return { templateId, variableKeys };
}

/**
 * Resolve DLT template + variable order for a notification event.
 * Returns null if no MSG91 template ID is configured for this event.
 */
export function resolveMsg91Template(
    event: string | undefined,
    eventData: Record<string, string> | undefined,
): Msg91TemplateRoute | null {
    if (!event) return null;
    const data = eventData ?? {};

    if (event === "LOGIN_OTP") {
        const hash = data.androidAppHash?.trim();
        const androidId = envTemplateId("MSG91_TEMPLATE_LOGIN_OTP_ANDROID");
        if (hash && androidId) {
            return { templateId: androidId, variableKeys: ["otp", "androidAppHash"] };
        }
        return route("MSG91_TEMPLATE_LOGIN_OTP", ["otp"]);
    }

    const byEvent: Record<string, { env: string; keys: string[] }> = {
        BOOKING_CONFIRMED: {
            env: "MSG91_TEMPLATE_BOOKING_CONFIRMED",
            keys: ["customerName", "orderRef", "scheduledAt", "trackUrl"],
        },
        BOOKING_ASSIGNED: {
            env: "MSG91_TEMPLATE_BOOKING_ASSIGNED",
            keys: ["vendorName", "orderRef", "scheduledAt", "trackUrl"],
        },
        VENDOR_EN_ROUTE: {
            env: "MSG91_TEMPLATE_VENDOR_EN_ROUTE",
            keys: ["vendorName", "orderRef", "trackUrl"],
        },
        VENDOR_ON_SITE: {
            env: "MSG91_TEMPLATE_VENDOR_ON_SITE",
            keys: ["vendorName", "orderRef"],
        },
        DELIVERY_CODE: {
            env: "MSG91_TEMPLATE_DELIVERY_CODE",
            keys: ["orderRef", "code"],
        },
        BOOKING_COMPLETED: {
            env: "MSG91_TEMPLATE_BOOKING_COMPLETED",
            keys: ["orderRef"],
        },
        VENDOR_NEW_JOB: {
            env: "MSG91_TEMPLATE_VENDOR_NEW_JOB",
            keys: ["orderRef", "scheduledAt", "address"],
        },
        VENDOR_JOB_ASSIGNED: {
            env: "MSG91_TEMPLATE_VENDOR_JOB_ASSIGNED",
            keys: ["orderRef", "scheduledAt", "address"],
        },
        BOOKING_REMINDER: {
            env: "MSG91_TEMPLATE_BOOKING_REMINDER",
            keys: ["orderRef", "scheduledAt", "trackUrl"],
        },
        PAYOUT_PAID: {
            env: "MSG91_TEMPLATE_PAYOUT_PAID",
            keys: ["amountFormatted", "payoutDestination"],
        },
        PAYOUT_FAILED: {
            env: "MSG91_TEMPLATE_PAYOUT_FAILED",
            keys: ["amountFormatted", "failureReason"],
        },
    };

    const spec = byEvent[event as NotificationEvent];
    if (!spec) return null;
    return route(spec.env, spec.keys);
}

export function msg91MobileFromE164(to: string): string {
    const digits = to.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
        return digits;
    }
    if (digits.length === 10) {
        return `91${digits}`;
    }
    if (digits.startsWith("91") && digits.length >= 12) {
        return digits.slice(0, 12);
    }
    throw new Error(`MSG91: unsupported phone format: ${to}`);
}

export function buildMsg91RecipientVars(
    variableKeys: string[],
    eventData: Record<string, string>,
): Record<string, string> {
    const recipient: Record<string, string> = {};
    variableKeys.forEach((key, index) => {
        const varKey = `var${index + 1}`;
        let value = eventData[key] ?? "";
        if (key === "androidAppHash") {
            value = eventData.androidAppHash ?? "";
        }
        recipient[varKey] = value;
    });
    return recipient;
}

export function assertMsg91Configured(): void {
    if (!_config.MSG91_AUTH_KEY?.trim()) {
        throw new Error("MSG91_AUTH_KEY is required when SMS_PROVIDER=msg91");
    }
    if (!_config.MSG91_SENDER_ID?.trim()) {
        throw new Error("MSG91_SENDER_ID is required when SMS_PROVIDER=msg91");
    }
}
