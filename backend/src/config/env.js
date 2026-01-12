const dotenv = require("dotenv");

let cached;

function requireVar(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

function loadEnv() {
  if (cached) return cached;

  dotenv.config();

  const NODE_ENV = process.env.NODE_ENV || "development";

  const config = {
    NODE_ENV,
    PORT: Number(process.env.PORT || 5000),
    DATABASE_URL: requireVar("DATABASE_URL"),
    JWT_SECRET: requireVar("JWT_SECRET"),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    RESET_TOKEN_EXPIRES_MIN: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 15),
  };

  cached = Object.freeze(config);
  return cached;
}

module.exports = { loadEnv };
