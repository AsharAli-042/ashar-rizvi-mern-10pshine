const ApiError = require("../utils/ApiError");
const userModel = require("../models/user.model");
const { logger } = require("../config/logger");
const bcrypt = require("bcrypt");

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

/* change password from profile */
async function changePassword(userId, currentPassword, newPassword) {
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  if (!currentPassword || typeof currentPassword !== "string") {
    throw new ApiError(400, "Current password is required", "VALIDATION_ERROR");
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters", "VALIDATION_ERROR");
  }

  // Fetch user including passwordHash
  const user = await userModel.findUserByIdWithHash(userId);
  if (!user) throw new ApiError(404, "User not found", "USER_NOT_FOUND");

  // Verify current password
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, "Invalid current password", "INVALID_CREDENTIALS");
  }

  // Hash new password and update
  const newHash = await bcrypt.hash(newPassword, 10);
  await userModel.updateUserById(userId, {
    passwordHash: newHash,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
  });

  logger.info({ userId }, "User changed password via profile");

  return { message: "Password changed successfully" };
}

module.exports = { getMe, updateMe, changePassword };
