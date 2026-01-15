const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ApiError = require("../utils/ApiError");
const userModel = require("../models/user.model");
const { loadEnv } = require("../config/env");
const { logger } = require("../config/logger");

const env = loadEnv();

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN, subject: userId });
}

async function register({ name, email, password }) {
  if (!name || typeof name !== "string") throw new ApiError(400, "Name is required", "VALIDATION_ERROR");
  if (!isValidEmail(email)) throw new ApiError(400, "Invalid email", "VALIDATION_ERROR");
  if (!password || password.length < 6) throw new ApiError(400, "Password must be at least 6 characters", "VALIDATION_ERROR");

  const existing = await userModel.findUserByEmail(email);
  if (existing) throw new ApiError(409, "Email already in use", "EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({ name, email, passwordHash });

  logger.info({ userId: user.id }, "User registered");

  const token = signToken(user.id);
  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt },
    token,
  };
}

async function login({ email, password }) {
  if (!isValidEmail(email)) throw new ApiError(400, "Invalid email", "VALIDATION_ERROR");
  if (!password) throw new ApiError(400, "Password is required", "VALIDATION_ERROR");

  const user = await userModel.findUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials", "INVALID_CREDENTIALS");

  logger.info({ userId: user.id }, "User logged in");

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt },
    token: signToken(user.id),
  };
}

async function logout({ userId }) {
  logger.info({ userId }, "User logged out");
  return { success: true };
}

function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

async function forgotPassword({ email }) {
  if (!isValidEmail(email)) throw new ApiError(400, "Invalid email", "VALIDATION_ERROR");

  const user = await userModel.findUserByEmail(email);

  if (!user) {
    logger.info({ email }, "Forgot password requested for non-existing email");
    return { message: "If the email exists, a reset token has been issued." };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = hashResetToken(rawToken);
  const expires = new Date(Date.now() + env.RESET_TOKEN_EXPIRES_MIN * 60 * 1000);

  await userModel.updateUserById(user.id, { resetTokenHash, resetTokenExpiresAt: expires });

  logger.info({ userId: user.id }, "Password reset token generated");

  return {
    message: "Reset token generated (dev mode). Use it to reset password.",
    resetToken: rawToken,
    expiresAt: expires.toISOString(),
  };
}

async function resetPassword({ token, newPassword }) {
  if (!token || typeof token !== "string") throw new ApiError(400, "Token is required", "VALIDATION_ERROR");
  if (!newPassword || newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters", "VALIDATION_ERROR");

  const resetTokenHash = hashResetToken(token);
  const user = await userModel.findUserByResetTokenHash(resetTokenHash);

  if (!user) throw new ApiError(400, "Invalid or expired reset token", "INVALID_RESET_TOKEN");

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await userModel.updateUserById(user.id, {
    passwordHash,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
  });

  logger.info({ userId: user.id }, "Password reset successful");

  return { message: "Password has been reset successfully" };
}

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
