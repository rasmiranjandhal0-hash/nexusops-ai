export default function errorHandler(err, req, res, next) {
  // Never log request body or sensitive payload contents
  const status = err.status || 500;
  const message = err.message || 'An internal server error occurred during privacy evaluation.';

  return res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
}

