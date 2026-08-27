import { Request, Response, NextFunction } from 'express';
import ClientService from '@/services/clientService.js';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

function getMeta(req: Request) {
  return {
    userEmail: (req as any).user?.email || 'unknown',
    ipAddress: req.ip || (req.connection as any)?.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
  };
}

export class ClientController {
  /**
   * Get client dashboard
   * GET /api/client/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const dashboard = await ClientService.getClientDashboard(userId);

      res.status(200).json({
        success: true,
        message: 'Dashboard retrieved',
        data: dashboard,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Client dashboard retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client profile
   * GET /api/client/profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const profile = await ClientService.getClientProfile(userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved',
        data: profile,
        statusCode: 200,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update client profile
   * PUT /api/client/profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const profile = await ClientService.updateClientProfile(userId, req.body, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Profile updated',
        data: profile,
        statusCode: 200,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get marketplace with membership restrictions
   * GET /api/client/marketplace
   */
  static async getMarketplace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { page = '1', limit = '10' } = req.query;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const marketplace = await ClientService.getMarketplace(userId, Number(page), Number(limit));

      res.status(200).json({
        success: true,
        message: 'Marketplace retrieved',
        data: marketplace,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Marketplace retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get creator details from marketplace
   * GET /api/client/marketplace/:creatorId
   */
  static async getCreatorDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { creatorId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const creator = await ClientService.getCreatorDetails(creatorId, userId);

      res.status(200).json({
        success: true,
        message: 'Creator details retrieved',
        data: creator,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator details retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get saved creators
   * GET /api/client/saved-creators
   */
  static async getSavedCreators(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const creators = await ClientService.getSavedCreators(userId);

      res.status(200).json({
        success: true,
        message: 'Saved creators retrieved',
        data: creators,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Saved creators retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save creator to favorites
   * POST /api/client/save-creator/:creatorId
   */
  static async saveCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { creatorId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await ClientService.saveCreator(userId, creatorId, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Creator saved',
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator saved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unsave creator from favorites
   * DELETE /api/client/save-creator/:creatorId
   */
  static async unsaveCreator(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { creatorId } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await ClientService.unsaveCreator(userId, creatorId, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Creator unsaved',
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator unsaved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recently viewed creators
   * GET /api/client/recently-viewed
   */
  static async getRecentlyViewed(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const creators = await ClientService.getRecentlyViewed(userId);

      res.status(200).json({
        success: true,
        message: 'Recently viewed retrieved',
        data: creators,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Recently viewed retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get membership status
   * GET /api/client/membership
   */
  static async getMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const membership = await ClientService.getMembershipStatus(userId);

      res.status(200).json({
        success: true,
        message: 'Membership retrieved',
        data: membership,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Membership retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a real Razorpay order for the Premium membership purchase
   * POST /api/client/membership/order
   */
  static async createMembershipOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const order = await ClientService.createMembershipOrder(userId);

      res.status(200).json({
        success: true,
        message: 'Membership order created',
        data: order,
        statusCode: 200,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify the membership payment and activate Premium
   * POST /api/client/membership/verify
   */
  static async verifyMembershipPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { orderId, paymentId, signature } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!orderId || !paymentId || !signature) {
        throw new AppError('orderId, paymentId and signature are required', 400);
      }

      const result = await ClientService.verifyMembershipPayment(userId, orderId, paymentId, signature);

      res.status(200).json({
        success: true,
        message: 'Premium membership activated',
        data: result,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Premium membership verified for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel membership
   * POST /api/client/membership/cancel
   */
  static async cancelMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const client = await ClientService.cancelMembership(userId, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Membership cancelled',
        data: client?.membership,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Membership cancelled for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create project enquiry
   * POST /api/client/projects
   */
  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { title, description, budget, requirements, timeline, creatorId } = req.body;

      if (!title || !description || !budget || !requirements || !timeline) {
        throw new AppError('title, description, budget, requirements and timeline are required', 400);
      }

      const project = await ClientService.createClientProject(
        userId,
        { title, description, budget: Number(budget), requirements, timeline, creatorId },
        getMeta(req)
      );

      res.status(201).json({
        success: true,
        message: 'Project enquiry created',
        data: project,
        statusCode: 201,
        timestamp: new Date(),
      });

      logger.info(`✅ Project enquiry created for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client projects
   * GET /api/client/projects
   */
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { status } = req.query;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const projects = await ClientService.getClientProjects(userId, status as string | undefined);

      res.status(200).json({
        success: true,
        message: 'Projects retrieved',
        data: projects,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Projects retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get project details
   * GET /api/client/projects/:id
   */
  static async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const project = await ClientService.getClientProject(userId, id);

      res.status(200).json({
        success: true,
        message: 'Project retrieved',
        data: project,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Project retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update project (real, server-controlled transitions only)
   * PUT /api/client/projects/:id
   */
  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const project = await ClientService.updateClientProject(userId, id, req.body, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Project updated',
        data: project,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Project updated for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit a review for a completed project
   * POST /api/client/projects/:id/review
   */
  static async submitProjectReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;
      const { rating, feedback } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const project = await ClientService.submitProjectReview(
        userId,
        id,
        { rating: Number(rating), feedback },
        getMeta(req)
      );

      res.status(200).json({
        success: true,
        message: 'Review submitted',
        data: project,
        statusCode: 200,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ClientController;
