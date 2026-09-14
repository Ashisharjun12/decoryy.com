import { startNotificationWorkers } from "@/worker/start-workers.js";
import { logger } from "@/utils/logger.js";

void startNotificationWorkers().catch((error) => {
    logger.fatal(error, "worker failed to start");
    process.exit(1);
});
