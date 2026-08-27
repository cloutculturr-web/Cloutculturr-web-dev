import { Request, Response, NextFunction } from 'express';
import ClientService from '@/services/clientService.js';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

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

      await ClientService.saveCreator(userId, creatorId);

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

      await ClientService.unsaveCreator(userId, creatorId);

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
   * Upgrade to premium
   * POST /api/client/membership/upgrade
   */
  static async upgradeToPremium(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // TODO: Create Razorpay order and return checkout URL
      const client = await ClientService.upgradeToPremium(userId);

      res.status(200).json({
        success: true,
        message: 'Premium upgrade initiated',
        data: {
          membership: client.membership,
          // TODO: Add Razorpay order details
        },
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Premium upgrade initiated for: ${userId}`);
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

      const client = await ClientService.cancelMembership(userId);

      res.status(200).json({
        success: true,
        message: 'Membership cancelled',
        data: client.membership,
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
      const { title, description, budget, requirements } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // TODO: Implement project creation via ProjectService
      res.status(201).json({
        success: true,
        message: 'Project enquiry created',
        data: {
          // TODO: Return project data
        },
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

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // TODO: Implement project fetching
      res.status(200).json({
        success: true,
        message: 'Projects retrieved',
        data: [],
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

      // TODO: Implement project detail fetching
      res.status(200).json({
        success: true,
        message: 'Project retrieved',
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Project retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update project
   * PUT /api/client/projects/:id
   */
  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // TODO: Implement project update
      res.status(200).json({
        success: true,
        message: 'Project updated',
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Project updated for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }
}

export default ClientController;
