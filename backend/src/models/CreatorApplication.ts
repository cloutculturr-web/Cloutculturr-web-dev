import mongoose, { Schema, Document } from 'mongoose';

export interface ICreatorApplication extends Document {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyName: string;
  bio: string;
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
  portfolioLinks: string[];
  proposedPricing?: number;
  pricingNotes?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  changesRequestedNotes?: string;
  creatorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const creatorApplicationSchema = new Schema<ICreatorApplication>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      index: true,
    },
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    phoneNumber: { type: String, trim: true },
    companyName: { type: String, required: [true, 'Company/brand name is required'], trim: true },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    experience: { type: Number, default: 0, min: [0, 'Experience cannot be negative'] },
    languages: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    website: { type: String, default: null },
    socialMedia: {
      instagram: { type: String, default: null },
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
    },
    portfolioLinks: { type: [String], default: [] },
    proposedPricing: { type: Number, min: [0, 'Pricing cannot be negative'], default: null },
    pricingNotes: { type: String, trim: true, default: null },
    status: {
      type: String,
      enum: {
        values: ['pending', 'under_review', 'approved', 'rejected', 'changes_requested'],
        message: 'Invalid application status',
      },
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: null },
    changesRequestedNotes: { type: String, trim: true, default: null },
    creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', default: null },
  },
  { timestamps: true }
);

creatorApplicationSchema.index({ status: 1, createdAt: -1 });
creatorApplicationSchema.index({ email: 1 });

export default mongoose.model<ICreatorApplication>('CreatorApplication', creatorApplicationSchema);
