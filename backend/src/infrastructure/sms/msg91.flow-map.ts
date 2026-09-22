import type { NotificationEvent } from "@/modules/notifications/policy/events.js";

export type Msg91FlowRoute = {
    flowId: string;
    /** Ordered keys read from eventData for Flow VAR1, VAR2, … */
    variableKeys: string[];
};

function envFlowId(key: string): string | null {
    const value = process.env[key]?.trim();
    return value ? value : null;
}

function route(flowEnvKey: string, variableKeys: string[]): Msg91FlowRoute | null {
    const flowId = envFlowId(flowEnvKey);
    if (!flowId) return null;
    return { flowId, variableKeys };
}

/**
 * Resolve MSG91 One API Flow + variable order for a notification event.
 */
export function resolveMsg91Flow(
    event: string | undefined,
    eventData: Record<string, string> | undefined,
): Msg91FlowRoute | null {
    if (!event) return null;

    if (event === "LOGIN_OTP") {
        return route("MSG91_FLOW_LOGIN_OTP", ["otp"]);
    }

    const byEvent: Record<string, { env: string; keys: string[] }> = {
        BOOKING_CONFIRMED: {
            env: "MSG91_FLOW_BOOKING_CONFIRMED",
            keys: ["customerName", "orderRef", "scheduledAt", "trackUrl"],
        },
        BOOKING_ASSIGNED: {
            env: "MSG91_FLOW_BOOKING_ASSIGNED",
            keys: ["vendorName", "orderRef", "scheduledAt", "trackUrl"],
        },
        VENDOR_EN_ROUTE: {
            env: "MSG91_FLOW_VENDOR_EN_ROUTE",
            keys: ["vendorName", "orderRef", "trackUrl"],
        },
        VENDOR_ON_SITE: {
            env: "MSG91_FLOW_VENDOR_ON_SITE",
            keys: ["vendorName", "orderRef"],
        },
        DELIVERY_CODE: {
            env: "MSG91_FLOW_DELIVERY_CODE",
            keys: ["orderRef", "code"],
        },
        BOOKING_COMPLETED: {
            env: "MSG91_FLOW_BOOKING_COMPLETED",
            keys: ["orderRef"],
        },
        VENDOR_NEW_JOB: {
            env: "MSG91_FLOW_VENDOR_NEW_JOB",
            keys: ["orderRef", "scheduledAt", "address"],
        },
        VENDOR_JOB_ASSIGNED: {
            env: "MSG91_FLOW_VENDOR_JOB_ASSIGNED",
            keys: ["orderRef", "scheduledAt", "address"],
        },
        BOOKING_REMINDER: {
            env: "MSG91_FLOW_BOOKING_REMINDER",
            keys: ["orderRef", "scheduledAt", "trackUrl"],
        },
        PAYOUT_PAID: {
            env: "MSG91_FLOW_PAYOUT_PAID",
            keys: ["amountFormatted", "payoutDestination"],
        },
        PAYOUT_FAILED: {
            env: "MSG91_FLOW_PAYOUT_FAILED",
            keys: ["amountFormatted", "failureReason"],
        },
    };

    const spec = byEvent[event as NotificationEvent];
    if (!spec) return null;
    return route(spec.env, spec.keys);
}

export function buildMsg91FlowRecipientVars(
    variableKeys: string[],
    eventData: Record<string, string>,
): Record<string, string> {
    const recipient: Record<string, string> = {};
    variableKeys.forEach((key, index) => {
        const varKey = `VAR${index + 1}`;
        recipient[varKey] = eventData[key] ?? "";
    });
    return recipient;
}
