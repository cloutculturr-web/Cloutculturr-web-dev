import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  projectCode: string;
  /** Human-facing sequential code, e.g. "CC-REQ-2026-0001". Optional on legacy docs. */
  displayCode?: string;
  clientId: mongoose.Types.ObjectId;
  creatorId?: mongoose.Types.ObjectId;
  type: 'agency' | 'marketplace';
  title: string;
  description: string;
  budget: number;
  status: 'enquiry' | 'requirements' | 'review' | 'quoted' | 'approved' | 'active' | 'completed' | 'archived';
  timeline: Date;
  deliverables: string[];
  
  enquiry: {
    submittedAt: Date;
    requirements: string;
  };
  
  quotation: {
    generatedAt?: Date;
    amount?: number;
    breakdown?: Record<string, any>;
    validUntil?: Date;
    status: 'pending' | 'approved' | 'rejected';
  };
  
  execution: {
    startDate?: Date;
    endDate?: Date;
    progress: number;
    milestones: any[];
  };
  
  payment: {
    status: 'pending' | 'partial' | 'completed';
    razorpayOrderId?: string;
    paidAmount: number;
    totalAmount: number;
  };
  
  review: {
    clientFeedback?: string;
    rating?: number;
    completedAt?: Date;
  };
  
  revenue: {
    total: number;
    agencyShare: number;
    creatorShare: number;
    commission: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    projectCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayCode: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: ['agency', 'marketplace'],
        message: 'Type must be agency or marketplace',
      },
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['enquiry', 'requirements', 'review', 'quoted', 'approved', 'active', 'completed', 'archived'],
        message: 'Invalid project status',
      },
      default: 'enquiry',
      index: true,
    },
    timeline: {
      type: Date,
      required: [true, 'Timeline is required'],
    },
    deliverables: {
      type: [String],
      default: [],
    },
    
    enquiry: {
      submittedAt: {
        type: Date,
        default: () => new Date(),
      },
      requirements: {
        type: String,
        default: '',
      },
    },
    
    quotation: {
      generatedAt: {
        type: Date,
        default: null,
      },
      amount: {
        type: Number,
        default: 0,
      },
      breakdown: {
        type: Schema.Types.Mixed,
        default: {},
      },
      validUntil: {
        type: Date,
        default: null,
      },
      status: {
        type: String,
        enum: {
          values: ['pending', 'approved', 'rejected'],
          message: 'Invalid quotation status',
        },
        default: 'pending',
      },
    },
    
    execution: {
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      progress: {
        type: Number,
        default: 0,
        min: [0, 'Progress cannot be less than 0'],
        max: [100, 'Progress cannot exceed 100'],
      },
      milestones: {
        type: [Schema.Types.Mixed],
        default: [],
      },
    },
    
    payment: {
      status: {
        type: String,
        enum: {
          values: ['pending', 'partial', 'completed'],
          message: 'Invalid payment status',
        },
        default: 'pending',
      },
      razorpayOrderId: {
        type: String,
        default: null,
        select: false,
      },
      paidAmount: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
      },
    },
    
    review: {
      clientFeedback: {
        type: String,
        default: null,
      },
      rating: {
        type: Number,
        default: null,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      completedAt: {
        type: Date,
        default: null,
      },
    },
    
    revenue: {
      total: {
        type: Number,
        default: 0,
      },
      agencyShare: {
        type: Number,
        default: 0,
      },
      creatorShare: {
        type: Number,
        default: 0,
      },
      commission: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
projectSchema.index({ clientId: 1, createdAt: -1 });
projectSchema.index({ creatorId: 1, createdAt: -1 });
projectSchema.index({ status: 1 });
projectSchema.index({ type: 1 });
projectSchema.index({ 'payment.status': 1 });

export default mongoose.model<IProject>('Project', projectSchema);
