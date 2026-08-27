import { Router } from 'express';
import AuthController from '@/controllers/authController.js';
import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  handleValidationErrors,
  validateAuthRegister,
  validateAuthLogin,
} from '@/middleware/validation.js';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

/**
 * Auth Routes
 */

// Public Routes
router.post('/register', validateAuthRegister(), handleValidationErrors, AuthController.register);
router.post('/login', validateAuthLogin(), handleValidationErrors, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', validateEmail(), handleValidationErrors, AuthController.forgotPassword);
router.post('/reset-password', validatePassword(), handleValidationErrors, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);

// Protected Routes
router.post('/logout', authenticate, AuthController.logout);
router.post(
  '/change-password',
  authenticate,
  validatePassword(),
  handleValidationErrors,
  AuthController.changePassword
);
router.post('/2fa-setup', authenticate, AuthController.setup2FA);
router.post('/2fa-verify', authenticate, AuthController.verify2FA);

export default router;
