import App from "@/app.js";
import { _config } from "@/config/config.js";
import { db } from "@/config/db.js";
import { logger } from "@/utils/logger.js";

const start = async () => {
  try {
    // Connect to the database
    await db();

    const appInstance = new App();
    // Setup the middleware and routes
    await appInstance.setupMastra();

    const app = appInstance.getApp();
    const PORT = _config.PORT ?? 8080;

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    logger.info("server started");
  } catch (error) {
    logger.error(error, "Failed to start the server");
    process.exit(1);
  }
};

void start();