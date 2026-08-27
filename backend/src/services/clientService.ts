import User from '@/models/User.js';
import Client from '@/models/Client.js';
import Creator from '@/models/Creator.js';
import Membership from '@/models/Membership.js';
import Package from '@/models/Package.js';
import { NotFoundError, AppError, ValidationError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import mongoose from 'mongoose';

interface UpdateClientProfilePayload {
  companyName?: string;
  industry?: string;
  location?: string;
  websiteUrl?: string;
  description?: string;
}

const MARKETPLACE_LIMIT_FREE = 8; // Free users see 8 creators

export class ClientService {
  /**
   * Get client profile
   */
  static async getClientProfile(userId: string) {
    try {
      const client = await Client.findOne({ userId }).populate('userId', 'email firstName lastName phoneNumber');

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      return client;
    } catch (error) {
      logger.error('Client profile fetch error:', error);
      throw error;
    }
  }

  /**
   * Update client profile
   */
  static async updateClientProfile(userId: string, payload: UpdateClientProfilePayload) {
    try {
      const client = await Client.findOne({ userId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      // Update allowed fields
      if (payload.companyName) client.companyName = payload.companyName;
      if (payload.industry) client.industry = payload.industry;
      if (payload.location) client.location = payload.location;
      if (payload.websiteUrl) client.websiteUrl = payload.websiteUrl;
      if (payload.description) client.description = payload.description;

      await client.save();
      logger.info(`✅ Client profile updated: ${userId}`);

      return client;
    } catch (error) {
      logger.error('Client profile update error:', error);
      throw error;
    }
  }

  /**
   * Get marketplace (with membership restrictions)
   */
  static async getMarketplace(userId: string, page: number = 1, limit: number = 10) {
    try {
      const client = await Client.findOne({ userId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      // Check membership
      const isPremium = client.membership.status === 'premium';

      // Get skip value
      const skip = (page - 1) * limit;

      // Build query for verified creators only
      const query: any = {
        role: 'creator',
        status: 'active',
        'verification.status': 'verified',
      };

      let creators: any[] = [];
      let total = 0;

      if (isPremium) {
        // Premium: unlimited access
        creators = await User.find(query)
          .populate('creator')
          .skip(skip)
          .limit(limit)
          .select('-password')
          .lean();

        total = await User.countDocuments(query);
      } else {
        // Free: limited to 8 creators
        creators = await User.find(query)
          .populate('creator')
          .skip(skip)
          .limit(MARKETPLACE_LIMIT_FREE)
          .select('-password')
          .lean();

        total = Math.min(MARKETPLACE_LIMIT_FREE, await User.countDocuments(query));
      }

      return {
        creators,
        pagination: {
          total,
          page,
          limit: isPremium ? limit : MARKETPLACE_LIMIT_FREE,
          pages: Math.ceil(total / (isPremium ? limit : MARKETPLACE_LIMIT_FREE)),
          isPremium,
          remainingCreators: Math.max(0, total - (skip + (isPremium ? limit : MARKETPLACE_LIMIT_FREE))),
        },
      };
    } catch (error) {
      logger.error('Marketplace fetch error:', error);
      throw error;
    }
  }

  /**
   * Get creator details (for marketplace view)
   */
  static async getCreatorDetails(creatorUserId: string, clientUserId: string) {
    try {
      // Get creator user
      const creatorUser = await User.findById(creatorUserId).select('-password').lean();

      if (!creatorUser || creatorUser.role !== 'creator') {
        throw new NotFoundError('Creator');
      }

      // Get creator profile
      const creatorProfile = await Creator.findOne({ userId: creatorUserId })
        .populate('portfolio')
        .populate('packages')
        .lean();

      if (!creatorProfile) {
        throw new NotFoundError('Creator profile');
      }

      // Track view
      await this.addViewedCreator(clientUserId, creatorUserId);

      return {
        user: creatorUser,
        profile: creatorProfile,
      };
    } catch (error) {
      logger.error('Creator details fetch error:', error);
      throw error;
    }
  }

  /**
   * Save creator to favorites
   */
  static async saveCreator(clientUserId: string, creatorUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      // Check if already saved
      const creatorObjId = new mongoose.Types.ObjectId(creatorUserId);
      if (!client.savedCreators.some((id) => id.toString() === creatorUserId)) {
        client.savedCreators.push(creatorObjId as any);
        await client.save();
        logger.info(`✅ Creator saved: ${creatorUserId}`);
      }

      return client;
    } catch (error) {
      logger.error('Save creator error:', error);
      throw error;
    }
  }

  /**
   * Unsave creator from favorites
   */
  static async unsaveCreator(clientUserId: string, creatorUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      client.savedCreators = client.savedCreators.filter((id) => id.toString() !== creatorUserId);
      await client.save();

      logger.info(`✅ Creator unsaved: ${creatorUserId}`);

      return client;
    } catch (error) {
      logger.error('Unsave creator error:', error);
      throw error;
    }
  }

  /**
   * Get saved creators
   */
  static async getSavedCreators(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId }).populate('savedCreators', '-password').lean();

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      return client.savedCreators;
    } catch (error) {
      logger.error('Saved creators fetch error:', error);
      throw error;
    }
  }

  /**
   * Add viewed creator (internal tracking)
   */
  static async addViewedCreator(clientUserId: string, creatorUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (client && !client.viewedCreators.some((id) => id.toString() === creatorUserId)) {
        const viewedObjId = new mongoose.Types.ObjectId(creatorUserId);
        client.viewedCreators.push(viewedObjId as any);
        // Keep only last 20 viewed
        if (client.viewedCreators.length > 20) {
          client.viewedCreators = client.viewedCreators.slice(-20);
        }
        await client.save();
      }

      return client;
    } catch (error) {
      logger.error('View tracking error:', error);
      // Don't throw, just log
    }
  }

  /**
   * Get recently viewed creators
   */
  static async getRecentlyViewed(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId })
        .populate('viewedCreators', '-password')
        .lean();

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      return client.viewedCreators || [];
    } catch (error) {
      logger.error('Recently viewed fetch error:', error);
      throw error;
    }
  }

  /**
   * Upgrade to premium membership
   */
  static async upgradeToPremium(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      // Calculate expiry (30 days)
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + 30);

      // Update client membership
      client.membership.status = 'premium';
      client.membership.tier = 'premium';
      client.membership.startDate = startDate;
      client.membership.expiryDate = expiryDate;
      client.membership.autoRenew = true;

      await client.save();

      // Create membership record
      const membership = await Membership.findOne({ clientId: client._id });

      if (membership) {
        membership.tier = 'premium';
        membership.status = 'active';
        membership.startDate = startDate;
        membership.expiryDate = expiryDate;
        membership.autoRenew = true;
        await membership.save();
      }

      logger.info(`✅ Client upgraded to premium: ${clientUserId}`);

      return client;
    } catch (error) {
      logger.error('Premium upgrade error:', error);
      throw error;
    }
  }

  /**
   * Get membership status
   */
  static async getMembershipStatus(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      const membership = await Membership.findOne({ clientId: client._id }).lean();

      return {
        client: {
          status: client.membership.status,
          tier: client.membership.tier,
          startDate: client.membership.startDate,
          expiryDate: client.membership.expiryDate,
          autoRenew: client.membership.autoRenew,
        },
        membership,
      };
    } catch (error) {
      logger.error('Membership status fetch error:', error);
      throw error;
    }
  }

  /**
   * Cancel membership
   */
  static async cancelMembership(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      client.membership.status = 'free';
      client.membership.tier = 'free';
      client.membership.autoRenew = false;

      await client.save();

      logger.info(`✅ Membership cancelled: ${clientUserId}`);

      return client;
    } catch (error) {
      logger.error('Membership cancellation error:', error);
      throw error;
    }
  }

  /**
   * Get client dashboard data
   */
  static async getClientDashboard(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      const savedCount = client.savedCreators?.length || 0;
      const viewedCount = client.viewedCreators?.length || 0;

      return {
        profile: client,
        stats: {
          savedCreators: savedCount,
          recentlyViewed: viewedCount,
          membershipStatus: client.membership.status,
          membershipExpiry: client.membership.expiryDate,
        },
      };
    } catch (error) {
      logger.error('Client dashboard error:', error);
      throw error;
    }
  }
}

export default ClientService;
