import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

interface ErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors?: any[];
  stack?: string;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] | undefined;

  // Handle AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    logger.error(`❌ AppError: ${message}`, { statusCode, path: req.path });
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = [(error as any).details];
    logger.error(`❌ ValidationError: ${message}`, { details: errors });
  }
  // Handle MongoDB cast errors
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    logger.error(`❌ CastError: ${message}`);
  }
  // Handle MongoDB duplicate key errors
  else if ((error as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((error as any).keyPattern)[0];
    message = `${field} already exists`;
    logger.error(`❌ DuplicateKeyError: ${message}`, { field });
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    logger.error(`❌ JWTError: ${message}`);
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    logger.error(`❌ TokenExpiredError: ${message}`);
  }
  // Handle generic errors
  else {
    statusCode = 500;
    message = error.message || 'Internal server error';
    logger.error(`❌ UnhandledError: ${message}`, { error: error.stack });
  }

  const response: ErrorResponse = {
    success: false,
    message,
    statusCode,
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.warn(`⚠️ 404 Not Found: ${req.method} ${req.path}`);

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    statusCode: 404,
  });
};

/**
 * Async error wrapper
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Catch-all error handler (must be last middleware)
 */
export const catchAllErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`🔴 Uncaught error: ${error.message}`, { stack: error.stack });

  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
};
