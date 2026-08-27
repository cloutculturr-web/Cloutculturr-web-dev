export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication Errors
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password', 401);
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super('Token has expired', 401);
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

// Authorization Errors
export class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

// Validation Errors
export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 400);
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Not Found Error
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// Conflict Error
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// Payment Errors
export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing failed') {
    super(message, 402);
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

// Rate Limit Error
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// Server Error
export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export const errorMessages = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  
  // User
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  USER_SUSPENDED: 'Your account has been suspended',
  USER_INACTIVE: 'Your account is inactive',
  
  // Creator
  CREATOR_NOT_FOUND: 'Creator not found',
  CREATOR_NOT_VERIFIED: 'Creator is not verified',
  CREATOR_SUSPENDED: 'Creator account is suspended',
  
  // Client
  CLIENT_NOT_FOUND: 'Client not found',
  
  // Project
  PROJECT_NOT_FOUND: 'Project not found',
  PROJECT_NOT_ACTIVE: 'Project is not in active state',
  
  // Payment
  PAYMENT_FAILED: 'Payment processing failed',
  PAYMENT_NOT_FOUND: 'Payment not found',
  INVALID_PAYMENT_AMOUNT: 'Invalid payment amount',
  
  // Membership
  MEMBERSHIP_EXPIRED: 'Membership has expired',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  
  // General
  INTERNAL_SERVER_ERROR: 'Internal server error',
  RESOURCE_NOT_FOUND: 'Resource not found',
  INVALID_REQUEST: 'Invalid request',
  VALIDATION_FAILED: 'Validation failed',
};
