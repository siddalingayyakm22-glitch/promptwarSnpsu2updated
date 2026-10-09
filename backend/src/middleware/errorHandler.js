/**
 * Centralized Error Handling Middleware
 * Provides safe, structured error responses without leaking internal stack traces.
 */

function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || (err.name === 'ZodError' ? 400 : 500);
  const errorCode = err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'));

  const safeMessage = err.message || 'An unexpected error occurred while processing your request.';

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code: errorCode,
      message: safeMessage
    }
  });
}

module.exports = errorHandler;
