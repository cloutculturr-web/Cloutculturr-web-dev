import User from '@/models/User.js';
import Creator from '@/models/Creator.js';
import Portfolio from '@/models/Portfolio.js';
import Package from '@/models/Package.js';
import Project from '@/models/Project.js';
import AuditLog from '@/models/AuditLog.js';
import ProjectService from '@/services/projectService.js';
import PaymentService from '@/services/paymentService.js';
import { ConflictError, NotFoundError, ValidationError, AppError, AuthorizationError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import { Types } from 'mongoose';

interface AuditMeta {
  userEmail: string;
  ipAddress: string;
  userAgent: string;
}

async function logCreatorAction(
  userId: string,
  meta: AuditMeta,
  action: string,
  resource: string,
  resourceId?: string,
  changes?: { before?: any; after?: any }
) {
  try {
    await new AuditLog({
      userId,
      userEmail: meta.userEmail,
      action,
      resource,
      resourceId,
      changes,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      status: 'success',
    }).save();
  } catch (error) {
    logger.error('Error creating creator audit log:', error);
  }
}

interface CreateCreatorPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyName: string;
  location?: string;
}

interface UpdateCreatorProfilePayload {
  companyName?: string;
  bio?: string;
  profilePhoto?: string;
  banner?: string;
  location?: string;
  experience?: number;
  languages?: string[];
  skills?: string[];
  website?: string;
  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export class CreatorService {
  /**
   * Create creator account (admin only)
   */
  static async createCreatorAccount(payload: CreateCreatorPayload) {
    try {
      // Check if email exists
      const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      // Create user
      const user = new User({
        email: payload.email.toLowerCase(),
        password: payload.password,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        role: 'creator',
        emailVerified: false,
      });

      await user.save();
      logger.info(`✅ Creator user created: ${user.email}`);

      // Create creator profile
      const creator = new Creator({
        userId: user._id,
        companyName: payload.companyName,
        location: payload.location || 'Not specified',
        bio: '',
        profilePhoto: '',
        banner: '',
        experience: 0,
        languages: [],
        skills: [],
        website: '',
        socialMedia: {
          instagram: '',
          linkedin: '',
          twitter: '',
        },
      });

      await creator.save();
      logger.info(`✅ Creator profile created for: ${user.email}`);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        creator: {
          id: creator._id,
          companyName: creator.companyName,
          location: creator.location,
        },
      };
    } catch (error) {
      logger.error('Creator account creation error:', error);
      throw error;
    }
  }

  /**
   * Update creator profile
   */
  static async updateCreatorProfile(userId: string, payload: UpdateCreatorProfilePayload, meta?: AuditMeta) {
    try {
      const creator = await Creator.findOne({ userId });

      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const before = creator.toObject();

      // Update allowed fields
      if (payload.companyName) creator.companyName = payload.companyName;
      if (payload.bio) creator.bio = payload.bio;
      if (payload.profilePhoto) creator.profilePhoto = payload.profilePhoto;
      if (payload.banner) creator.banner = payload.banner;
      if (payload.location) creator.location = payload.location;
      if (payload.experience !== undefined) creator.experience = payload.experience;
      if (payload.languages) creator.languages = payload.languages;
      if (payload.skills) creator.skills = payload.skills;
      if (payload.website) creator.website = payload.website;

      if (payload.socialMedia) {
        creator.socialMedia = {
          ...creator.socialMedia,
          ...payload.socialMedia,
        };
      }

      await creator.save();
      logger.info(`✅ Creator profile updated: ${userId}`);

      if (meta) {
        await logCreatorAction(userId, meta, 'UPDATE', 'creator', creator._id.toString(), {
          before,
          after: creator.toObject(),
        });
      }

      return creator;
    } catch (error) {
      logger.error('Creator profile update error:', error);
      throw error;
    }
  }

  /**
   * Update creator availability (available/busy/unavailable)
   */
  static async updateAvailability(userId: string, availability: 'available' | 'busy' | 'unavailable', meta?: AuditMeta) {
    try {
      const validValues = ['available', 'busy', 'unavailable'];
      if (!validValues.includes(availability)) {
        throw new ValidationError('Invalid availability value');
      }

      const creator = await Creator.findOne({ userId });
      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const previous = creator.availability;
      creator.availability = availability;
      await creator.save();

      if (meta) {
        await logCreatorAction(userId, meta, 'UPDATE', 'availability', creator._id.toString(), {
          before: { availability: previous },
          after: { availability },
        });
      }

      logger.info(`✅ Creator availability updated: ${userId} -> ${availability}`);

      return creator;
    } catch (error) {
      logger.error('Creator availability update error:', error);
      throw error;
    }
  }

  /**
   * Get creator profile
   */
  static async getCreatorProfile(userId: string) {
    try {
      const creator = await Creator.findOne({ userId })
        .populate('userId', 'email firstName lastName phoneNumber')
        .populate('tierId')
        .populate('pricingHistory.changedBy', 'firstName lastName email');

      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      return creator;
    } catch (error) {
      logger.error('Creator profile fetch error:', error);
      throw error;
    }
  }

  /**
   * Upload portfolio item
   */
  static async addPortfolioItem(userId: string, payload: any, meta?: AuditMeta) {
    try {
      const creator = await Creator.findOne({ userId });

      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const portfolio = new Portfolio({
        creatorId: creator._id,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        media: payload.media,
        projectDetails: payload.projectDetails || {},
        views: 0,
        likes: 0,
        status: 'pending_review',
      });

      await portfolio.save();

      // Add to creator's portfolio
      creator.portfolio.push(portfolio._id);
      await creator.save();

      logger.info(`✅ Portfolio item added for creator: ${userId}`);

      if (meta) {
        await logCreatorAction(userId, meta, 'CREATE', 'portfolio', portfolio._id.toString(), { after: portfolio.toObject() });
      }

      return portfolio;
    } catch (error) {
      logger.error('Portfolio upload error:', error);
      throw error;
    }
  }

  /**
   * Update a portfolio item — verifies it actually belongs to the calling creator
   */
  static async updatePortfolioItem(userId: string, portfolioId: string, payload: any, meta?: AuditMeta) {
    try {
      const creator = await Creator.findOne({ userId });
      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const item = await Portfolio.findOne({ _id: portfolioId, creatorId: creator._id });
      if (!item) {
        throw new AuthorizationError('You do not have access to this portfolio item');
      }

      const before = item.toObject();

      if (payload.title !== undefined) item.title = payload.title;
      if (payload.description !== undefined) item.description = payload.description;
      if (payload.category !== undefined) item.category = payload.category;
      if (payload.media !== undefined) item.media = payload.media;
      if (payload.projectDetails !== undefined) item.projectDetails = { ...item.projectDetails, ...payload.projectDetails };
      // Editing a portfolio item sends it back for re-review rather than
      // silently keeping a stale "approved" status on changed content.
      item.status = 'pending_review';

      await item.save();

      if (meta) {
        await logCreatorAction(userId, meta, 'UPDATE', 'portfolio', item._id.toString(), { before, after: item.toObject() });
      }

      logger.info(`✅ Portfolio item updated: ${portfolioId}`);

      return item;
    } catch (error) {
      logger.error('Portfolio item update error:', error);
      throw error;
    }
  }

  /**
   * Delete a portfolio item — verifies it actually belongs to the calling creator
   */
  static async deletePortfolioItem(userId: string, portfolioId: string, meta?: AuditMeta) {
    try {
      const creator = await Creator.findOne({ userId });
      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const item = await Portfolio.findOne({ _id: portfolioId, creatorId: creator._id });
      if (!item) {
        throw new AuthorizationError('You do not have access to this portfolio item');
      }

      await Portfolio.findByIdAndDelete(portfolioId);
      await Creator.findByIdAndUpdate(creator._id, { $pull: { portfolio: portfolioId } });

      if (meta) {
        await logCreatorAction(userId, meta, 'DELETE', 'portfolio', portfolioId, { before: item.toObject() });
      }

      logger.info(`✅ Portfolio item deleted: ${portfolioId}`);

      return item;
    } catch (error) {
      logger.error('Portfolio item delete error:', error);
      throw error;
    }
  }

  /**
   * Get portfolio items
   */
  static async getPortfolioItems(userId: string) {
    try {
      const creator = await Creator.findOne({ userId });

      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const items = await Portfolio.find({ creatorId: creator._id });

      return items;
    } catch (error) {
      logger.error('Portfolio fetch error:', error);
      throw error;
    }
  }

  /**
   * Create service package
   */
  static async createPackage(userId: string, payload: any, meta?: AuditMeta) {
    try {
      const creator = await Creator.findOne({ userId });

      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const pkg = new Package({
        creatorId: creator._id,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        deliverables: payload.deliverables,
        timeline: payload.timeline,
        additionalServices: payload.additionalServices || [],
        status: 'active',
      });

      await pkg.save();

      // Add to creator's packages
      creator.packages.push(pkg._id);
      await creator.save();

      logger.info(`✅ Package created for creator: ${userId}`);

      if (meta) {
        await logCreatorAction(userId, meta, 'CREATE', 'package', pkg._id.toString(), { after: pkg.toObject() });
      }

      return pkg;
    } catch (error) {
      logger.error('Package creation error:', error);
      throw error;
    }
  }

  /**
   * Get creator packages
   */
  static async getPackages(userId: string) {
    try {
      const creator = await Creator.findOne({ userId });

      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const packages = await Package.find({ creatorId: creator._id });

      return packages;
    } catch (error) {
      logger.error('Package fetch error:', error);
      throw error;
    }
  }

  /**
   * Update package — verifies it actually belongs to the calling creator
   */
  static async updatePackage(userId: string, packageId: string, payload: any, meta?: AuditMeta) {
    try {
      const creator = await Creator.findOne({ userId });
      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const pkg = await Package.findOne({ _id: packageId, creatorId: creator._id });
      if (!pkg) {
        throw new AuthorizationError('You do not have access to this package');
      }

      const before = pkg.toObject();
      const allowedFields = ['name', 'description', 'price', 'deliverables', 'timeline', 'additionalServices', 'status'];
      for (const field of allowedFields) {
        if (payload[field] !== undefined) (pkg as any)[field] = payload[field];
      }
      await pkg.save();

      logger.info(`✅ Package updated: ${packageId}`);

      if (meta) {
        await logCreatorAction(userId, meta, 'UPDATE', 'package', packageId, { before, after: pkg.toObject() });
      }

      return pkg;
    } catch (error) {
      logger.error('Package update error:', error);
      throw error;
    }
  }

  /**
   * Delete package — verifies it actually belongs to the calling creator
   */
  static async deletePackage(userId: string, packageId: string, meta?: AuditMeta) {
    try {
      const creator = await Creator.findOne({ userId });
      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const pkg = await Package.findOne({ _id: packageId, creatorId: creator._id });
      if (!pkg) {
        throw new AuthorizationError('You do not have access to this package');
      }

      await Package.findByIdAndDelete(packageId);
      await Creator.findByIdAndUpdate(creator._id, { $pull: { packages: packageId } });

      logger.info(`✅ Package deleted: ${packageId}`);

      if (meta) {
        await logCreatorAction(userId, meta, 'DELETE', 'package', packageId, { before: pkg.toObject() });
      }

      return pkg;
    } catch (error) {
      logger.error('Package delete error:', error);
      throw error;
    }
  }

  /**
   * Approve creator profile (admin only)
   */
  static async approveCreatorProfile(userId: string) {
    try {
      const user = await User.findById(userId);

      if (!user || user.role !== 'creator') {
        throw new NotFoundError('Creator');
      }

      const creator = await Creator.findOne({ userId });

      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      creator.verification.status = 'verified';
      creator.verification.badge = true;
      creator.verification.verifiedAt = new Date();
      await creator.save();

      logger.info(`✅ Creator profile approved: ${userId}`);

      return creator;
    } catch (error) {
      logger.error('Creator approval error:', error);
      throw error;
    }
  }

  /**
   * Suspend creator profile (admin only)
   */
  static async suspendCreatorProfile(userId: string, reason: string = 'Administrative suspension') {
    try {
      const user = await User.findById(userId);

      if (!user || user.role !== 'creator') {
        throw new NotFoundError('Creator');
      }

      user.status = 'suspended';
      await user.save();

      const creator = await Creator.findOne({ userId });

      if (creator) {
        creator.suspendedAt = new Date();
        creator.suspensionReason = reason;
        await creator.save();
      }

      logger.info(`✅ Creator suspended: ${userId}`);

      return creator;
    } catch (error) {
      logger.error('Creator suspension error:', error);
      throw error;
    }
  }

  /**
   * Get creator's own projects
   */
  static async getCreatorProjects(userId: string, status?: string) {
    try {
      const creator = await Creator.findOne({ userId });
      if (!creator) {
        throw new NotFoundError('Creator profile');
      }
      return await ProjectService.getProjectsByCreator(creator._id.toString(), status);
    } catch (error) {
      logger.error('Creator projects fetch error:', error);
      throw error;
    }
  }

  /**
   * Get creator's real earnings — computed from actual Payment/Project records,
   * never a hardcoded number.
   */
  static async getCreatorEarnings(userId: string) {
    try {
      const creator = await Creator.findOne({ userId });
      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const payments = await PaymentService.getPaymentHistory(null, creator._id.toString());
      const paidEarnings = payments.reduce((sum: number, p: any) => sum + (p.breakdown?.creatorShare || 0), 0);

      const projects = await Project.find({ creatorId: creator._id }).lean();
      const activeProjects = projects.filter((p: any) => p.status === 'active');
      const activeProjectValue = activeProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

      // Money owed once an in-progress project's payment resolves — an honest
      // proxy given there is no separate Payout ledger yet (see roadmap).
      const pendingEarnings = projects
        .filter((p: any) => p.payment?.status !== 'completed' && ['active', 'review', 'approved'].includes(p.status))
        .reduce((sum: number, p: any) => sum + (p.revenue?.creatorShare || 0), 0);

      return {
        paidEarnings,
        pendingEarnings,
        totalEarnings: paidEarnings + pendingEarnings,
        activeProjectValue,
        payments,
      };
    } catch (error) {
      logger.error('Creator earnings error:', error);
      throw error;
    }
  }

  /**
   * Real profile-completion percentage — computed from actual populated
   * fields, never hardcoded. Availability is excluded since it always holds
   * a valid value (default 'available') and is never meaningfully "incomplete".
   */
  static computeProfileCompletion(creator: any, portfolioCount: number, packageCount: number): number {
    const checks = [
      !!creator.profilePhoto,
      !!(creator.bio && creator.bio.trim().length > 0),
      Array.isArray(creator.skills) && creator.skills.length > 0,
      packageCount > 0,
      portfolioCount > 0,
      (creator.experience || 0) > 0,
      creator.pricing?.approvedAmount != null,
    ];
    const complete = checks.filter(Boolean).length;
    return Math.round((complete / checks.length) * 100);
  }

  /**
   * Get creator dashboard data
   */
  static async getCreatorDashboard(userId: string) {
    try {
      const creator = await Creator.findOne({ userId }).populate('tierId');

      if (!creator) {
        throw new NotFoundError('Creator profile');
      }

      const portfolioCount = await Portfolio.countDocuments({ creatorId: creator._id });
      const packageCount = await Package.countDocuments({ creatorId: creator._id });
      const activeProjectsCount = await Project.countDocuments({ creatorId: creator._id, status: 'active' });
      const completedProjectsCount = await Project.countDocuments({ creatorId: creator._id, status: 'completed' });
      const profileCompletion = this.computeProfileCompletion(creator, portfolioCount, packageCount);

      const activeProjectDocs = await Project.find({
        creatorId: creator._id,
        payment: { $ne: null },
        status: { $in: ['active', 'review', 'approved'] },
      })
        .select('payment.status revenue.creatorShare')
        .lean();
      const pendingPayout = activeProjectDocs
        .filter((p: any) => p.payment?.status !== 'completed')
        .reduce((sum: number, p: any) => sum + (p.revenue?.creatorShare || 0), 0);

      return {
        profile: creator,
        stats: {
          portfolioItems: portfolioCount,
          activePackages: packageCount,
          activeProjects: activeProjectsCount,
          completedProjects: completedProjectsCount,
          averageRating: creator.performance?.averageRating || 0,
          profileCompletion,
          pendingPayout,
        },
      };
    } catch (error) {
      logger.error('Creator dashboard error:', error);
      throw error;
    }
  }
}

export default CreatorService;
