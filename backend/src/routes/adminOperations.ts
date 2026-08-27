import { Router } from 'express';
import {
  CMSController,
  NotificationController,
  SecurityController,
  SettingsController,
  ReportsController,
  MarketplaceController
} from '@/controllers/adminOperationsController';
import {
  requirePermission,
  AdminPermission,
  auditLog
} from '@/middleware/rbac';

/**
 * Admin Operations Routes
 * Comprehensive API routes for all admin operations
 */

const router = Router();

// ============================================
// CMS ROUTES
// ============================================
router.get(
  '/cms/content',
  requirePermission(AdminPermission.VIEW_CMS),
  auditLog('VIEW_CMS', 'CMS Management'),
  CMSController.getContent
);

router.post(
  '/cms/content',
  requirePermission(AdminPermission.MANAGE_CMS),
  auditLog('CREATE_CMS', 'CMS Management'),
  CMSController.createContent
);

router.put(
  '/cms/content/:id',
  requirePermission(AdminPermission.MANAGE_CMS),
  auditLog('UPDATE_CMS', 'CMS Management'),
  CMSController.updateContent
);

router.post(
  '/cms/content/:id/publish',
  requirePermission(AdminPermission.PUBLISH_CMS),
  auditLog('PUBLISH_CMS', 'CMS Management'),
  CMSController.publishContent
);

router.delete(
  '/cms/content/:id',
  requirePermission(AdminPermission.MANAGE_CMS),
  auditLog('DELETE_CMS', 'CMS Management'),
  CMSController.deleteContent
);

// ============================================
// NOTIFICATION ROUTES
// ============================================
router.get(
  '/notifications',
  requirePermission(AdminPermission.VIEW_NOTIFICATIONS),
  auditLog('VIEW_NOTIFICATIONS', 'Notification Management'),
  NotificationController.getNotifications
);

router.post(
  '/notifications/send',
  requirePermission(AdminPermission.SEND_NOTIFICATIONS),
  auditLog('SEND_NOTIFICATION', 'Notification Management'),
  NotificationController.sendNotification
);

router.put(
  '/notifications/:id',
  requirePermission(AdminPermission.MANAGE_NOTIFICATIONS),
  auditLog('UPDATE_NOTIFICATION', 'Notification Management'),
  NotificationController.updateNotification
);

router.delete(
  '/notifications/:id',
  requirePermission(AdminPermission.MANAGE_NOTIFICATIONS),
  auditLog('DELETE_NOTIFICATION', 'Notification Management'),
  NotificationController.deleteNotification
);

// ============================================
// SECURITY ROUTES
// ============================================
router.get(
  '/security/sessions',
  requirePermission(AdminPermission.VIEW_SECURITY),
  auditLog('VIEW_SESSIONS', 'Security Management'),
  SecurityController.getLoginSessions
);

router.post(
  '/security/sessions/:sessionId/revoke',
  requirePermission(AdminPermission.MANAGE_SECURITY),
  auditLog('REVOKE_SESSION', 'Security Management'),
  SecurityController.revokeSession
);

router.get(
  '/security/failed-attempts',
  requirePermission(AdminPermission.VIEW_SECURITY),
  auditLog('VIEW_FAILED_ATTEMPTS', 'Security Management'),
  SecurityController.getFailedLoginAttempts
);

router.get(
  '/security/blocked-users',
  requirePermission(AdminPermission.VIEW_SECURITY),
  auditLog('VIEW_BLOCKED_USERS', 'Security Management'),
  SecurityController.getBlockedUsers
);

router.post(
  '/security/block-user/:userId',
  requirePermission(AdminPermission.BLOCK_USERS),
  auditLog('BLOCK_USER', 'Security Management'),
  SecurityController.blockUser
);

router.post(
  '/security/unblock-user/:userId',
  requirePermission(AdminPermission.BLOCK_USERS),
  auditLog('UNBLOCK_USER', 'Security Management'),
  SecurityController.unblockUser
);

// ============================================
// SETTINGS ROUTES
// ============================================
router.get(
  '/settings',
  requirePermission(AdminPermission.VIEW_SETTINGS),
  auditLog('VIEW_SETTINGS', 'Settings Management'),
  SettingsController.getSettings
);

router.put(
  '/settings',
  requirePermission(AdminPermission.MANAGE_SETTINGS),
  auditLog('UPDATE_SETTINGS', 'Settings Management'),
  SettingsController.updateSettings
);

router.get(
  '/settings/backups',
  requirePermission(AdminPermission.VIEW_SETTINGS),
  auditLog('VIEW_BACKUPS', 'Settings Management'),
  SettingsController.getBackups
);

router.post(
  '/settings/backups/trigger',
  requirePermission(AdminPermission.MANAGE_SETTINGS),
  auditLog('TRIGGER_BACKUP', 'Settings Management'),
  SettingsController.triggerBackup
);

// ============================================
// REPORTS ROUTES
// ============================================
router.get(
  '/reports',
  requirePermission(AdminPermission.VIEW_REPORTS),
  auditLog('VIEW_REPORTS', 'Reports'),
  ReportsController.getReportHistory
);

router.post(
  '/reports/generate',
  requirePermission(AdminPermission.GENERATE_REPORTS),
  auditLog('GENERATE_REPORT', 'Reports'),
  ReportsController.generateReport
);

router.get(
  '/reports/:reportId/download',
  requirePermission(AdminPermission.VIEW_REPORTS),
  auditLog('DOWNLOAD_REPORT', 'Reports'),
  ReportsController.downloadReport
);

// ============================================
// MARKETPLACE ROUTES
// ============================================
router.get(
  '/marketplace/featured',
  requirePermission(AdminPermission.VIEW_MARKETPLACE),
  auditLog('VIEW_FEATURED_CREATORS', 'Marketplace Management'),
  MarketplaceController.getFeaturedCreators
);

router.post(
  '/marketplace/feature/:creatorId',
  requirePermission(AdminPermission.FEATURE_CREATORS),
  auditLog('FEATURE_CREATOR', 'Marketplace Management'),
  MarketplaceController.featureCreator
);

router.post(
  '/marketplace/remove-feature/:creatorId',
  requirePermission(AdminPermission.FEATURE_CREATORS),
  auditLog('REMOVE_FEATURE', 'Marketplace Management'),
  MarketplaceController.removeFeature
);

router.put(
  '/marketplace/stats/:creatorId',
  requirePermission(AdminPermission.MANAGE_MARKETPLACE),
  auditLog('UPDATE_MARKETPLACE_STATS', 'Marketplace Management'),
  MarketplaceController.updateMarketplaceStats
);

export default router;
