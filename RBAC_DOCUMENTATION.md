# Role-Based Access Control (RBAC) Documentation

## Overview
Complete role-based access control system for the CloutCulturee Admin Dashboard. Includes backend middleware, frontend utilities, and comprehensive permission matrix.

## Admin Roles

### 1. Super Admin
**Description:** Full system access with all permissions
**Use Case:** System owners, developers, system administrators

**Permissions:** All permissions available

### 2. Admin
**Description:** Full operational control of platform management
**Use Case:** Primary platform administrators, operations managers

**Permissions:**
- All dashboard and analytics access
- Full client management (create, edit, delete, suspend)
- Full creator management (verify, approve, delete)
- Full project management
- Full membership management
- Full booking management
- Full payment management and refunds
- Full support ticket management
- Marketplace management and creator featuring
- CMS content management and publishing
- Notification sending and scheduling
- Security management (view sessions, block users)
- System settings configuration
- Report generation and viewing
- Audit and activity log viewing

### 3. Moderator
**Description:** Content moderation and support operations
**Use Case:** Support specialists, content moderators, customer success

**Permissions:**
- Dashboard and analytics (read-only)
- View clients and creators
- Creator verification
- View projects and memberships
- View bookings and payments
- **Full support ticket management and resolution**
- View marketplace
- CMS viewing only
- View notifications
- **Security management (view sessions, block users)**
- Report viewing
- Audit and activity log viewing

### 4. Analyst
**Description:** Analytics and reporting only
**Use Case:** Business analysts, data analysts, reporting specialists

**Permissions:**
- Dashboard and analytics (read-only)
- View all clients, creators, projects, memberships, bookings, payments
- View support tickets (read-only)
- View marketplace
- **Report generation and viewing**
- Audit and activity log viewing

## Permission Matrix

| Permission | Super Admin | Admin | Moderator | Analyst |
|-----------|-----------|-------|-----------|---------|
| VIEW_DASHBOARD | ✓ | ✓ | ✓ | ✓ |
| VIEW_ANALYTICS | ✓ | ✓ | ✓ | ✓ |
| MANAGE_CLIENTS | ✓ | ✓ | ✗ | ✗ |
| VIEW_CLIENTS | ✓ | ✓ | ✓ | ✓ |
| DELETE_CLIENTS | ✓ | ✓ | ✗ | ✗ |
| MANAGE_CREATORS | ✓ | ✓ | ✗ | ✗ |
| VIEW_CREATORS | ✓ | ✓ | ✓ | ✓ |
| VERIFY_CREATORS | ✓ | ✓ | ✓ | ✗ |
| DELETE_CREATORS | ✓ | ✓ | ✗ | ✗ |
| MANAGE_PROJECTS | ✓ | ✓ | ✗ | ✗ |
| VIEW_PROJECTS | ✓ | ✓ | ✓ | ✓ |
| MANAGE_MEMBERSHIPS | ✓ | ✓ | ✗ | ✗ |
| VIEW_MEMBERSHIPS | ✓ | ✓ | ✓ | ✓ |
| MANAGE_BOOKINGS | ✓ | ✓ | ✗ | ✗ |
| VIEW_BOOKINGS | ✓ | ✓ | ✓ | ✓ |
| MANAGE_PAYMENTS | ✓ | ✓ | ✗ | ✗ |
| VIEW_PAYMENTS | ✓ | ✓ | ✓ | ✓ |
| PROCESS_REFUNDS | ✓ | ✓ | ✗ | ✗ |
| MANAGE_SUPPORT | ✓ | ✓ | ✓ | ✗ |
| VIEW_SUPPORT | ✓ | ✓ | ✓ | ✓ |
| RESOLVE_TICKETS | ✓ | ✓ | ✓ | ✗ |
| MANAGE_MARKETPLACE | ✓ | ✓ | ✗ | ✗ |
| VIEW_MARKETPLACE | ✓ | ✓ | ✓ | ✓ |
| FEATURE_CREATORS | ✓ | ✓ | ✗ | ✗ |
| MANAGE_CMS | ✓ | ✓ | ✗ | ✗ |
| PUBLISH_CMS | ✓ | ✓ | ✗ | ✗ |
| VIEW_CMS | ✓ | ✓ | ✓ | ✗ |
| SEND_NOTIFICATIONS | ✓ | ✓ | ✗ | ✗ |
| MANAGE_NOTIFICATIONS | ✓ | ✓ | ✗ | ✗ |
| VIEW_NOTIFICATIONS | ✓ | ✓ | ✓ | ✗ |
| VIEW_SECURITY | ✓ | ✓ | ✓ | ✗ |
| MANAGE_SECURITY | ✓ | ✓ | ✗ | ✗ |
| BLOCK_USERS | ✓ | ✓ | ✓ | ✗ |
| MANAGE_SETTINGS | ✓ | ✓ | ✗ | ✗ |
| VIEW_SETTINGS | ✓ | ✓ | ✗ | ✗ |
| GENERATE_REPORTS | ✓ | ✓ | ✗ | ✓ |
| VIEW_REPORTS | ✓ | ✓ | ✓ | ✓ |
| VIEW_AUDIT_LOGS | ✓ | ✓ | ✓ | ✓ |
| VIEW_ACTIVITY_LOGS | ✓ | ✓ | ✓ | ✓ |

## Backend Implementation

### 1. Middleware Files

#### `backend/src/middleware/rbac.ts`
Core RBAC middleware with:
- Admin role enumeration
- Permission enumeration
- Role-permission mapping
- Middleware functions:
  - `requireAdminAuth()` - Check admin authentication
  - `requireRole()` - Check specific role(s)
  - `requirePermission()` - Check specific permission(s)
  - `auditLog()` - Log admin actions

#### `backend/src/routes/adminRoutes.ts`
Protected admin routes with RBAC middleware applied:
- All admin routes wrapped with `requireAdminAuth`
- Route-specific permission checks
- Audit logging for all actions

### 2. Usage Examples

```typescript
// Protect a route with role requirement
router.delete(
  '/clients/:id',
  requireRole(AdminRole.ADMIN, AdminRole.SUPER_ADMIN),
  clientController.deleteClient
);

// Protect a route with permission requirement
router.post(
  '/creators/:id/verify',
  requirePermission(AdminPermission.VERIFY_CREATORS),
  creatorController.verifyCreator
);

// Protect with audit logging
router.post(
  '/payments/:id/refund',
  requirePermission(AdminPermission.PROCESS_REFUNDS),
  auditLog('PROCESS_REFUND', 'Payment Management'),
  paymentController.processRefund
);
```

## Frontend Implementation

### 1. Utility Files

#### `src/lib/rbac.ts`
Frontend RBAC utilities with:
- Role and permission enums (mirrored from backend)
- AdminUser interface
- Permission checking functions:
  - `hasPermission()` - Check single permission
  - `hasAnyPermission()` - Check any of multiple permissions
  - `hasAllPermissions()` - Check all permissions
  - `hasRole()` - Check single role
  - `hasAnyRole()` - Check any of multiple roles
  - `canAccessModule()` - Check access to admin module
  - `getRoleLabel()` - Get human-readable role name
  - `getRoleBadgeColor()` - Get badge styling

#### `src/hooks/useAdminRBAC.ts`
React hook for RBAC operations:
- `can()` - Check single permission
- `canAny()` - Check any permission
- `canAll()` - Check all permissions
- `is()` - Check single role
- `isAny()` - Check any role
- `canAccessModule()` - Check module access
- `useConditionalRender()` - Render based on permissions

### 2. Usage Examples

#### Checking Permissions in Components

```typescript
import { useAdminRBAC } from '@/hooks/useAdminRBAC';

export function ClientManagement() {
  const { can, is, adminUser } = useAdminRBAC();

  return (
    <div>
      {can(AdminPermission.VIEW_CLIENTS) && (
        <ClientList />
      )}

      {can(AdminPermission.DELETE_CLIENTS) && (
        <DeleteButton />
      )}

      {is(AdminRole.SUPER_ADMIN) && (
        <SystemSettings />
      )}
    </div>
  );
}
```

#### Conditional Rendering

```typescript
import { useConditionalRender } from '@/hooks/useAdminRBAC';
import { AdminPermission } from '@/lib/rbac';

export function Dashboard() {
  const If = useConditionalRender();

  return (
    <div>
      <If permission={AdminPermission.VIEW_DASHBOARD}>
        <DashboardContent />
      </If>

      <If permission={AdminPermission.MANAGE_SETTINGS} fallback={<div>Access Denied</div>}>
        <SettingsPanel />
      </If>
    </div>
  );
}
```

#### Using Direct Functions

```typescript
import { hasPermission, canAccessModule } from '@/lib/rbac';
import { AdminUser, AdminPermission } from '@/lib/rbac';

function checkAccess(user: AdminUser) {
  if (hasPermission(user, AdminPermission.MANAGE_CLIENTS)) {
    // Show client management interface
  }

  if (canAccessModule(user, 'reports')) {
    // Show reports module
  }
}
```

## Security Considerations

### Backend Security

1. **Always verify permissions server-side** - Never trust frontend permission checks alone
2. **Use middleware consistently** - Apply RBAC middleware to all protected routes
3. **Audit logging** - All admin actions are logged with:
   - Admin user email/ID
   - Action performed
   - Resource affected
   - Timestamp
   - IP address (when available)
4. **Session validation** - Verify admin session is still valid on each request
5. **Rate limiting** - Consider rate limiting for sensitive operations

### Frontend Security

1. **Use frontend checks for UX** - Hide UI elements based on permissions
2. **Fail securely** - Hide restricted UI elements by default
3. **Never store sensitive secrets** - No API keys or secrets in frontend code
4. **Validate responses** - Check responses for expected data types

## Implementation Checklist

- [ ] Backend RBAC middleware implemented (`backend/src/middleware/rbac.ts`)
- [ ] Protected admin routes created (`backend/src/routes/adminRoutes.ts`)
- [ ] All admin routes wrapped with appropriate middleware
- [ ] Frontend RBAC utilities created (`src/lib/rbac.ts`)
- [ ] React hook implemented (`src/hooks/useAdminRBAC.ts`)
- [ ] All admin components updated with permission checks
- [ ] Navigation menu filters based on user role
- [ ] Audit logging implemented and tested
- [ ] Admin user model includes role and permissions fields
- [ ] Session management validates admin status
- [ ] Error handling for permission denied scenarios

## API Response Examples

### Unauthorized (No Authentication)
```json
{
  "success": false,
  "message": "Unauthorized: Admin authentication required"
}
```

### Forbidden (Insufficient Permissions)
```json
{
  "success": false,
  "message": "Forbidden: Required permission(s): MANAGE_CLIENTS"
}
```

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

## File Locations

- Backend RBAC: `backend/src/middleware/rbac.ts`
- Protected Routes: `backend/src/routes/adminRoutes.ts`
- Frontend Utilities: `src/lib/rbac.ts`
- React Hook: `src/hooks/useAdminRBAC.ts`
- Documentation: `RBAC_DOCUMENTATION.md`

## Future Enhancements

1. **Custom Roles** - Allow creating custom roles with selected permissions
2. **Granular Permissions** - Object-level permissions (manage own clients vs all clients)
3. **Time-based Access** - Temporary elevated permissions with expiration
4. **IP Whitelisting** - Restrict admin access to specific IP ranges
5. **Two-Factor Authentication** - Require 2FA for sensitive operations
6. **Session Management UI** - Admin panel to view/revoke active sessions
7. **Audit Log UI** - Dashboard to view and export audit logs
8. **Permission Requests** - Workflow for requesting elevated permissions
