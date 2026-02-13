const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { loadEnv } = require("./config/env");
const { httpLogger } = require("./config/logger");

const authRoutes = require("./routes/auth.routes");
const notesRoutes = require("./routes/notes.routes");
const usersRoutes = require("./routes/users.routes");

const notFound = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const env = loadEnv();

function createApp() {
  const app = express();

  app.use(httpLogger());
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/notes", notesRoutes);
  app.use("/api/v1/users", usersRoutes);

  app.use(notFound);
  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
