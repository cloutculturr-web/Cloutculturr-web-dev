import { Request, Response, NextFunction } from 'express';
import CreatorApplicationService from '@/services/creatorApplicationService.js';
import { logger } from '@/utils/logger.js';

function splitList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export class CreatorApplicationController {
  /**
   * Public: submit a new creator application
   * POST /api/creator-applications
   */
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const files = ((req.files as Express.Multer.File[]) || []).map((f) => ({
        buffer: f.buffer,
        mimetype: f.mimetype,
        originalname: f.originalname,
      }));

      const application = await CreatorApplicationService.submitApplication(
        {
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          companyName: body.companyName,
          bio: body.bio,
          location: body.location,
          experience: body.experience ? Number(body.experience) : undefined,
          languages: splitList(body.languages),
          skills: splitList(body.skills),
          website: body.website || undefined,
          socialMedia: {
            instagram: body.instagram || undefined,
            linkedin: body.linkedin || undefined,
            twitter: body.twitter || undefined,
          },
          portfolioLinks: splitList(body.portfolioLinks),
          proposedPricing: body.proposedPricing ? Number(body.proposedPricing) : undefined,
          pricingNotes: body.pricingNotes || undefined,
        },
        files
      );

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully. Our team will review it shortly.',
        data: { applicationId: application._id },
        statusCode: 201,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator application received: ${body.email}`);
    } catch (error) {
      next(error);
    }
  }
}

export default CreatorApplicationController;
