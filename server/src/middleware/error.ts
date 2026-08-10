import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import mongoose from 'mongoose';

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;
  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined && { details: err.details }),
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

  if (err instanceof SyntaxError && 'body' in (err as { body?: unknown })) {
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  const statusCode = env.NODE_ENV === 'production' ? 500 : (err as { statusCode?: number })?.statusCode ?? 500;
  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error';
  res.status(statusCode).json({ success: false, message });
};