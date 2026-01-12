const ApiError = require("../utils/ApiError");

function notFound(_req, _res, next) {
  next(new ApiError(404, "Route not found", "NOT_FOUND"));
}

module.exports = notFound;
