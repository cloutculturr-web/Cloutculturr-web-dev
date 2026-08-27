import { Request, Response, NextFunction } from 'express';
import PaymentService from '@/services/paymentService.js';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import Client from '@/models/Client.js';

export class PaymentController {
  /**
   * Create Razorpay order
   * POST /api/payment/create-order
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = (req as any).user?.userId;
      const { projectId, amount, creatorId } = req.body;

      if (!clientId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!projectId || !amount) {
        throw new AppError('Project ID and amount are required', 400);
      }

      const order = await PaymentService.createOrder(
        { projectId, amount },
        clientId,
        creatorId
      );

      res.status(201).json({
        success: true,
        message: 'Order created',
        data: order,
        statusCode: 201,
        timestamp: new Date(),
      });

      logger.info(`✅ Order created for client: ${clientId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify payment
   * POST /api/payment/verify
   */
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, paymentId, signature } = req.body;

      if (!orderId || !paymentId || !signature) {
        throw new AppError('Order ID, Payment ID, and Signature are required', 400);
      }

      const result = await PaymentService.verifyPayment({
        orderId,
        paymentId,
        signature,
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Payment verified: ${paymentId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Razorpay webhook handler
   * POST /api/payment/webhook
   */
  static async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { event, payload } = req.body;

      if (!event) {
        throw new AppError('Event type is required', 400);
      }

      await PaymentService.handleWebhook({
        event,
        payload,
      });

      res.status(200).json({
        success: true,
        message: 'Webhook processed',
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Webhook processed: ${event}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment history
   * GET /api/payment/history
   */
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { role } = (req as any).user;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      let payments;

      if (role === 'client') {
        payments = await PaymentService.getPaymentHistory(userId, null);
      } else if (role === 'creator') {
        payments = await PaymentService.getPaymentHistory(null, userId);
      } else {
        throw new AppError('Unauthorized', 403);
      }

      res.status(200).json({
        success: true,
        message: 'Payment history retrieved',
        data: payments,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Payment history retrieved for user: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment details
   * GET /api/payment/:id
   */
  static async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const payment = await PaymentService.getPaymentDetails(id);

      // Verify ownership
      if (payment.clientId.toString() !== userId && payment.creatorId?.toString() !== userId) {
        throw new AppError('Unauthorized to view this payment', 403);
      }

      res.status(200).json({
        success: true,
        message: 'Payment retrieved',
        data: payment,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Payment retrieved: ${id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process refund
   * POST /api/payment/:id/refund
   */
  static async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const userId = (req as any).user?.userId;
      const { role } = (req as any).user;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (role !== 'admin' && role !== 'client') {
        throw new AppError('Only admins or clients can initiate refunds', 403);
      }

      const result = await PaymentService.processRefund(id, amount);

      res.status(200).json({
        success: true,
        message: 'Refund processed',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Refund processed for payment: ${id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create subscription
   * POST /api/payment/subscription/create
   */
  static async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = (req as any).user?.userId;
      const { planId } = req.body;

      if (!clientId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!planId) {
        throw new AppError('Plan ID is required', 400);
      }

      const subscription = await PaymentService.createSubscription(clientId, planId);

      res.status(201).json({
        success: true,
        message: 'Subscription created',
        data: subscription,
        statusCode: 201,
        timestamp: new Date(),
      });

      logger.info(`✅ Subscription created for client: ${clientId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel subscription
   * POST /api/payment/subscription/cancel
   */
  static async cancelSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = (req as any).user?.userId;
      const { subscriptionId } = req.body;

      if (!clientId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!subscriptionId) {
        throw new AppError('Subscription ID is required', 400);
      }

      const result = await PaymentService.cancelSubscription(subscriptionId);

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Subscription cancelled for client: ${clientId}`);
    } catch (error) {
      next(error);
    }
  }
}

export default PaymentController;
