import { Router } from 'express';
import CreatorController from '@/controllers/creatorController.js';
import { authenticate } from '@/middleware/auth.js';
import { requireRole } from '@/middleware/rbac.js';

const router = Router();

// Apply authentication and creator role check to all routes
router.use(authenticate);
router.use(requireRole('creator'));

/**
 * Dashboard & Profile
 */
router.get('/dashboard', CreatorController.getDashboard);
router.get('/profile', CreatorController.getProfile);
router.put('/profile', CreatorController.updateProfile);
router.put('/availability', CreatorController.updateAvailability);

/**
 * Portfolio Management
 */
router.get('/portfolio', CreatorController.getPortfolio);
router.post('/portfolio', CreatorController.addPortfolio);
router.put('/portfolio/:id', CreatorController.updatePortfolio);
router.delete('/portfolio/:id', CreatorController.deletePortfolio);

/**
 * Package Management
 */
router.get('/packages', CreatorController.getPackages);
router.post('/packages', CreatorController.createPackage);
router.put('/packages/:id', CreatorController.updatePackage);
router.delete('/packages/:id', CreatorController.deletePackage);

/**
 * Revenue & Projects
 */
router.get('/revenue', CreatorController.getRevenue);
router.get('/projects', CreatorController.getProjects);

export default router;
