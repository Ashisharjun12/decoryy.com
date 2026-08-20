import { Redis } from "ioredis";
import { Worker } from "bullmq";
import { _config } from "@/config/config.js";
import DbFactory from "@/infrastructure/database/db.factory.js";
import { QUEUE_NAMES } from "@/infrastructure/queue/queues.js";
import { processSmsJob } from "@/modules/notifications/sms/sms.job.js";
import { processOptimizeJob } from "@/modules/upload/media/optimize.job.js";
import { logger } from "@/utils/logger.js";

async function start(): Promise<void> {
    await DbFactory.connectRedis();

    const redisUrl = _config.REDIS_URL;
    if (!redisUrl) {
        throw new Error("REDIS_URL is missing from environment");
    }

    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

    const smsWorker = new Worker(QUEUE_NAMES.sms, processSmsJob, {
        connection,
        concurrency: 5,
    });

    const optimizeWorker = new Worker(QUEUE_NAMES.imageOptimize, processOptimizeJob, {
        connection,
        concurrency: 2,
    });

    smsWorker.on("failed", (job, err) => {
        logger.error({ jobId: job?.id, err }, "sms job failed");
    });

    optimizeWorker.on("failed", (job, err) => {
        logger.error({ jobId: job?.id, err }, "image optimize job failed");
    });

    logger.info(
        { queues: [QUEUE_NAMES.sms, QUEUE_NAMES.imageOptimize], concurrency: 5 },
        "Decory worker started",
    );
}

void start().catch((error) => {
    logger.fatal(error, "worker failed to start");
    process.exit(1);
});
