import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import { logger } from '@/utils/logger.js';
import { AppError } from '@/utils/errors.js';
import { connectDatabase } from '@/config/database.js';
import { requestLogger } from '@/middleware/requestLogger.js';
import { errorHandler } from '@/middleware/errorHandler.js';

// Import routes
import authRoutes from '@/routes/auth.js';
import adminRoutes from '@/routes/admin.js';
import creatorRoutes from '@/routes/creator.js';
import clientRoutes from '@/routes/client.js';
import paymentRoutes from '@/routes/payment.js';
import creatorApplicationRoutes from '@/routes/creatorApplication.js';
import notificationRoutes from '@/routes/notifications.js';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ================================
// Middleware Setup
// ================================

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts
  skip: (req) => req.method === 'GET',
  message: 'Too many authentication attempts, please try again later.',
});

app.use('/api/', limiter);
// Disabled for development - remove this line for production
// app.use('/api/auth/', authLimiter);
// app.use('/api/auth/', authLimiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Request Logging
app.use(requestLogger);

// ================================
// Health Check & Info Routes
// ================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    environment: NODE_ENV,
  });
});

app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Cloutculturr Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      creator: '/api/creator',
      client: '/api/client',
      payment: '/api/payment',
      creatorApplications: '/api/creator-applications',
      notifications: '/api/notifications',
    },
  });
});

// ================================
// Welcome Route
// ================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Cloutculturr API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      admin: '/api/admin',
      creator: '/api/creator',
      client: '/api/client',
      payment: '/api/payment',
      creatorApplications: '/api/creator-applications',
      notifications: '/api/notifications',
    },
    documentation: '/api/docs',
  });
});

// ================================
// API Routes
// ================================

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/creator-applications', creatorApplicationRoutes);
app.use('/api/notifications', notificationRoutes);

// ================================
// 404 Handler
// ================================

app.use((req: Request, res: Response, next: NextFunction) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
});

// ================================
// Error Handler (Must be last)
// ================================

app.use(errorHandler);

// ================================
// Database Connection & Server Start
// ================================

// Resolves once the database connection has been attempted (connectDatabase
// itself never rejects — it logs and continues in a degraded state on
// failure). Exported so a serverless wrapper (api/backend.js on Vercel) can
// await it before handling the first request on a cold start, instead of
// racing ahead of an in-flight connection the way a fire-and-forget
// startServer() call would.
export const dbReady: Promise<void> = connectDatabase();

const startServer = async () => {
  try {
    await dbReady;

    // Start server
    app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════╗
║  Cloutculturr Backend Server Running  ║
╠════════════════════════════════════════╣
║  Port: ${PORT}
║  Environment: ${NODE_ENV}
║  Time: ${new Date().toLocaleString()}
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    // Do NOT exit — attempt to listen anyway so the API responds to health checks
    app.listen(PORT, () => {
      logger.warn(`⚠️  Server started in degraded mode on port ${PORT}`);
    });
  }
};

// ================================
// Graceful Shutdown
// ================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${String(promise)} reason: ${String(reason)}`);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Only auto-start a listening server for local/traditional hosting. On
// Vercel (process.env.VERCEL is set by the platform itself), the serverless
// wrapper at api/backend.js imports `app` and `dbReady` directly and invokes
// the app per-request — an actual bound port would never receive traffic
// there, and would just be dead weight in the function's cold start.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
