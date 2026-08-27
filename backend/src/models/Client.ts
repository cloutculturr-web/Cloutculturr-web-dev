import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  industry: string;
  location: string;
  websiteUrl?: string;
  description?: string;
  membership: {
    status: 'free' | 'premium';
    tier: string;
    startDate: Date;
    expiryDate?: Date;
    autoRenew: boolean;
    razorpaySubscriptionId?: string;
  };
  /** Element ids are User._id (the creator's linked User doc), not Creator._id. */
  savedCreators: mongoose.Types.ObjectId[];
  /** Element ids are User._id (the creator's linked User doc), not Creator._id. */
  viewedCreators: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
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
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    websiteUrl: {
      type: String,
      default: null,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Invalid website URL',
      ],
    },
    description: {
      type: String,
      default: null,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    membership: {
      status: {
        type: String,
        enum: {
          values: ['free', 'premium'],
          message: 'Invalid membership status',
        },
        default: 'free',
      },
      tier: {
        type: String,
        enum: {
          values: ['free', 'premium'],
          message: 'Invalid tier',
        },
        default: 'free',
      },
      startDate: {
        type: Date,
        default: () => new Date(),
      },
      expiryDate: {
        type: Date,
        default: null,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      razorpaySubscriptionId: {
        type: String,
        default: null,
        select: false,
      },
    },
    savedCreators: {
      // Stores the creator's User._id (matches what clientService actually writes/
      // populates) — was incorrectly declared ref:'Creator' before this fix.
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    viewedCreators: {
      // Stores the creator's User._id (matches what clientService actually writes/
      // populates) — was incorrectly declared ref:'Creator' before this fix.
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
clientSchema.index({ userId: 1 });
clientSchema.index({ 'membership.status': 1 });
clientSchema.index({ 'membership.expiryDate': 1 });
clientSchema.index({ industry: 1 });
clientSchema.index({ createdAt: -1 });

export default mongoose.model<IClient>('Client', clientSchema);
