import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'account' | 'project' | 'booking' | 'meeting' | 'membership' | 'announcement' | 'payment' | 'system' | 'creator_approval';
  
  title: string;
  message: string;
  actionUrl?: string;
  
  status: 'unread' | 'read';
  readAt?: Date;
  
  metadata: {
    projectId?: mongoose.Types.ObjectId;
    creatorId?: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    type: {
      type: String,
      enum: {
        values: ['account', 'project', 'booking', 'meeting', 'membership', 'announcement', 'payment', 'system', 'creator_approval'],
        message: 'Invalid notification type',
      },
      required: true,
      index: true,
    },
    
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    
    actionUrl: {
      type: String,
      default: null,
    },
    
    status: {
      type: String,
      enum: {
        values: ['unread', 'read'],
        message: 'Invalid status',
      },
      default: 'unread',
      index: true,
    },
    
    readAt: {
      type: Date,
      default: null,
    },
    
    metadata: {
      projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        default: null,
      },
      creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'Creator',
        default: null,
      },
      paymentId: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete old read notifications after 30 days
notificationSchema.index(
  { readAt: 1 },
  {
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { status: 'read' },
  }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
