# Admin Dashboard Database Schema

## Overview
Complete MongoDB database schema for the CloutCulturee Admin Dashboard. Includes 15 collections supporting KPI tracking, analytics, CMS, security, notifications, reports, and system configuration.

## Collections

### 1. DashboardKPISnapshot
**Purpose:** Store real-time KPI snapshots for dashboard display and trending
**Indexes:** timestamp, period, dateRange

```typescript
{
  _id: ObjectId,
  timestamp: Date,
  period: 'day' | 'week' | 'month' | 'year' | 'custom',
  dateRange: { start: Date, end: Date },
  
  // Revenue Metrics
  totalRevenue: Number,
  todayRevenue: Number,
  monthlyRevenue: Number,
  annualRevenue: Number,
  marketplaceRevenue: Number,
  agencyRevenue: Number,
  platformCommission: Number,
  monthlyMembershipRevenue: Number,
  
  // Client Metrics
  totalClients: Number,
  activeClients: Number,
  newClientsThisMonth: Number,
  premiumMembers: Number,
  freeMembers: Number,
  
  // Creator Metrics
  totalCreators: Number,
  activeCreators: Number,
  verifiedCreators: Number,
  pendingCreatorApprovals: Number,
  
  // Project Metrics
  activeProjects: Number,
  completedProjects: Number,
  ongoingProjects: Number,
  
  // Booking Metrics
  pendingRequests: Number,
  bookingRequests: Number,
  strategyCallsScheduled: Number,
  
  // Traffic & Engagement
  websiteVisitors: Number,
  conversionRate: Number,
  averageClientRating: Number,
  averageCreatorRating: Number,
  
  // Growth Trends
  revenueGrowth: Number,
  clientGrowth: Number,
  creatorGrowth: Number,
  projectGrowth: Number
}
```

### 2. RevenueAnalytics
**Purpose:** Daily revenue tracking and analytics
**Indexes:** date

```typescript
{
  _id: ObjectId,
  date: Date,
  totalRevenue: Number,
  marketplaceRevenue: Number,
  agencyRevenue: Number,
  membershipRevenue: Number,
  commission: Number,
  transactions: Number,
  averageTransactionValue: Number
}
```

### 3. UserAnalytics
**Purpose:** Daily user metrics and engagement tracking
**Indexes:** date

```typescript
{
  _id: ObjectId,
  date: Date,
  newClients: Number,
  newCreators: Number,
  activeUsers: Number,
  returningUsers: Number,
  newUsers: Number,
  churnRate: Number,
  engagementRate: Number
}
```

### 4. ProjectAnalytics
**Purpose:** Daily project performance tracking
**Indexes:** date

```typescript
{
  _id: ObjectId,
  date: Date,
  newProjects: Number,
  completedProjects: Number,
  activeProjects: Number,
  averageProjectValue: Number,
  completionRate: Number,
  averageTimeline: Number
}
```

### 5. ActivityLog
**Purpose:** Comprehensive user activity audit trail
**Indexes:** userId, timestamp

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  userType: 'admin' | 'client' | 'creator',
  action: String,
  entity: String,
  entityId: ObjectId,
  changes: Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

### 6. AuditLog
**Purpose:** Admin actions and system changes audit
**Indexes:** adminId, timestamp

```typescript
{
  _id: ObjectId,
  adminId: ObjectId (ref: User),
  action: String,
  resource: String,
  resourceId: ObjectId,
  changes: {
    [key]: { old: any, new: any }
  },
  reason: String,
  timestamp: Date,
  ipAddress: String
}
```

### 7. CMSContent
**Purpose:** Website content management (no-code CMS)
**Indexes:** title, section, status

```typescript
{
  _id: ObjectId,
  title: String,
  section: 'Homepage' | 'About' | 'Services' | 'Testimonials' | 'Portfolio' | 'Blog' | 'Legal' | 'Announcements',
  content: String,
  status: 'draft' | 'published' | 'archived',
  author: ObjectId (ref: User),
  views: Number,
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date,
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String]
  }
}
```

### 8. Notification
**Purpose:** Platform-wide announcements and alerts
**Indexes:** type, status, createdAt

```typescript
{
  _id: ObjectId,
  title: String,
  message: String,
  type: 'announcement' | 'maintenance' | 'alert' | 'update' | 'emergency',
  target: 'all' | 'creators' | 'clients' | 'admins' | 'members',
  status: 'draft' | 'scheduled' | 'sent' | 'archived',
  scheduledFor: Date,
  sentAt: Date,
  recipientCount: Number,
  readCount: Number,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 9. LoginSession
**Purpose:** Active user login sessions and device tracking
**Indexes:** userId, ipAddress, expiresAt

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  email: String,
  ipAddress: String,
  device: String,
  browser: String,
  location: String,
  loginTime: Date,
  lastActivity: Date,
  status: 'active' | 'expired' | 'revoked',
  sessionToken: String (unique),
  expiresAt: Date
}
```

### 10. FailedLoginAttempt
**Purpose:** Track failed login attempts for security
**Indexes:** email, ipAddress, timestamp

```typescript
{
  _id: ObjectId,
  email: String,
  ipAddress: String,
  reason: String,
  timestamp: Date,
  userAgent: String
}
```

### 11. BlockedUser
**Purpose:** Manage blocked and banned accounts
**Indexes:** email, status

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  email: String (unique),
  username: String,
  reason: String,
  blockedAt: Date,
  blockedBy: ObjectId (ref: User),
  unblockAt: Date,
  failedAttempts: Number,
  status: 'blocked' | 'unblocked' | 'permanent_ban'
}
```

### 12. SystemSettings
**Purpose:** Global platform configuration and settings
**Single document collection**

```typescript
{
  _id: ObjectId,
  platformName: String,
  platformTagline: String,
  maintenanceMode: Boolean,
  requireEmailVerification: Boolean,
  requirePhoneVerification: Boolean,
  creatorApprovalRequired: Boolean,
  automaticPayoutEnabled: Boolean,
  payoutFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly',
  minimumPayout: Number,
  commissionRate: Number,
  platformFee: Number,
  supportEmail: String,
  smtpConfig: {
    host: String,
    port: Number,
    username: String,
    password: String
  },
  paymentProvider: 'stripe' | 'paypal' | 'square',
  stripeKeys: {
    publishable: String,
    secret: String
  },
  paymentGatewayWebhookUrl: String,
  termsOfService: String,
  privacyPolicy: String,
  termsUpdatedAt: Date,
  privacyUpdatedAt: Date,
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly',
  backupRetention: Number,
  updatedAt: Date,
  updatedBy: ObjectId (ref: User)
}
```

### 13. BackupRecord
**Purpose:** Database backup tracking and management
**Indexes:** timestamp, retentionUntil

```typescript
{
  _id: ObjectId,
  timestamp: Date,
  size: Number, // MB
  type: 'full' | 'incremental',
  status: 'completed' | 'failed' | 'in_progress',
  duration: Number, // seconds
  location: String,
  checksum: String,
  retentionUntil: Date
}
```

### 14. ReportHistory
**Purpose:** Generated report tracking and archival
**Indexes:** reportType, createdAt

```typescript
{
  _id: ObjectId,
  reportType: 'revenue' | 'creators' | 'clients' | 'marketplace' | 'membership' | 'projects' | 'traffic' | 'growth' | 'booking' | 'commission',
  format: 'csv' | 'excel' | 'pdf',
  generatedBy: ObjectId (ref: User),
  dateRange: { start: Date, end: Date },
  recordCount: Number,
  fileSize: Number,
  status: 'completed' | 'failed' | 'pending',
  downloadUrl: String,
  createdAt: Date,
  expiresAt: Date
}
```

### 15. MarketplaceFeature
**Purpose:** Creator marketplace feature tracking
**Indexes:** creatorId (unique)

```typescript
{
  _id: ObjectId,
  creatorId: ObjectId (ref: User, unique),
  status: 'featured' | 'trending' | 'verified' | 'standard',
  featuredAt: Date,
  expiresAt: Date,
  position: Number,
  impressions: Number,
  clicks: Number,
  conversionRate: Number,
  category: String,
  visibility: 'public' | 'private' | 'hidden'
}
```

### 16. PlatformStatistics
**Purpose:** Daily platform health and statistics
**Indexes:** date

```typescript
{
  _id: ObjectId,
  date: Date,
  totalUsers: Number,
  totalCreators: Number,
  totalClients: Number,
  activeUsers: Number,
  newSignups: Number,
  totalProjects: Number,
  totalRevenue: Number,
  averageUserEngagement: Number,
  platformHealth: {
    uptime: Number,
    responseTime: Number,
    errorRate: Number
  }
}
```

## Database Indexes Summary

| Collection | Indexes |
|-----------|---------|
| DashboardKPISnapshot | timestamp, period |
| RevenueAnalytics | date |
| UserAnalytics | date |
| ProjectAnalytics | date |
| ActivityLog | userId, timestamp |
| AuditLog | adminId, timestamp |
| CMSContent | section, status |
| Notification | type, status, createdAt |
| LoginSession | userId, expiresAt |
| FailedLoginAttempt | email, ipAddress, timestamp |
| BlockedUser | email, status |
| SystemSettings | (singleton) |
| BackupRecord | timestamp, retentionUntil |
| ReportHistory | reportType, createdAt |
| MarketplaceFeature | creatorId (unique) |
| PlatformStatistics | date |

## Data Retention & Cleanup Policies

1. **ActivityLog:** Keep for 90 days, archive after
2. **AuditLog:** Keep for 365 days (compliance)
3. **FailedLoginAttempt:** Keep for 30 days
4. **LoginSession:** Auto-expire based on expiresAt
5. **BackupRecord:** Respect backupRetention setting
6. **ReportHistory:** Auto-delete after expiresAt

## Performance Optimization

- All frequently-queried fields have indexes
- Compound indexes on (field1, field2) for common queries
- TTL indexes on expiresAt fields for automatic cleanup
- Denormalized data in DashboardKPISnapshot for fast queries
- Separate analytics collections for aggregation performance

## API Endpoints

All data accessible via `/api/admin/dashboard/*` endpoints as implemented in adminDashboardController.ts

## File Location
`backend/src/models/AdminDashboard.ts`
