import mongoose, { Schema, Document } from 'mongoose';

export interface IMembership extends Document {
  clientId: mongoose.Types.ObjectId;
  
  tier: 'free' | 'premium';
  price: number;
  
  razorpay: {
    planId?: string;
    subscriptionId?: string;
  };
  
  startDate: Date;
  expiryDate?: Date;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'cancelled';
  
  features: {
    unlimitedCreatorAccess: boolean;
    unlimitedSearch: boolean;
    creatorComparison: boolean;
    advancedFilters: boolean;
    savedCreators: number;
    priorityBooking: boolean;
    prioritySupport: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      unique: true,
      index: true,
    },
    
    tier: {
      type: String,
      enum: {
        values: ['free', 'premium'],
        message: 'Invalid tier',
      },
      default: 'free',
      index: true,
    },
    
    price: {
      type: Number,
      default: 0,
    },
    
    razorpay: {
      planId: {
        type: String,
        default: null,
        select: false,
      },
      subscriptionId: {
        type: String,
        default: null,
        select: false,
      },
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
    
    status: {
      type: String,
      enum: {
        values: ['active', 'expired', 'cancelled'],
        message: 'Invalid status',
      },
      default: 'active',
      index: true,
    },
    
    features: {
      unlimitedCreatorAccess: {
        type: Boolean,
        default: false,
      },
      unlimitedSearch: {
        type: Boolean,
        default: false,
      },
      creatorComparison: {
        type: Boolean,
        default: false,
      },
      advancedFilters: {
        type: Boolean,
        default: false,
      },
      savedCreators: {
        type: Number,
        default: 0,
      },
      priorityBooking: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
membershipSchema.index({ clientId: 1 });
membershipSchema.index({ status: 1 });
membershipSchema.index({ expiryDate: 1 });
membershipSchema.index({ createdAt: -1 });

// Premium tier features helper
membershipSchema.methods.setupPremiumFeatures = function () {
  if (this.tier === 'premium') {
    this.features = {
      unlimitedCreatorAccess: true,
      unlimitedSearch: true,
      creatorComparison: true,
      advancedFilters: true,
      savedCreators: 999,
      priorityBooking: true,
      prioritySupport: true,
    };
  } else {
    this.features = {
      unlimitedCreatorAccess: false,
      unlimitedSearch: false,
      creatorComparison: false,
      advancedFilters: false,
      savedCreators: 10,
      priorityBooking: false,
      prioritySupport: false,
    };
  }
};

export default mongoose.model<IMembership>('Membership', membershipSchema);
