import mongoose from 'mongoose';
import { logger } from '@/utils/logger.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const skipDbConnection = process.env.SKIP_DB_CONNECTION === 'true';
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Try to connect with extended timeout for cloud databases
    try {
      await mongoose.connect(mongoUri, {
        dbName: process.env.MONGODB_DB_NAME || 'cloutculturee',
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 30000, // Increased from 5000 to 30000 for cloud DB
        connectTimeoutMS: 30000,
      });

      logger.info('✅ MongoDB Connected Successfully');

      // Connection event listeners
      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB Disconnected');
      });

      mongoose.connection.on('error', (error) => {
        logger.error('❌ MongoDB Connection Error:', error);
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('🔄 MongoDB Reconnected');
      });
    } catch (connectionError) {
      logger.warn('⚠️ MongoDB Connection Failed');
      logger.warn('⚠️ Running in MOCK MODE (data will not persist)');
      logger.warn('⚠️ This may be due to:');
      logger.warn('  • Network/Firewall blocking MongoDB Atlas');
      logger.warn('  • DNS resolution issues');
      logger.warn('  • Check your internet connection');
    }

  } catch (error) {
    logger.error('❌ Database Configuration Error:', error);
    logger.warn('⚠️ Running in MOCK MODE instead');
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('✅ MongoDB Disconnected Successfully');
  } catch (error) {
    logger.error('❌ Disconnection Error:', error);
  }
};

export default mongoose;
