import DbFactory from "@/infrastructure/database/db.factory.js";

export function getQueueConnection() {
    return DbFactory.getRedisDatabase().getClient();
}

export const QUEUE_NAMES = {
    sms: "sms",
    assignmentReminder: "assignment.reminder",
    paymentsWebhookRetry: "payments.webhook-retry",
    ledgerPostOnComplete: "ledger.post-on-complete",
    imageOptimize: "image.optimize",
} as const;
