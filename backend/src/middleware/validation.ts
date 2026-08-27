import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { ValidationError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.type === 'field' ? (err as any).path : 'general',
      message: err.msg,
    }));

    logger.warn(`⚠️ Validation errors: ${JSON.stringify(errorMessages)}`);

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
    return;
  }

  next();
};

/**
 * Email validation
 */
export const validateEmail = () => {
  return body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .trim();
};

/**
 * Password validation (min 8 chars, uppercase, lowercase, number, symbol)
 */
export const validatePassword = () => {
  return body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[@#$%^&*]/)
    .withMessage('Password must contain at least one special character (@#$%^&*)');
};

/**
 * Phone number validation (Indian format)
 */
export const validatePhoneNumber = (fieldName: string = 'phoneNumber') => {
  return body(fieldName)
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number format')
    .optional({ checkFalsy: true });
};

/**
 * URL validation
 */
export const validateUrl = (fieldName: string = 'url') => {
  return body(fieldName)
    .isURL()
    .withMessage('Invalid URL format')
    .optional({ checkFalsy: true });
};

/**
 * Positive number validation
 */
export const validatePositiveNumber = (fieldName: string) => {
  return body(fieldName)
    .isNumeric()
    .withMessage(`${fieldName} must be a number`)
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error(`${fieldName} must be greater than 0`);
      }
      return true;
    });
};

/**
 * Date validation
 */
export const validateDate = (fieldName: string) => {
  return body(fieldName)
    .isISO8601()
    .withMessage(`${fieldName} must be a valid date`)
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error(`${fieldName} cannot be in the past`);
      }
      return true;
    });
};

/**
 * Required field validation
 */
export const validateRequired = (fieldName: string) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${fieldName} is required`);
};

/**
 * Min length validation
 */
export const validateMinLength = (fieldName: string, minLength: number) => {
  return body(fieldName)
    .isLength({ min: minLength })
    .withMessage(`${fieldName} must be at least ${minLength} characters`);
};

/**
 * Max length validation
 */
export const validateMaxLength = (fieldName: string, maxLength: number) => {
  return body(fieldName)
    .isLength({ max: maxLength })
    .withMessage(`${fieldName} cannot exceed ${maxLength} characters`);
};

/**
 * Enum validation
 */
export const validateEnum = (fieldName: string, allowedValues: string[]) => {
  return body(fieldName)
    .isIn(allowedValues)
    .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
};

/**
 * ID validation (MongoDB ObjectId format)
 */
export const validateObjectId = (fieldName: string) => {
  return param(fieldName)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${fieldName} format`);
};

/**
 * Pagination validation
 */
export const validatePagination = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ];
};

/**
 * Search validation
 */
export const validateSearch = () => {
  return query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters');
};

/**
 * Validation chains for common scenarios
 */
export const validateAuthRegister = () => {
  // Self-registration always creates a client account (see AuthController.register) —
  // role is not accepted from the client, so it must not be required here.
  return [
    validateRequired('firstName'),
    validateRequired('lastName'),
    validateEmail(),
    validatePassword(),
  ];
};

export const validateAuthLogin = () => {
  return [
    validateEmail(),
    validateRequired('password'),
  ];
};

export const validateProjectCreate = () => {
  return [
    validateRequired('title'),
    validateRequired('description'),
    validatePositiveNumber('budget'),
    validateDate('timeline'),
  ];
};

export const validateCreatorCreate = () => {
  return [
    validateRequired('companyName'),
    validateRequired('location'),
    validateRequired('bio'),
    body('experience')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Experience must be non-negative'),
  ];
};

export const validatePackageCreate = () => {
  return [
    validateRequired('name'),
    validateRequired('description'),
    validatePositiveNumber('price'),
    body('timeline')
      .isInt({ min: 1 })
      .withMessage('Timeline must be at least 1 day'),
  ];
};
