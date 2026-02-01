// src/config/db.js
const { PrismaClient } = require("@prisma/client");
const { loadEnv } = require("./env");
const { logger } = require("./logger");

let prisma;

/**
 * In test environment we intentionally avoid creating a real PrismaClient
 * so unit tests that stub model functions never cause DB connection attempts.
 */
function getPrisma() {
  // If in test mode, return a simple placeholder object (no DB initialization).
  // Tests should stub model functions and not call through to prisma().
  if (process.env.NODE_ENV === "test") {
    if (!prisma) {
      prisma = {}; // placeholder — do not initialize PrismaClient in unit tests
    }
    return prisma;
  }

  // Normal behavior for dev/prod
  if (!prisma) {
    loadEnv(); // ensure DATABASE_URL is present
    prisma = new PrismaClient();
  }
  return prisma;
}

async function connectDb() {
  if (process.env.NODE_ENV === "test") {
    logger.info("Skipping DB connect in test environment");
    return;
  }
  const client = getPrisma();
  await client.$connect();
  logger.info("Database connected");
}

async function disconnectDb() {
  if (process.env.NODE_ENV === "test") {
    logger.info("Skipping DB disconnect in test environment");
    return;
  }
  if (prisma) {
    await prisma.$disconnect();
    logger.info("Database disconnected");
  }
}

module.exports = { getPrisma, connectDb, disconnectDb };
