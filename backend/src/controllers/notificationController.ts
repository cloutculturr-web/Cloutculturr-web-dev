import { Request, Response, NextFunction } from 'express';
import NotificationService from '@/services/notificationService.js';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

/**
 * Notification endpoints — shared across all authenticated roles.
 * Every method is scoped to req.user.userId; a user can never read or
 * mutate another user's notifications.
 */
export class NotificationController {
  /**
   * GET /api/notifications
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const includeRead = req.query.includeRead === 'true';

      const notifications = await NotificationService.getUserNotifications(userId, limit, includeRead);

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved',
        data: notifications,
        statusCode: 200,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   */
  static async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const result = await NotificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        message: 'Unread count retrieved',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/notifications/:id/read
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const notification = await NotificationService.markAsReadForUser(userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Notification marked as read for user: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/notifications/read-all
   */
  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new AppError('User not authenticated', 401);

      const result = await NotificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ All notifications marked as read for user: ${userId}`);
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
