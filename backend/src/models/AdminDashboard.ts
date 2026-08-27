import mongoose, { Schema, Document } from 'mongoose';

/**
 * Admin Dashboard - Enterprise-grade admin panel for platform management
 * Tracks all KPIs, analytics, CMS, security, notifications, and operational metrics
 */

// ============================================
// CORE ANALYTICS & KPI INTERFACES
// ============================================

// Dashboard KPI Snapshot
export interface DashboardKPISnapshot extends Document {
  timestamp: Date;
  period: 'day' | 'week' | 'month' | 'year' | 'custom';
  dateRange: { start: Date; end: Date };

  // Revenue Metrics
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  annualRevenue: number;
  marketplaceRevenue: number;
  agencyRevenue: number;
  platformCommission: number;
  monthlyMembershipRevenue: number;

  // Client Metrics
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  premiumMembers: number;
  freeMembers: number;

  // Creator Metrics
  totalCreators: number;
  activeCreators: number;
  verifiedCreators: number;
  pendingCreatorApprovals: number;

  // Project Metrics
  activeProjects: number;
  completedProjects: number;
  ongoingProjects: number;

  // Booking & Call Metrics
  pendingRequests: number;
  bookingRequests: number;
  strategyCallsScheduled: number;

  // Traffic & Engagement Metrics
  websiteVisitors: number;
  conversionRate: number;
  averageClientRating: number;
  averageCreatorRating: number;

  // Growth Trends
  revenueGrowth: number;
  clientGrowth: number;
  creatorGrowth: number;
  projectGrowth: number;
}

// Revenue Analytics
export interface RevenueAnalytics extends Document {
  date: Date;
  totalRevenue: number;
  marketplaceRevenue: number;
  agencyRevenue: number;
  membershipRevenue: number;
  commission: number;
  transactions: number;
  averageTransactionValue: number;
}

// User Analytics
export interface UserAnalytics extends Document {
  date: Date;
  newClients: number;
  newCreators: number;
  activeUsers: number;
  returningUsers: number;
  newUsers: number;
  churnRate: number;
  engagementRate: number;
}

// Project Analytics
export interface ProjectAnalytics extends Document {
  date: Date;
  newProjects: number;
  completedProjects: number;
  activeProjects: number;
  averageProjectValue: number;
  completionRate: number;
  averageTimeline: number; // in days
}

// Platform Activity Log
export interface ActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'admin' | 'client' | 'creator';
  action: string;
  entity: string; // e.g., 'project', 'client', 'creator'
  entityId: mongoose.Types.ObjectId;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Admin Audit Log
export interface AuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId: mongoose.Types.ObjectId;
  changes: Record<string, { old: any; new: any }>;
  reason?: string;
  timestamp: Date;
  ipAddress: string;
}

// ============================================
// CMS & CONTENT MANAGEMENT
// ============================================

export interface CMSContent extends Document {
  title: string;
  section: 'Homepage' | 'About' | 'Services' | 'Testimonials' | 'Portfolio' | 'Blog' | 'Legal' | 'Announcements';
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: mongoose.Types.ObjectId;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
  };
}

// ============================================
// NOTIFICATIONS & ANNOUNCEMENTS
// ============================================

export interface Notification extends Document {
  title: string;
  message: string;
  type: 'announcement' | 'maintenance' | 'alert' | 'update' | 'emergency';
  target: 'all' | 'creators' | 'clients' | 'admins' | 'members';
  status: 'draft' | 'scheduled' | 'sent' | 'archived';
  scheduledFor?: Date;
  sentAt?: Date;
  recipientCount: number;
  readCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SECURITY & LOGIN MANAGEMENT
// ============================================

export interface LoginSession extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  loginTime: Date;
  lastActivity: Date;
  status: 'active' | 'expired' | 'revoked';
  sessionToken: string;
  expiresAt: Date;
}

export interface FailedLoginAttempt extends Document {
  email: string;
  ipAddress: string;
  reason: string;
  timestamp: Date;
  userAgent: string;
}

export interface BlockedUser extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  username: string;
  reason: string;
  blockedAt: Date;
  blockedBy: mongoose.Types.ObjectId;
  unblockAt?: Date;
  failedAttempts: number;
  status: 'blocked' | 'unblocked' | 'permanent_ban';
}

// ============================================
// SYSTEM SETTINGS & CONFIGURATION
// ============================================

export interface SystemSettings extends Document {
  platformName: string;
  platformTagline: string;
  maintenanceMode: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  creatorApprovalRequired: boolean;
  automaticPayoutEnabled: boolean;
  payoutFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  minimumPayout: number;
  commissionRate: number;
  platformFee: number;
  supportEmail: string;
  smtpConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  paymentProvider: 'stripe' | 'paypal' | 'square';
  stripeKeys: {
    publishable: string;
    secret: string;
  };
  paymentGatewayWebhookUrl: string;
  termsOfService: string;
  privacyPolicy: string;
  termsUpdatedAt: Date;
  privacyUpdatedAt: Date;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  backupRetention: number; // in days
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId;
}

export interface BackupRecord extends Document {
  timestamp: Date;
  size: number; // in MB
  type: 'full' | 'incremental';
  status: 'completed' | 'failed' | 'in_progress';
  duration: number; // in seconds
  location: string;
  checksum: string;
  retentionUntil: Date;
}

// ============================================
// REPORTS & ANALYTICS EXPORT
// ============================================

export interface ReportHistory extends Document {
  reportType: 'revenue' | 'creators' | 'clients' | 'marketplace' | 'membership' | 'projects' | 'traffic' | 'growth' | 'booking' | 'commission';
  format: 'csv' | 'excel' | 'pdf';
  generatedBy: mongoose.Types.ObjectId;
  dateRange: { start: Date; end: Date };
  recordCount: number;
  fileSize: number;
  status: 'completed' | 'failed' | 'pending';
  downloadUrl: string;
  createdAt: Date;
  expiresAt: Date;
}

// ============================================
// MARKETPLACE & FEATURED LISTINGS
// ============================================

export interface MarketplaceFeature extends Document {
  creatorId: mongoose.Types.ObjectId;
  status: 'featured' | 'trending' | 'verified' | 'standard';
  featuredAt: Date;
  expiresAt?: Date;
  position: number;
  impressions: number;
  clicks: number;
  conversionRate: number;
  category: string;
  visibility: 'public' | 'private' | 'hidden';
}

// ============================================
// PLATFORM STATISTICS
// ============================================

export interface PlatformStatistics extends Document {
  date: Date;
  totalUsers: number;
  totalCreators: number;
  totalClients: number;
  activeUsers: number;
  newSignups: number;
  totalProjects: number;
  totalRevenue: number;
  averageUserEngagement: number;
  platformHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

// ============================================
// MONGOOSE SCHEMAS
// ============================================

const DashboardKPISnapshotSchema = new Schema<DashboardKPISnapshot>({
  timestamp: { type: Date, default: Date.now, index: true },
  period: { type: String, enum: ['day', 'week', 'month', 'year', 'custom'], required: true },
  dateRange: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },

  // Revenue
  totalRevenue: { type: Number, default: 0 },
  todayRevenue: { type: Number, default: 0 },
  monthlyRevenue: { type: Number, default: 0 },
  annualRevenue: { type: Number, default: 0 },
  marketplaceRevenue: { type: Number, default: 0 },
  agencyRevenue: { type: Number, default: 0 },
  platformCommission: { type: Number, default: 0 },
  monthlyMembershipRevenue: { type: Number, default: 0 },

  // Clients
  totalClients: { type: Number, default: 0 },
  activeClients: { type: Number, default: 0 },
  newClientsThisMonth: { type: Number, default: 0 },
  premiumMembers: { type: Number, default: 0 },
  freeMembers: { type: Number, default: 0 },

  // Creators
  totalCreators: { type: Number, default: 0 },
  activeCreators: { type: Number, default: 0 },
  verifiedCreators: { type: Number, default: 0 },
  pendingCreatorApprovals: { type: Number, default: 0 },

  // Projects
  activeProjects: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  ongoingProjects: { type: Number, default: 0 },

  // Bookings
  pendingRequests: { type: Number, default: 0 },
  bookingRequests: { type: Number, default: 0 },
  strategyCallsScheduled: { type: Number, default: 0 },

  // Traffic
  websiteVisitors: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  averageClientRating: { type: Number, default: 0 },
  averageCreatorRating: { type: Number, default: 0 },

  // Growth
  revenueGrowth: { type: Number, default: 0 },
  clientGrowth: { type: Number, default: 0 },
  creatorGrowth: { type: Number, default: 0 },
  projectGrowth: { type: Number, default: 0 }
});

const RevenueAnalyticsSchema = new Schema<RevenueAnalytics>({
  date: { type: Date, required: true, index: true },
  totalRevenue: { type: Number, required: true },
  marketplaceRevenue: { type: Number, required: true },
  agencyRevenue: { type: Number, required: true },
  membershipRevenue: { type: Number, required: true },
  commission: { type: Number, required: true },
  transactions: { type: Number, required: true },
  averageTransactionValue: { type: Number, required: true }
});

const UserAnalyticsSchema = new Schema<UserAnalytics>({
  date: { type: Date, required: true, index: true },
  newClients: { type: Number, default: 0 },
  newCreators: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  returningUsers: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  churnRate: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 }
});

const ProjectAnalyticsSchema = new Schema<ProjectAnalytics>({
  date: { type: Date, required: true, index: true },
  newProjects: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  activeProjects: { type: Number, default: 0 },
  averageProjectValue: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  averageTimeline: { type: Number, default: 0 }
});

const ActivityLogSchema = new Schema<ActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userType: { type: String, enum: ['admin', 'client', 'creator'], required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  changes: { type: Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

const AuditLogSchema = new Schema<AuditLog>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: Schema.Types.ObjectId, required: true },
  changes: { type: Schema.Types.Mixed, required: true },
  reason: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  ipAddress: { type: String, required: true }
});

const CMSContentSchema = new Schema<CMSContent>({
  title: { type: String, required: true, index: true },
  section: { type: String, enum: ['Homepage', 'About', 'Services', 'Testimonials', 'Portfolio', 'Blog', 'Legal', 'Announcements'], required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  metadata: {
    seoTitle: { type: String },
    seoDescription: { type: String },
    keywords: [{ type: String }]
  }
});

const NotificationSchema = new Schema<Notification>({
  title: { type: String, required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'maintenance', 'alert', 'update', 'emergency'], required: true },
  target: { type: String, enum: ['all', 'creators', 'clients', 'admins', 'members'], required: true },
  status: { type: String, enum: ['draft', 'scheduled', 'sent', 'archived'], default: 'draft' },
  scheduledFor: { type: Date },
  sentAt: { type: Date },
  recipientCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

const LoginSessionSchema = new Schema<LoginSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  email: { type: String, required: true },
  ipAddress: { type: String, required: true, index: true },
  device: { type: String },
  browser: { type: String },
  location: { type: String },
  loginTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' },
  sessionToken: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: true }
});

const FailedLoginAttemptSchema = new Schema<FailedLoginAttempt>({
  email: { type: String, required: true, index: true },
  ipAddress: { type: String, required: true, index: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  userAgent: { type: String }
});

const BlockedUserSchema = new Schema<BlockedUser>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  email: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true },
  reason: { type: String, required: true },
  blockedAt: { type: Date, default: Date.now },
  blockedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  unblockAt: { type: Date },
  failedAttempts: { type: Number, default: 0 },
  status: { type: String, enum: ['blocked', 'unblocked', 'permanent_ban'], default: 'blocked' }
});

const SystemSettingsSchema = new Schema<SystemSettings>({
  platformName: { type: String, default: 'CloutCulturee' },
  platformTagline: { type: String },
  maintenanceMode: { type: Boolean, default: false },
  requireEmailVerification: { type: Boolean, default: true },
  requirePhoneVerification: { type: Boolean, default: false },
  creatorApprovalRequired: { type: Boolean, default: true },
  automaticPayoutEnabled: { type: Boolean, default: true },
  payoutFrequency: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly'], default: 'weekly' },
  minimumPayout: { type: Number, default: 100 },
  commissionRate: { type: Number, default: 15 },
  platformFee: { type: Number, default: 5 },
  supportEmail: { type: String, required: true },
  smtpConfig: {
    host: { type: String },
    port: { type: Number },
    username: { type: String },
    password: { type: String }
  },
  paymentProvider: { type: String, enum: ['stripe', 'paypal', 'square'], default: 'stripe' },
  stripeKeys: {
    publishable: { type: String },
    secret: { type: String }
  },
  paymentGatewayWebhookUrl: { type: String },
  termsOfService: { type: String },
  privacyPolicy: { type: String },
  termsUpdatedAt: { type: Date },
  privacyUpdatedAt: { type: Date },
  backupFrequency: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly'], default: 'daily' },
  backupRetention: { type: Number, default: 30 },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

const BackupRecordSchema = new Schema<BackupRecord>({
  timestamp: { type: Date, default: Date.now, index: true },
  size: { type: Number, required: true },
  type: { type: String, enum: ['full', 'incremental'], required: true },
  status: { type: String, enum: ['completed', 'failed', 'in_progress'], required: true },
  duration: { type: Number, required: true },
  location: { type: String, required: true },
  checksum: { type: String, required: true },
  retentionUntil: { type: Date, required: true, index: true }
});

const ReportHistorySchema = new Schema<ReportHistory>({
  reportType: { type: String, enum: ['revenue', 'creators', 'clients', 'marketplace', 'membership', 'projects', 'traffic', 'growth', 'booking', 'commission'], required: true },
  format: { type: String, enum: ['csv', 'excel', 'pdf'], required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dateRange: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  recordCount: { type: Number, default: 0 },
  fileSize: { type: Number, default: 0 },
  status: { type: String, enum: ['completed', 'failed', 'pending'], default: 'pending' },
  downloadUrl: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date, required: true, index: true }
});

const MarketplaceFeatureSchema = new Schema<MarketplaceFeature>({
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  status: { type: String, enum: ['featured', 'trending', 'verified', 'standard'], default: 'standard' },
  featuredAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  position: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  category: { type: String },
  visibility: { type: String, enum: ['public', 'private', 'hidden'], default: 'public' }
});

const PlatformStatisticsSchema = new Schema<PlatformStatistics>({
  date: { type: Date, default: Date.now, index: true },
  totalUsers: { type: Number, default: 0 },
  totalCreators: { type: Number, default: 0 },
  totalClients: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  newSignups: { type: Number, default: 0 },
  totalProjects: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  averageUserEngagement: { type: Number, default: 0 },
  platformHealth: {
    uptime: { type: Number, default: 99.9 },
    responseTime: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 }
  }
});

// ============================================
// CREATE INDEXES
// ============================================

DashboardKPISnapshotSchema.index({ timestamp: -1 });
RevenueAnalyticsSchema.index({ date: -1 });
UserAnalyticsSchema.index({ date: -1 });
ProjectAnalyticsSchema.index({ date: -1 });
AuditLogSchema.index({ adminId: 1, timestamp: -1 });
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
CMSContentSchema.index({ section: 1, status: 1 });
NotificationSchema.index({ type: 1, status: 1, createdAt: -1 });
LoginSessionSchema.index({ userId: 1, createdAt: -1 });
FailedLoginAttemptSchema.index({ email: 1, timestamp: -1 });
BlockedUserSchema.index({ email: 1, status: 1 });
ReportHistorySchema.index({ reportType: 1, createdAt: -1 });
PlatformStatisticsSchema.index({ date: -1 });

// ============================================
// EXPORT MODELS (with duplicate prevention for hot reload)
// ============================================

export const DashboardKPISnapshot = mongoose.models.DashboardKPISnapshot || mongoose.model<DashboardKPISnapshot>('DashboardKPISnapshot', DashboardKPISnapshotSchema);
export const RevenueAnalytics = mongoose.models.RevenueAnalytics || mongoose.model<RevenueAnalytics>('RevenueAnalytics', RevenueAnalyticsSchema);
export const UserAnalytics = mongoose.models.UserAnalytics || mongoose.model<UserAnalytics>('UserAnalytics', UserAnalyticsSchema);
export const ProjectAnalytics = mongoose.models.ProjectAnalytics || mongoose.model<ProjectAnalytics>('ProjectAnalytics', ProjectAnalyticsSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<ActivityLog>('ActivityLog', ActivityLogSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model<AuditLog>('AuditLog', AuditLogSchema);
export const CMSContent = mongoose.models.CMSContent || mongoose.model<CMSContent>('CMSContent', CMSContentSchema);
export const Notification = mongoose.models.Notification || mongoose.model<Notification>('Notification', NotificationSchema);
export const LoginSession = mongoose.models.LoginSession || mongoose.model<LoginSession>('LoginSession', LoginSessionSchema);
export const FailedLoginAttempt = mongoose.models.FailedLoginAttempt || mongoose.model<FailedLoginAttempt>('FailedLoginAttempt', FailedLoginAttemptSchema);
export const BlockedUser = mongoose.models.BlockedUser || mongoose.model<BlockedUser>('BlockedUser', BlockedUserSchema);
export const SystemSettings = mongoose.models.SystemSettings || mongoose.model<SystemSettings>('SystemSettings', SystemSettingsSchema);
export const BackupRecord = mongoose.models.BackupRecord || mongoose.model<BackupRecord>('BackupRecord', BackupRecordSchema);
export const ReportHistory = mongoose.models.ReportHistory || mongoose.model<ReportHistory>('ReportHistory', ReportHistorySchema);
export const MarketplaceFeature = mongoose.models.MarketplaceFeature || mongoose.model<MarketplaceFeature>('MarketplaceFeature', MarketplaceFeatureSchema);
export const PlatformStatistics = mongoose.models.PlatformStatistics || mongoose.model<PlatformStatistics>('PlatformStatistics', PlatformStatisticsSchema);
