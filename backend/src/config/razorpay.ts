import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '@/utils/logger.js';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  logger.warn('⚠️ Razorpay credentials not configured. Payment functionality will be disabled.');
}

export const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID || '',
  key_secret: RAZORPAY_KEY_SECRET || '',
});

export interface CreateOrderOptions {
  amount: number; // in paise (multiply by 100)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreateSubscriptionOptions {
  planId: string;
  customerId: string;
  quantity?: number;
  totalCount?: number;
  startAt?: number;
  notes?: Record<string, string>;
}

export const createOrder = async (options: CreateOrderOptions) => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt || `receipt_${Date.now()}`,
      notes: options.notes,
    });
    logger.info(`✅ Order created: ${order.id}`);
    return order;
  } catch (error) {
    logger.error('❌ Error creating Razorpay order:', error);
    throw error;
  }
};

export const fetchOrder = async (orderId: string) => {
  try {
    return await razorpayInstance.orders.fetch(orderId);
  } catch (error) {
    logger.error('❌ Error fetching order:', error);
    throw error;
  }
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;
    if (isValid) {
      logger.info('✅ Payment signature verified');
    } else {
      logger.warn('⚠️ Payment signature verification failed');
    }
    return isValid;
  } catch (error) {
    logger.error('❌ Error verifying payment signature:', error);
    return false;
  }
};

export const createPlan = async (
  interval: 'monthly' | 'yearly',
  period: number,
  amount: number,
  description: string
) => {
  try {
    const plan = await razorpayInstance.plans.create({
      period: interval === 'monthly' ? 'monthly' : 'yearly',
      interval: period,
      item: {
        name: description,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
      },
    });
    logger.info(`✅ Plan created: ${plan.id}`);
    return plan;
  } catch (error) {
    logger.error('❌ Error creating plan:', error);
    throw error;
  }
};

export const fetchPayment = async (paymentId: string) => {
  try {
    return await razorpayInstance.payments.fetch(paymentId);
  } catch (error) {
    logger.error('❌ Error fetching payment:', error);
    throw error;
  }
};

export const refundPayment = async (
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined,
      notes,
    });
    logger.info(`✅ Refund initiated: ${refund.id}`);
    return refund;
  } catch (error) {
    logger.error('❌ Error refunding payment:', error);
    throw error;
  }
};

export const verifyWebhookSignature = (body: unknown, signature: string): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET || '')
      .update(JSON.stringify(body))
      .digest('hex');
    return expectedSignature === signature;
  } catch (error) {
    logger.error('❌ Error verifying webhook signature:', error);
    return false;
  }
};
