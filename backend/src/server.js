const createApp = require("./app");
const { loadEnv } = require("./config/env");
const { logger } = require("./config/logger");
const { connectDb, disconnectDb } = require("./config/db");

const env = loadEnv();
const app = createApp();

async function start() {
  await connectDb();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Server started");
  });

  const shutdown = async () => {
    logger.info("Shutting down...");
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});

start().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
