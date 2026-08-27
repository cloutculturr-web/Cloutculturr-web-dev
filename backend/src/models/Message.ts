import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  projectId: mongoose.Types.ObjectId;
  
  sender: {
    userId: mongoose.Types.ObjectId;
    role: 'admin' | 'creator' | 'client';
    name: string;
  };
  
  content: string;
  attachments: string[];
  
  status: 'sent' | 'delivered' | 'read';
  readAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    
    sender: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        enum: {
          values: ['admin', 'creator', 'client'],
          message: 'Invalid role',
        },
        required: true,
      },
      name: {
        type: String,
        required: [true, 'Sender name is required'],
        trim: true,
      },
    },
    
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    
    attachments: {
      type: [String],
      default: [],
    },
    
    status: {
      type: String,
      enum: {
        values: ['sent', 'delivered', 'read'],
        message: 'Invalid status',
      },
      default: 'sent',
    },
    
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ projectId: 1, createdAt: -1 });
messageSchema.index({ 'sender.userId': 1 });
messageSchema.index({ status: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
