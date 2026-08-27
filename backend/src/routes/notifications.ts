import { Router } from 'express';
import NotificationController from '@/controllers/notificationController.js';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

// Any authenticated role (admin/creator/client) can use these — every
// method is scoped to req.user.userId, never a client-supplied ID.
router.use(authenticate);

router.get('/', NotificationController.list);
router.get('/unread-count', NotificationController.unreadCount);
router.put('/read-all', NotificationController.markAllAsRead);
router.put('/:id/read', NotificationController.markAsRead);

export default router;
