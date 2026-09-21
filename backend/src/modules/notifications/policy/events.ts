import type {
    NotificationChannel,
    NotificationPriority,
    NotificationTemplateType,
} from "@/modules/notifications/schema.js";

export const NOTIFICATION_EVENTS = [
    "LOGIN_OTP",
    "BOOKING_CONFIRMED",
    "BOOKING_ASSIGNED",
    "VENDOR_EN_ROUTE",
    "VENDOR_ON_SITE",
    "DELIVERY_CODE",
    "BOOKING_COMPLETED",
    "VENDOR_NEW_JOB",
    "VENDOR_JOB_ASSIGNED",
    "BOOKING_REMINDER",
    "CHAT_MESSAGE",
    "PAYOUT_PAID",
    "PAYOUT_FAILED",
    "DISPATCH_EXHAUSTED",
] as const;
export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export type EventChannelPolicy = {
    templateKey: string;
    channel: NotificationChannel;
    type: NotificationTemplateType;
    priority: NotificationPriority;
    required: boolean;
};

export type EventPolicy = {
    channels: EventChannelPolicy[];
};

export const EVENT_POLICIES: Record<NotificationEvent, EventPolicy> = {
    LOGIN_OTP: {
        channels: [
            {
                templateKey: "login_otp",
                channel: "sms",
                type: "transactional",
                priority: "critical",
                required: true,
            },
        ],
    },
    BOOKING_CONFIRMED: {
        channels: [
            {
                templateKey: "booking_confirmed",
                channel: "email",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "booking_confirmed",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    BOOKING_ASSIGNED: {
        channels: [
            {
                templateKey: "booking_assigned",
                channel: "email",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "booking_assigned",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    VENDOR_EN_ROUTE: {
        channels: [
            {
                templateKey: "vendor_en_route",
                channel: "email",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "vendor_en_route",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    VENDOR_ON_SITE: {
        channels: [
            {
                templateKey: "vendor_on_site",
                channel: "email",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "vendor_on_site",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    DELIVERY_CODE: {
        channels: [
            {
                templateKey: "delivery_code",
                channel: "email",
                type: "transactional",
                priority: "critical",
                required: false,
            },
            {
                templateKey: "delivery_code",
                channel: "sms",
                type: "transactional",
                priority: "critical",
                required: false,
            },
        ],
    },
    BOOKING_COMPLETED: {
        channels: [
            {
                templateKey: "booking_completed",
                channel: "email",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "booking_completed",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    VENDOR_NEW_JOB: {
        channels: [
            {
                templateKey: "vendor_new_job",
                channel: "push",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "vendor_new_job",
                channel: "in_app",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "vendor_new_job",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    VENDOR_JOB_ASSIGNED: {
        channels: [
            {
                templateKey: "vendor_job_assigned",
                channel: "push",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "vendor_job_assigned",
                channel: "in_app",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    BOOKING_REMINDER: {
        channels: [
            {
                templateKey: "booking_reminder",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "booking_reminder",
                channel: "push",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "booking_reminder",
                channel: "in_app",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    CHAT_MESSAGE: {
        channels: [
            {
                templateKey: "chat_message",
                channel: "push",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "chat_message",
                channel: "in_app",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    PAYOUT_PAID: {
        channels: [
            {
                templateKey: "payout_paid",
                channel: "email",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "payout_paid",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "payout_paid",
                channel: "push",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "payout_paid",
                channel: "in_app",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    DISPATCH_EXHAUSTED: {
        channels: [
            {
                templateKey: "dispatch_exhausted",
                channel: "email",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
    PAYOUT_FAILED: {
        channels: [
            {
                templateKey: "payout_failed",
                channel: "email",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "payout_failed",
                channel: "sms",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "payout_failed",
                channel: "push",
                type: "transactional",
                priority: "standard",
                required: false,
            },
            {
                templateKey: "payout_failed",
                channel: "in_app",
                type: "transactional",
                priority: "standard",
                required: false,
            },
        ],
    },
};

export function isNotificationEvent(value: string): value is NotificationEvent {
    return (NOTIFICATION_EVENTS as readonly string[]).includes(value);
}
