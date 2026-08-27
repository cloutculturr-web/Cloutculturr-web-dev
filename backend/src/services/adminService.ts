import User, { IUser } from '@/models/User.js';
import Creator from '@/models/Creator.js';
import Client from '@/models/Client.js';
import Project from '@/models/Project.js';
import Payment from '@/models/Payment.js';
import Membership from '@/models/Membership.js';
import Message from '@/models/Message.js';
import Notification from '@/models/Notification.js';
import AuditLog from '@/models/AuditLog.js';
import CreatorTier from '@/models/CreatorTier.js';
import { AppError, NotFoundError, ValidationError, ConflictError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import * as crypto from 'crypto';
import mongoose from 'mongoose';

interface ClientQuery {
  status?: string;
  membership?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CreatorQuery {
  status?: string;
  verification?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ProjectQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AdminService {
  /**
   * Create audit log entry
   */
  static async createAuditLog(data: {
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: { before?: any; after?: any };
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failure';
    errorMessage?: string;
  }) {
    try {
      const auditLog = new AuditLog(data);
      await auditLog.save();
      logger.info(`📝 Audit log created: ${data.action} on ${data.resource}`);
      return auditLog;
    } catch (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw - audit logging should not break main operation
    }
  }

  /**
   * ============ CLIENT MANAGEMENT ============
   */

  /**
   * Get all clients with pagination, search, and filters
   */
  static async getAllClients(query: ClientQuery, adminId: string, adminEmail: string, ipAddress: string, userAgent: string) {
    try {
      const { status, membership, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      // Build filter
      const filter: any = {};
      if (status) filter.status = status;
      if (membership) filter['membership.status'] = membership;
      if (search) {
        filter.$or = [
          { companyName: { $regex: search, $options: 'i' } },
          { industry: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const clients = await Client.find(filter)
        .populate('userId', 'firstName lastName email phoneNumber status')
        .skip(skip)
        .limit(Number(limit))
        .sort(sortObj)
        .lean();

      const total = await Client.countDocuments(filter);

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'VIEW',
        resource: 'client',
        ipAddress,
        userAgent,
        status: 'success',
      });

      return {
        clients: clients.map(client => ({
          ...client,
          userId: client.userId,
        })),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error) {
      logger.error('Error fetching clients:', error);
      throw error;
    }
  }

  /**
   * Get single client details
   */
  static async getClientDetails(clientId: string, adminId: string, adminEmail: string, ipAddress: string, userAgent: string) {
    try {
      const client = await Client.findById(clientId)
        .populate('userId', 'firstName lastName email phoneNumber status lastLogin')
        .populate('savedCreators', 'firstName lastName companyName')
        .lean();

      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Get related data
      const projects = await Project.countDocuments({ clientId });
      const payments = await Payment.countDocuments({ clientId, status: 'successful' });
      const totalSpent = await Payment.aggregate([
        { $match: { clientId: new mongoose.Types.ObjectId(clientId), status: 'successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'VIEW',
        resource: 'client',
        resourceId: clientId,
        ipAddress,
        userAgent,
        status: 'success',
      });

      return {
        ...client,
        stats: {
          projects,
          payments,
          totalSpent: totalSpent[0]?.total || 0,
        },
      };
    } catch (error) {
      logger.error('Error fetching client details:', error);
      throw error;
    }
  }

  /**
   * Update client information
   */
  static async updateClient(
    clientId: string,
    updates: any,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      const before = client.toObject();

      // Apply updates (whitelist allowed fields)
      const allowedFields = ['companyName', 'industry', 'location', 'websiteUrl', 'description'];
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          (client as any)[key] = updates[key];
        }
      });

      await client.save();

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'UPDATE',
        resource: 'client',
        resourceId: clientId,
        changes: { before, after: client.toObject() },
        ipAddress,
        userAgent,
        status: 'success',
      });

      return client;
    } catch (error) {
      logger.error('Error updating client:', error);
      throw error;
    }
  }

  /**
   * Suspend client account
   */
  static async suspendClient(
    clientId: string,
    reason: string,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Update user status
      const user = await User.findByIdAndUpdate(client.userId, { status: 'suspended' }, { new: true });

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'SUSPEND',
        resource: 'client',
        resourceId: clientId,
        changes: { after: { reason, status: 'suspended' } },
        ipAddress,
        userAgent,
        status: 'success',
      });

      return { message: 'Client suspended successfully', user };
    } catch (error) {
      logger.error('Error suspending client:', error);
      throw error;
    }
  }

  /**
   * Reactivate client account
   */
  static async reactivateClient(
    clientId: string,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Update user status
      const user = await User.findByIdAndUpdate(client.userId, { status: 'active' }, { new: true });

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'ACTIVATE',
        resource: 'client',
        resourceId: clientId,
        changes: { after: { status: 'active' } },
        ipAddress,
        userAgent,
        status: 'success',
      });

      return { message: 'Client reactivated successfully', user };
    } catch (error) {
      logger.error('Error reactivating client:', error);
      throw error;
    }
  }

  /**
   * Delete client account
   */
  static async deleteClient(
    clientId: string,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const client = await Client.findById(clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }

      const userId = client.userId;

      // Delete client and related data
      await Client.findByIdAndDelete(clientId);
      await User.findByIdAndDelete(userId);
      await Project.deleteMany({ clientId });
      await Message.deleteMany({ senderId: userId });

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'DELETE',
        resource: 'client',
        resourceId: clientId,
        ipAddress,
        userAgent,
        status: 'success',
      });

      return { message: 'Client deleted successfully' };
    } catch (error) {
      logger.error('Error deleting client:', error);
      throw error;
    }
  }

  /**
   * ============ CREATOR MANAGEMENT ============
   */

  /**
   * Create new creator account (admin-only)
   */
  static async createCreatorAccount(
    creatorData: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      companyName?: string;
    },
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      // Check if email exists
      const existingUser = await User.findOne({ email: creatorData.email.toLowerCase() });
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }

      // Generate temporary password
      const tempPassword = crypto.randomBytes(12).toString('hex');

      // Create user
      const user = new User({
        email: creatorData.email.toLowerCase(),
        password: tempPassword,
        firstName: creatorData.firstName,
        lastName: creatorData.lastName,
        phoneNumber: creatorData.phoneNumber,
        role: 'creator',
        status: 'active',
        emailVerified: true,
      });

      await user.save();

      // Create creator profile
      const creator = new Creator({
        userId: user._id,
        companyName: creatorData.companyName || `${creatorData.firstName}'s Business`,
        bio: 'Profile created by admin',
        location: 'Not specified',
        experience: 0,
        verification: {
          status: 'pending',
          badge: false,
        },
      });

      await creator.save();

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'CREATE',
        resource: 'creator',
        resourceId: user._id.toString(),
        changes: { after: { email: creatorData.email, role: 'creator' } },
        ipAddress,
        userAgent,
        status: 'success',
      });

      logger.info(`✅ Creator account created: ${creatorData.email}`);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        creator: {
          id: creator._id,
          status: creator.verification.status,
        },
        tempPassword, // Return only once
      };
    } catch (error) {
      logger.error('Error creating creator account:', error);
      throw error;
    }
  }

  /**
   * Get all creators with pagination, search, and filters
   */
  static async getAllCreators(query: CreatorQuery, adminId: string, adminEmail: string, ipAddress: string, userAgent: string) {
    try {
      const { status, verification, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      const filter: any = {};
      if (verification) filter['verification.status'] = verification;
      if (search) {
        filter.$or = [
          { companyName: { $regex: search, $options: 'i' } },
          { 'userId.firstName': { $regex: search, $options: 'i' } },
          { 'userId.lastName': { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const creators = await Creator.find(filter)
        .populate('userId', 'firstName lastName email phoneNumber status')
        .skip(skip)
        .limit(Number(limit))
        .sort(sortObj)
        .lean();

      const total = await Creator.countDocuments(filter);

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'VIEW',
        resource: 'creator',
        ipAddress,
        userAgent,
        status: 'success',
      });

      return {
        creators,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error) {
      logger.error('Error fetching creators:', error);
      throw error;
    }
  }

  /**
   * Get a single creator's full detail (profile, tier, pricing, stats)
   */
  static async getCreatorDetails(creatorId: string, adminId: string, adminEmail: string, ipAddress: string, userAgent: string) {
    try {
      const creator = await Creator.findById(creatorId)
        .populate('userId', 'firstName lastName email phoneNumber status lastLogin')
        .populate('tierId')
        .populate('pricingHistory.changedBy', 'firstName lastName email')
        .lean();

      if (!creator) {
        throw new NotFoundError('Creator');
      }

      const activeProjects = await Project.countDocuments({ creatorId, status: { $in: ['active', 'approved'] } });
      const completedProjects = await Project.countDocuments({ creatorId, status: 'completed' });

      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'VIEW',
        resource: 'creator',
        resourceId: creatorId,
        ipAddress,
        userAgent,
        status: 'success',
      });

      return {
        ...creator,
        stats: { activeProjects, completedProjects },
      };
    } catch (error) {
      logger.error('Error fetching creator details:', error);
      throw error;
    }
  }

  /**
   * Verify creator profile
   */
  static async verifyCreator(
    creatorId: string,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const creator = await Creator.findById(creatorId);
      if (!creator) {
        throw new AppError('Creator not found', 404);
      }

      creator.verification.status = 'verified';
      creator.verification.verifiedAt = new Date();
      creator.verification.badge = true;
      await creator.save();

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'VERIFY',
        resource: 'creator',
        resourceId: creatorId,
        ipAddress,
        userAgent,
        status: 'success',
      });

      return creator;
    } catch (error) {
      logger.error('Error verifying creator:', error);
      throw error;
    }
  }

  /**
   * Reject creator profile
   */
  static async rejectCreator(
    creatorId: string,
    reason: string,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const creator = await Creator.findById(creatorId);
      if (!creator) {
        throw new AppError('Creator not found', 404);
      }

      creator.verification.status = 'rejected';
      await creator.save();

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'REJECT',
        resource: 'creator',
        resourceId: creatorId,
        changes: { after: { reason, status: 'rejected' } },
        ipAddress,
        userAgent,
        status: 'success',
      });

      return creator;
    } catch (error) {
      logger.error('Error rejecting creator:', error);
      throw error;
    }
  }

  /**
   * Suspend creator account
   */
  static async suspendCreator(
    creatorId: string,
    reason: string,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const creator = await Creator.findById(creatorId);
      if (!creator) {
        throw new AppError('Creator not found', 404);
      }

      creator.suspendedAt = new Date();
      creator.suspensionReason = reason;
      await creator.save();

      // Also update user status
      await User.findByIdAndUpdate(creator.userId, { status: 'suspended' });

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'SUSPEND',
        resource: 'creator',
        resourceId: creatorId,
        changes: { after: { reason, suspended: true } },
        ipAddress,
        userAgent,
        status: 'success',
      });

      return creator;
    } catch (error) {
      logger.error('Error suspending creator:', error);
      throw error;
    }
  }

  /**
   * Delete creator account
   */
  static async deleteCreator(
    creatorId: string,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const creator = await Creator.findById(creatorId);
      if (!creator) {
        throw new AppError('Creator not found', 404);
      }

      const userId = creator.userId;

      // Delete creator and related data
      await Creator.findByIdAndDelete(creatorId);
      await User.findByIdAndDelete(userId);
      await Project.deleteMany({ creatorId });
      await Message.deleteMany({ senderId: userId });

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'DELETE',
        resource: 'creator',
        resourceId: creatorId,
        ipAddress,
        userAgent,
        status: 'success',
      });

      return { message: 'Creator deleted successfully' };
    } catch (error) {
      logger.error('Error deleting creator:', error);
      throw error;
    }
  }

  /**
   * ============ PROJECT MANAGEMENT ============
   */

  /**
   * Get all projects with filters
   */
  static async getAllProjects(query: ProjectQuery, adminId: string, adminEmail: string, ipAddress: string, userAgent: string) {
    try {
      const { status, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      const filter: any = {};
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const projects = await Project.find(filter)
        .populate('clientId', 'firstName lastName companyName')
        .populate('creatorId', 'firstName lastName companyName')
        .skip(skip)
        .limit(Number(limit))
        .sort(sortObj)
        .lean();

      const total = await Project.countDocuments(filter);

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'VIEW',
        resource: 'project',
        ipAddress,
        userAgent,
        status: 'success',
      });

      return {
        projects,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error) {
      logger.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Update project status
   */
  static async updateProjectStatus(
    projectId: string,
    newStatus: 'enquiry' | 'requirements' | 'review' | 'quoted' | 'approved' | 'active' | 'completed' | 'archived',
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new AppError('Project not found', 404);
      }

      const before = project.toObject();
      project.status = newStatus;
      await project.save();

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'UPDATE',
        resource: 'project',
        resourceId: projectId,
        changes: { before, after: project.toObject() },
        ipAddress,
        userAgent,
        status: 'success',
      });

      return project;
    } catch (error) {
      logger.error('Error updating project status:', error);
      throw error;
    }
  }

  /**
   * ============ ANALYTICS ============
   */

  /**
   * Get platform statistics
   */
  static async getPlatformStats(adminId: string, adminEmail: string, ipAddress: string, userAgent: string) {
    try {
      const totalCreators = await Creator.countDocuments();
      const activeCreators = await Creator.countDocuments({ status: 'active' });
      const verifiedCreators = await Creator.countDocuments({ verificationStatus: 'verified' });
      const pendingCreators = await Creator.countDocuments({ verificationStatus: 'pending' });

      const totalClients = await Client.countDocuments();
      const premiumClients = await Client.countDocuments({ 'membership.status': 'premium' });
      const freeClients = await Client.countDocuments({ 'membership.status': 'free' });

      const totalProjects = await Project.countDocuments();
      const activeProjects = await Project.countDocuments({ status: 'active' });
      const completedProjects = await Project.countDocuments({ status: 'completed' });

      // Get revenue data
      const revenueData = await Payment.aggregate([
        { $match: { status: 'successful' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalCommission: { $sum: '$breakdown.commission' },
            totalTransactions: { $sum: 1 },
          },
        },
      ]);

      const revenue = revenueData[0] || { totalRevenue: 0, totalCommission: 0, totalTransactions: 0 };

      // Audit log
      await this.createAuditLog({
        userId: adminId,
        userEmail: adminEmail,
        action: 'VIEW',
        resource: 'admin',
        ipAddress,
        userAgent,
        status: 'success',
      });

      return {
        creators: { total: totalCreators, active: activeCreators, verified: verifiedCreators, pending: pendingCreators },
        clients: { total: totalClients, premium: premiumClients, free: freeClients },
        projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
        revenue: {
          total: revenue.totalRevenue,
          commission: revenue.totalCommission,
          transactions: revenue.totalTransactions,
        },
      };
    } catch (error) {
      logger.error('Error fetching platform stats:', error);
      throw error;
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(
    query: { page?: number; limit?: number; resource?: string; action?: string },
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      const { page = 1, limit = 20, resource, action } = query;

      const filter: any = {};
      if (resource) filter.resource = resource;
      if (action) filter.action = action;

      const skip = (Number(page) - 1) * Number(limit);

      const logs = await AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const total = await AuditLog.countDocuments(filter);

      return {
        logs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * ============ CREATOR TIER MANAGEMENT ============
   */

  static async listCreatorTiers() {
    return CreatorTier.find().sort({ level: 1 }).lean();
  }

  static async createCreatorTier(
    data: { name: string; level: 1 | 2 | 3; description?: string; pricingGuidance?: { min?: number; max?: number; currency?: string }; eligibilityCriteria?: string; status?: 'active' | 'inactive' },
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    const existing = await CreatorTier.findOne({ level: data.level });
    if (existing) {
      throw new ConflictError(`Tier level ${data.level} already exists`);
    }

    const tier = new CreatorTier({
      name: data.name,
      level: data.level,
      description: data.description || '',
      pricingGuidance: {
        min: data.pricingGuidance?.min ?? null,
        max: data.pricingGuidance?.max ?? null,
        currency: data.pricingGuidance?.currency || 'INR',
      },
      eligibilityCriteria: data.eligibilityCriteria || '',
      status: data.status || 'active',
      order: data.level,
    });
    await tier.save();

    await this.createAuditLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'CREATE',
      resource: 'creator_tier',
      resourceId: tier._id.toString(),
      changes: { after: tier.toObject() },
      ipAddress,
      userAgent,
      status: 'success',
    });

    return tier;
  }

  static async updateCreatorTier(
    tierId: string,
    data: Partial<{ name: string; description: string; pricingGuidance: { min?: number; max?: number; currency?: string }; eligibilityCriteria: string; status: 'active' | 'inactive' }>,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    const tier = await CreatorTier.findById(tierId);
    if (!tier) throw new NotFoundError('Creator tier');

    const before = tier.toObject();

    if (data.name !== undefined) tier.name = data.name;
    if (data.description !== undefined) tier.description = data.description;
    if (data.eligibilityCriteria !== undefined) tier.eligibilityCriteria = data.eligibilityCriteria;
    if (data.status !== undefined) tier.status = data.status;
    if (data.pricingGuidance) {
      if (data.pricingGuidance.min !== undefined) tier.pricingGuidance.min = data.pricingGuidance.min;
      if (data.pricingGuidance.max !== undefined) tier.pricingGuidance.max = data.pricingGuidance.max;
      if (data.pricingGuidance.currency !== undefined) tier.pricingGuidance.currency = data.pricingGuidance.currency;
    }

    await tier.save();

    await this.createAuditLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'UPDATE',
      resource: 'creator_tier',
      resourceId: tierId,
      changes: { before, after: tier.toObject() },
      ipAddress,
      userAgent,
      status: 'success',
    });

    return tier;
  }

  /**
   * ============ CREATOR PRICING & TIER ASSIGNMENT ============
   */

  static async getCreatorPricingHistory(creatorId: string) {
    const creator = await Creator.findById(creatorId).select('pricing pricingHistory').populate('pricingHistory.changedBy', 'firstName lastName email').lean();
    if (!creator) throw new NotFoundError('Creator');
    return { pricing: creator.pricing, history: creator.pricingHistory };
  }

  static async approveCreatorPricing(
    creatorId: string,
    input: { approvedAmount: number; reason: string },
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    if (!input.approvedAmount || input.approvedAmount <= 0) {
      throw new ValidationError('Approved amount must be a positive number');
    }
    if (!input.reason || !input.reason.trim()) {
      throw new ValidationError('A reason is required for pricing changes');
    }

    const creator = await Creator.findById(creatorId);
    if (!creator) throw new NotFoundError('Creator');

    const previousAmount = creator.pricing.approvedAmount;
    creator.pricing.approvedAmount = input.approvedAmount;
    creator.pricing.status = 'approved';
    creator.pricingHistory.push({
      previousAmount,
      newAmount: input.approvedAmount,
      changedBy: adminId as any,
      changedAt: new Date(),
      reason: input.reason,
    });
    await creator.save();

    await this.createAuditLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'PRICING_APPROVE',
      resource: 'creator',
      resourceId: creatorId,
      changes: { before: { approvedAmount: previousAmount }, after: { approvedAmount: input.approvedAmount, reason: input.reason } },
      ipAddress,
      userAgent,
      status: 'success',
    });

    return creator;
  }

  static async rejectCreatorPricing(
    creatorId: string,
    reason: string,
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    if (!reason || !reason.trim()) {
      throw new ValidationError('A reason is required to reject pricing');
    }
    const creator = await Creator.findById(creatorId);
    if (!creator) throw new NotFoundError('Creator');

    creator.pricing.status = 'rejected';
    await creator.save();

    await this.createAuditLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'PRICING_REJECT',
      resource: 'creator',
      resourceId: creatorId,
      changes: { after: { reason } },
      ipAddress,
      userAgent,
      status: 'success',
    });

    return creator;
  }

  static async changeCreatorTier(
    creatorId: string,
    input: { tierId: string; reason: string },
    adminId: string,
    adminEmail: string,
    ipAddress: string,
    userAgent: string
  ) {
    if (!input.reason || !input.reason.trim()) {
      throw new ValidationError('A reason is required for tier changes');
    }
    const [creator, tier] = await Promise.all([
      Creator.findById(creatorId),
      CreatorTier.findById(input.tierId),
    ]);
    if (!creator) throw new NotFoundError('Creator');
    if (!tier) throw new ValidationError('Selected tier does not exist');

    const previousTierId = creator.tierId;
    creator.tierId = tier._id as any;
    creator.pricing.recommendedRange = { min: tier.pricingGuidance.min, max: tier.pricingGuidance.max };
    await creator.save();

    await this.createAuditLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'TIER_CHANGE',
      resource: 'creator',
      resourceId: creatorId,
      changes: { before: { tierId: previousTierId }, after: { tierId: tier._id, reason: input.reason } },
      ipAddress,
      userAgent,
      status: 'success',
    });

    return creator;
  }
}

export default AdminService;
