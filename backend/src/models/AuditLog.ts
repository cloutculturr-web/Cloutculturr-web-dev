import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'SUSPEND',
        'ACTIVATE',
        'VERIFY',
        'REJECT',
        'APPROVE',
        'EXPORT',
        'LOGIN',
        'LOGOUT',
        'SETTINGS_CHANGE',
        'BULK_OPERATION',
        'REQUEST_CHANGES',
        'TIER_CHANGE',
        'PRICING_APPROVE',
        'PRICING_REJECT',
        'VIEW',
      ],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: ['client', 'creator', 'project', 'membership', 'payment', 'booking', 'cms', 'user', 'admin', 'creator_application', 'creator_tier', 'portfolio', 'package', 'availability'],
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      index: true,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

// TTL Index - Keep audit logs for 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
