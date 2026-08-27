import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  creatorId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  status: 'active' | 'disabled';
  
  deliverables: {
    reels: number;
    posts: number;
    stories: number;
    photography: boolean;
    editing: boolean;
    contentStrategy: boolean;
    monthlySupport: boolean;
    revisions: number;
  };
  
  timeline: number;
  additionalServices: string[];
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Package description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'disabled'],
        message: 'Status must be active or disabled',
      },
      default: 'active',
      index: true,
    },
    
    deliverables: {
      reels: {
        type: Number,
        default: 0,
        min: [0, 'Reels count cannot be negative'],
      },
      posts: {
        type: Number,
        default: 0,
        min: [0, 'Posts count cannot be negative'],
      },
      stories: {
        type: Number,
        default: 0,
        min: [0, 'Stories count cannot be negative'],
      },
      photography: {
        type: Boolean,
        default: false,
      },
      editing: {
        type: Boolean,
        default: false,
      },
      contentStrategy: {
        type: Boolean,
        default: false,
      },
      monthlySupport: {
        type: Boolean,
        default: false,
      },
      revisions: {
        type: Number,
        default: 0,
        min: [0, 'Revisions count cannot be negative'],
      },
    },
    
    timeline: {
      type: Number,
      required: [true, 'Timeline (in days) is required'],
      min: [1, 'Timeline must be at least 1 day'],
    },
    
    additionalServices: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
packageSchema.index({ creatorId: 1, status: 1 });
packageSchema.index({ price: 1 });
packageSchema.index({ createdAt: -1 });

export default mongoose.model<IPackage>('Package', packageSchema);
