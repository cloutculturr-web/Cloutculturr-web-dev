import { Request, Response, NextFunction } from 'express';
import {
  CMSContent,
  Notification,
  LoginSession,
  FailedLoginAttempt,
  BlockedUser,
  SystemSettings,
  BackupRecord,
  ReportHistory,
  MarketplaceFeature,
} from '@/models/AdminDashboard';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

/**
 * Admin Operations Controller
 * Comprehensive API endpoints for all admin dashboard operations
 * CMS, Notifications, Security, Settings, Reports, Marketplace
 */

// ============================================
// CMS MANAGEMENT ENDPOINTS
// ============================================

export class CMSController {
  static async getContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { section, status, limit = 50, skip = 0 } = req.query;

      const filter: any = {};
      if (section) filter.section = section;
      if (status) filter.status = status;

      const content = await CMSContent.find(filter)
        .populate('author', 'email name')
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ createdAt: -1 });

      const total = await CMSContent.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: content,
        pagination: { total, limit: parseInt(limit as string), skip: parseInt(skip as string) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async createContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, section, content, metadata } = req.body;

      const newContent = await CMSContent.create({
        title,
        section,
        content,
        metadata,
        author: req.adminUser?.id,
        status: 'draft'
      });

      logger.info(`[CMS] Content created: ${title}`);

      res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: newContent
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await CMSContent.findByIdAndUpdate(id, updates, { new: true });

      if (!updated) {
        throw new AppError('Content not found', 404);
      }

      logger.info(`[CMS] Content updated: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Content updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async publishContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const updated = await CMSContent.findByIdAndUpdate(
        id,
        { status: 'published', publishedAt: new Date() },
        { new: true }
      );

      if (!updated) {
        throw new AppError('Content not found', 404);
      }

      logger.info(`[CMS] Content published: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Content published successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const deleted = await CMSContent.findByIdAndDelete(id);

      if (!deleted) {
        throw new AppError('Content not found', 404);
      }

      logger.info(`[CMS] Content deleted: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

// ============================================
// NOTIFICATION MANAGEMENT ENDPOINTS
// ============================================

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, status, limit = 50, skip = 0 } = req.query;

      const filter: any = {};
      if (type) filter.type = type;
      if (status) filter.status = status;

      const notifications = await Notification.find(filter)
        .populate('createdBy', 'email name')
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ createdAt: -1 });

      const total = await Notification.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: { total, limit: parseInt(limit as string), skip: parseInt(skip as string) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, message, type, target, scheduledFor } = req.body;

      const notification = await Notification.create({
        title,
        message,
        type,
        target,
        status: scheduledFor ? 'scheduled' : 'sent',
        scheduledFor,
        sentAt: scheduledFor ? undefined : new Date(),
        createdBy: req.adminUser?.id,
        recipientCount: 1000, // Mock
        readCount: 0
      });

      logger.info(`[NOTIFICATION] Sent: ${title} to ${target}`);

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await Notification.findByIdAndUpdate(id, updates, { new: true });

      if (!updated) {
        throw new AppError('Notification not found', 404);
      }

      logger.info(`[NOTIFICATION] Updated: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Notification updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await Notification.findByIdAndDelete(id);

      logger.info(`[NOTIFICATION] Deleted: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

// ============================================
// SECURITY MANAGEMENT ENDPOINTS
// ============================================

export class SecurityController {
  static async getLoginSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, status, limit = 50, skip = 0 } = req.query;

      const filter: any = {};
      if (userId) filter.userId = userId;
      if (status) filter.status = status;

      const sessions = await LoginSession.find(filter)
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ loginTime: -1 });

      const total = await LoginSession.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: sessions,
        pagination: { total, limit: parseInt(limit as string), skip: parseInt(skip as string) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;

      const updated = await LoginSession.findByIdAndUpdate(
        sessionId,
        { status: 'revoked' },
        { new: true }
      );

      if (!updated) {
        throw new AppError('Session not found', 404);
      }

      logger.info(`[SECURITY] Session revoked: ${sessionId}`);

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFailedLoginAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, ipAddress, limit = 50, skip = 0 } = req.query;

      const filter: any = {};
      if (email) filter.email = email;
      if (ipAddress) filter.ipAddress = ipAddress;

      const attempts = await FailedLoginAttempt.find(filter)
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ timestamp: -1 });

      const total = await FailedLoginAttempt.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: attempts,
        pagination: { total, limit: parseInt(limit as string), skip: parseInt(skip as string) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { reason, unblockAt } = req.body;

      const blocked = await BlockedUser.findOneAndUpdate(
        { userId },
        {
          reason,
          blockedAt: new Date(),
          blockedBy: req.adminUser?.id,
          unblockAt,
          status: 'blocked'
        },
        { upsert: true, new: true }
      );

      logger.info(`[SECURITY] User blocked: ${userId}, Reason: ${reason}`);

      res.status(200).json({
        success: true,
        message: 'User blocked successfully',
        data: blocked
      });
    } catch (error) {
      next(error);
    }
  }

  static async unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const updated = await BlockedUser.findOneAndUpdate(
        { userId },
        { status: 'unblocked', unblockAt: new Date() },
        { new: true }
      );

      logger.info(`[SECURITY] User unblocked: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'User unblocked successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBlockedUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { status = 'blocked', limit = 50, skip = 0 } = req.query;

      const blocked = await BlockedUser.find({ status })
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ blockedAt: -1 });

      const total = await BlockedUser.countDocuments({ status });

      res.status(200).json({
        success: true,
        data: blocked,
        pagination: { total, limit: parseInt(limit as string), skip: parseInt(skip as string) }
      });
    } catch (error) {
      next(error);
    }
  }
}

// ============================================
// SYSTEM SETTINGS ENDPOINTS
// ============================================

export class SettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SystemSettings.findOne();

      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updates = req.body;

      const settings = await SystemSettings.findOneAndUpdate(
        {},
        {
          ...updates,
          updatedAt: new Date(),
          updatedBy: req.adminUser?.id
        },
        { new: true, upsert: true }
      );

      logger.info(`[SETTINGS] Updated by ${req.adminUser?.email}`);

      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBackups(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, limit = 50, skip = 0 } = req.query;

      const filter: any = {};
      if (status) filter.status = status;

      const backups = await BackupRecord.find(filter)
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ timestamp: -1 });

      const total = await BackupRecord.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: backups,
        pagination: { total, limit: parseInt(limit as string), skip: parseInt(skip as string) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async triggerBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { type = 'full' } = req.body;

      // Create backup record
      const backup = await BackupRecord.create({
        type,
        status: 'in_progress',
        timestamp: new Date(),
        size: 0,
        duration: 0,
        location: `/backups/${new Date().toISOString()}`,
        checksum: '',
        retentionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // TODO: Trigger actual backup process
      logger.info(`[BACKUP] Backup initiated: ${backup._id}, Type: ${type}`);

      res.status(202).json({
        success: true,
        message: 'Backup initiated successfully',
        data: backup
      });
    } catch (error) {
      next(error);
    }
  }
}

// ============================================
// REPORTS ENDPOINTS
// ============================================

export class ReportsController {
  static async getReportHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType, format, limit = 50, skip = 0 } = req.query;

      const filter: any = {};
      if (reportType) filter.reportType = reportType;
      if (format) filter.format = format;

      const reports = await ReportHistory.find(filter)
        .populate('generatedBy', 'email name')
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ createdAt: -1 });

      const total = await ReportHistory.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: reports,
        pagination: { total, limit: parseInt(limit as string), skip: parseInt(skip as string) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType, format, startDate, endDate } = req.body;

      const report = await ReportHistory.create({
        reportType,
        format,
        generatedBy: req.adminUser?.id,
        dateRange: { start: new Date(startDate), end: new Date(endDate) },
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // TODO: Trigger report generation job
      logger.info(`[REPORT] Report generation started: ${reportType} in ${format}`);

      res.status(202).json({
        success: true,
        message: 'Report generation started',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params;

      const report = await ReportHistory.findById(reportId);

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      if (report.status !== 'completed') {
        throw new AppError('Report is not ready for download', 400);
      }

      // TODO: Implement actual file download
      logger.info(`[REPORT] Report downloaded: ${reportId}`);

      res.status(200).json({
        success: true,
        message: 'Report ready for download',
        downloadUrl: report.downloadUrl
      });
    } catch (error) {
      next(error);
    }
  }
}

// ============================================
// MARKETPLACE ENDPOINTS
// ============================================

export class MarketplaceController {
  static async getFeaturedCreators(req: Request, res: Response, next: NextFunction) {
    try {
      const { status = 'featured', limit = 50, skip = 0 } = req.query;

      const features = await MarketplaceFeature.find({ status })
        .populate('creatorId', 'name email specialization rating')
        .limit(parseInt(limit as string))
        .skip(parseInt(skip as string))
        .sort({ position: 1 });

      const total = await MarketplaceFeature.countDocuments({ status });

      res.status(200).json({
        success: true,
        data: features,
        pagination: { total, limit: parseInt(limit as string), skip: parseInt(skip as string) }
      });
    } catch (error) {
      next(error);
    }
  }

  static async featureCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const { creatorId } = req.params;
      const { status = 'featured', expiresAt, category } = req.body;

      const feature = await MarketplaceFeature.findOneAndUpdate(
        { creatorId },
        {
          status,
          featuredAt: new Date(),
          expiresAt,
          category,
          position: 0
        },
        { upsert: true, new: true }
      );

      logger.info(`[MARKETPLACE] Creator featured: ${creatorId}, Status: ${status}`);

      res.status(200).json({
        success: true,
        message: 'Creator featured successfully',
        data: feature
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const { creatorId } = req.params;

      await MarketplaceFeature.findOneAndUpdate(
        { creatorId },
        { status: 'standard' }
      );

      logger.info(`[MARKETPLACE] Feature removed: ${creatorId}`);

      res.status(200).json({
        success: true,
        message: 'Feature removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMarketplaceStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { creatorId } = req.params;
      const { impressions, clicks, conversionRate } = req.body;

      const updated = await MarketplaceFeature.findOneAndUpdate(
        { creatorId },
        { impressions, clicks, conversionRate },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Marketplace stats updated',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}

export default {
  CMSController,
  NotificationController,
  SecurityController,
  SettingsController,
  ReportsController,
  MarketplaceController
};
