import { useEffect, useCallback, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

/**
 * Real-time Hook
 * Manages WebSocket connection and subscribes to real-time events
 */

interface UseRealtimeOptions {
  adminId: string;
  token: string;
  url?: string;
  autoConnect?: boolean;
}

interface RealtimeEvents {
  'kpi:update': (data: any) => void;
  'revenue:update': (data: any) => void;
  'users:update': (data: any) => void;
  'projects:update': (data: any) => void;
  'notification:new': (data: any) => void;
  'security:alert': (data: any) => void;
  'login:failed': (data: any) => void;
  'user:blocked': (data: any) => void;
  'activity:new': (data: any) => void;
  'backup:completed': (data: any) => void;
  'report:completed': (data: any) => void;
  'cms:published': (data: any) => void;
  'marketplace:update': (data: any) => void;
  'settings:update': (data: any) => void;
  'connected': (data: any) => void;
  'error': (data: any) => void;
}

export const useRealtime = (options: UseRealtimeOptions) => {
  const { adminId, token, url = 'http://localhost:4000', autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const listenersRef = useRef<Map<keyof RealtimeEvents, Set<Function>>>(new Map());

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected || isConnecting) return;

    setIsConnecting(true);

    socketRef.current = io(url, {
      auth: {
        token,
        adminId
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to real-time service');
      setIsConnected(true);
      setIsConnecting(false);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from real-time service');
      setIsConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('🔴 Real-time connection error:', error);
      setIsConnecting(false);
    });

    return socketRef.current;
  }, [adminId, token, url, isConnecting]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  /**
   * Subscribe to dashboard updates
   */
  const subscribeToDashboard = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:dashboard');
    }
  }, []);

  /**
   * Subscribe to analytics updates
   */
  const subscribeToAnalytics = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:analytics');
    }
  }, []);

  /**
   * Subscribe to notifications
   */
  const subscribeToNotifications = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:notifications');
    }
  }, []);

  /**
   * Subscribe to security events
   */
  const subscribeToSecurity = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:security');
    }
  }, []);

  /**
   * Register event listener
   */
  const on = useCallback(
    <K extends keyof RealtimeEvents>(event: K, callback: RealtimeEvents[K]) => {
      if (!listenerRef.current.has(event)) {
        listenersRef.current.set(event, new Set());
      }

      listenersRef.current.get(event)?.add(callback as Function);

      // Setup socket listener if not already set up
      if (socketRef.current && !socketRef.current.hasListeners(event)) {
        socketRef.current.on(event, (payload) => {
          listenersRef.current.get(event)?.forEach(cb => {
            (cb as Function)(payload);
          });
        });
      }

      // Return unsubscribe function
      return () => {
        listenersRef.current.get(event)?.delete(callback as Function);
      };
    },
    []
  );

  /**
   * Initialize auto-connection
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    on,
    subscribeToDashboard,
    subscribeToAnalytics,
    subscribeToNotifications,
    subscribeToSecurity,
    socket: socketRef.current
  };
};

/**
 * Hook for subscribing to KPI updates
 */
export const useKPIUpdates = (onUpdate: (kpis: any) => void) => {
  const realtime = useRealtime({
    adminId: 'current-admin', // Replace with actual admin ID
    token: 'current-token' // Replace with actual token
  });

  useEffect(() => {
    const unsubscribe = realtime.on('kpi:update', onUpdate);
    realtime.subscribeToDashboard();

    return unsubscribe;
  }, [realtime, onUpdate]);

  return realtime;
};

/**
 * Hook for subscribing to analytics updates
 */
export const useAnalyticsUpdates = (
  onRevenueUpdate?: (data: any) => void,
  onUserUpdate?: (data: any) => void,
  onProjectUpdate?: (data: any) => void
) => {
  const realtime = useRealtime({
    adminId: 'current-admin',
    token: 'current-token'
  });

  useEffect(() => {
    const unsubscribers = [];

    if (onRevenueUpdate) {
      unsubscribers.push(realtime.on('revenue:update', onRevenueUpdate));
    }

    if (onUserUpdate) {
      unsubscribers.push(realtime.on('users:update', onUserUpdate));
    }

    if (onProjectUpdate) {
      unsubscribers.push(realtime.on('projects:update', onProjectUpdate));
    }

    realtime.subscribeToAnalytics();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [realtime, onRevenueUpdate, onUserUpdate, onProjectUpdate]);

  return realtime;
};

/**
 * Hook for subscribing to notifications
 */
export const useNotificationUpdates = (onNotification: (notification: any) => void) => {
  const realtime = useRealtime({
    adminId: 'current-admin',
    token: 'current-token'
  });

  useEffect(() => {
    const unsubscribe = realtime.on('notification:new', onNotification);
    realtime.subscribeToNotifications();

    return unsubscribe;
  }, [realtime, onNotification]);

  return realtime;
};

/**
 * Hook for subscribing to security events
 */
export const useSecurityUpdates = (
  onAlert?: (alert: any) => void,
  onFailedLogin?: (attempt: any) => void,
  onUserBlocked?: (user: any) => void
) => {
  const realtime = useRealtime({
    adminId: 'current-admin',
    token: 'current-token'
  });

  useEffect(() => {
    const unsubscribers = [];

    if (onAlert) {
      unsubscribers.push(realtime.on('security:alert', onAlert));
    }

    if (onFailedLogin) {
      unsubscribers.push(realtime.on('login:failed', onFailedLogin));
    }

    if (onUserBlocked) {
      unsubscribers.push(realtime.on('user:blocked', onUserBlocked));
    }

    realtime.subscribeToSecurity();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [realtime, onAlert, onFailedLogin, onUserBlocked]);

  return realtime;
};
