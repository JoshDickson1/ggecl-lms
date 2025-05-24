import mongoose from "mongoose";
import { envConfig } from "./config/envValidator.js";
import app, { init } from "./server.js";
import { redis } from "./config/redisConfig.js";
import { initSuperAdmin } from "./controllers/admins/index.js";
import { NotificationService } from "./services/notificationService.js";
import cron from "node-cron";
import { ProgressService } from "./services/progressService.js";

const PORT = Number(envConfig.port) || 3000;

async function startServer(): Promise<void> {
  try {
    await init();
    await initSuperAdmin();

    // Set up the cron job for notification cleanup: runs every day at 2 AM
    cron.schedule("0 2 * * *", () => {
      console.log("Running daily notification cleanup...");
      NotificationService.cleanupAllOldNotifications().catch((error) => {
        console.error("Error during notification cleanup:", error);
      });
      ProgressService.addDailyProgressToAllStudents().catch((error) => {
        console.error("Error during daily progress update:", error);
      });
    });

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server started on http://localhost:${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("\nShutting down server...");
      await mongoose.disconnect();
      await redis.disconnect();
      server.close(() => {
        console.log("Server and database connections closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Unhandled error during server start:", error);
    process.exit(1);
  }
}

startServer();
