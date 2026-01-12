const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const { loadEnv } = require("../config/env");

const env = loadEnv();

function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token", "INVALID_TOKEN"));
  }
}

module.exports = authMiddleware;
