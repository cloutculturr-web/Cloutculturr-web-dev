/**
 * One-time, idempotent bootstrap: creates the single real admin User account
 * from ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env if it doesn't already exist.
 *
 * This exists because self-registration is client-only by design (see
 * AuthService.register) and the old MOCK_USERS login backdoor has been removed —
 * without this, there would be no way to get a real admin account into the
 * database at all.
 *
 * Run with: npm run bootstrap:admin
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '@/models/User.js';
import CreatorTier from '@/models/CreatorTier.js';
import { logger } from '@/utils/logger.js';

const DEFAULT_TIERS = [
  { name: 'Tier 1', level: 1 as const, order: 1 },
  { name: 'Tier 2', level: 2 as const, order: 2 },
  { name: 'Tier 3', level: 3 as const, order: 3 },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env');
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in backend/.env');
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB_NAME || 'cloutculturee',
    serverSelectionTimeoutMS: 30000,
  });
  logger.info('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    logger.info(`ℹ️  Admin user already exists (${email}) — nothing to do.`);
  } else {
    const admin = new User({
      email: email.toLowerCase(),
      password, // hashed by User's pre-save hook
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      emailVerified: true,
    });
    await admin.save();
    logger.info(`✅ Created admin user: ${email}`);
    logger.warn('⚠️  Log in and change this password once the password-change flow is in place.');
  }

  const tierCount = await CreatorTier.countDocuments();
  if (tierCount === 0) {
    for (const tier of DEFAULT_TIERS) {
      await new CreatorTier({
        name: tier.name,
        level: tier.level,
        order: tier.order,
        description: '',
        eligibilityCriteria: '',
        pricingGuidance: { min: null, max: null, currency: 'INR' },
        status: 'active',
      }).save();
    }
    logger.info('✅ Seeded default creator tiers (Tier 1/2/3) — edit their details from Creator Tiers in the admin dashboard.');
  } else {
    logger.info('ℹ️  Creator tiers already exist — nothing to seed.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  logger.error('❌ Admin bootstrap failed:', error);
  process.exit(1);
});
