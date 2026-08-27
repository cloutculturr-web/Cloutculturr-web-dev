import Creator from '@/models/Creator.js';
import CreatorTier from '@/models/CreatorTier.js';
import Client from '@/models/Client.js';
import Project from '@/models/Project.js';
import Payment from '@/models/Payment.js';
import Message from '@/models/Message.js';
import { logger } from '@/utils/logger.js';

export class AnalyticsService {
  /**
   * Get all KPI metrics for dashboard
   */
  static async getAllKPIs(period: 'day' | 'week' | 'month' | 'year' = 'month', customDates?: { start: Date; end: Date }) {
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();

      if (customDates) {
        startDate = customDates.start;
        now.setTime(customDates.end.getTime());
      } else {
        switch (period) {
          case 'day':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setDate(now.getDate() - 30);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
      }

      // Get current metrics
      const currentKPIs = await this.getKPIsForDateRange(startDate, now);

      // Get previous period metrics for comparison
      const prevEndDate = new Date(startDate);
      const prevStartDate = new Date(prevEndDate);
      const rangeDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      prevStartDate.setDate(prevStartDate.getDate() - rangeDays);

      const previousKPIs = await this.getKPIsForDateRange(prevStartDate, prevEndDate);

      // Calculate trends
      const kpis = this.calculateTrends(currentKPIs, previousKPIs);

      logger.info(`✅ KPIs calculated for period: ${period}`);
      return kpis;
    } catch (error) {
      logger.error('Error calculating KPIs:', error);
      // Never substitute fake numbers for a real failure — let the caller
      // surface a real error so the UI can distinguish "zero" from "failed".
      throw error;
    }
  }

  /**
   * Get KPIs for a specific date range
   */
  static async getKPIsForDateRange(startDate: Date, endDate: Date) {
    try {
      // User counts
      const totalCreators = await Creator.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
      const verifiedCreators = await Creator.countDocuments({ 'verification.status': 'verified', createdAt: { $gte: startDate, $lte: endDate } });
      const pendingCreators = await Creator.countDocuments({ 'verification.status': 'pending', createdAt: { $gte: startDate, $lte: endDate } });
      const suspendedCreators = await Creator.countDocuments({ suspendedAt: { $exists: true, $ne: null }, createdAt: { $gte: startDate, $lte: endDate } });

      const totalClients = await Client.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
      const premiumClients = await Client.countDocuments({
        'membership.status': 'premium',
        createdAt: { $gte: startDate, $lte: endDate },
      });
      const freeClients = await Client.countDocuments({
        'membership.status': 'free',
        createdAt: { $gte: startDate, $lte: endDate },
      });

      // Project counts
      const totalProjects = await Project.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
      const activeProjects = await Project.countDocuments({ status: 'active', createdAt: { $gte: startDate, $lte: endDate } });
      const completedProjects = await Project.countDocuments({ status: 'completed', createdAt: { $gte: startDate, $lte: endDate } });
      const pendingProjects = await Project.countDocuments({ status: 'enquiry', createdAt: { $gte: startDate, $lte: endDate } });

      // Payment/Revenue
      const payments = await Payment.aggregate([
        {
          $match: {
            status: 'successful',
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalCommission: { $sum: '$breakdown.commission' },
            totalCreatorShare: { $sum: '$breakdown.creatorShare' },
            totalTransactions: { $sum: 1 },
          },
        },
      ]);

      const revenue = payments[0] || {
        totalRevenue: 0,
        totalCommission: 0,
        totalCreatorShare: 0,
        totalTransactions: 0,
      };

      // Get booking/strategy call stats
      const bookings = await Message.countDocuments({
        messageType: 'booking',
        createdAt: { $gte: startDate, $lte: endDate },
      });

      // Get creator ratings average (Client has no rating field — there is no
      // equivalent "client rating" to compute, so it is not fabricated here)
      const creatorRatings = await Creator.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, 'performance.averageRating': { $exists: true, $gt: 0 } } },
        { $group: { _id: null, avgRating: { $avg: '$performance.averageRating' } } },
      ]);

      return {
        creators: {
          total: totalCreators,
          verified: verifiedCreators,
          pending: pendingCreators,
          suspended: suspendedCreators,
        },
        clients: {
          total: totalClients,
          premium: premiumClients,
          free: freeClients,
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          pending: pendingProjects,
        },
        revenue: {
          total: revenue.totalRevenue,
          commission: revenue.totalCommission,
          creatorPayouts: revenue.totalCreatorShare,
          transactions: revenue.totalTransactions,
        },
        bookings: bookings,
        ratings: {
          creatorAvg: creatorRatings[0]?.avgRating || 0,
        },
      };
    } catch (error) {
      logger.error('Error calculating KPIs for date range:', error);
      throw error;
    }
  }

  /**
   * Calculate trends by comparing current to previous period
   */
  static calculateTrends(current: any, previous: any) {
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 100) / 100;
    };

    return {
      // Creator metrics
      totalCreators: {
        value: current.creators.total,
        change: calculateChange(current.creators.total, previous.creators.total),
      },
      verifiedCreators: {
        value: current.creators.verified,
        change: calculateChange(current.creators.verified, previous.creators.verified),
      },
      pendingCreators: {
        value: current.creators.pending,
        change: calculateChange(current.creators.pending, previous.creators.pending),
      },
      suspendedCreators: {
        value: current.creators.suspended,
        change: calculateChange(current.creators.suspended, previous.creators.suspended),
      },

      // Client metrics
      totalClients: {
        value: current.clients.total,
        change: calculateChange(current.clients.total, previous.clients.total),
      },
      premiumClients: {
        value: current.clients.premium,
        change: calculateChange(current.clients.premium, previous.clients.premium),
      },
      freeClients: {
        value: current.clients.free,
        change: calculateChange(current.clients.free, previous.clients.free),
      },

      // Project metrics
      totalProjects: {
        value: current.projects.total,
        change: calculateChange(current.projects.total, previous.projects.total),
      },
      activeProjects: {
        value: current.projects.active,
        change: calculateChange(current.projects.active, previous.projects.active),
      },
      completedProjects: {
        value: current.projects.completed,
        change: calculateChange(current.projects.completed, previous.projects.completed),
      },

      // Revenue metrics (in currency)
      totalRevenue: {
        value: current.revenue.total,
        change: calculateChange(current.revenue.total, previous.revenue.total),
      },
      commission: {
        value: current.revenue.commission,
        change: calculateChange(current.revenue.commission, previous.revenue.commission),
      },
      creatorPayouts: {
        value: current.revenue.creatorPayouts,
        change: calculateChange(current.revenue.creatorPayouts, previous.revenue.creatorPayouts),
      },
      transactions: {
        value: current.revenue.transactions,
        change: calculateChange(current.revenue.transactions, previous.revenue.transactions),
      },

      // Booking metrics
      bookings: {
        value: current.bookings,
        change: calculateChange(current.bookings, previous.bookings),
      },

      // Rating metrics
      creatorRating: {
        value: Math.round(current.ratings.creatorAvg * 100) / 100,
        change: calculateChange(current.ratings.creatorAvg, previous.ratings.creatorAvg),
      },
    };
  }

  /**
   * Get revenue breakdown over time
   */
  static async getRevenueOverTime(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      let dateFormat: string;
      switch (period) {
        case 'day':
          dateFormat = '%H:00';
          break;
        case 'week':
          dateFormat = '%Y-%m-%d';
          break;
        case 'month':
          dateFormat = '%Y-%m-%d';
          break;
        case 'year':
          dateFormat = '%Y-%m';
          break;
      }

      const data = await Payment.aggregate([
        {
          $match: { status: 'successful' },
        },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            commission: { $sum: '$breakdown.commission' },
            creatorShare: { $sum: '$breakdown.creatorShare' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return data;
    } catch (error) {
      logger.error('Error fetching revenue over time:', error);
      throw error;
    }
  }

  /**
   * Get creator performance metrics
   */
  static async getTopCreators(limit: number = 10) {
    try {
      const topCreators = await Creator.aggregate([
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: 'creatorId',
            as: 'projects',
          },
        },
        {
          $addFields: {
            projectCount: { $size: '$projects' },
            completedCount: {
              $size: {
                $filter: {
                  input: '$projects',
                  as: 'project',
                  cond: { $eq: ['$$project.status', 'completed'] },
                },
              },
            },
          },
        },
        { $sort: { 'performance.averageRating': -1, projectCount: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            companyName: 1,
            'performance.averageRating': 1,
            projectCount: 1,
            completedCount: 1,
          },
        },
      ]);

      return topCreators;
    } catch (error) {
      logger.error('Error fetching top creators:', error);
      throw error;
    }
  }

  /**
   * Get client acquisition funnel (free → premium conversion)
   */
  static async getClientFunnel() {
    try {
      const registered = await Client.countDocuments();
      const premiumMembers = await Client.countDocuments({ 'membership.status': 'premium' });
      const activeProjects = await Project.countDocuments({
        status: 'active',
        clientId: { $exists: true },
      });

      const conversionRate = registered > 0 ? (premiumMembers / registered) * 100 : 0;

      return {
        registered,
        premiumMembers,
        activeProjects,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Error fetching client funnel:', error);
      throw error;
    }
  }

  /**
   * Get creator count distribution across configured tiers
   */
  static async getCreatorTierDistribution() {
    try {
      const tiers = await CreatorTier.find().sort({ level: 1 }).lean();

      const counts = await Creator.aggregate([
        { $group: { _id: '$tierId', count: { $sum: 1 } } },
      ]);
      const countByTierId = new Map(counts.map((c) => [String(c._id), c.count]));

      const unassigned = await Creator.countDocuments({ tierId: null });

      return {
        tiers: tiers.map((tier) => ({
          tierId: tier._id,
          name: tier.name,
          level: tier.level,
          count: countByTierId.get(String(tier._id)) || 0,
        })),
        unassigned,
      };
    } catch (error) {
      logger.error('Error fetching creator tier distribution:', error);
      throw error;
    }
  }

  /**
   * Get project counts grouped by pipeline stage
   */
  static async getProjectPipeline() {
    try {
      const STAGES = ['enquiry', 'requirements', 'review', 'quoted', 'approved', 'active', 'completed', 'archived'];
      const counts = await Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      const countByStatus = new Map(counts.map((c) => [c._id, c.count]));

      return STAGES.map((stage) => ({ stage, count: countByStatus.get(stage) || 0 }));
    } catch (error) {
      logger.error('Error fetching project pipeline:', error);
      throw error;
    }
  }

  /**
   * Get marketplace statistics
   */
  static async getMarketplaceStats() {
    try {
      const totalListings = await Creator.countDocuments({ 'verification.status': 'verified' });
      const averagePrice = await Project.aggregate([
        {
          $group: {
            _id: null,
            avgBudget: { $avg: '$budget' },
          },
        },
      ]);

      return {
        totalListings,
        averagePrice: averagePrice[0]?.avgBudget || 0,
      };
    } catch (error) {
      logger.error('Error fetching marketplace stats:', error);
      throw error;
    }
  }
}

export default AnalyticsService;
