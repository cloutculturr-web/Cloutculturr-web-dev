import { Router } from 'express';
import ClientController from '@/controllers/clientController.js';
import { authenticate } from '@/middleware/auth.js';
import { requireRole } from '@/middleware/rbac.js';

const router = Router();

// Apply authentication and client role check to all routes
router.use(authenticate);
router.use(requireRole('client'));

/**
 * Dashboard
 */
router.get('/dashboard', ClientController.getDashboard);

/**
 * Marketplace
 */
router.get('/marketplace', ClientController.getMarketplace);
router.get('/marketplace/:creatorId', ClientController.getCreatorDetails);
router.post('/save-creator/:creatorId', ClientController.saveCreator);
router.delete('/save-creator/:creatorId', ClientController.unsaveCreator);
router.get('/saved-creators', ClientController.getSavedCreators);
router.get('/recently-viewed', ClientController.getRecentlyViewed);

/**
 * Membership
 */
router.get('/membership', ClientController.getMembership);
router.post('/membership/upgrade', ClientController.upgradeToPremium);
router.post('/membership/cancel', ClientController.cancelMembership);

/**
 * Projects
 */
router.post('/projects', ClientController.createProject);
router.get('/projects', ClientController.getProjects);
router.get('/projects/:id', ClientController.getProject);
router.put('/projects/:id', ClientController.updateProject);

export default router;
