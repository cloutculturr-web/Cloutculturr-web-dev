import crypto from 'crypto';
import User from '@/models/User.js';
import Client from '@/models/Client.js';
import Creator from '@/models/Creator.js';
import Membership from '@/models/Membership.js';
import AuditLog from '@/models/AuditLog.js';
import ProjectService from '@/services/projectService.js';
import MembershipService from '@/services/membershipService.js';
import NotificationService from '@/services/notificationService.js';
import { razorpayInstance } from '@/config/razorpay.js';
import { NotFoundError, AppError, ValidationError, AuthorizationError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import mongoose from 'mongoose';

interface UpdateClientProfilePayload {
  companyName?: string;
  industry?: string;
  location?: string;
  websiteUrl?: string;
  description?: string;
}

interface CreateClientProjectPayload {
  title: string;
  description: string;
  budget: number;
  requirements: string;
  timeline: string;
  creatorId?: string;
}

const MARKETPLACE_LIMIT_FREE = 8; // Free users see 8 creators
const PREMIUM_PRICE = 100; // ₹100 — must match MembershipService's price

interface AuditMeta {
  userEmail: string;
  ipAddress: string;
  userAgent: string;
}

async function logClientAction(
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
    logger.error('Error creating client audit log:', error);
    // Audit failures must never break the main operation.
  }
}

/**
 * Builds the exact, client-safe shape of a creator's public profile.
 * Never include the linked User's email/phoneNumber, and never include
 * Creator.pricing.proposedAmount/recommendedRange or pricingHistory — those
 * are internal CC/admin negotiation data. Only the CC-approved amount, and
 * only once CC has actually approved it, is ever client-visible.
 */
function toClientSafeCreator(userDoc: any, creatorDoc: any) {
  const pricing =
    creatorDoc?.pricing?.status === 'approved' && creatorDoc.pricing.approvedAmount != null
      ? { amount: creatorDoc.pricing.approvedAmount, currency: creatorDoc.pricing.currency || 'INR' }
      : null;

  return {
    userId: userDoc._id,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    companyName: creatorDoc.companyName,
    bio: creatorDoc.bio,
    profilePhoto: creatorDoc.profilePhoto,
    banner: creatorDoc.banner,
    location: creatorDoc.location,
    experience: creatorDoc.experience,
    languages: creatorDoc.languages,
    skills: creatorDoc.skills,
    website: creatorDoc.website,
    socialMedia: creatorDoc.socialMedia,
    verification: creatorDoc.verification,
    performance: creatorDoc.performance,
    portfolio: creatorDoc.portfolio,
    packages: creatorDoc.packages,
    tierId: creatorDoc.tierId,
    availability: creatorDoc.availability,
    pricing,
  };
}

/** Hydrates a list of creator User._ids into full client-safe creator cards. */
async function hydrateCreatorList(userIds: mongoose.Types.ObjectId[] | any[]) {
  if (!userIds || userIds.length === 0) return [];

  const [users, creatorProfiles] = await Promise.all([
    User.find({ _id: { $in: userIds }, role: 'creator' })
      .select('firstName lastName role status')
      .lean(),
    Creator.find({ userId: { $in: userIds } })
      .populate('portfolio')
      .populate('packages')
      .populate('tierId', 'name level')
      .lean(),
  ]);

  const profileByUserId = new Map(creatorProfiles.map((c: any) => [c.userId.toString(), c]));

  return users
    .map((u: any) => {
      const profile = profileByUserId.get(u._id.toString());
      return profile ? toClientSafeCreator(u, profile) : null;
    })
    .filter(Boolean);
}

export class ClientService {
  /**
   * Get client profile
   */
  static async getClientProfile(userId: string) {
    try {
      const client = await Client.findOne({ userId }).populate('userId', 'email firstName lastName phoneNumber');

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      return client;
    } catch (error) {
      logger.error('Client profile fetch error:', error);
      throw error;
    }
  }

  /**
   * Update client profile
   */
  static async updateClientProfile(userId: string, payload: UpdateClientProfilePayload, meta?: AuditMeta) {
    try {
      const client = await Client.findOne({ userId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      const before = client.toObject();

      // Update allowed fields
      if (payload.companyName) client.companyName = payload.companyName;
      if (payload.industry) client.industry = payload.industry;
      if (payload.location) client.location = payload.location;
      if (payload.websiteUrl) client.websiteUrl = payload.websiteUrl;
      if (payload.description) client.description = payload.description;

      await client.save();
      logger.info(`✅ Client profile updated: ${userId}`);

      if (meta) {
        await logClientAction(userId, meta, 'UPDATE', 'client', client._id.toString(), {
          before,
          after: client.toObject(),
        });
      }

      return client;
    } catch (error) {
      logger.error('Client profile update error:', error);
      throw error;
    }
  }

  /**
   * Get marketplace (with membership restrictions)
   *
   * Queries FROM Creator (filtering on the real `verification.status` field,
   * which lives on Creator, not User) rather than the previous User-first query,
   * which filtered on 'verification.status' against the User collection — a
   * field that doesn't exist there, so the old query always matched zero
   * documents. Also returns full client-safe creator profiles instead of bare
   * (and previously non-populated) User records.
   */
  static async getMarketplace(userId: string, page: number = 1, limit: number = 10) {
    try {
      const client = await Client.findOne({ userId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      const isPremium = client.membership.status === 'premium';
      const effectiveLimit = isPremium ? limit : MARKETPLACE_LIMIT_FREE;
      const skip = (page - 1) * effectiveLimit;

      const query = { 'verification.status': 'verified' };
      const total = await Creator.countDocuments(query);
      const cappedTotal = isPremium ? total : Math.min(MARKETPLACE_LIMIT_FREE, total);

      const creatorDocs = await Creator.find(query)
        .populate({
          path: 'userId',
          select: 'firstName lastName role status',
          match: { role: 'creator', status: 'active' },
        })
        .populate('portfolio')
        .populate('packages')
        .populate('tierId', 'name level')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(effectiveLimit)
        .lean();

      const creators = creatorDocs
        .filter((c: any) => c.userId) // drop any whose linked user didn't match role/status
        .map((c: any) => toClientSafeCreator(c.userId, c));

      return {
        creators,
        pagination: {
          total: cappedTotal,
          page,
          limit: effectiveLimit,
          pages: Math.ceil(cappedTotal / effectiveLimit),
          isPremium,
          remainingCreators: Math.max(0, cappedTotal - (skip + creators.length)),
        },
      };
    } catch (error) {
      logger.error('Marketplace fetch error:', error);
      throw error;
    }
  }

  /**
   * Get creator details (for marketplace view) — client-safe projection only.
   */
  static async getCreatorDetails(creatorUserId: string, clientUserId: string) {
    try {
      const creatorUser = await User.findOne({ _id: creatorUserId, role: 'creator', status: 'active' })
        .select('firstName lastName role status')
        .lean();

      if (!creatorUser) {
        throw new NotFoundError('Creator');
      }

      const creatorProfile = await Creator.findOne({ userId: creatorUserId })
        .populate('portfolio')
        .populate('packages')
        .populate('tierId', 'name level')
        .lean();

      if (!creatorProfile) {
        throw new NotFoundError('Creator profile');
      }

      // Track view (best-effort; never blocks the response)
      await this.addViewedCreator(clientUserId, creatorUserId);

      return toClientSafeCreator(creatorUser, creatorProfile);
    } catch (error) {
      logger.error('Creator details fetch error:', error);
      throw error;
    }
  }

  /**
   * Save creator to favorites
   */
  static async saveCreator(clientUserId: string, creatorUserId: string, meta?: AuditMeta) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      const creatorObjId = new mongoose.Types.ObjectId(creatorUserId);
      if (!client.savedCreators.some((id) => id.toString() === creatorUserId)) {
        client.savedCreators.push(creatorObjId as any);
        await client.save();
        logger.info(`✅ Creator saved: ${creatorUserId}`);

        if (meta) {
          await logClientAction(clientUserId, meta, 'CREATE', 'client', creatorUserId, {
            after: { savedCreator: creatorUserId },
          });
        }
      }

      return client;
    } catch (error) {
      logger.error('Save creator error:', error);
      throw error;
    }
  }

  /**
   * Unsave creator from favorites
   */
  static async unsaveCreator(clientUserId: string, creatorUserId: string, meta?: AuditMeta) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      client.savedCreators = client.savedCreators.filter((id) => id.toString() !== creatorUserId);
      await client.save();

      logger.info(`✅ Creator unsaved: ${creatorUserId}`);

      if (meta) {
        await logClientAction(clientUserId, meta, 'DELETE', 'client', creatorUserId, {
          before: { savedCreator: creatorUserId },
        });
      }

      return client;
    } catch (error) {
      logger.error('Unsave creator error:', error);
      throw error;
    }
  }

  /**
   * Get saved creators — full client-safe creator cards, not bare User records.
   */
  static async getSavedCreators(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId }).lean();

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      return hydrateCreatorList(client.savedCreators || []);
    } catch (error) {
      logger.error('Saved creators fetch error:', error);
      throw error;
    }
  }

  /**
   * Add viewed creator (internal tracking)
   */
  static async addViewedCreator(clientUserId: string, creatorUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (client && !client.viewedCreators.some((id) => id.toString() === creatorUserId)) {
        const viewedObjId = new mongoose.Types.ObjectId(creatorUserId);
        client.viewedCreators.push(viewedObjId as any);
        // Keep only last 20 viewed
        if (client.viewedCreators.length > 20) {
          client.viewedCreators = client.viewedCreators.slice(-20);
        }
        await client.save();
      }

      return client;
    } catch (error) {
      logger.error('View tracking error:', error);
      // Don't throw, just log
    }
  }

  /**
   * Get recently viewed creators — full client-safe creator cards.
   */
  static async getRecentlyViewed(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId }).lean();

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      return hydrateCreatorList(client.viewedCreators || []);
    } catch (error) {
      logger.error('Recently viewed fetch error:', error);
      throw error;
    }
  }

  /**
   * Create a real, self-contained Razorpay order for the ₹100 Premium
   * membership purchase. Deliberately kept separate from
   * PaymentService.createOrder/verifyPayment, which is hard-coupled to a
   * Project — reusing it here would mean loosening a currently-correct
   * required field on a model that real project payments depend on.
   */
  static async createMembershipOrder(userId: string) {
    try {
      const client = await Client.findOne({ userId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      if (client.membership.status === 'premium') {
        throw new AppError('You already have an active Premium membership', 400);
      }

      let order;
      try {
        order = await razorpayInstance.orders.create({
          amount: PREMIUM_PRICE * 100, // paise
          currency: 'INR',
          receipt: `membership_${client._id}_${Date.now()}`,
          notes: {
            purpose: 'membership_premium',
            userId,
            clientId: client._id.toString(),
          },
        });
      } catch (razorpayError: any) {
        // Surface a real, honest error rather than a generic 500 — the SDK
        // itself throws when RAZORPAY_KEY_ID/SECRET aren't real credentials.
        logger.error('Razorpay order creation failed:', razorpayError);
        throw new AppError(
          'Payment provider is not configured yet. Premium membership purchase is unavailable right now.',
          503
        );
      }

      logger.info(`✅ Membership order created: ${order.id}`);

      return {
        orderId: order.id,
        amount: PREMIUM_PRICE,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || '',
      };
    } catch (error) {
      logger.error('Membership order creation error:', error);
      throw error;
    }
  }

  /**
   * Verify the ₹100 membership payment's Razorpay signature (same HMAC
   * scheme already proven in PaymentService.verifyPayment) and cross-check
   * the order's own notes so a client can't reuse an unrelated valid
   * order/payment pair to unlock Premium. Only on success does this call
   * the real, already-fully-implemented MembershipService.upgradeToPremium.
   */
  static async verifyMembershipPayment(
    userId: string,
    orderId: string,
    paymentId: string,
    signature: string
  ) {
    try {
      const client = await Client.findOne({ userId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new ValidationError('Payment verification failed — invalid signature');
      }

      const order = await razorpayInstance.orders.fetch(orderId);
      const notes = (order.notes || {}) as Record<string, string>;

      if (notes.purpose !== 'membership_premium' || notes.userId !== userId) {
        throw new ValidationError('Payment verification failed — order does not match this request');
      }

      const membership = await MembershipService.upgradeToPremium(client._id.toString(), orderId);

      logger.info(`✅ Membership payment verified and Premium activated: ${userId}`);

      const updatedClient = await Client.findOne({ userId });

      return { client: updatedClient, membership };
    } catch (error) {
      logger.error('Membership payment verification error:', error);
      throw error;
    }
  }

  /**
   * Get membership status
   */
  static async getMembershipStatus(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      const membership = await Membership.findOne({ clientId: client._id }).lean();

      return {
        client: {
          status: client.membership.status,
          tier: client.membership.tier,
          startDate: client.membership.startDate,
          expiryDate: client.membership.expiryDate,
          autoRenew: client.membership.autoRenew,
        },
        membership,
        premiumPrice: PREMIUM_PRICE,
      };
    } catch (error) {
      logger.error('Membership status fetch error:', error);
      throw error;
    }
  }

  /**
   * Cancel membership — delegates to the real MembershipService so both the
   * Membership document and Client.membership stay in sync (the previous
   * inline version here only ever updated Client, silently drifting from
   * the Membership collection).
   */
  static async cancelMembership(clientUserId: string, meta?: AuditMeta) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      await MembershipService.cancelMembership(client._id.toString());

      if (meta) {
        await logClientAction(clientUserId, meta, 'UPDATE', 'membership', client._id.toString(), {
          after: { status: 'free' },
        });
      }

      return Client.findOne({ userId: clientUserId });
    } catch (error) {
      logger.error('Membership cancellation error:', error);
      throw error;
    }
  }

  /**
   * Get client dashboard data
   */
  static async getClientDashboard(clientUserId: string) {
    try {
      const client = await Client.findOne({ userId: clientUserId });

      if (!client) {
        throw new NotFoundError('Client profile');
      }

      const savedCount = client.savedCreators?.length || 0;
      const viewedCount = client.viewedCreators?.length || 0;
      const projects = await ProjectService.getProjectsByClient(client._id.toString());

      return {
        profile: client,
        stats: {
          savedCreators: savedCount,
          recentlyViewed: viewedCount,
          membershipStatus: client.membership.status,
          membershipExpiry: client.membership.expiryDate,
          activeProjects: projects.filter((p: any) =>
            ['requirements', 'review', 'quoted', 'approved', 'active'].includes(p.status)
          ).length,
          completedProjects: projects.filter((p: any) => p.status === 'completed').length,
        },
        recentProjects: projects.slice(0, 5),
      };
    } catch (error) {
      logger.error('Client dashboard error:', error);
      throw error;
    }
  }

  // ---------------------------------------------------------------------
  // Projects — real wiring on top of the already-working ProjectService.
  // Every method resolves the caller's own Client first and never trusts
  // a client-supplied id alone to select whose data to read/mutate.
  // ---------------------------------------------------------------------

  static async createClientProject(userId: string, payload: CreateClientProjectPayload, meta?: AuditMeta) {
    const client = await Client.findOne({ userId });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    const project = await ProjectService.createProjectEnquiry(client._id.toString(), payload);

    if (meta) {
      await logClientAction(userId, meta, 'CREATE', 'project', project._id.toString(), {
        after: { title: project.title, budget: project.budget, displayCode: (project as any).displayCode },
      });
    }

    try {
      await NotificationService.sendProjectNotification(userId, project.title, 'enquiry received', project._id.toString());
    } catch (notifyError) {
      logger.warn('Project notification failed (non-critical):', notifyError);
    }

    return project;
  }

  static async getClientProjects(userId: string, status?: string) {
    const client = await Client.findOne({ userId });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    return ProjectService.getProjectsByClient(client._id.toString(), status);
  }

  static async getClientProject(userId: string, projectId: string) {
    const client = await Client.findOne({ userId });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    const project = await ProjectService.getProjectById(projectId);

    if (project.clientId._id ? project.clientId._id.toString() !== client._id.toString() : project.clientId.toString() !== client._id.toString()) {
      throw new AuthorizationError('You do not have access to this project');
    }

    return project;
  }

  /**
   * Client-facing project updates are limited to real, server-controlled
   * workflow transitions (quotation approve/reject) — never an arbitrary
   * status field patch.
   */
  static async updateClientProject(
    userId: string,
    projectId: string,
    payload: { action?: 'approve_quotation' | 'reject_quotation'; description?: string },
    meta?: AuditMeta
  ) {
    const client = await Client.findOne({ userId });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    const existing = await ProjectService.getProjectById(projectId);
    const existingClientId = (existing.clientId as any)._id
      ? (existing.clientId as any)._id.toString()
      : existing.clientId.toString();

    if (existingClientId !== client._id.toString()) {
      throw new AuthorizationError('You do not have access to this project');
    }

    let project = existing;

    if (payload.action === 'approve_quotation') {
      project = await ProjectService.approveQuotation(projectId);
    } else if (payload.action === 'reject_quotation') {
      project = await ProjectService.rejectQuotation(projectId);
    } else if (payload.description) {
      project.description = payload.description;
      await project.save();
    } else {
      throw new ValidationError('No valid update action provided');
    }

    if (meta) {
      await logClientAction(userId, meta, 'UPDATE', 'project', projectId, {
        after: { status: project.status, action: payload.action },
      });
    }

    return project;
  }

  /**
   * Client review of a completed project. Only allowed once the project is
   * genuinely marked 'completed' by CC's own workflow — a client can never
   * mark their own project complete or leave a review before that happens.
   */
  static async submitProjectReview(
    userId: string,
    projectId: string,
    payload: { rating: number; feedback?: string },
    meta?: AuditMeta
  ) {
    const client = await Client.findOne({ userId });

    if (!client) {
      throw new NotFoundError('Client profile');
    }

    const project = await ProjectService.getProjectById(projectId);
    const existingClientId = (project.clientId as any)._id
      ? (project.clientId as any)._id.toString()
      : project.clientId.toString();

    if (existingClientId !== client._id.toString()) {
      throw new AuthorizationError('You do not have access to this project');
    }

    if (project.status !== 'completed') {
      throw new AppError('You can only review a completed project', 400);
    }

    if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    project.review = {
      clientFeedback: payload.feedback || project.review?.clientFeedback || '',
      rating: payload.rating,
      completedAt: project.review?.completedAt || new Date(),
    };
    await project.save();

    if (meta) {
      await logClientAction(userId, meta, 'CREATE', 'project', projectId, {
        after: { review: project.review },
      });
    }

    return project;
  }
}

export default ClientService;
