import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import AdminService from '@/services/adminService.js';
import AnalyticsService from '@/services/analyticsService.js';
import CreatorService from '@/services/creatorService.js';
import CreatorApplicationService from '@/services/creatorApplicationService.js';
import { AppError, NotFoundError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

export class AdminController {
  /**
   * Extract request metadata for audit logging
   */
  private static getRequestMetadata(req: any) {
    const adminId = req.user?.userId;
    const adminEmail = req.user?.email;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    return { adminId, adminEmail, ipAddress, userAgent };
  }

  /**
   * Get admin dashboard overview
   * GET /api/admin/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const period = (req.query.period as any) || 'month';

      // Get all KPIs
      const kpis = await AnalyticsService.getAllKPIs(period);

      // Get top creators
      const topCreators = await AnalyticsService.getTopCreators(5);

      // Get client funnel (free -> premium conversion)
      const funnel = await AnalyticsService.getClientFunnel();

      // Get creator tier distribution
      const tierDistribution = await AnalyticsService.getCreatorTierDistribution();

      // Get project pipeline stage counts
      const projectPipeline = await AnalyticsService.getProjectPipeline();

      // Get revenue over time for the chart
      const revenueOverTime = await AnalyticsService.getRevenueOverTime(period);

      // Pending creator APPLICATIONS (distinct from Creator.verification.status —
      // an approved application creates a Creator that may still be unverified)
      const pendingApplicationsResult = await CreatorApplicationService.listApplications({ status: 'pending', page: 1, limit: 1 });
      const pendingApplications = pendingApplicationsResult.pagination.total;

      // Get recent admin activity (real audit log entries) — VIEW actions are
      // excluded here since they fire on every page load and would drown out
      // meaningful state-changing events like approvals or tier changes.
      const recentActivityResult = await AdminService.getAuditLogs(
        { page: 1, limit: 20 },
        metadata.adminId,
        metadata.adminEmail,
        metadata.ipAddress,
        metadata.userAgent
      );
      const recentActivity = recentActivityResult.logs.filter((log: any) => log.action !== 'VIEW').slice(0, 6);

      res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved',
        data: {
          kpis,
          topCreators,
          funnel,
          tierDistribution,
          projectPipeline,
          revenueOverTime,
          recentActivity,
          pendingApplications,
          period,
        },
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Admin dashboard retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get analytics data
   * GET /api/admin/analytics
   */
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'month', startDate, endDate } = req.query;

      let customDates: any = undefined;
      if (startDate && endDate) {
        customDates = {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        };
      }

      const kpis = await AnalyticsService.getAllKPIs(period as any, customDates);
      const revenueOverTime = await AnalyticsService.getRevenueOverTime(period as any);
      const marketplaceStats = await AnalyticsService.getMarketplaceStats();

      res.status(200).json({
        success: true,
        message: 'Analytics retrieved',
        data: {
          kpis,
          revenueOverTime,
          marketplaceStats,
          period,
        },
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Analytics data retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============ CLIENT MANAGEMENT ============
   */

  /**
   * Get all clients
   * GET /api/admin/clients
   */
  static async getClients(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.getAllClients(req.query as any, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Clients retrieved',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Clients list retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single client
   * GET /api/admin/clients/:id
   */
  static async getClient(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const client = await AdminService.getClientDetails(req.params.id, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Client retrieved',
        data: client,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Client retrieved: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update client
   * PUT /api/admin/clients/:id
   */
  static async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const client = await AdminService.updateClient(req.params.id, req.body, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Client updated',
        data: client,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Client updated: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suspend client
   * POST /api/admin/clients/:id/suspend
   */
  static async suspendClient(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.suspendClient(req.params.id, req.body.reason || 'Administrative suspension', metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Client suspended',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Client suspended: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reactivate client
   * POST /api/admin/clients/:id/reactivate
   */
  static async reactivateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.reactivateClient(req.params.id, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Client reactivated',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Client reactivated: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete client
   * DELETE /api/admin/clients/:id
   */
  static async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.deleteClient(req.params.id, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Client deleted',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Client deleted: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============ CREATOR MANAGEMENT ============
   */

  /**
   * Create new creator
   * POST /api/admin/creators
   */
  static async createCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.createCreatorAccount(req.body, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(201).json({
        success: true,
        message: 'Creator account created',
        data: result,
        statusCode: 201,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator account created: ${req.body.email}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all creators
   * GET /api/admin/creators
   */
  static async getCreators(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.getAllCreators(req.query as any, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Creators retrieved',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Creators list retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single creator
   * GET /api/admin/creators/:id
   */
  static async getCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const creator = await AdminService.getCreatorDetails(req.params.id, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Creator retrieved',
        data: creator,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator retrieved: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify creator profile
   * POST /api/admin/creators/:id/verify
   */
  static async verifyCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.verifyCreator(req.params.id, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Creator verified',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator verified: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject creator profile
   * POST /api/admin/creators/:id/reject
   */
  static async rejectCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.rejectCreator(req.params.id, req.body.reason || 'Rejected by admin', metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Creator rejected',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator rejected: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suspend creator profile
   * POST /api/admin/creators/:id/suspend
   */
  static async suspendCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.suspendCreator(req.params.id, req.body.reason || 'Administrative suspension', metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Creator suspended',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator suspended: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete creator
   * DELETE /api/admin/creators/:id
   */
  static async deleteCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.deleteCreator(req.params.id, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Creator deleted',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator deleted: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============ PROJECT MANAGEMENT ============
   */

  /**
   * Get all projects
   * GET /api/admin/projects
   */
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.getAllProjects(req.query as any, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Projects retrieved',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Projects list retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update project status
   * PUT /api/admin/projects/:id/status
   */
  static async updateProjectStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const result = await AdminService.updateProjectStatus(req.params.id, req.body.status, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Project status updated',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Project status updated: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============ PLATFORM STATISTICS ============
   */

  /**
   * Get platform statistics
   * GET /api/admin/stats
   */
  static async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const stats = await AdminService.getPlatformStats(metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Platform statistics retrieved',
        data: stats,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Platform statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs
   * GET /api/admin/audit-logs
   */
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const logs = await AdminService.getAuditLogs(req.query as any, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);

      res.status(200).json({
        success: true,
        message: 'Audit logs retrieved',
        data: logs,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info('✅ Audit logs retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============ CREATOR APPLICATIONS ============
   */

  static async listCreatorApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CreatorApplicationService.listApplications(req.query as any);
      res.status(200).json({ success: true, message: 'Creator applications retrieved', data: result, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  static async getCreatorApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await CreatorApplicationService.getApplicationById(req.params.id);
      res.status(200).json({ success: true, message: 'Creator application retrieved', data: application, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  static async downloadCreatorApplicationFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { file, absolutePath } = await CreatorApplicationService.getApplicationFile(req.params.id, req.params.fileId);
      if (!fs.existsSync(absolutePath)) {
        throw new NotFoundError('File');
      }
      res.setHeader('Content-Type', file.fileType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
      fs.createReadStream(absolutePath).pipe(res);
    } catch (error) {
      next(error);
    }
  }

  static async approveCreatorApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const { tierId, approvedAmount, availability } = req.body;
      const result = await CreatorApplicationService.approveApplication(
        req.params.id,
        { tierId, approvedAmount: Number(approvedAmount), availability },
        { adminId: metadata.adminId, adminEmail: metadata.adminEmail, ipAddress: metadata.ipAddress, userAgent: metadata.userAgent }
      );
      res.status(200).json({
        success: true,
        message: 'Creator application approved',
        data: {
          creatorId: result.creator._id,
          userId: result.user._id,
          temporaryPassword: result.temporaryPassword,
        },
        statusCode: 200,
        timestamp: new Date(),
      });
      logger.info(`✅ Creator application approved: ${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }

  static async rejectCreatorApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const application = await CreatorApplicationService.rejectApplication(
        req.params.id,
        req.body.reason,
        { adminId: metadata.adminId, adminEmail: metadata.adminEmail, ipAddress: metadata.ipAddress, userAgent: metadata.userAgent }
      );
      res.status(200).json({ success: true, message: 'Creator application rejected', data: application, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  static async requestCreatorApplicationChanges(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const application = await CreatorApplicationService.requestChanges(
        req.params.id,
        req.body.notes,
        { adminId: metadata.adminId, adminEmail: metadata.adminEmail, ipAddress: metadata.ipAddress, userAgent: metadata.userAgent }
      );
      res.status(200).json({ success: true, message: 'Changes requested from applicant', data: application, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============ CREATOR TIERS ============
   */

  static async listCreatorTiers(req: Request, res: Response, next: NextFunction) {
    try {
      const tiers = await AdminService.listCreatorTiers();
      res.status(200).json({ success: true, message: 'Creator tiers retrieved', data: { tiers }, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  static async createCreatorTier(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const tier = await AdminService.createCreatorTier(req.body, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);
      res.status(201).json({ success: true, message: 'Creator tier created', data: tier, statusCode: 201, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  static async updateCreatorTier(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const tier = await AdminService.updateCreatorTier(req.params.id, req.body, metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent);
      res.status(200).json({ success: true, message: 'Creator tier updated', data: tier, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ============ CREATOR PRICING & TIER ASSIGNMENT ============
   */

  static async getCreatorPricingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getCreatorPricingHistory(req.params.id);
      res.status(200).json({ success: true, message: 'Pricing history retrieved', data, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  static async approveCreatorPricing(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const creator = await AdminService.approveCreatorPricing(
        req.params.id,
        { approvedAmount: Number(req.body.approvedAmount), reason: req.body.reason },
        metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent
      );
      res.status(200).json({ success: true, message: 'Creator pricing approved', data: creator, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  static async rejectCreatorPricing(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const creator = await AdminService.rejectCreatorPricing(
        req.params.id, req.body.reason,
        metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent
      );
      res.status(200).json({ success: true, message: 'Creator pricing rejected', data: creator, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }

  static async changeCreatorTier(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = AdminController.getRequestMetadata(req);
      const creator = await AdminService.changeCreatorTier(
        req.params.id,
        { tierId: req.body.tierId, reason: req.body.reason },
        metadata.adminId, metadata.adminEmail, metadata.ipAddress, metadata.userAgent
      );
      res.status(200).json({ success: true, message: 'Creator tier updated', data: creator, statusCode: 200, timestamp: new Date() });
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;
