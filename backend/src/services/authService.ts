import User, { IUser } from '@/models/User.js';
import Creator from '@/models/Creator.js';
import Client from '@/models/Client.js';
import Membership from '@/models/Membership.js';
import { generateTokenPair, verifyRefreshToken } from '@/config/jwt.js';
import { InvalidCredentialsError, ConflictError, ValidationError, NotFoundError, AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'creator';
  phoneNumber?: string;
  companyName?: string;
  industry?: string;
  location?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register new user
   */
  static async register(payload: RegisterPayload) {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      // Create user
      const user = new User({
        email: payload.email.toLowerCase(),
        password: payload.password,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        role: payload.role,
        emailVerified: false,
      });

      await user.save();
      logger.info(`✅ New user registered: ${user.email}`);

      // Create role-specific profiles
      if (payload.role === 'client') {
        const client = new Client({
          userId: user._id,
          companyName: payload.companyName || `${payload.firstName}'s Business`,
          industry: payload.industry || 'Other',
          location: payload.location || 'Not specified',
          membership: {
            status: 'free',
            tier: 'free',
            startDate: new Date(),
          },
        });
        await client.save();

        // Create default free membership
        const membership = new Membership({
          clientId: client._id,
          tier: 'free',
          price: 0,
          status: 'active',
        });
        // setupPremiumFeatures is optional on some model versions
        if (typeof (membership as any).setupPremiumFeatures === 'function') {
          (membership as any).setupPremiumFeatures();
        }
        await membership.save();

        logger.info(`✅ Client profile created for: ${user.email}`);
      }

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(payload: LoginPayload) {
    try {
      // Find user
      const user = await User.findOne({ email: payload.email.toLowerCase() }).select('+password');
      if (!user) {
        throw new InvalidCredentialsError();
      }

      // Check account lock
      if (user.isLocked()) {
        throw new InvalidCredentialsError();
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(payload.password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        throw new InvalidCredentialsError();
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`✅ User logged in: ${user.email}`);

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundError('User');
      }

      // Verify current password
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        throw new ValidationError('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`✅ Password changed for user: ${user.email}`);

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      logger.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Forgot password - generate reset token
   */
  static async forgotPassword(email: string) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal if user exists for security
        logger.warn(`Password reset requested for non-existent email: ${email}`);
        return {
          message: 'If email exists, password reset link will be sent',
        };
      }

      const resetToken = user.generatePasswordResetToken();
      await user.save();

      logger.info(`✅ Password reset token generated for: ${user.email}`);

      // TODO: Send email with reset token
      return {
        message: 'Password reset link sent to email',
        // For development only
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(resetToken: string, newPassword: string) {
    try {
      // Hash the token to match stored token
      const hashedToken = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: { $gt: new Date() },
      }).select('+password');

      if (!user) {
        throw new ValidationError('Password reset token is invalid or expired');
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpiry = undefined;
      await user.save();

      logger.info(`✅ Password reset for user: ${user.email}`);

      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(email: string) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new NotFoundError('User');
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpiry = undefined;
      await user.save();

      logger.info(`✅ Email verified for user: ${user.email}`);

      return {
        message: 'Email verified successfully',
      };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        throw new ValidationError('Invalid refresh token');
      }

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      logger.info(`✅ Tokens refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }
}

export default AuthService;
