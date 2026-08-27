import { Router } from 'express';
import PaymentController from '@/controllers/paymentController.js';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

/**
 * Payment Routes
 */

// Public webhook (no auth required)
router.post('/webhook', PaymentController.webhook);

// Protected routes
router.use(authenticate);

// Order creation (clients)
router.post('/create-order', PaymentController.createOrder);

// Payment verification
router.post('/verify', PaymentController.verifyPayment);

// History & Details
router.get('/history', PaymentController.getHistory);
router.get('/:id', PaymentController.getPayment);

// Refund (admin/client)
router.post('/:id/refund', PaymentController.refund);

// Subscriptions
router.post('/subscription/create', PaymentController.createSubscription);
router.post('/subscription/cancel', PaymentController.cancelSubscription);

export default router;
