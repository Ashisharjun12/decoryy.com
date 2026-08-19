import type { Job } from "bullmq";
import { SmsFactory } from "@/infrastructure/sms/sms.factory.js";
import type { SmsMessage } from "@/infrastructure/sms/sms.interface.js";

export async function processSmsJob(job: Job<SmsMessage>): Promise<void> {
    await SmsFactory.getProvider().send(job.data);
}
