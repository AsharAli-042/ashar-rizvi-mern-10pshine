const { logger } = require("../config/logger");
const ApiError = require("../utils/ApiError");

function errorMiddleware(err, req, res, _next) {
  // Prisma unique constraint -> 409
  if (err && err.code === "P2002") {
    const apiErr = new ApiError(409, "Resource already exists", "CONFLICT", {
      target: err.meta?.target,
    });
    logger.warn({ err: apiErr, path: req.path }, "Prisma conflict");
    return res.status(apiErr.statusCode).json({
      success: false,
      error: { message: apiErr.message, code: apiErr.code, details: apiErr.details },
    });
  }

  const apiErr =
    err instanceof ApiError
      ? err
      : new ApiError(500, "Internal server error", "INTERNAL_ERROR");

  if (!(err instanceof ApiError)) {
    logger.error({ err, path: req.path }, "Unhandled error");
  } else {
    logger.warn({ err: apiErr, path: req.path }, "Handled error");
  }

  return res.status(apiErr.statusCode).json({
    success: false,
    error: { message: apiErr.message, code: apiErr.code, details: apiErr.details },
  });
}

module.exports = errorMiddleware;
