function notFoundHandler(req, _res, next) {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.error = "NotFoundError";
  next(error);
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const errorName = error.error || "InternalServerError";
  const message = error.message || "Unexpected server error";

  res.status(statusCode).json({
    error: errorName,
    message,
    statusCode
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
