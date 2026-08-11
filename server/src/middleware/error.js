import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import mongoose from 'mongoose';
class ApiError extends Error {
  statusCode;
  details;
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
const notFound = (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};
const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== void 0 && { details: err.details }),
    });
    return;
  }
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: 'Invalid resource identifier' });
    return;
  }
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    return;
  }
  logger.error({ err }, 'Unhandled error');
  const statusCode = env.NODE_ENV === 'production' ? 500 : (err?.statusCode ?? 500);
  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error';
  res.status(statusCode).json({ success: false, message });
};
export { ApiError, errorHandler, notFound };
