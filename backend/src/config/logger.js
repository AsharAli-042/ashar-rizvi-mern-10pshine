const pino = require("pino");
const pinoHttp = require("pino-http");
const { loadEnv } = require("./env");

const env = loadEnv();

const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.newPassword",
      "req.body.token",
    ],
    remove: true,
  },
});

function httpLogger() {
  return pinoHttp({
    logger,
    customLogLevel: (res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  });
}

module.exports = { logger, httpLogger };
