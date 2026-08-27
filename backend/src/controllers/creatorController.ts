import { Request, Response, NextFunction } from 'express';
import CreatorService from '@/services/creatorService.js';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

function getMeta(req: Request) {
  return {
    userEmail: (req as any).user?.email || 'unknown',
    ipAddress: req.ip || (req.connection as any)?.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
  };
}

export class CreatorController {
  /**
   * Get creator dashboard
   * GET /api/creator/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const dashboard = await CreatorService.getCreatorDashboard(userId);

      res.status(200).json({
        success: true,
        message: 'Dashboard retrieved',
        data: dashboard,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator dashboard retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get creator profile
   * GET /api/creator/profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const profile = await CreatorService.getCreatorProfile(userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved',
        data: profile,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator profile retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update creator profile
   * PUT /api/creator/profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const profile = await CreatorService.updateCreatorProfile(userId, req.body, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Profile updated',
        data: profile,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator profile updated for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update creator availability
   * PUT /api/creator/availability
   */
  static async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const creator = await CreatorService.updateAvailability(userId, req.body.availability, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Availability updated',
        data: creator,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator availability updated for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get portfolio items
   * GET /api/creator/portfolio
   */
  static async getPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const items = await CreatorService.getPortfolioItems(userId);

      res.status(200).json({
        success: true,
        message: 'Portfolio retrieved',
        data: items,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator portfolio retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add portfolio item
   * POST /api/creator/portfolio
   */
  static async addPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const item = await CreatorService.addPortfolioItem(userId, req.body, getMeta(req));

      res.status(201).json({
        success: true,
        message: 'Portfolio item added',
        data: item,
        statusCode: 201,
        timestamp: new Date(),
      });

      logger.info(`✅ Portfolio item added for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update portfolio item
   * PUT /api/creator/portfolio/:id
   */
  static async updatePortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const item = await CreatorService.updatePortfolioItem(userId, id, req.body, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Portfolio item updated',
        data: item,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Portfolio item updated for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete portfolio item
   * DELETE /api/creator/portfolio/:id
   */
  static async deletePortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await CreatorService.deletePortfolioItem(userId, id, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Portfolio item deleted',
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Portfolio item deleted for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get creator packages
   * GET /api/creator/packages
   */
  static async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const packages = await CreatorService.getPackages(userId);

      res.status(200).json({
        success: true,
        message: 'Packages retrieved',
        data: packages,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator packages retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create service package
   * POST /api/creator/packages
   */
  static async createPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const pkg = await CreatorService.createPackage(userId, req.body, getMeta(req));

      res.status(201).json({
        success: true,
        message: 'Package created',
        data: pkg,
        statusCode: 201,
        timestamp: new Date(),
      });

      logger.info(`✅ Package created for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update package
   * PUT /api/creator/packages/:id
   */
  static async updatePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const pkg = await CreatorService.updatePackage(userId, id, req.body, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Package updated',
        data: pkg,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Package updated for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete package
   * DELETE /api/creator/packages/:id
   */
  static async deletePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      await CreatorService.deletePackage(userId, id, getMeta(req));

      res.status(200).json({
        success: true,
        message: 'Package deleted',
        data: null,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Package deleted for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get creator revenue/earnings
   * GET /api/creator/revenue
   */
  static async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const earnings = await CreatorService.getCreatorEarnings(userId);

      res.status(200).json({
        success: true,
        message: 'Revenue data retrieved',
        data: earnings,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator revenue retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get creator projects
   * GET /api/creator/projects
   */
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const projects = await CreatorService.getCreatorProjects(userId, req.query.status as string | undefined);

      res.status(200).json({
        success: true,
        message: 'Projects retrieved',
        data: projects,
        statusCode: 200,
        timestamp: new Date(),
      });

      logger.info(`✅ Creator projects retrieved for: ${userId}`);
    } catch (error) {
      next(error);
    }
  }
}

export default CreatorController;
