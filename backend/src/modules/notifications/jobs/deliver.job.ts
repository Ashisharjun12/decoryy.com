import type { Job } from "bullmq";
import { EmailFactory } from "@/infrastructure/email/email.factory.js";
import { PushFactory } from "@/infrastructure/push/push.factory.js";
import { ExpoPushProvider } from "@/infrastructure/push/expo.provider.js";
import { SmsFactory } from "@/infrastructure/sms/sms.factory.js";
import { isChannelEnabled } from "@/modules/ops/index.js";
import { pushDeviceService } from "../container.js";
import { notificationRepository } from "../container.js";
import { logger } from "@/utils/logger.js";

export type DeliverJobData = {
    notificationId: string;
    to?: string;
    subject?: string | null;
    body?: string;
    event?: string;
    channel?: string;
    userId?: string | null;
    eventData?: Record<string, string>;
};

async function finish(
    data: DeliverJobData,
    status: "SENT" | "FAILED" | "SKIPPED",
    provider: string,
    error?: string,
) {
    if (data.notificationId) {
        await notificationRepository.markNotification(data.notificationId, status, error ?? null);
        await notificationRepository.insertDelivery({
            notificationId: data.notificationId,
            provider,
            attempt: 1,
            error: error ?? null,
            status,
        });
    }
}

export async function processSmsDeliverJob(job: Job<DeliverJobData>): Promise<void> {
    if (!(await isChannelEnabled("sms"))) {
        await finish(job.data, "SKIPPED", "sms", "sms notifications disabled");
        return;
    }
    const to = job.data.to;
    const body = job.data.body;
    if (!to || !body) {
        await finish(job.data, "FAILED", "sms", "missing to/body");
        return;
    }
    await SmsFactory.getProvider().send({ to, body });
    await finish(job.data, "SENT", "sms");
}

export async function processEmailDeliverJob(job: Job<DeliverJobData>): Promise<void> {
    if (!(await isChannelEnabled("email"))) {
        await finish(job.data, "SKIPPED", "smtp", "email notifications disabled");
        return;
    }
    const to = job.data.to;
    const body = job.data.body;
    if (!to || !body) {
        await finish(job.data, "FAILED", "smtp", "missing to/body");
        return;
    }
    await EmailFactory.getProvider().send({
        to,
        subject: job.data.subject || "Decoryy",
        html: body,
        text: body.replace(/<[^>]+>/g, ""),
    });
    await finish(job.data, "SENT", "smtp");
}

export async function processPushDeliverJob(job: Job<DeliverJobData>): Promise<void> {
    if (!(await isChannelEnabled("push"))) {
        await finish(job.data, "SKIPPED", "expo", "push notifications disabled");
        return;
    }

    const userId = job.data.userId;
    const title = job.data.subject || "Decoryy";
    const body = job.data.body ?? "";
    if (!userId || !body) {
        await finish(job.data, "SKIPPED", "expo", "userId/body required for push");
        return;
    }

    const tokens = await pushDeviceService.listTokensForUser(userId);
    if (tokens.length === 0) {
        await finish(job.data, "SKIPPED", "expo", "no push devices registered");
        return;
    }

    const provider = PushFactory.getProvider() as ExpoPushProvider;
    const pushData = job.data.eventData ?? {};
    let sent = 0;

    for (const token of tokens) {
        try {
            const result = await provider.sendOne({
                to: token,
                title,
                body,
                data: pushData,
            });
            if (result.ok) {
                sent += 1;
                continue;
            }
            if (result.staleToken) {
                await pushDeviceService.removeStaleToken(token);
            }
            logger.warn({ token, error: result.error }, "expo push token failed");
        } catch (err) {
            logger.warn({ err, token }, "expo push send failed");
        }
    }

    if (sent > 0) {
        await finish(job.data, "SENT", "expo");
        return;
    }

    await finish(job.data, "FAILED", "expo", "all push tokens failed");
}

export async function processInAppDeliverJob(job: Job<DeliverJobData>): Promise<void> {
    const userId = job.data.userId;
    const body = job.data.body ?? "";
    if (!userId) {
        await finish(job.data, "SKIPPED", "inbox", "userId required for in-app");
        return;
    }
    await notificationRepository.insertInbox({
        userId,
        title: job.data.subject || "Decoryy",
        body,
        data: {
            event: job.data.event,
            notificationId: job.data.notificationId,
            ...(job.data.eventData ?? {}),
        },
    });
    await finish(job.data, "SENT", "inbox");
}
