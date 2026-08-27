import Membership from '@/models/Membership.js';
import Client from '@/models/Client.js';
import { NotFoundError, AppError, ValidationError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import NotificationService from '@/services/notificationService.js';

const PREMIUM_PRICE = 100; // ₹100 per month

export class MembershipService {
  /**
   * Create free membership for new client
   */
  static async createFreeMembership(clientId: string) {
    try {
      // Check if membership exists
      let membership = await Membership.findOne({ clientId });

      if (membership) {
        logger.warn(`Membership already exists for client: ${clientId}`);
        return membership;
      }

      membership = new Membership({
        clientId,
        tier: 'free',
        price: 0,
        status: 'active',
        startDate: new Date(),
      });

      // Setup free tier features
      membership.features = {
        unlimitedCreatorAccess: false,
        unlimitedSearch: false,
        creatorComparison: false,
        advancedFilters: false,
        savedCreators: 8, // Limited to 8
        priorityBooking: false,
        prioritySupport: false,
      };

      await membership.save();

      logger.info(`✅ Free membership created for client: ${clientId}`);

      return membership;
    } catch (error) {
      logger.error('Free membership creation error:', error);
      throw error;
    }
  }

  /**
   * Upgrade to premium membership
   */
  static async upgradeToPremium(clientId: string, razorpayOrderId?: string) {
    try {
      let membership = await Membership.findOne({ clientId });

      if (!membership) {
        membership = new Membership({ clientId });
      }

      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month validity

      membership.tier = 'premium';
      membership.price = PREMIUM_PRICE;
      membership.status = 'active';
      membership.startDate = startDate;
      membership.expiryDate = expiryDate;
      membership.autoRenew = true;

      if (razorpayOrderId) {
        membership.razorpay = {
          ...(membership.razorpay ?? {}),
          subscriptionId: razorpayOrderId,
        };
      }

      // Setup premium features
      membership.features = {
        unlimitedCreatorAccess: true,
        unlimitedSearch: true,
        creatorComparison: true,
        advancedFilters: true,
        savedCreators: 999, // Unlimited
        priorityBooking: true,
        prioritySupport: true,
      };

      await membership.save();

      // Update client membership status
      await Client.findByIdAndUpdate(clientId, {
        'membership.status': 'premium',
        'membership.tier': 'premium',
        'membership.startDate': startDate,
        'membership.expiryDate': expiryDate,
        'membership.autoRenew': true,
      });

      // Send notification
      try {
        const client = await Client.findById(clientId).populate('userId');
        if (client?.userId) {
          await NotificationService.sendMembershipNotification(client.userId._id.toString(), 'activated');
        }
      } catch (error) {
        logger.warn('Notification error (non-critical):', error);
      }

      logger.info(`✅ Premium membership activated for client: ${clientId}`);

      return membership;
    } catch (error) {
      logger.error('Premium upgrade error:', error);
      throw error;
    }
  }

  /**
   * Downgrade to free membership
   */
  static async downgradeToFree(clientId: string) {
    try {
      const membership = await Membership.findOne({ clientId });

      if (!membership) {
        throw new NotFoundError('Membership');
      }

      membership.tier = 'free';
      membership.price = 0;
      membership.status = 'active';
      membership.expiryDate = undefined;
      membership.autoRenew = false;
      membership.razorpay = {
        planId: '',
        subscriptionId: '',
      };

      // Setup free features
      membership.features = {
        unlimitedCreatorAccess: false,
        unlimitedSearch: false,
        creatorComparison: false,
        advancedFilters: false,
        savedCreators: 8,
        priorityBooking: false,
        prioritySupport: false,
      };

      await membership.save();

      // Update client
      await Client.findByIdAndUpdate(clientId, {
        'membership.status': 'free',
        'membership.tier': 'free',
        'membership.autoRenew': false,
      });

      logger.info(`✅ Downgraded to free membership: ${clientId}`);

      return membership;
    } catch (error) {
      logger.error('Downgrade error:', error);
      throw error;
    }
  }

  /**
   * Cancel membership
   */
  static async cancelMembership(clientId: string) {
    try {
      const membership = await Membership.findOne({ clientId });

      if (!membership) {
        throw new NotFoundError('Membership');
      }

      membership.status = 'cancelled';
      membership.autoRenew = false;
      await membership.save();

      // Downgrade to free
      await this.downgradeToFree(clientId);

      logger.info(`✅ Membership cancelled: ${clientId}`);

      return membership;
    } catch (error) {
      logger.error('Membership cancellation error:', error);
      throw error;
    }
  }

  /**
   * Get membership details
   */
  static async getMembership(clientId: string) {
    try {
      const membership = await Membership.findOne({ clientId });

      if (!membership) {
        throw new NotFoundError('Membership');
      }

      return membership;
    } catch (error) {
      logger.error('Membership fetch error:', error);
      throw error;
    }
  }

  /**
   * Check if membership is active
   */
  static async isMembershipActive(clientId: string): Promise<boolean> {
    try {
      const membership = await Membership.findOne({ clientId });

      if (!membership) {
        return false;
      }

      if (membership.status !== 'active') {
        return false;
      }

      // Check expiry
      if (membership.expiryDate && membership.expiryDate < new Date()) {
        membership.status = 'expired';
        await membership.save();
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Membership check error:', error);
      return false;
    }
  }

  /**
   * Check if user has premium access
   */
  static async hasPremiumAccess(clientId: string): Promise<boolean> {
    try {
      const membership = await Membership.findOne({ clientId });

      if (!membership || membership.tier !== 'premium') {
        return false;
      }

      if (membership.status !== 'active') {
        return false;
      }

      // Check expiry
      if (membership.expiryDate && membership.expiryDate < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Premium access check error:', error);
      return false;
    }
  }

  /**
   * Process membership renewal
   */
  static async renewMembership(clientId: string) {
    try {
      const membership = await Membership.findOne({ clientId });

      if (!membership) {
        throw new NotFoundError('Membership');
      }

      if (membership.tier !== 'premium') {
        throw new AppError('Only premium memberships can be renewed', 400);
      }

      const newExpiryDate = new Date(membership.expiryDate || new Date());
      newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);

      membership.expiryDate = newExpiryDate;
      membership.status = 'active';
      await membership.save();

      logger.info(`✅ Membership renewed for client: ${clientId}`);

      return membership;
    } catch (error) {
      logger.error('Membership renewal error:', error);
      throw error;
    }
  }

  /**
   * Check expiring memberships and send notifications
   */
  static async checkExpiringMemberships() {
    try {
      // Find memberships expiring in next 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringMemberships = await Membership.find({
        status: 'active',
        tier: 'premium',
        expiryDate: {
          $gte: new Date(),
          $lte: threeDaysFromNow,
        },
      });

      for (const membership of expiringMemberships) {
        try {
          const client = await Client.findById(membership.clientId).populate('userId');
          if (client?.userId) {
            await NotificationService.sendMembershipNotification(
              client.userId._id.toString(),
              'expiring',
              membership.expiryDate
            );
          }
        } catch (error) {
          logger.warn(`Notification failed for membership: ${membership._id}`);
        }
      }

      logger.info(`✅ Checked ${expiringMemberships.length} expiring memberships`);

      return { checked: expiringMemberships.length };
    } catch (error) {
      logger.error('Expiring membership check error:', error);
      throw error;
    }
  }

  /**
   * Auto-expire past memberships
   */
  static async expireOldMemberships() {
    try {
      const result = await Membership.updateMany(
        {
          status: 'active',
          expiryDate: { $lt: new Date() },
        },
        {
          status: 'expired',
        }
      );

      logger.info(`✅ Expired ${result.modifiedCount} memberships`);

      return { expiredCount: result.modifiedCount };
    } catch (error) {
      logger.error('Membership expiration error:', error);
      throw error;
    }
  }

  /**
   * Get premium tier features
   */
  static getPremiumFeatures() {
    return {
      unlimitedCreatorAccess: true,
      unlimitedSearch: true,
      creatorComparison: true,
      advancedFilters: true,
      savedCreators: 999,
      priorityBooking: true,
      prioritySupport: true,
    };
  }

  /**
   * Get free tier features
   */
  static getFreeTierFeatures() {
    return {
      unlimitedCreatorAccess: false,
      unlimitedSearch: false,
      creatorComparison: false,
      advancedFilters: false,
      savedCreators: 8,
      priorityBooking: false,
      prioritySupport: false,
    };
  }
}

export default MembershipService;
