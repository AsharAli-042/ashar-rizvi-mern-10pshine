const ApiError = require("../utils/ApiError");
const userModel = require("../models/user.model");
const { logger } = require("../config/logger");

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getMe(userId) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  const user = await userModel.findUserSafeById(userId);
  if (!user) throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  return user;
}

async function updateMe(userId, patch) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

  const data = {};
  if (patch.name !== undefined) {
    if (!patch.name || typeof patch.name !== "string") throw new ApiError(400, "Invalid name", "VALIDATION_ERROR");
    data.name = patch.name;
  }
  if (patch.email !== undefined) {
    if (!isValidEmail(patch.email)) throw new ApiError(400, "Invalid email", "VALIDATION_ERROR");
    data.email = patch.email;
  }

  try {
    await userModel.updateUserById(userId, data);
  } catch (e) {
    throw e;
  }

  logger.info({ userId }, "User profile updated");
  return getMe(userId);
}

module.exports = { getMe, updateMe };
