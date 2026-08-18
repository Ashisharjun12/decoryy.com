import { Queue } from "bullmq";
import { getQueueConnection, QUEUE_NAMES } from "@/infrastructure/queue/queues.js";

let queues: Record<string, Queue> | null = null;

export function getQueues() {
    if (queues) return queues;

    const connection = getQueueConnection();
    queues = {
        sms: new Queue(QUEUE_NAMES.sms, { connection }),
        assignmentReminder: new Queue(QUEUE_NAMES.assignmentReminder, { connection }),
        paymentsWebhookRetry: new Queue(QUEUE_NAMES.paymentsWebhookRetry, { connection }),
        ledgerPostOnComplete: new Queue(QUEUE_NAMES.ledgerPostOnComplete, { connection }),
    };
    return queues;
}
