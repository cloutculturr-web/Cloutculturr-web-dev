# Real-Time Updates & Notifications Integration Guide

## Overview
Complete real-time WebSocket integration for the CloutCulturee Admin Dashboard using Socket.IO. Enables live KPI updates, analytics, notifications, security alerts, and system events.

## Architecture

### Backend Components
- **RealtimeService** (`backend/src/services/realtimeService.ts`)
  - Socket.IO server initialization
  - Authentication middleware
  - Event broadcasting system
  - Admin connection tracking

### Frontend Components
- **useRealtime Hook** (`src/hooks/useRealtime.ts`)
  - WebSocket connection management
  - Event subscription
  - Auto-reconnection handling

## Installation

### Backend Setup

#### 1. Install Dependencies
```bash
npm install socket.io socket.io-client
```

#### 2. Initialize Real-time Service in Server
```typescript
// backend/src/server.ts
import { createServer } from 'http';
import { realtimeService } from '@/services/realtimeService';
import app from '@/app';

const httpServer = createServer(app);
realtimeService.initialize(httpServer);

httpServer.listen(4000, () => {
  console.log('Server running on port 4000');
});
```

#### 3. Add Real-time Events on Data Changes
```typescript
// In your service/controller after updating data
import { realtimeService } from '@/services/realtimeService';

// When KPIs are updated
const kpis = await calculateKPIs();
realtimeService.broadcastKPIUpdate(kpis);

// When notification is sent
const notification = await createNotification(data);
realtimeService.broadcastNotification(notification, notification.target);

// When user is blocked
const blockedUser = await blockUser(userId, reason);
realtimeService.broadcastUserBlocked(blockedUser);
```

### Frontend Setup

#### 1. Install Socket.IO Client
```bash
npm install socket.io-client
```

#### 2. Initialize Real-time Hook in Dashboard
```typescript
// src/routes/admin/dashboard/page.tsx
import { useRealtime } from '@/hooks/useRealtime';

export function DashboardPage() {
  const realtime = useRealtime({
    adminId: 'current-admin-id',
    token: 'current-auth-token',
    url: 'http://api.cloutculturee.com'
  });

  useEffect(() => {
    if (realtime.isConnected) {
      realtime.subscribeToDashboard();
    }
  }, [realtime.isConnected]);

  // Subscribe to KPI updates
  useEffect(() => {
    const unsubscribe = realtime.on('kpi:update', (payload) => {
      console.log('KPI Update:', payload.data);
      // Update UI with new KPIs
    });

    return unsubscribe;
  }, [realtime]);

  return (
    <div>
      {realtime.isConnected ? (
        <span className="text-green-500">🟢 Live</span>
      ) : (
        <span className="text-red-500">🔴 Offline</span>
      )}
    </div>
  );
}
```

## Real-Time Events

### Dashboard Events

#### kpi:update
Broadcast when KPI snapshot is updated
```typescript
realtimeService.broadcastKPIUpdate({
  totalRevenue: 125000,
  activeClients: 280,
  activeCreators: 320,
  // ... all KPI fields
});
```

**Subscribe:**
```typescript
realtime.on('kpi:update', (payload) => {
  const { data, timestamp } = payload;
  updateDashboardKPIs(data);
});
```

#### activity:new
Broadcast when new activity is logged
```typescript
realtimeService.broadcastActivity({
  userId: '123',
  action: 'created_project',
  entity: 'project',
  timestamp: new Date()
});
```

### Analytics Events

#### revenue:update
Broadcast when revenue metrics are updated
```typescript
realtimeService.broadcastRevenueUpdate({
  date: '2024-01-22',
  totalRevenue: 5200,
  transactions: 12,
  // ... revenue fields
});
```

#### users:update
Broadcast when user metrics are updated
```typescript
realtimeService.broadcastUserAnalyticsUpdate({
  date: '2024-01-22',
  newUsers: 15,
  activeUsers: 450,
  // ... user fields
});
```

#### projects:update
Broadcast when project metrics are updated
```typescript
realtimeService.broadcastProjectAnalyticsUpdate({
  date: '2024-01-22',
  newProjects: 5,
  completedProjects: 3,
  // ... project fields
});
```

### Notification Events

#### notification:new
Broadcast when notification is sent
```typescript
realtimeService.broadcastNotification({
  id: '123',
  title: 'Platform Update',
  message: 'New features available',
  type: 'announcement',
  target: 'all',
  timestamp: new Date()
}, 'all');
```

**Subscribe:**
```typescript
realtime.on('notification:new', (payload) => {
  const { data } = payload;
  showNotificationToast(data.title, data.message);
});
```

### Security Events

#### security:alert
Broadcast when security issue is detected
```typescript
realtimeService.broadcastSecurityAlert({
  type: 'suspicious_activity',
  description: 'Multiple failed login attempts',
  severity: 'high',
  timestamp: new Date()
});
```

#### login:failed
Broadcast when login fails
```typescript
realtimeService.broadcastFailedLogin({
  email: 'user@example.com',
  ipAddress: '192.168.1.100',
  reason: 'Invalid credentials',
  timestamp: new Date()
});
```

#### user:blocked
Broadcast when user is blocked
```typescript
realtimeService.broadcastUserBlocked({
  userId: '123',
  email: 'user@example.com',
  reason: 'Suspicious activity',
  blockedAt: new Date()
});
```

### System Events

#### backup:completed
Broadcast when backup is completed
```typescript
realtimeService.broadcastBackupCompleted({
  backupId: '123',
  type: 'full',
  size: 256, // MB
  duration: 120, // seconds
  timestamp: new Date()
});
```

#### report:completed
Broadcast when report generation is completed
```typescript
realtimeService.broadcastReportCompleted({
  reportId: '123',
  reportType: 'revenue',
  format: 'pdf',
  downloadUrl: '/api/reports/123/download',
  timestamp: new Date()
});
```

#### cms:published
Broadcast when CMS content is published
```typescript
realtimeService.broadcastContentPublished({
  contentId: '123',
  title: 'Homepage Hero',
  section: 'Homepage',
  timestamp: new Date()
});
```

#### marketplace:update
Broadcast when marketplace is updated
```typescript
realtimeService.broadcastMarketplaceUpdate({
  creatorId: '123',
  status: 'featured',
  position: 1,
  timestamp: new Date()
});
```

#### settings:update
Broadcast when system settings are updated
```typescript
realtimeService.broadcastSettingsUpdate({
  commissionRate: 20,
  minimumPayout: 150,
  updatedBy: 'admin123',
  timestamp: new Date()
});
```

## Hook Usage Examples

### Dashboard KPI Auto-Update
```typescript
import { useKPIUpdates } from '@/hooks/useRealtime';

export function Dashboard() {
  const [kpis, setKpis] = useState(null);

  useKPIUpdates((payload) => {
    setKpis(payload.data);
  });

  return (
    <div>
      <KPICards kpis={kpis} />
    </div>
  );
}
```

### Analytics Real-Time Update
```typescript
import { useAnalyticsUpdates } from '@/hooks/useRealtime';

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    revenue: null,
    users: null,
    projects: null
  });

  useAnalyticsUpdates(
    (payload) => {
      setAnalytics(prev => ({ ...prev, revenue: payload.data }));
    },
    (payload) => {
      setAnalytics(prev => ({ ...prev, users: payload.data }));
    },
    (payload) => {
      setAnalytics(prev => ({ ...prev, projects: payload.data }));
    }
  );

  return (
    <div>
      <RevenueChart data={analytics.revenue} />
      <UserChart data={analytics.users} />
      <ProjectChart data={analytics.projects} />
    </div>
  );
}
```

### Security Monitoring
```typescript
import { useSecurityUpdates } from '@/hooks/useRealtime';

export function SecurityDashboard() {
  const [alerts, setAlerts] = useState([]);

  useSecurityUpdates(
    (payload) => {
      setAlerts(prev => [payload.data, ...prev].slice(0, 50));
    },
    (payload) => {
      // Failed login
      showWarningAlert(`Failed login: ${payload.data.email}`);
    },
    (payload) => {
      // User blocked
      showErrorAlert(`User blocked: ${payload.data.email}`);
    }
  );

  return (
    <div>
      <AlertsList alerts={alerts} />
    </div>
  );
}
```

## Connection Management

### Manual Connection Control
```typescript
import { useRealtime } from '@/hooks/useRealtime';

export function AdminPanel() {
  const realtime = useRealtime({
    adminId: 'admin-123',
    token: 'token-abc',
    autoConnect: false // Start manually
  });

  useEffect(() => {
    // Connect when user logs in
    realtime.connect();

    return () => {
      realtime.disconnect();
    };
  }, []);

  return (
    <div>
      {realtime.isConnected && <LiveIndicator />}
    </div>
  );
}
```

## Error Handling

### Connection Error Handling
```typescript
useEffect(() => {
  realtime.on('error', (payload) => {
    console.error('Connection error:', payload);
    showErrorToast('Real-time connection lost. Attempting to reconnect...');
  });
}, [realtime]);
```

### Fallback to Polling
```typescript
const [usePolling, setUsePolling] = useState(false);

useEffect(() => {
  if (!realtime.isConnected && !usePolling) {
    setUsePolling(true);
    // Start polling as fallback
    const interval = setInterval(fetchDataFromAPI, 5000);
    return () => clearInterval(interval);
  }
}, [realtime.isConnected]);
```

## Performance Optimization

### 1. Selective Subscriptions
Only subscribe to events you need:
```typescript
// Good - subscribe to specific events
realtime.subscribeToDashboard();

// Not recommended - would subscribe to everything
realtime.on('kpi:update', handler);
realtime.on('revenue:update', handler);
realtime.on('users:update', handler);
```

### 2. Unsubscribe When Leaving Page
```typescript
useEffect(() => {
  realtime.subscribeToDashboard();

  return () => {
    // Cleanup when component unmounts
  };
}, []);
```

### 3. Debounce UI Updates
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdate = useDebouncedCallback((data) => {
  setKpis(data);
}, 500);

realtime.on('kpi:update', (payload) => {
  debouncedUpdate(payload.data);
});
```

## Security Considerations

### 1. Authentication
Always validate admin token:
```typescript
// Backend middleware validates token
this.io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!validateToken(token)) {
    return next(new Error('Auth error'));
  }
  next();
});
```

### 2. Authorization
Check permissions before broadcasting:
```typescript
// Only send to admins with VIEW_DASHBOARD permission
const hasPermission = await checkAdminPermission(adminId, 'VIEW_DASHBOARD');
if (hasPermission) {
  realtimeService.broadcastKPIUpdate(kpis);
}
```

### 3. CORS Configuration
Configure CORS for your domain:
```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});
```

## Monitoring

### Check Active Connections
```typescript
const activeAdmins = realtimeService.getActiveAdminCount();
const adminConnections = realtimeService.getAdminConnectionCount(adminId);

console.log(`Active admins: ${activeAdmins}`);
console.log(`Admin ${adminId} connections: ${adminConnections}`);
```

### Connection Metrics
```typescript
// Monitor in your dashboard
useEffect(() => {
  const interval = setInterval(() => {
    const io = realtimeService.getIO();
    if (io) {
      console.log(`Connected clients: ${io.engine.clientsCount}`);
    }
  }, 10000); // Every 10 seconds

  return () => clearInterval(interval);
}, []);
```

## Deployment Considerations

### 1. Load Balancing
Use sticky sessions for WebSocket:
```javascript
// Nginx example
upstream backend {
  server backend1;
  server backend2;
  hash $remote_addr consistent;
}
```

### 2. Redis Adapter (for multiple servers)
```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### 3. Environment Variables
```env
REALTIME_URL=https://api.cloutculturee.com
REALTIME_PORT=4000
REDIS_URL=redis://localhost:6379
```

## File Locations

- Backend Service: `backend/src/services/realtimeService.ts`
- Frontend Hook: `src/hooks/useRealtime.ts`
- Documentation: `REALTIME_INTEGRATION_GUIDE.md`

## Testing

### Test Connection
```typescript
import { realtimeService } from '@/services/realtimeService';

describe('Real-time Service', () => {
  test('should broadcast KPI update', (done) => {
    realtimeService.broadcastKPIUpdate({
      totalRevenue: 100000
    });

    // Verify broadcast in test
    done();
  });
});
```

### Test Frontend Hook
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRealtime } from '@/hooks/useRealtime';

describe('useRealtime', () => {
  test('should subscribe to dashboard updates', async () => {
    const { result } = renderHook(() =>
      useRealtime({
        adminId: 'test',
        token: 'test'
      })
    );

    act(() => {
      result.current.subscribeToDashboard();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });
});
```
