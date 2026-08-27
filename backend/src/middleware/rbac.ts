import { Request, Response, NextFunction } from 'express';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Controls access to admin dashboard routes based on user roles and permissions
 */

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  ANALYST = 'analyst',
}

export enum AdminPermission {
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ANALYTICS = 'view_analytics',

  // Client Management
  MANAGE_CLIENTS = 'manage_clients',
  VIEW_CLIENTS = 'view_clients',
  DELETE_CLIENTS = 'delete_clients',

  // Creator Management
  MANAGE_CREATORS = 'manage_creators',
  VIEW_CREATORS = 'view_creators',
  VERIFY_CREATORS = 'verify_creators',
  DELETE_CREATORS = 'delete_creators',

  // Creator Applications & Tiers
  VIEW_CREATOR_APPLICATIONS = 'view_creator_applications',
  MANAGE_CREATOR_APPLICATIONS = 'manage_creator_applications',
  MANAGE_CREATOR_TIERS = 'manage_creator_tiers',
  MANAGE_CREATOR_PRICING = 'manage_creator_pricing',

  // Project Management
  MANAGE_PROJECTS = 'manage_projects',
  VIEW_PROJECTS = 'view_projects',

  // Membership Management
  MANAGE_MEMBERSHIPS = 'manage_memberships',
  VIEW_MEMBERSHIPS = 'view_memberships',

  // Booking Management
  MANAGE_BOOKINGS = 'manage_bookings',
  VIEW_BOOKINGS = 'view_bookings',

  // Payment Management
  MANAGE_PAYMENTS = 'manage_payments',
  VIEW_PAYMENTS = 'view_payments',
  PROCESS_REFUNDS = 'process_refunds',

  // Support Management
  MANAGE_SUPPORT = 'manage_support',
  VIEW_SUPPORT = 'view_support',
  RESOLVE_TICKETS = 'resolve_tickets',

  // Marketplace Management
  MANAGE_MARKETPLACE = 'manage_marketplace',
  VIEW_MARKETPLACE = 'view_marketplace',
  FEATURE_CREATORS = 'feature_creators',

  // CMS Management
  MANAGE_CMS = 'manage_cms',
  PUBLISH_CMS = 'publish_cms',
  VIEW_CMS = 'view_cms',

  // Notification Management
  SEND_NOTIFICATIONS = 'send_notifications',
  MANAGE_NOTIFICATIONS = 'manage_notifications',
  VIEW_NOTIFICATIONS = 'view_notifications',

  // Security Management
  VIEW_SECURITY = 'view_security',
  MANAGE_SECURITY = 'manage_security',
  BLOCK_USERS = 'block_users',

  // Settings Management
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_SETTINGS = 'view_settings',

  // Reports
  GENERATE_REPORTS = 'generate_reports',
  VIEW_REPORTS = 'view_reports',

  // Audit & Logs
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  VIEW_ACTIVITY_LOGS = 'view_activity_logs',
}

// Role-Permission Mapping
const rolePermissionMap: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(AdminPermission),
  ],

  [AdminRole.ADMIN]: [
    // Full dashboard access
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_ANALYTICS,

    // Client Management
    AdminPermission.MANAGE_CLIENTS,
    AdminPermission.VIEW_CLIENTS,
    AdminPermission.DELETE_CLIENTS,

    // Creator Management
    AdminPermission.MANAGE_CREATORS,
    AdminPermission.VIEW_CREATORS,
    AdminPermission.VERIFY_CREATORS,
    AdminPermission.DELETE_CREATORS,

    // Creator Applications & Tiers
    AdminPermission.VIEW_CREATOR_APPLICATIONS,
    AdminPermission.MANAGE_CREATOR_APPLICATIONS,
    AdminPermission.MANAGE_CREATOR_TIERS,
    AdminPermission.MANAGE_CREATOR_PRICING,

    // Project Management
    AdminPermission.MANAGE_PROJECTS,
    AdminPermission.VIEW_PROJECTS,

    // Membership Management
    AdminPermission.MANAGE_MEMBERSHIPS,
    AdminPermission.VIEW_MEMBERSHIPS,

    // Booking Management
    AdminPermission.MANAGE_BOOKINGS,
    AdminPermission.VIEW_BOOKINGS,

    // Payment Management
    AdminPermission.MANAGE_PAYMENTS,
    AdminPermission.VIEW_PAYMENTS,
    AdminPermission.PROCESS_REFUNDS,

    // Support Management
    AdminPermission.MANAGE_SUPPORT,
    AdminPermission.VIEW_SUPPORT,
    AdminPermission.RESOLVE_TICKETS,

    // Marketplace Management
    AdminPermission.MANAGE_MARKETPLACE,
    AdminPermission.VIEW_MARKETPLACE,
    AdminPermission.FEATURE_CREATORS,

    // CMS Management
    AdminPermission.MANAGE_CMS,
    AdminPermission.PUBLISH_CMS,
    AdminPermission.VIEW_CMS,

    // Notification Management
    AdminPermission.SEND_NOTIFICATIONS,
    AdminPermission.MANAGE_NOTIFICATIONS,
    AdminPermission.VIEW_NOTIFICATIONS,

    // Security Management
    AdminPermission.VIEW_SECURITY,
    AdminPermission.MANAGE_SECURITY,
    AdminPermission.BLOCK_USERS,

    // Settings Management
    AdminPermission.MANAGE_SETTINGS,
    AdminPermission.VIEW_SETTINGS,

    // Reports
    AdminPermission.GENERATE_REPORTS,
    AdminPermission.VIEW_REPORTS,

    // Audit & Logs
    AdminPermission.VIEW_AUDIT_LOGS,
    AdminPermission.VIEW_ACTIVITY_LOGS,
  ],

  [AdminRole.MODERATOR]: [
    // Read-only dashboard
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_ANALYTICS,

    // Client Management
    AdminPermission.VIEW_CLIENTS,

    // Creator Management
    AdminPermission.VIEW_CREATORS,
    AdminPermission.VERIFY_CREATORS,

    // Project Management
    AdminPermission.VIEW_PROJECTS,

    // Membership Management
    AdminPermission.VIEW_MEMBERSHIPS,

    // Booking Management
    AdminPermission.VIEW_BOOKINGS,

    // Payment Management
    AdminPermission.VIEW_PAYMENTS,

    // Support Management
    AdminPermission.MANAGE_SUPPORT,
    AdminPermission.VIEW_SUPPORT,
    AdminPermission.RESOLVE_TICKETS,

    // Marketplace Management
    AdminPermission.VIEW_MARKETPLACE,

    // CMS Management
    AdminPermission.VIEW_CMS,

    // Notification Management
    AdminPermission.VIEW_NOTIFICATIONS,

    // Security Management
    AdminPermission.VIEW_SECURITY,
    AdminPermission.BLOCK_USERS,

    // Reports
    AdminPermission.VIEW_REPORTS,

    // Audit & Logs
    AdminPermission.VIEW_AUDIT_LOGS,
    AdminPermission.VIEW_ACTIVITY_LOGS,
  ],

  [AdminRole.ANALYST]: [
    // Analytics only
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_ANALYTICS,
    AdminPermission.VIEW_CLIENTS,
    AdminPermission.VIEW_CREATORS,
    AdminPermission.VIEW_PROJECTS,
    AdminPermission.VIEW_MEMBERSHIPS,
    AdminPermission.VIEW_BOOKINGS,
    AdminPermission.VIEW_PAYMENTS,
    AdminPermission.VIEW_SUPPORT,
    AdminPermission.VIEW_MARKETPLACE,
    AdminPermission.GENERATE_REPORTS,
    AdminPermission.VIEW_REPORTS,
    AdminPermission.VIEW_AUDIT_LOGS,
    AdminPermission.VIEW_ACTIVITY_LOGS,
  ],
};

/**
 * Extend Express Request to include admin user info
 */
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: string;
        email: string;
        role: AdminRole;
        permissions: AdminPermission[];
      };
    }
  }
}

/**
 * Populate req.adminUser from the already-verified JWT (req.user, set by
 * middleware/auth.ts's `authenticate`). Must run after `authenticate`.
 *
 * Only a single 'admin' role exists on the User model today, so every admin
 * is mapped to AdminRole.ADMIN. Finer-grained roles (super_admin/moderator/
 * analyst) require adding an `adminRole` field to User — not built yet.
 */
export const loadAdminUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    req.adminUser = {
      id: req.user.userId,
      email: req.user.email,
      role: AdminRole.ADMIN,
      permissions: getPermissionsForRole(AdminRole.ADMIN),
    };
  }
  next();
};

/**
 * Check if user is authenticated admin
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminUser = req.adminUser;

  if (!adminUser) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication required',
    });
  }

  next();
};

/**
 * Check if user has specific role
 * Supports both string roles (from auth middleware) and AdminRole enum
 */
export const requireRole = (...roles: (AdminRole | string)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check both req.adminUser (from RBAC) and req.user (from auth middleware)
    const user = req.adminUser || (req.user as any);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin authentication required',
      });
    }

    // Normalize roles for comparison (handle both enum and string)
    const normalizedRoles = roles.map((r: any) => String(r).toLowerCase());
    const userRole = String(user.role).toLowerCase();

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission
 */
export const requirePermission = (...permissions: AdminPermission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin authentication required',
      });
    }

    const hasPermission = permissions.some(permission =>
      req.adminUser!.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Required permission(s): ${permissions.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Get permissions for a role
 */
export const getPermissionsForRole = (role: AdminRole): AdminPermission[] => {
  return rolePermissionMap[role] || [];
};

/**
 * Check if role has permission
 */
export const roleHasPermission = (role: AdminRole, permission: AdminPermission): boolean => {
  const permissions = rolePermissionMap[role] || [];
  return permissions.includes(permission);
};

/**
 * Audit logging middleware
 * Logs all admin actions for compliance and security
 */
export const auditLog = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (data: any) {
      // Log after response is sent
      if (req.adminUser) {
        const statusCode = res.statusCode;
        if (statusCode >= 200 && statusCode < 300) {
          console.log(`[AUDIT] Admin: ${req.adminUser.email} | Action: ${action} | Resource: ${resource} | Status: ${statusCode}`);
        }
      }

      return originalSend.call(this, data);
    };

    next();
  };
};
