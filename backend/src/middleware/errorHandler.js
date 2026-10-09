function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);

  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    data: null,
    error: err.message || 'Internal server error occurred',
    ...(isDev ? { stack: err.stack } : {})
  });
}

module.exports = errorHandler;
