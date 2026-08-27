import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'admin' | 'creator' | 'client';
  status: 'active' | 'suspended' | 'inactive';
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
  
  // Methods
  comparePassword(password: string): Promise<boolean>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'creator', 'client'],
        message: 'Invalid role: must be admin, creator, or client',
      },
      default: 'client',
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'inactive'],
        message: 'Invalid status',
      },
      default: 'active',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationTokenExpiry: {
      type: Date,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Middleware: Hash password before saving
userSchema.pre('save', async function (this: IUser, next: any) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method: Compare password
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Method: Check if account is locked
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Method: Increment login attempts
userSchema.methods.incLoginAttempts = async function (): Promise<void> {
  const maxLoginAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = Number(process.env.LOCK_TIME) || 15 * 60 * 1000;

  // Reset attempts if lock time has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;

    // Lock account if max attempts exceeded
    if (this.loginAttempts >= maxLoginAttempts) {
      this.lockUntil = new Date(Date.now() + lockTime);
    }
  }

  await this.save();
};

// Method: Reset login attempts
userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// Method: Generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  const token = require('crypto').randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + (1000 * 60 * 60); // 1 hour

  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetTokenExpiry = new Date(tokenExpiry);

  return token;
};

// Method: Generate email verification token
userSchema.methods.generateEmailVerificationToken = function (): string {
  const token = require('crypto').randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + (1000 * 60 * 60 * 24); // 24 hours

  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationTokenExpiry = new Date(tokenExpiry);

  return token;
};

// Virtual: Full name
userSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model<IUser>('User', userSchema);
