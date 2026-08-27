/**
 * Role-Based Access Control (RBAC) Utilities for Frontend
 * Manages admin roles and permissions on the client side
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

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  avatar?: string;
  createdAt: Date;
}

/**
 * Get permissions for a specific role
 */
export const getPermissionsForRole = (role: AdminRole): AdminPermission[] => {
  const rolePermissionMap: Record<AdminRole, AdminPermission[]> = {
    [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission),
    [AdminRole.ADMIN]: [
      AdminPermission.VIEW_DASHBOARD,
      AdminPermission.VIEW_ANALYTICS,
      AdminPermission.MANAGE_CLIENTS,
      AdminPermission.VIEW_CLIENTS,
      AdminPermission.DELETE_CLIENTS,
      AdminPermission.MANAGE_CREATORS,
      AdminPermission.VIEW_CREATORS,
      AdminPermission.VERIFY_CREATORS,
      AdminPermission.DELETE_CREATORS,
      AdminPermission.MANAGE_PROJECTS,
      AdminPermission.VIEW_PROJECTS,
      AdminPermission.MANAGE_MEMBERSHIPS,
      AdminPermission.VIEW_MEMBERSHIPS,
      AdminPermission.MANAGE_BOOKINGS,
      AdminPermission.VIEW_BOOKINGS,
      AdminPermission.MANAGE_PAYMENTS,
      AdminPermission.VIEW_PAYMENTS,
      AdminPermission.PROCESS_REFUNDS,
      AdminPermission.MANAGE_SUPPORT,
      AdminPermission.VIEW_SUPPORT,
      AdminPermission.RESOLVE_TICKETS,
      AdminPermission.MANAGE_MARKETPLACE,
      AdminPermission.VIEW_MARKETPLACE,
      AdminPermission.FEATURE_CREATORS,
      AdminPermission.MANAGE_CMS,
      AdminPermission.PUBLISH_CMS,
      AdminPermission.VIEW_CMS,
      AdminPermission.SEND_NOTIFICATIONS,
      AdminPermission.MANAGE_NOTIFICATIONS,
      AdminPermission.VIEW_NOTIFICATIONS,
      AdminPermission.VIEW_SECURITY,
      AdminPermission.MANAGE_SECURITY,
      AdminPermission.BLOCK_USERS,
      AdminPermission.MANAGE_SETTINGS,
      AdminPermission.VIEW_SETTINGS,
      AdminPermission.GENERATE_REPORTS,
      AdminPermission.VIEW_REPORTS,
      AdminPermission.VIEW_AUDIT_LOGS,
      AdminPermission.VIEW_ACTIVITY_LOGS,
    ],
    [AdminRole.MODERATOR]: [
      AdminPermission.VIEW_DASHBOARD,
      AdminPermission.VIEW_ANALYTICS,
      AdminPermission.VIEW_CLIENTS,
      AdminPermission.VIEW_CREATORS,
      AdminPermission.VERIFY_CREATORS,
      AdminPermission.VIEW_PROJECTS,
      AdminPermission.VIEW_MEMBERSHIPS,
      AdminPermission.VIEW_BOOKINGS,
      AdminPermission.VIEW_PAYMENTS,
      AdminPermission.MANAGE_SUPPORT,
      AdminPermission.VIEW_SUPPORT,
      AdminPermission.RESOLVE_TICKETS,
      AdminPermission.VIEW_MARKETPLACE,
      AdminPermission.VIEW_CMS,
      AdminPermission.VIEW_NOTIFICATIONS,
      AdminPermission.VIEW_SECURITY,
      AdminPermission.BLOCK_USERS,
      AdminPermission.VIEW_REPORTS,
      AdminPermission.VIEW_AUDIT_LOGS,
      AdminPermission.VIEW_ACTIVITY_LOGS,
    ],
    [AdminRole.ANALYST]: [
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

  return rolePermissionMap[role] || [];
};

/**
 * Check if admin user has a specific permission
 */
export const hasPermission = (user: AdminUser | null, permission: AdminPermission): boolean => {
  if (!user) return false;
  return user.permissions.includes(permission);
};

/**
 * Check if admin user has any of the specified permissions
 */
export const hasAnyPermission = (user: AdminUser | null, permissions: AdminPermission[]): boolean => {
  if (!user) return false;
  return permissions.some(permission => user.permissions.includes(permission));
};

/**
 * Check if admin user has all of the specified permissions
 */
export const hasAllPermissions = (user: AdminUser | null, permissions: AdminPermission[]): boolean => {
  if (!user) return false;
  return permissions.every(permission => user.permissions.includes(permission));
};

/**
 * Check if admin user has a specific role
 */
export const hasRole = (user: AdminUser | null, role: AdminRole): boolean => {
  if (!user) return false;
  return user.role === role;
};

/**
 * Check if admin user has any of the specified roles
 */
export const hasAnyRole = (user: AdminUser | null, roles: AdminRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

/**
 * Get role label for display
 */
export const getRoleLabel = (role: AdminRole): string => {
  const labels: Record<AdminRole, string> = {
    [AdminRole.SUPER_ADMIN]: 'Super Admin',
    [AdminRole.ADMIN]: 'Admin',
    [AdminRole.MODERATOR]: 'Moderator',
    [AdminRole.ANALYST]: 'Analyst',
  };
  return labels[role] || role;
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role: AdminRole): string => {
  const colors: Record<AdminRole, string> = {
    [AdminRole.SUPER_ADMIN]: 'bg-red-500/20 text-red-500',
    [AdminRole.ADMIN]: 'bg-purple-500/20 text-purple-500',
    [AdminRole.MODERATOR]: 'bg-blue-500/20 text-blue-500',
    [AdminRole.ANALYST]: 'bg-green-500/20 text-green-500',
  };
  return colors[role] || 'bg-gray-500/20 text-gray-500';
};

/**
 * Can navigate to admin section
 */
export const canAccessAdmin = (user: AdminUser | null): boolean => {
  if (!user) return false;
  return hasPermission(user, AdminPermission.VIEW_DASHBOARD);
};

/**
 * Can navigate to specific admin module
 */
export const canAccessModule = (user: AdminUser | null, module: string): boolean => {
  if (!user) return false;

  const modulePermissions: Record<string, AdminPermission[]> = {
    dashboard: [AdminPermission.VIEW_DASHBOARD],
    analytics: [AdminPermission.VIEW_ANALYTICS],
    clients: [AdminPermission.VIEW_CLIENTS],
    creators: [AdminPermission.VIEW_CREATORS],
    projects: [AdminPermission.VIEW_PROJECTS],
    memberships: [AdminPermission.VIEW_MEMBERSHIPS],
    bookings: [AdminPermission.VIEW_BOOKINGS],
    payments: [AdminPermission.VIEW_PAYMENTS],
    support: [AdminPermission.VIEW_SUPPORT],
    marketplace: [AdminPermission.VIEW_MARKETPLACE],
    cms: [AdminPermission.VIEW_CMS],
    notifications: [AdminPermission.VIEW_NOTIFICATIONS],
    security: [AdminPermission.VIEW_SECURITY],
    settings: [AdminPermission.VIEW_SETTINGS],
    reports: [AdminPermission.VIEW_REPORTS],
    search: [AdminPermission.VIEW_DASHBOARD], // Global search available to all admins
  };

  const requiredPermissions = modulePermissions[module] || [];
  return hasAnyPermission(user, requiredPermissions);
};

/**
 * Can perform specific action
 */
export const canPerformAction = (user: AdminUser | null, action: AdminPermission): boolean => {
  if (!user) return false;
  return hasPermission(user, action);
};
