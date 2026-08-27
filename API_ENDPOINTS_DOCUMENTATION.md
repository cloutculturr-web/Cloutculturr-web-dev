# Admin Dashboard API Endpoints Documentation

## Overview
Complete REST API documentation for the CloutCulturee Admin Dashboard. All endpoints require admin authentication and appropriate permissions.

## Base URL
```
http://api.cloutculturee.com/api/admin
```

## Authentication
All requests must include:
- `Authorization: Bearer {admin_token}`
- Admin user must have appropriate RBAC permissions

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {},
  "statusCode": 200,
  "timestamp": "2024-01-22T10:30:00Z"
}
```

---

## Dashboard & Analytics Endpoints

### Get Dashboard KPIs
```
GET /dashboard/kpis
```
**Parameters:**
- `period` (optional): day, week, month, year, custom - Default: month
- `startDate` (optional): ISO date for custom range
- `endDate` (optional): ISO date for custom range

**Permissions:** VIEW_DASHBOARD

**Response:**
```json
{
  "totalRevenue": 125000,
  "todayRevenue": 5200,
  "monthlyRevenue": 125000,
  "annualRevenue": 1500000,
  "totalClients": 350,
  "activeClients": 280,
  "totalCreators": 450,
  "activeCreators": 320,
  ...
}
```

### Get Dashboard Overview
```
GET /dashboard/overview
```
**Permissions:** VIEW_DASHBOARD

**Response:** Combines all KPIs, analytics, and recent logs

### Get Revenue Analytics
```
GET /dashboard/analytics/revenue
```
**Parameters:**
- `days`: Number of days to retrieve (default: 30)

**Permissions:** VIEW_ANALYTICS

### Get User Analytics
```
GET /dashboard/analytics/users
```
**Parameters:**
- `days`: Number of days to retrieve (default: 30)

**Permissions:** VIEW_ANALYTICS

### Get Project Analytics
```
GET /dashboard/analytics/projects
```
**Parameters:**
- `days`: Number of days to retrieve (default: 30)

**Permissions:** VIEW_ANALYTICS

### Get Activity Logs
```
GET /dashboard/activity-logs
```
**Parameters:**
- `userId` (optional): Filter by user ID
- `userType` (optional): admin, client, creator
- `entity` (optional): Entity type (project, client, creator)
- `limit` (optional): Default 100
- `skip` (optional): Default 0

**Permissions:** VIEW_ACTIVITY_LOGS

### Get Audit Logs
```
GET /dashboard/audit-logs
```
**Parameters:**
- `adminId` (optional): Filter by admin ID
- `resource` (optional): Resource type
- `limit` (optional): Default 100
- `skip` (optional): Default 0

**Permissions:** VIEW_AUDIT_LOGS

---

## CMS Management Endpoints

### Get CMS Content
```
GET /cms/content
```
**Parameters:**
- `section` (optional): Homepage, About, Services, Blog, Legal, etc.
- `status` (optional): draft, published, archived
- `limit` (optional): Default 50
- `skip` (optional): Default 0

**Permissions:** VIEW_CMS

### Create CMS Content
```
POST /cms/content
```
**Body:**
```json
{
  "title": "Homepage Hero",
  "section": "Homepage",
  "content": "Welcome to CloutCulturee...",
  "metadata": {
    "seoTitle": "Title",
    "seoDescription": "Description",
    "keywords": ["keyword1", "keyword2"]
  }
}
```
**Permissions:** MANAGE_CMS

**Response:** Created content object

### Update CMS Content
```
PUT /cms/content/:id
```
**Body:** Fields to update

**Permissions:** MANAGE_CMS

### Publish CMS Content
```
POST /cms/content/:id/publish
```
**Permissions:** PUBLISH_CMS

**Response:** Updated content with status: published

### Delete CMS Content
```
DELETE /cms/content/:id
```
**Permissions:** MANAGE_CMS

---

## Notification Management Endpoints

### Get Notifications
```
GET /notifications
```
**Parameters:**
- `type` (optional): announcement, maintenance, alert, update, emergency
- `status` (optional): draft, scheduled, sent, archived
- `limit` (optional): Default 50
- `skip` (optional): Default 0

**Permissions:** VIEW_NOTIFICATIONS

### Send Notification
```
POST /notifications/send
```
**Body:**
```json
{
  "title": "Platform Update",
  "message": "New features available...",
  "type": "announcement",
  "target": "all", // all, creators, clients, admins, members
  "scheduledFor": "2024-01-25T10:00:00Z" // Optional
}
```
**Permissions:** SEND_NOTIFICATIONS

**Response:** Created notification object

### Update Notification
```
PUT /notifications/:id
```
**Body:** Fields to update

**Permissions:** MANAGE_NOTIFICATIONS

### Delete Notification
```
DELETE /notifications/:id
```
**Permissions:** MANAGE_NOTIFICATIONS

---

## Security Management Endpoints

### Get Login Sessions
```
GET /security/sessions
```
**Parameters:**
- `userId` (optional): Filter by user
- `status` (optional): active, expired, revoked
- `limit` (optional): Default 50
- `skip` (optional): Default 0

**Permissions:** VIEW_SECURITY

### Revoke Login Session
```
POST /security/sessions/:sessionId/revoke
```
**Permissions:** MANAGE_SECURITY

### Get Failed Login Attempts
```
GET /security/failed-attempts
```
**Parameters:**
- `email` (optional): Filter by email
- `ipAddress` (optional): Filter by IP
- `limit` (optional): Default 50
- `skip` (optional): Default 0

**Permissions:** VIEW_SECURITY

### Get Blocked Users
```
GET /security/blocked-users
```
**Parameters:**
- `status` (optional): blocked, unblocked, permanent_ban - Default: blocked
- `limit` (optional): Default 50
- `skip` (optional): Default 0

**Permissions:** VIEW_SECURITY

### Block User
```
POST /security/block-user/:userId
```
**Body:**
```json
{
  "reason": "Suspicious activity detected",
  "unblockAt": "2024-02-01T00:00:00Z" // Optional
}
```
**Permissions:** BLOCK_USERS

**Response:** Blocked user object

### Unblock User
```
POST /security/unblock-user/:userId
```
**Permissions:** BLOCK_USERS

---

## System Settings Endpoints

### Get System Settings
```
GET /settings
```
**Permissions:** VIEW_SETTINGS

**Response:**
```json
{
  "platformName": "CloutCulturee",
  "maintenanceMode": false,
  "commissionRate": 15,
  "platformFee": 5,
  "minimumPayout": 100,
  "payoutFrequency": "weekly",
  "backupFrequency": "daily",
  "smtpConfig": {...},
  "stripeKeys": {...},
  "termsOfService": "...",
  "privacyPolicy": "..."
}
```

### Update System Settings
```
PUT /settings
```
**Body:** Fields to update

**Permissions:** MANAGE_SETTINGS

**Example:**
```json
{
  "commissionRate": 20,
  "minimumPayout": 150,
  "maintenanceMode": false
}
```

### Get Backups
```
GET /settings/backups
```
**Parameters:**
- `status` (optional): completed, failed, in_progress
- `limit` (optional): Default 50
- `skip` (optional): Default 0

**Permissions:** VIEW_SETTINGS

### Trigger Backup
```
POST /settings/backups/trigger
```
**Body:**
```json
{
  "type": "full" // or "incremental"
}
```
**Permissions:** MANAGE_SETTINGS

**Response:** Backup object with status: in_progress

---

## Reports Endpoints

### Get Report History
```
GET /reports
```
**Parameters:**
- `reportType` (optional): revenue, creators, clients, marketplace, etc.
- `format` (optional): csv, excel, pdf
- `limit` (optional): Default 50
- `skip` (optional): Default 0

**Permissions:** VIEW_REPORTS

### Generate Report
```
POST /reports/generate
```
**Body:**
```json
{
  "reportType": "revenue", // or creators, clients, marketplace, etc.
  "format": "pdf", // csv, excel, pdf
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```
**Permissions:** GENERATE_REPORTS

**Response:** Report object with status: pending (will be updated when complete)

### Download Report
```
GET /reports/:reportId/download
```
**Permissions:** VIEW_REPORTS

**Response:** Download URL if report is completed

---

## Marketplace Management Endpoints

### Get Featured Creators
```
GET /marketplace/featured
```
**Parameters:**
- `status` (optional): featured, trending, verified, standard - Default: featured
- `limit` (optional): Default 50
- `skip` (optional): Default 0

**Permissions:** VIEW_MARKETPLACE

### Feature Creator
```
POST /marketplace/feature/:creatorId
```
**Body:**
```json
{
  "status": "featured", // featured, trending, verified
  "category": "Design",
  "expiresAt": "2024-02-22T00:00:00Z" // Optional expiration
}
```
**Permissions:** FEATURE_CREATORS

**Response:** MarketplaceFeature object

### Remove Feature
```
POST /marketplace/remove-feature/:creatorId
```
**Permissions:** FEATURE_CREATORS

### Update Marketplace Stats
```
PUT /marketplace/stats/:creatorId
```
**Body:**
```json
{
  "impressions": 1500,
  "clicks": 120,
  "conversionRate": 8.0
}
```
**Permissions:** MANAGE_MARKETPLACE

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: Admin authentication required",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: Required permission(s): MANAGE_CLIENTS",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "statusCode": 404
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "statusCode": 400
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Rate Limiting

- Standard rate limit: 100 requests per minute per admin user
- Report generation: 10 per hour per admin user
- Backup trigger: 5 per day per admin user

---

## Pagination

All list endpoints support pagination:
- `limit`: Number of records per page (default: 50, max: 200)
- `skip`: Number of records to skip (default: 0)

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "total": 500,
    "limit": 50,
    "skip": 0,
    "pages": 10
  }
}
```

---

## File Locations

- Dashboard Controller: `backend/src/controllers/adminDashboardController.ts`
- Operations Controller: `backend/src/controllers/adminOperationsController.ts`
- Dashboard Routes: `backend/src/routes/adminDashboard.ts`
- Operations Routes: `backend/src/routes/adminOperations.ts`
- Protected Routes: `backend/src/routes/adminRoutes.ts`
- RBAC Middleware: `backend/src/middleware/rbac.ts`

---

## Integration Examples

### Fetch Dashboard KPIs (JavaScript/TypeScript)
```typescript
const response = await fetch('/api/admin/dashboard/kpis?period=month', {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  }
});
const { data } = await response.json();
```

### Send Notification
```typescript
const response = await fetch('/api/admin/notifications/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Platform Maintenance',
    message: 'Server maintenance scheduled for 2 AM UTC',
    type: 'maintenance',
    target: 'all'
  })
});
```

### Generate Report
```typescript
const response = await fetch('/api/admin/reports/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reportType: 'revenue',
    format: 'pdf',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  })
});
```

---

## Webhook Events

The admin system triggers these webhook events:
- `admin.notification.sent` - When notification is sent
- `admin.cms.published` - When CMS content is published
- `admin.user.blocked` - When user is blocked
- `admin.settings.updated` - When settings are changed
- `admin.report.completed` - When report generation completes
- `admin.backup.completed` - When backup is completed

---

## Best Practices

1. **Always include error handling** for network failures and timeout scenarios
2. **Use pagination** for large data sets to improve performance
3. **Cache dashboard KPIs** to reduce API calls
4. **Monitor rate limits** and implement exponential backoff for retries
5. **Log all admin actions** for audit and compliance purposes
6. **Validate input** on the frontend before sending to API
7. **Use appropriate HTTP methods** (GET, POST, PUT, DELETE)
8. **Include timestamps** in all API responses for synchronization
