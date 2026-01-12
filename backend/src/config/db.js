const { PrismaClient } = require("@prisma/client");
const { loadEnv } = require("./env");
const { logger } = require("./logger");

let prisma;

function getPrisma() {
  if (!prisma) {
    loadEnv(); // ensures DATABASE_URL is present
    prisma = new PrismaClient();
  }
  return prisma;
}

async function connectDb() {
  const client = getPrisma();
  await client.$connect();
  logger.info("Database connected");
}

async function disconnectDb() {
  if (prisma) {
    await prisma.$disconnect();
    logger.info("Database disconnected");
  }
}

module.exports = { getPrisma, connectDb, disconnectDb };
