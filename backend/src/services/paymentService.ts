import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '@/models/Payment.js';
import Project from '@/models/Project.js';
import { NotFoundError, ValidationError, AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '0.25'); // 25%

interface CreateOrderPayload {
  projectId: string;
  amount: number;
  currency?: string;
}

interface VerifyPaymentPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

export class PaymentService {
  /**
   * Create Razorpay order
   */
  static async createOrder(payload: CreateOrderPayload, clientId: string, creatorId?: string) {
    try {
      const { projectId, amount, currency = 'INR' } = payload;

      if (!amount || amount <= 0) {
        throw new ValidationError('Amount must be greater than 0');
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        notes: {
          projectId,
          clientId,
          creatorId: creatorId || 'agency',
        },
      });

      // Calculate breakdown
      const commission = Math.round(amount * COMMISSION_RATE * 100) / 100;
      const creatorShare = creatorId ? amount - commission : 0;
      const agencyShare = creatorId ? commission : amount;

      // Create payment record
      const payment = new Payment({
        projectId,
        clientId,
        creatorId: creatorId || null,
        razorpay: {
          orderId: razorpayOrder.id,
          paymentId: '',
          signatureId: '',
        },
        amount,
        currency,
        status: 'initiated',
        breakdown: {
          subtotal: amount,
          commission,
          creatorShare,
          tax: 0, // TODO: Calculate tax
        },
      });

      await payment.save();

      logger.info(`✅ Razorpay order created: ${razorpayOrder.id}`);

      return {
        orderId: razorpayOrder.id,
        amount,
        currency,
        paymentId: payment._id,
      };
    } catch (error) {
      logger.error('Order creation error:', error);
      throw error;
    }
  }

  /**
   * Verify payment signature
   */
  static async verifyPayment(payload: VerifyPaymentPayload) {
    try {
      const { orderId, paymentId, signature } = payload;

      // Generate signature
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new ValidationError('Payment verification failed - Invalid signature');
      }

      // Find and update payment
      const payment = await Payment.findOne({
        'razorpay.orderId': orderId,
      });

      if (!payment) {
        throw new NotFoundError('Payment');
      }

      payment.razorpay.paymentId = paymentId;
      payment.razorpay.signatureId = signature;
      payment.status = 'successful';
      payment.paidAt = new Date();
      await payment.save();

      // Update project status
      await Project.findByIdAndUpdate(payment.projectId, {
        status: 'approved',
        'payment.status': 'completed',
        'payment.razorpayOrderId': orderId,
        'payment.paidAmount': payment.amount,
        'payment.totalAmount': payment.amount,
      });

      logger.info(`✅ Payment verified: ${paymentId}`);

      return {
        paymentId,
        orderId,
        status: 'successful',
      };
    } catch (error) {
      logger.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Handle Razorpay webhook
   */
  static async handleWebhook(event: any) {
    try {
      const { event: eventType, payload } = event;

      logger.info(`📢 Webhook event received: ${eventType}`);

      switch (eventType) {
        case 'payment.authorized':
          await this.handlePaymentAuthorized(payload);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;

        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;

        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload);
          break;

        case 'subscription.failed':
          await this.handleSubscriptionFailed(payload);
          break;

        default:
          logger.warn(`⚠️ Unknown webhook event: ${eventType}`);
      }

      return { status: 'success' };
    } catch (error) {
      logger.error('Webhook error:', error);
      throw error;
    }
  }

  private static async handlePaymentAuthorized(payload: any) {
    const { payment } = payload;

    // Find and update payment record
    const paymentRecord = await Payment.findOne({
      'razorpay.orderId': payment.order_id,
    });

    if (paymentRecord) {
      paymentRecord.status = 'pending';
      await paymentRecord.save();

      logger.info(`✅ Payment authorized: ${payment.id}`);
    }
  }

  private static async handlePaymentFailed(payload: any) {
    const { payment } = payload;

    // Find and update payment record
    const paymentRecord = await Payment.findOne({
      'razorpay.orderId': payment.order_id,
    });

    if (paymentRecord) {
      paymentRecord.status = 'failed';
      await paymentRecord.save();

      // Update project status
      await Project.findByIdAndUpdate(paymentRecord.projectId, {
        status: 'quoted',
        'payment.status': 'failed',
      });

      logger.error(`❌ Payment failed: ${payment.id}`);
    }
  }

  private static async handlePaymentCaptured(payload: any) {
    const { payment } = payload;

    // Find and update payment record
    const paymentRecord = await Payment.findOne({
      'razorpay.orderId': payment.order_id,
    });

    if (paymentRecord) {
      paymentRecord.status = 'successful';
      paymentRecord.paidAt = new Date();
      await paymentRecord.save();

      // Update project status
      await Project.findByIdAndUpdate(paymentRecord.projectId, {
        status: 'active',
        'payment.status': 'completed',
      });

      logger.info(`✅ Payment captured: ${payment.id}`);
    }
  }

  private static async handleSubscriptionActivated(payload: any) {
    logger.info(`✅ Subscription activated`);
    // TODO: Update client membership
  }

  private static async handleSubscriptionFailed(payload: any) {
    logger.error(`❌ Subscription failed`);
    // TODO: Handle subscription failure
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(clientId: string | null = null, creatorId: string | null = null) {
    try {
      const query: any = { status: 'successful' };

      if (clientId) query.clientId = clientId;
      if (creatorId) query.creatorId = creatorId;

      const payments = await Payment.find(query)
        .populate('projectId', 'title budget')
        .sort({ createdAt: -1 })
        .lean();

      return payments;
    } catch (error) {
      logger.error('Payment history fetch error:', error);
      throw error;
    }
  }

  /**
   * Get payment details
   */
  static async getPaymentDetails(paymentId: string) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('projectId')
        .populate('clientId', 'companyName')
        .populate('creatorId', 'companyName');

      if (!payment) {
        throw new NotFoundError('Payment');
      }

      return payment;
    } catch (error) {
      logger.error('Payment fetch error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  static async processRefund(paymentId: string, amount?: number) {
    try {
      const payment = await Payment.findById(paymentId);

      if (!payment) {
        throw new NotFoundError('Payment');
      }

      if (payment.status !== 'successful') {
        throw new AppError('Can only refund successful payments', 400);
      }

      const refundAmount = amount || payment.amount;

      if (refundAmount > payment.amount) {
        throw new AppError('Refund amount cannot exceed payment amount', 400);
      }

      if (!payment.razorpay.paymentId) {
        throw new AppError('No Razorpay payment ID found', 400);
      }

      // Process refund with Razorpay
      await razorpay.payments.refund(payment.razorpay.paymentId, {
        amount: Math.round(refundAmount * 100), // Convert to paise
      });

      // Update payment record
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.refundReason = 'Manual refund';
      await payment.save();

      // Update project status
      await Project.findByIdAndUpdate(payment.projectId, {
        status: 'archived',
        'payment.status': 'refunded',
      });

      logger.info(`✅ Refund processed: ${paymentId}`);

      return {
        paymentId,
        refundAmount,
        status: 'refunded',
      };
    } catch (error) {
      logger.error('Refund error:', error);
      throw error;
    }
  }

  /**
   * Create subscription for premium membership
   */
  static async createSubscription(clientId: string, planId: string) {
    try {
      // TODO: Implement subscription creation with Razorpay
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        quantity: 1,
        total_count: 0, // Unlimited renewals
        notes: {
          clientId,
        },
      });

      logger.info(`✅ Subscription created: ${subscription.id}`);

      return subscription;
    } catch (error) {
      logger.error('Subscription creation error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await razorpay.subscriptions.cancel(subscriptionId, false);

      logger.info(`✅ Subscription cancelled: ${subscriptionId}`);

      return subscription;
    } catch (error) {
      logger.error('Subscription cancellation error:', error);
      throw error;
    }
  }
}

export default PaymentService;
