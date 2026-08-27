import crypto from 'crypto';
import CreatorApplication from '@/models/CreatorApplication.js';
import Creator from '@/models/Creator.js';
import CreatorTier from '@/models/CreatorTier.js';
import User from '@/models/User.js';
import FileModel from '@/models/File.js';
import Notification from '@/models/Notification.js';
import AuditLog from '@/models/AuditLog.js';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import { saveOwnerFile, resolveStoredFilePath } from '@/utils/fileStorage.js';

interface ListQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AdminMeta {
  adminId: string;
  adminEmail: string;
  ipAddress: string;
  userAgent: string;
}

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$%^&*';
  const pick = (set: string) => set[crypto.randomInt(set.length)];
  const required = [pick(upper), pick(lower), pick(digits), pick(special)];
  const all = upper + lower + digits + special;
  const rest = Array.from({ length: 8 }, () => pick(all));
  return [...required, ...rest].sort(() => crypto.randomInt(3) - 1).join('');
}

async function createAuditLog(data: {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: { before?: any; after?: any };
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
}) {
  try {
    await new AuditLog(data).save();
  } catch (error) {
    logger.error('Error creating audit log:', error);
  }
}

export class CreatorApplicationService {
  /**
   * Public submission — no auth. Creates the application, stores any
   * uploaded portfolio files privately, and notifies every admin.
   */
  static async submitApplication(
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      companyName: string;
      bio: string;
      location: string;
      experience?: number;
      languages?: string[];
      skills?: string[];
      website?: string;
      socialMedia?: { instagram?: string; linkedin?: string; twitter?: string };
      portfolioLinks?: string[];
      proposedPricing?: number;
      pricingNotes?: string;
    },
    files: { buffer: Buffer; mimetype: string; originalname: string }[]
  ) {
    const existingPending = await CreatorApplication.findOne({
      email: data.email.toLowerCase(),
      status: { $in: ['pending', 'under_review', 'changes_requested'] },
    });
    if (existingPending) {
      throw new ConflictError('An application from this email is already under review');
    }

    const application = new CreatorApplication({
      ...data,
      email: data.email.toLowerCase(),
    });
    await application.save();

    for (const file of files) {
      const { storagePath, size } = saveOwnerFile(
        'creator_application',
        application._id.toString(),
        file.buffer,
        file.mimetype
      );
      await new FileModel({
        ownerType: 'creator_application',
        ownerId: application._id,
        fileType: file.mimetype,
        originalName: file.originalname,
        size,
        storagePath,
      }).save();
    }

    const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');
    await Promise.all(
      admins.map((admin) =>
        new Notification({
          userId: admin._id,
          type: 'creator_approval',
          title: 'New creator application',
          message: `${data.firstName} ${data.lastName} (${data.companyName}) applied to join as a creator.`,
          actionUrl: `/admin/creator-applications/${application._id}`,
          metadata: {},
        }).save()
      )
    );

    logger.info(`✅ Creator application submitted: ${data.email}`);
    return application;
  }

  static async listApplications(query: ListQuery) {
    const { status, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortObj: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [applications, total] = await Promise.all([
      CreatorApplication.find(filter).skip(skip).limit(Number(limit)).sort(sortObj).lean(),
      CreatorApplication.countDocuments(filter),
    ]);

    return {
      applications,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    };
  }

  static async getApplicationById(id: string) {
    const application = await CreatorApplication.findById(id).lean();
    if (!application) throw new NotFoundError('Creator application');
    const files = await FileModel.find({ ownerType: 'creator_application', ownerId: id })
      .select('_id originalName fileType size createdAt')
      .lean();
    return { ...application, files };
  }

  static async getApplicationFile(applicationId: string, fileId: string) {
    const file = await FileModel.findOne({
      _id: fileId,
      ownerType: 'creator_application',
      ownerId: applicationId,
    });
    if (!file) throw new NotFoundError('File');
    return { file, absolutePath: resolveStoredFilePath(file.storagePath) };
  }

  static async approveApplication(
    id: string,
    input: { tierId: string; approvedAmount: number; availability?: string },
    meta: AdminMeta
  ) {
    const application = await CreatorApplication.findById(id);
    if (!application) throw new NotFoundError('Creator application');
    if (application.status === 'approved') {
      throw new ConflictError('Application already approved');
    }

    const tier = await CreatorTier.findById(input.tierId);
    if (!tier) throw new ValidationError('Selected tier does not exist');
    if (!input.approvedAmount || input.approvedAmount <= 0) {
      throw new ValidationError('Approved pricing must be a positive amount');
    }

    const existingUser = await User.findOne({ email: application.email });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const tempPassword = generateTempPassword();

    const user = new User({
      email: application.email,
      password: tempPassword,
      firstName: application.firstName,
      lastName: application.lastName,
      phoneNumber: application.phoneNumber,
      role: 'creator',
      status: 'active',
      emailVerified: false,
    });
    await user.save();

    const creator = new Creator({
      userId: user._id,
      companyName: application.companyName,
      bio: application.bio,
      location: application.location,
      experience: application.experience,
      languages: application.languages,
      skills: application.skills,
      website: application.website,
      socialMedia: application.socialMedia,
      tierId: tier._id,
      applicationId: application._id,
      pricing: {
        proposedAmount: application.proposedPricing ?? null,
        approvedAmount: input.approvedAmount,
        currency: 'INR',
        status: 'approved',
        recommendedRange: { min: tier.pricingGuidance.min, max: tier.pricingGuidance.max },
      },
      pricingHistory: [
        {
          previousAmount: null,
          newAmount: input.approvedAmount,
          changedBy: meta.adminId,
          changedAt: new Date(),
          reason: 'Initial pricing set on application approval',
        },
      ],
    });
    await creator.save();

    application.status = 'approved';
    application.reviewedBy = meta.adminId as any;
    application.reviewedAt = new Date();
    application.creatorId = creator._id as any;
    await application.save();

    await new Notification({
      userId: user._id,
      type: 'creator_approval',
      title: 'Your creator application was approved',
      message: `Welcome to CloutCulturee — you've been placed in ${tier.name}.`,
      metadata: {},
    }).save();

    await createAuditLog({
      userId: meta.adminId,
      userEmail: meta.adminEmail,
      action: 'APPROVE',
      resource: 'creator_application',
      resourceId: id,
      changes: { after: { tierId: tier._id, approvedAmount: input.approvedAmount, creatorId: creator._id } },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      status: 'success',
    });

    logger.info(`✅ Creator application approved: ${application.email} -> creator ${creator._id}`);

    return { application, creator, user, temporaryPassword: tempPassword };
  }

  static async rejectApplication(id: string, reason: string, meta: AdminMeta) {
    if (!reason || !reason.trim()) {
      throw new ValidationError('A rejection reason is required');
    }
    const application = await CreatorApplication.findById(id);
    if (!application) throw new NotFoundError('Creator application');

    application.status = 'rejected';
    application.rejectionReason = reason;
    application.reviewedBy = meta.adminId as any;
    application.reviewedAt = new Date();
    await application.save();

    await createAuditLog({
      userId: meta.adminId,
      userEmail: meta.adminEmail,
      action: 'REJECT',
      resource: 'creator_application',
      resourceId: id,
      changes: { after: { reason } },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      status: 'success',
    });

    return application;
  }

  static async requestChanges(id: string, notes: string, meta: AdminMeta) {
    if (!notes || !notes.trim()) {
      throw new ValidationError('Notes describing the requested changes are required');
    }
    const application = await CreatorApplication.findById(id);
    if (!application) throw new NotFoundError('Creator application');

    application.status = 'changes_requested';
    application.changesRequestedNotes = notes;
    application.reviewedBy = meta.adminId as any;
    application.reviewedAt = new Date();
    await application.save();

    await createAuditLog({
      userId: meta.adminId,
      userEmail: meta.adminEmail,
      action: 'REQUEST_CHANGES',
      resource: 'creator_application',
      resourceId: id,
      changes: { after: { notes } },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      status: 'success',
    });

    return application;
  }
}

export default CreatorApplicationService;
