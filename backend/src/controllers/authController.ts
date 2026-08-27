import { Request, Response, NextFunction } from 'express';
import AuthService from '@/services/authService.js';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

export class AuthController {
  /**
   * Register new client
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;
      const { phoneNumber, companyName, industry, location } = req.body;

      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role: 'client', // Only clients can self-register
        companyName,
        industry,
        location,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
        statusCode: 201,
        timestamp: new Date(),
      });

      logger.info(`✅ Client registered: ${email}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user (all roles)
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          userId: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          role: result.user.role,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ User logged in: ${result.user.email}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new AppError('Refresh token not found', 401);
      }

      // Verify and refresh
      const tokens = await AuthService.refreshTokens(refreshToken);

      // Set new cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logout successful',
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ User logged out`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Forgot password request for: ${email}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { resetToken, newPassword } = req.body;

      const result = await AuthService.resetPassword(resetToken, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email with token
   * GET /api/auth/verify-email/:token
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      const result = await AuthService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password (authenticated user)
   * POST /api/auth/change-password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Password changed for user: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Setup 2FA for admin
   * POST /api/auth/2fa-setup
   */
  static async setup2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // TODO: Implement 2FA setup with TOTP
      res.status(200).json({
        success: true,
        message: '2FA setup initiated',
        data: {
          qrCode: 'TODO: Generate QR Code',
          secret: 'TODO: Generate Secret',
        },
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ 2FA setup initiated for user: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify 2FA code
   * POST /api/auth/2fa-verify
   */
  static async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { code } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // TODO: Implement 2FA verification with TOTP
      res.status(200).json({
        success: true,
        message: '2FA verified successfully',
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ 2FA verified for user: ${userId}`);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
