import Notification from '@/models/Notification.js';
import User from '@/models/User.js';
import { NotFoundError, ValidationError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

interface CreateNotificationPayload {
  userId: string;
  type: 'account' | 'project' | 'booking' | 'meeting' | 'membership' | 'announcement' | 'payment' | 'system' | 'creator_approval';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: {
    projectId?: string;
    creatorId?: string;
    paymentId?: string;
  };
}

export class NotificationService {
  /**
   * Create notification
   */
  static async createNotification(payload: CreateNotificationPayload) {
    try {
      // Verify user exists
      const user = await User.findById(payload.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      const notification = new Notification({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        actionUrl: payload.actionUrl || '',
        status: 'unread',
        metadata: payload.metadata || {},
      });

      await notification.save();

      logger.info(`✅ Notification created for user: ${payload.userId}`);

      return notification;
    } catch (error) {
      logger.error('Notification creation error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit: number = 20, includeRead: boolean = false) {
    try {
      const query: any = { userId };

      if (!includeRead) {
        query.status = 'unread';
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return notifications;
    } catch (error) {
      logger.error('Notifications fetch error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        {
          status: 'read',
          readAt: new Date(),
        },
        { new: true }
      );

      if (!notification) {
        throw new NotFoundError('Notification');
      }

      logger.info(`✅ Notification marked as read: ${notificationId}`);

      return notification;
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read — scoped to the owning user in a single query,
   * so a user can never mark (or even detect the existence of) another
   * user's notification by guessing an ID.
   */
  static async markAsReadForUser(userId: string, notificationId: string) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { status: 'read', readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new NotFoundError('Notification');
      }

      logger.info(`✅ Notification marked as read: ${notificationId} for user ${userId}`);

      return notification;
    } catch (error) {
      logger.error('Mark as read (scoped) error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string) {
    try {
      await Notification.updateMany({ userId, status: 'unread' }, { status: 'read', readAt: new Date() });

      logger.info(`✅ All notifications marked as read for user: ${userId}`);

      return { success: true };
    } catch (error) {
      logger.error('Mark all as read error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);

      if (!notification) {
        throw new NotFoundError('Notification');
      }

      logger.info(`✅ Notification deleted: ${notificationId}`);

      return notification;
    } catch (error) {
      logger.error('Notification delete error:', error);
      throw error;
    }
  }

  /**
   * Delete old read notifications
   */
  static async deleteOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        status: 'read',
        readAt: { $lt: cutoffDate },
      });

      logger.info(`✅ Old notifications deleted: ${result.deletedCount} records`);

      return { deletedCount: result.deletedCount };
    } catch (error) {
      logger.error('Old notification deletion error:', error);
      throw error;
    }
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: string) {
    try {
      const count = await Notification.countDocuments({
        userId,
        status: 'unread',
      });

      return { unreadCount: count };
    } catch (error) {
      logger.error('Unread count error:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications (admin feature)
   */
  static async sendBulkNotification(userIds: string[], payload: Omit<CreateNotificationPayload, 'userId'>) {
    try {
      const notifications = await Notification.insertMany(
        userIds.map((userId) => ({
          userId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          actionUrl: payload.actionUrl || '',
          status: 'unread',
          metadata: payload.metadata || {},
        }))
      );

      logger.info(`✅ Bulk notifications sent to ${userIds.length} users`);

      return { sentCount: notifications.length };
    } catch (error) {
      logger.error('Bulk notification error:', error);
      throw error;
    }
  }

  /**
   * Send system announcement (admin only)
   */
  static async sendSystemAnnouncement(title: string, message: string, targetRole?: 'admin' | 'creator' | 'client') {
    try {
      const query: any = {};

      if (targetRole) {
        query.role = targetRole;
      }

      const users = await User.find(query).select('_id').lean();
      const userIds = users.map((user) => user._id.toString());

      const result = await this.sendBulkNotification(userIds, {
        type: 'announcement',
        title,
        message,
      });

      logger.info(`✅ System announcement sent to ${result.sentCount} users`);

      return result;
    } catch (error) {
      logger.error('System announcement error:', error);
      throw error;
    }
  }

  /**
   * Send creator approval notification (admin)
   */
  static async sendCreatorApprovalNotification(userId: string, approved: boolean) {
    try {
      const title = approved ? 'Profile Approved! 🎉' : 'Profile Under Review';
      const message = approved
        ? 'Your creator profile has been approved by Cloutculturr. You can now start receiving projects!'
        : 'Your creator profile is under review. Our team will verify your details shortly.';

      const notification = await this.createNotification({
        userId,
        type: 'creator_approval',
        title,
        message,
        metadata: {
          creatorId: userId,
        },
      });

      return notification;
    } catch (error) {
      logger.error('Creator approval notification error:', error);
      throw error;
    }
  }

  /**
   * Send project status notification
   */
  static async sendProjectNotification(userId: string, projectTitle: string, status: string, projectId?: string) {
    try {
      const statusMessages: any = {
        enquiry: `New project enquiry: "${projectTitle}" has been submitted.`,
        quoted: `Quotation for "${projectTitle}" is ready for your review.`,
        approved: `Project "${projectTitle}" has been approved and is ready to start.`,
        active: `Project "${projectTitle}" is now in progress.`,
        completed: `Project "${projectTitle}" has been completed successfully!`,
        archived: `Project "${projectTitle}" has been archived.`,
      };

      const notification = await this.createNotification({
        userId,
        type: 'project',
        title: `Project Update: ${projectTitle}`,
        message: statusMessages[status] || `Project "${projectTitle}" status updated to ${status}.`,
        metadata: {
          projectId: projectId || '',
        },
      });

      return notification;
    } catch (error) {
      logger.error('Project notification error:', error);
      throw error;
    }
  }

  /**
   * Send payment notification
   */
  static async sendPaymentNotification(userId: string, amount: number, status: 'successful' | 'failed', paymentId?: string) {
    try {
      const title = status === 'successful' ? '💳 Payment Successful' : '❌ Payment Failed';
      const message =
        status === 'successful'
          ? `Payment of ₹${amount} has been received successfully.`
          : `Payment of ₹${amount} could not be processed. Please try again.`;

      const notification = await this.createNotification({
        userId,
        type: 'payment',
        title,
        message,
        metadata: {
          paymentId: paymentId || '',
        },
      });

      return notification;
    } catch (error) {
      logger.error('Payment notification error:', error);
      throw error;
    }
  }

  /**
   * Send membership notification
   */
  static async sendMembershipNotification(userId: string, type: 'activated' | 'expiring' | 'expired', expiryDate?: Date) {
    try {
      const messages: any = {
        activated: {
          title: '✨ Premium Activated',
          message: 'You now have access to unlimited creator profiles and advanced features!',
        },
        expiring: {
          title: '⏰ Membership Expiring Soon',
          message: `Your premium membership will expire on ${expiryDate?.toLocaleDateString()}. Renew now to continue enjoying premium features.`,
        },
        expired: {
          title: '⏱️ Membership Expired',
          message: 'Your premium membership has expired. Upgrade now to regain access to all features.',
        },
      };

      const notification = await this.createNotification({
        userId,
        type: 'membership',
        title: messages[type].title,
        message: messages[type].message,
      });

      return notification;
    } catch (error) {
      logger.error('Membership notification error:', error);
      throw error;
    }
  }
}

export default NotificationService;
