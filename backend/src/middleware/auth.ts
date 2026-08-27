import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, TokenPayload } from '@/config/jwt.js';
import { AuthenticationError, TokenExpiredError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      token?: string;
    }
  }
}

/**
 * Authenticate user and attach user info to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);
    req.token = token;

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      logger.debug(`✅ User authenticated: ${decoded.email} (${decoded.role})`);
      next();
    } catch (error: any) {
      // Check if token is expired
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      }
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    if (error instanceof AuthenticationError || error instanceof TokenExpiredError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  }
};

/**
 * Refresh expired access token using refresh token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshTokenHeader = req.headers['x-refresh-token'] as string;

    if (!refreshTokenHeader) {
      throw new AuthenticationError('Refresh token not provided');
    }

    try {
      const decoded = verifyRefreshToken(refreshTokenHeader);
      
      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      req.user = decoded;
      res.set('X-Access-Token', newAccessToken);
      
      logger.debug(`✅ Token refreshed for user: ${decoded.email}`);
      next();
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  } catch (error) {
    logger.error('Token refresh error:', error);
    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
      });
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    req.token = token;

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // Silently ignore auth errors for optional auth
      logger.debug('Optional auth: Token validation skipped');
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next();
  }
};
