import { Router } from 'express';
import AdminController from '@/controllers/adminController.js';
import { authenticate } from '@/middleware/auth.js';
import { requireRole, loadAdminUser, requirePermission, AdminPermission } from '@/middleware/rbac.js';

const router = Router();

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(requireRole('admin'));
router.use(loadAdminUser);

/**
 * ============ Dashboard & Analytics ============
 */
router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics', AdminController.getAnalytics);
router.get('/stats', AdminController.getPlatformStats);
router.get('/audit-logs', AdminController.getAuditLogs);

/**
 * ============ Client Management ============
 */
router.get('/clients', AdminController.getClients);
router.get('/clients/:id', AdminController.getClient);
router.put('/clients/:id', AdminController.updateClient);
router.post('/clients/:id/suspend', AdminController.suspendClient);
router.post('/clients/:id/reactivate', AdminController.reactivateClient);
router.delete('/clients/:id', AdminController.deleteClient);

/**
 * ============ Creator Management ============
 */
router.post('/creators', AdminController.createCreator);
router.get('/creators', AdminController.getCreators);
router.get('/creators/:id', AdminController.getCreator);
router.post('/creators/:id/verify', AdminController.verifyCreator);
router.post('/creators/:id/reject', AdminController.rejectCreator);
router.post('/creators/:id/suspend', AdminController.suspendCreator);
router.delete('/creators/:id', AdminController.deleteCreator);

/**
 * ============ Project Management ============
 */
router.get('/projects', AdminController.getProjects);
router.put('/projects/:id/status', AdminController.updateProjectStatus);

/**
 * ============ Creator Applications ============
 */
router.get('/creator-applications', requirePermission(AdminPermission.VIEW_CREATOR_APPLICATIONS), AdminController.listCreatorApplications);
router.get('/creator-applications/:id', requirePermission(AdminPermission.VIEW_CREATOR_APPLICATIONS), AdminController.getCreatorApplication);
router.get('/creator-applications/:id/files/:fileId', requirePermission(AdminPermission.VIEW_CREATOR_APPLICATIONS), AdminController.downloadCreatorApplicationFile);
router.post('/creator-applications/:id/approve', requirePermission(AdminPermission.MANAGE_CREATOR_APPLICATIONS), AdminController.approveCreatorApplication);
router.post('/creator-applications/:id/reject', requirePermission(AdminPermission.MANAGE_CREATOR_APPLICATIONS), AdminController.rejectCreatorApplication);
router.post('/creator-applications/:id/request-changes', requirePermission(AdminPermission.MANAGE_CREATOR_APPLICATIONS), AdminController.requestCreatorApplicationChanges);

/**
 * ============ Creator Tiers ============
 */
router.get('/creator-tiers', requirePermission(AdminPermission.VIEW_CREATORS), AdminController.listCreatorTiers);
router.post('/creator-tiers', requirePermission(AdminPermission.MANAGE_CREATOR_TIERS), AdminController.createCreatorTier);
router.put('/creator-tiers/:id', requirePermission(AdminPermission.MANAGE_CREATOR_TIERS), AdminController.updateCreatorTier);

/**
 * ============ Creator Pricing & Tier Assignment ============
 */
router.get('/creators/:id/pricing-history', requirePermission(AdminPermission.VIEW_CREATORS), AdminController.getCreatorPricingHistory);
router.put('/creators/:id/pricing', requirePermission(AdminPermission.MANAGE_CREATOR_PRICING), AdminController.approveCreatorPricing);
router.post('/creators/:id/pricing/reject', requirePermission(AdminPermission.MANAGE_CREATOR_PRICING), AdminController.rejectCreatorPricing);
router.put('/creators/:id/tier', requirePermission(AdminPermission.MANAGE_CREATOR_TIERS), AdminController.changeCreatorTier);

export default router;
