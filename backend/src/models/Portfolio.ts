import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  creatorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'photography' | 'reels' | 'posts' | 'design' | 'video' | 'campaign';
  
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  
  projectDetails: {
    clientName: string;
    challenge: string;
    solution: string;
    results: string;
  };
  
  views: number;
  likes: number;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Portfolio title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['photography', 'reels', 'posts', 'design', 'video', 'campaign'],
        message: 'Invalid category',
      },
      required: true,
      index: true,
    },
    
    media: {
      type: {
        type: String,
        enum: {
          values: ['image', 'video'],
          message: 'Media type must be image or video',
        },
        required: true,
      },
      url: {
        type: String,
        required: [true, 'Media URL is required'],
      },
      thumbnail: {
        type: String,
        default: null,
      },
    },
    
    projectDetails: {
      clientName: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
      },
      challenge: {
        type: String,
        required: [true, 'Challenge description is required'],
        trim: true,
      },
      solution: {
        type: String,
        required: [true, 'Solution description is required'],
        trim: true,
      },
      results: {
        type: String,
        required: [true, 'Results description is required'],
        trim: true,
      },
    },
    
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, 'Likes cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'pending_review', 'approved', 'rejected'],
        message: 'Invalid portfolio status',
      },
      default: 'pending_review',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
portfolioSchema.index({ creatorId: 1, category: 1 });
portfolioSchema.index({ category: 1 });
portfolioSchema.index({ views: -1 });
portfolioSchema.index({ createdAt: -1 });
portfolioSchema.index({ status: 1 });

export default mongoose.model<IPortfolio>('Portfolio', portfolioSchema);
