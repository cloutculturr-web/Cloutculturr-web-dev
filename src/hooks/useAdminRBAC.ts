import { useContext, useCallback } from 'react';
import {
  AdminUser,
  AdminRole,
  AdminPermission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  canAccessModule,
  canPerformAction,
} from '../lib/rbac';

/**
 * Admin Context (create this in a separate file and provide it to your app)
 * This is a placeholder - implement this based on your auth setup
 */
interface AdminContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for RBAC operations
 * Usage:
 * const { can, is, adminUser } = useAdminRBAC();
 * 
 * if (can('MANAGE_CLIENTS')) { ... }
 * if (is(AdminRole.ADMIN)) { ... }
 */
export const useAdminRBAC = () => {
  // Get admin user from context or auth provider
  // This is a placeholder - adjust based on your implementation
  const adminUser: AdminUser | null = null; // Replace with actual context

  const can = useCallback(
    (permission: AdminPermission | string): boolean => {
      if (!adminUser) return false;
      return hasPermission(adminUser, permission as AdminPermission);
    },
    [adminUser]
  );

  const canAny = useCallback(
    (permissions: AdminPermission[]): boolean => {
      if (!adminUser) return false;
      return hasAnyPermission(adminUser, permissions);
    },
    [adminUser]
  );

  const canAll = useCallback(
    (permissions: AdminPermission[]): boolean => {
      if (!adminUser) return false;
      return hasAllPermissions(adminUser, permissions);
    },
    [adminUser]
  );

  const is = useCallback(
    (role: AdminRole): boolean => {
      if (!adminUser) return false;
      return hasRole(adminUser, role);
    },
    [adminUser]
  );

  const isAny = useCallback(
    (roles: AdminRole[]): boolean => {
      if (!adminUser) return false;
      return hasAnyRole(adminUser, roles);
    },
    [adminUser]
  );

  const canAccessModule = useCallback(
    (module: string): boolean => {
      if (!adminUser) return false;
      // Re-implement the module access logic here or import it
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
      };

      const requiredPermissions = modulePermissions[module] || [];
      return hasAnyPermission(adminUser, requiredPermissions);
    },
    [adminUser]
  );

  return {
    adminUser,
    can,
    canAny,
    canAll,
    is,
    isAny,
    canAccessModule,
  };
};

/**
 * Hook to conditionally render content based on permissions
 * Usage:
 * const If = useConditionalRender();
 * <If permission={AdminPermission.MANAGE_CLIENTS}>
 *   <DeleteClientButton />
 * </If>
 */
export const useConditionalRender = () => {
  const { adminUser } = useAdminRBAC();

  const If = ({
    permission,
    role,
    children,
    fallback = null,
  }: {
    permission?: AdminPermission;
    role?: AdminRole;
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) => {
    let hasAccess = false;

    if (permission) {
      hasAccess = hasPermission(adminUser, permission);
    } else if (role) {
      hasAccess = hasRole(adminUser, role);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
  };

  return If;
};
