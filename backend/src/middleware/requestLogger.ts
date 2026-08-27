import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger.js';

/**
 * Log incoming requests and responses
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  // Log request
  const logData = {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...(req.user && { userId: req.user.userId, role: req.user.role }),
  };

  logger.info(`→ ${req.method} ${req.path}`, logData);

  // Intercept response end
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log response
    const responseLog = {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      method: req.method,
      path: req.path,
    };

    if (statusCode >= 400) {
      logger.warn(`← ${req.method} ${req.path} [${statusCode}]`, responseLog);
    } else {
      logger.info(`← ${req.method} ${req.path} [${statusCode}]`, responseLog);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Log security-related events
 */
export const securityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log failed authentication attempts
  const authHeader = req.headers.authorization;
  if (req.path.includes('/auth') && req.method === 'POST') {
    logger.debug(`🔒 Auth attempt: ${req.path} from ${req.ip}`);
  }

  next();
};

/**
 * Log database operations (to be used in controllers)
 */
export const logDatabaseOperation = (
  operation: string,
  model: string,
  result: any,
  error?: any
): void => {
  if (error) {
    logger.error(`❌ DB ${operation} ${model}: ${error.message}`);
  } else {
    logger.debug(`✅ DB ${operation} ${model}`);
  }
};

/**
 * Log payment operations
 */
export const logPaymentOperation = (
  operation: string,
  data: any,
  result?: any,
  error?: any
): void => {
  const logData = {
    operation,
    amount: data.amount,
    currency: data.currency,
    orderId: data.razorpayOrderId,
  };

  if (error) {
    logger.error(`❌ Payment ${operation} failed: ${error.message}`, logData);
  } else {
    logger.info(`✅ Payment ${operation}`, { ...logData, result });
  }
};

/**
 * Log admin actions
 */
export const logAdminAction = (
  action: string,
  targetId: string,
  targetType: string,
  adminId: string,
  details?: any
): void => {
  const logData = {
    action,
    targetId,
    targetType,
    adminId,
    ...details,
  };

  logger.info(`👤 Admin action: ${action} on ${targetType}`, logData);
};
