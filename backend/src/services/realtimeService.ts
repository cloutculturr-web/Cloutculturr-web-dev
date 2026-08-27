import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '@/utils/logger.js';

/**
 * Real-time Service
 * Manages WebSocket connections and real-time updates for admin dashboard
 */

interface AdminSocketData {
  adminId: string;
  email: string;
  role: string;
  connectedAt: Date;
}

export class RealtimeService {
  private io: SocketIOServer | null = null;
  private adminConnections: Map<string, Socket[]> = new Map();

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('✅ Real-time service initialized');
    return this.io;
  }

  /**
   * Setup middleware for authentication
   */
  private setupMiddleware() {
    if (!this.io) return;

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      const adminId = socket.handshake.auth.adminId;

      if (!token || !adminId) {
        return next(new Error('Authentication error'));
      }

      // TODO: Validate token with your auth service
      socket.data = {
        adminId,
        token,
        connectedAt: new Date()
      };

      next();
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const adminId = socket.data.adminId;

      logger.info(`✅ Admin connected: ${adminId}`);

      // Track admin connections
      if (!this.adminConnections.has(adminId)) {
        this.adminConnections.set(adminId, []);
      }
      this.adminConnections.get(adminId)?.push(socket);

      // Join admin-specific room
      socket.join(`admin:${adminId}`);
      socket.join('admin:all'); // Global admin notifications

      // Handle dashboard updates subscription
      socket.on('subscribe:dashboard', () => {
        socket.join('dashboard:updates');
        logger.info(`✅ Admin ${adminId} subscribed to dashboard updates`);
      });

      // Handle analytics updates subscription
      socket.on('subscribe:analytics', () => {
        socket.join('analytics:updates');
        logger.info(`✅ Admin ${adminId} subscribed to analytics updates`);
      });

      // Handle notifications subscription
      socket.on('subscribe:notifications', () => {
        socket.join('notifications:updates');
        logger.info(`✅ Admin ${adminId} subscribed to notifications`);
      });

      // Handle security events subscription
      socket.on('subscribe:security', () => {
        socket.join('security:updates');
        logger.info(`✅ Admin ${adminId} subscribed to security events`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const connections = this.adminConnections.get(adminId) || [];
        const index = connections.indexOf(socket);
        if (index > -1) {
          connections.splice(index, 1);
        }
        logger.info(`✅ Admin disconnected: ${adminId}`);
      });

      // Send connection confirmation
      socket.emit('connected', {
        message: 'Connected to real-time service',
        timestamp: new Date()
      });
    });
  }

  /**
   * Broadcast KPI updates to dashboard subscribers
   */
  broadcastKPIUpdate(kpis: any) {
    if (!this.io) return;

    this.io.to('dashboard:updates').emit('kpi:update', {
      data: kpis,
      timestamp: new Date()
    });

    logger.info('📊 KPI update broadcasted');
  }

  /**
   * Broadcast revenue analytics update
   */
  broadcastRevenueUpdate(analytics: any) {
    if (!this.io) return;

    this.io.to('analytics:updates').emit('revenue:update', {
      data: analytics,
      timestamp: new Date()
    });

    logger.info('💰 Revenue update broadcasted');
  }

  /**
   * Broadcast user analytics update
   */
  broadcastUserAnalyticsUpdate(analytics: any) {
    if (!this.io) return;

    this.io.to('analytics:updates').emit('users:update', {
      data: analytics,
      timestamp: new Date()
    });

    logger.info('👥 User analytics update broadcasted');
  }

  /**
   * Broadcast project analytics update
   */
  broadcastProjectAnalyticsUpdate(analytics: any) {
    if (!this.io) return;

    this.io.to('analytics:updates').emit('projects:update', {
      data: analytics,
      timestamp: new Date()
    });

    logger.info('📁 Project analytics update broadcasted');
  }

  /**
   * Broadcast notification to specific target
   */
  broadcastNotification(notification: any, target: string = 'all') {
    if (!this.io) return;

    const roomMap: Record<string, string> = {
      all: 'notifications:updates',
      creators: 'notifications:creators',
      clients: 'notifications:clients',
      admins: 'notifications:admins',
      members: 'notifications:members'
    };

    const room = roomMap[target] || 'notifications:updates';
    this.io.to(room).emit('notification:new', {
      data: notification,
      timestamp: new Date()
    });

    logger.info(`📢 Notification broadcasted to ${target}`);
  }

  /**
   * Broadcast security alert
   */
  broadcastSecurityAlert(alert: any) {
    if (!this.io) return;

    this.io.to('security:updates').emit('security:alert', {
      data: alert,
      timestamp: new Date()
    });

    logger.info('🔒 Security alert broadcasted');
  }

  /**
   * Broadcast failed login attempt
   */
  broadcastFailedLogin(attempt: any) {
    if (!this.io) return;

    this.io.to('security:updates').emit('login:failed', {
      data: attempt,
      timestamp: new Date()
    });

    logger.info('⚠️ Failed login attempt broadcasted');
  }

  /**
   * Broadcast user blocked event
   */
  broadcastUserBlocked(blockedUser: any) {
    if (!this.io) return;

    this.io.to('security:updates').emit('user:blocked', {
      data: blockedUser,
      timestamp: new Date()
    });

    logger.info('🚫 User blocked event broadcasted');
  }

  /**
   * Broadcast activity event
   */
  broadcastActivity(activity: any) {
    if (!this.io) return;

    this.io.to('dashboard:updates').emit('activity:new', {
      data: activity,
      timestamp: new Date()
    });

    logger.info('📝 Activity broadcasted');
  }

  /**
   * Broadcast backup completion
   */
  broadcastBackupCompleted(backup: any) {
    if (!this.io) return;

    this.io.to('admin:all').emit('backup:completed', {
      data: backup,
      timestamp: new Date()
    });

    logger.info('💾 Backup completion broadcasted');
  }

  /**
   * Broadcast report generation completion
   */
  broadcastReportCompleted(report: any) {
    if (!this.io) return;

    this.io.to('admin:all').emit('report:completed', {
      data: report,
      timestamp: new Date()
    });

    logger.info('📄 Report completion broadcasted');
  }

  /**
   * Broadcast CMS content published
   */
  broadcastContentPublished(content: any) {
    if (!this.io) return;

    this.io.to('admin:all').emit('cms:published', {
      data: content,
      timestamp: new Date()
    });

    logger.info('📰 CMS content published broadcasted');
  }

  /**
   * Broadcast marketplace feature update
   */
  broadcastMarketplaceUpdate(feature: any) {
    if (!this.io) return;

    this.io.to('admin:all').emit('marketplace:update', {
      data: feature,
      timestamp: new Date()
    });

    logger.info('🏪 Marketplace update broadcasted');
  }

  /**
   * Broadcast system settings update
   */
  broadcastSettingsUpdate(settings: any) {
    if (!this.io) return;

    this.io.to('admin:all').emit('settings:update', {
      data: settings,
      timestamp: new Date()
    });

    logger.info('⚙️ Settings update broadcasted');
  }

  /**
   * Send direct message to specific admin
   */
  sendToAdmin(adminId: string, event: string, data: any) {
    if (!this.io) return;

    this.io.to(`admin:${adminId}`).emit(event, {
      data,
      timestamp: new Date()
    });

    logger.info(`📤 Message sent to admin ${adminId}: ${event}`);
  }

  /**
   * Get active admin connections count
   */
  getActiveAdminCount(): number {
    let count = 0;
    this.adminConnections.forEach(connections => {
      count += connections.length;
    });
    return count;
  }

  /**
   * Get admin connection count by ID
   */
  getAdminConnectionCount(adminId: string): number {
    return this.adminConnections.get(adminId)?.length || 0;
  }

  /**
   * Get socket IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
