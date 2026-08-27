import mongoose, { Schema, Document } from 'mongoose';

export interface ICreator extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  bio: string;
  profilePhoto?: string;
  banner?: string;
  location: string;
  experience: number;
  languages: string[];
  skills: string[];
  website?: string;
  socialMedia: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    badge: boolean;
    verifiedAt?: Date;
  };
  performance: {
    totalProjects: number;
    completedProjects: number;
    averageRating: number;
    totalRevenue: number;
    monthlyRevenue: number;
  };
  portfolio: mongoose.Types.ObjectId[];
  packages: mongoose.Types.ObjectId[];
  tierId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  pricing: {
    proposedAmount: number | null;
    approvedAmount: number | null;
    currency: string;
    status: 'pending' | 'approved' | 'rejected';
    recommendedRange: {
      min: number | null;
      max: number | null;
    };
  };
  pricingHistory: {
    previousAmount: number | null;
    newAmount: number;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    reason: string;
  }[];
  suspendedAt?: Date;
  suspensionReason?: string;
  availability: 'available' | 'busy' | 'unavailable';
  createdAt: Date;
  updatedAt: Date;
}

const creatorSchema = new Schema<ICreator>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative'],
    },
    languages: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      default: null,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Invalid website URL',
      ],
    },
    socialMedia: {
      instagram: {
        type: String,
        default: null,
      },
      linkedin: {
        type: String,
        default: null,
      },
      twitter: {
        type: String,
        default: null,
      },
    },
    verification: {
      status: {
        type: String,
        enum: {
          values: ['pending', 'verified', 'rejected'],
          message: 'Invalid verification status',
        },
        default: 'pending',
      },
      badge: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
    },
    performance: {
      totalProjects: {
        type: Number,
        default: 0,
      },
      completedProjects: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      monthlyRevenue: {
        type: Number,
        default: 0,
      },
    },
    portfolio: {
      type: [Schema.Types.ObjectId],
      ref: 'Portfolio',
      default: [],
    },
    packages: {
      type: [Schema.Types.ObjectId],
      ref: 'Package',
      default: [],
    },
    tierId: {
      type: Schema.Types.ObjectId,
      ref: 'CreatorTier',
      default: null,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'CreatorApplication',
      default: null,
    },
    pricing: {
      proposedAmount: { type: Number, default: null, min: 0 },
      approvedAmount: { type: Number, default: null, min: 0 },
      currency: { type: String, default: 'INR' },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      recommendedRange: {
        min: { type: Number, default: null, min: 0 },
        max: { type: Number, default: null, min: 0 },
      },
    },
    pricingHistory: {
      type: [
        {
          previousAmount: { type: Number, default: null },
          newAmount: { type: Number, required: true },
          changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          changedAt: { type: Date, default: Date.now },
          reason: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
creatorSchema.index({ userId: 1 });
creatorSchema.index({ location: 1 });
creatorSchema.index({ 'verification.status': 1 });
creatorSchema.index({ 'verification.badge': 1 });
creatorSchema.index({ 'performance.averageRating': -1 });
creatorSchema.index({ createdAt: -1 });

export default mongoose.model<ICreator>('Creator', creatorSchema);
