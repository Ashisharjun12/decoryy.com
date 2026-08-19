import { getQueues } from "@/infrastructure/queue/bull.connection.js";
import type { SmsMessage } from "@/infrastructure/sms/sms.interface.js";

export interface ISmsService {
    enqueue(message: SmsMessage): Promise<void>;
}

export class SmsService implements ISmsService {
    async enqueue(message: SmsMessage): Promise<void> {
        await getQueues().sms.add("send", message, {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: true,
        });
    }
}
