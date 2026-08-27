import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  projectId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  creatorId?: mongoose.Types.ObjectId;
  
  razorpay: {
    orderId: string;
    paymentId?: string;
    signatureId?: string;
  };
  
  amount: number;
  currency: string;
  status: 'initiated' | 'pending' | 'successful' | 'failed' | 'refunded';
  paymentMethod?: string;
  
  breakdown: {
    subtotal: number;
    commission: number;
    creatorShare: number;
    tax: number;
  };
  
  paidAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
      default: null,
      index: true,
    },
    
    razorpay: {
      orderId: {
        type: String,
        required: true,
        unique: true,
        select: false,
      },
      paymentId: {
        type: String,
        default: null,
        select: false,
      },
      signatureId: {
        type: String,
        default: null,
        select: false,
      },
    },
    
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    
    currency: {
      type: String,
      default: 'INR',
      enum: {
        values: ['INR', 'USD', 'EUR'],
        message: 'Invalid currency',
      },
    },
    
    status: {
      type: String,
      enum: {
        values: ['initiated', 'pending', 'successful', 'failed', 'refunded'],
        message: 'Invalid payment status',
      },
      default: 'initiated',
      index: true,
    },
    
    paymentMethod: {
      type: String,
      default: 'razorpay',
    },
    
    breakdown: {
      subtotal: {
        type: Number,
        default: 0,
      },
      commission: {
        type: Number,
        default: 0,
      },
      creatorShare: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
    },
    
    paidAt: {
      type: Date,
      default: null,
    },
    
    refundedAt: {
      type: Date,
      default: null,
    },
    
    refundReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ clientId: 1, createdAt: -1 });
paymentSchema.index({ creatorId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
