import Project from '@/models/Project.js';
import Client from '@/models/Client.js';
import Creator from '@/models/Creator.js';
import { NotFoundError, ValidationError, AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

interface CreateProjectPayload {
  title: string;
  description: string;
  budget: number;
  requirements: string;
  type?: 'agency' | 'marketplace';
  creatorId?: string;
}

interface UpdateProjectPayload {
  status?: string;
  description?: string;
  budget?: number;
  quotation?: any;
  execution?: any;
}

export class ProjectService {
  /**
   * Create project enquiry
   */
  static async createProjectEnquiry(clientId: string, payload: CreateProjectPayload) {
    try {
      // Generate project code
      const projectCode = `PRJ-${Date.now()}-${uuidv4().substring(0, 8)}`.toUpperCase();

      const project = new Project({
        projectCode,
        clientId,
        creatorId: payload.creatorId || null,
        type: payload.type || 'marketplace',
        title: payload.title,
        description: payload.description,
        budget: payload.budget,
        status: 'enquiry',
        enquiry: {
          submittedAt: new Date(),
          requirements: payload.requirements,
        },
      });

      await project.save();

      logger.info(`✅ Project enquiry created: ${projectCode}`);

      return project;
    } catch (error) {
      logger.error('Project creation error:', error);
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  static async getProjectById(projectId: string) {
    try {
      const project = await Project.findById(projectId)
        .populate('clientId', 'companyName')
        .populate('creatorId', 'companyName');

      if (!project) {
        throw new NotFoundError('Project');
      }

      return project;
    } catch (error) {
      logger.error('Project fetch error:', error);
      throw error;
    }
  }

  /**
   * Get projects by client
   */
  static async getProjectsByClient(clientId: string, status?: string) {
    try {
      const query: any = { clientId };

      if (status) {
        query.status = status;
      }

      const projects = await Project.find(query)
        .populate('creatorId', 'companyName')
        .sort({ createdAt: -1 })
        .lean();

      return projects;
    } catch (error) {
      logger.error('Client projects fetch error:', error);
      throw error;
    }
  }

  /**
   * Get projects by creator
   */
  static async getProjectsByCreator(creatorId: string, status?: string) {
    try {
      const query: any = { creatorId };

      if (status) {
        query.status = status;
      }

      const projects = await Project.find(query)
        .populate('clientId', 'companyName')
        .sort({ createdAt: -1 })
        .lean();

      return projects;
    } catch (error) {
      logger.error('Creator projects fetch error:', error);
      throw error;
    }
  }

  /**
   * Update project status
   */
  static async updateProjectStatus(projectId: string, newStatus: string) {
    try {
      const validStatuses = ['enquiry', 'requirements', 'review', 'quoted', 'approved', 'active', 'completed', 'archived'];

      if (!validStatuses.includes(newStatus)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const project = await Project.findByIdAndUpdate(
        projectId,
        { status: newStatus, updatedAt: new Date() },
        { new: true }
      );

      if (!project) {
        throw new NotFoundError('Project');
      }

      logger.info(`✅ Project status updated to: ${newStatus}`);

      return project;
    } catch (error) {
      logger.error('Project status update error:', error);
      throw error;
    }
  }

  /**
   * Generate quotation
   */
  static async generateQuotation(projectId: string, amount: number, validityDays: number = 7) {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project');
      }

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validityDays);

      project.quotation = {
        generatedAt: new Date(),
        amount,
        breakdown: {
          items: [],
          subtotal: amount,
          tax: 0,
          total: amount,
        },
        validUntil,
        status: 'pending',
      };

      project.status = 'quoted';
      await project.save();

      logger.info(`✅ Quotation generated for project: ${projectId}`);

      return project;
    } catch (error) {
      logger.error('Quotation generation error:', error);
      throw error;
    }
  }

  /**
   * Approve quotation
   */
  static async approveQuotation(projectId: string) {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project');
      }

      if (!project.quotation || project.quotation.status !== 'pending') {
        throw new AppError('No pending quotation to approve', 400);
      }

      project.quotation.status = 'approved';
      project.status = 'approved';
      await project.save();

      logger.info(`✅ Quotation approved for project: ${projectId}`);

      return project;
    } catch (error) {
      logger.error('Quotation approval error:', error);
      throw error;
    }
  }

  /**
   * Reject quotation
   */
  static async rejectQuotation(projectId: string) {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project');
      }

      if (!project.quotation || project.quotation.status !== 'pending') {
        throw new AppError('No pending quotation to reject', 400);
      }

      project.quotation.status = 'rejected';
      project.status = 'enquiry';
      await project.save();

      logger.info(`✅ Quotation rejected for project: ${projectId}`);

      return project;
    } catch (error) {
      logger.error('Quotation rejection error:', error);
      throw error;
    }
  }

  /**
   * Start project execution
   */
  static async startExecution(projectId: string, startDate?: Date, endDate?: Date) {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project');
      }

      if (project.status !== 'approved') {
        throw new AppError('Project must be approved before starting execution', 400);
      }

      const start = startDate || new Date();
      const end = endDate || new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

      project.execution = {
        startDate: start,
        endDate: end,
        progress: 0,
        milestones: [],
      };

      project.status = 'active';
      await project.save();

      logger.info(`✅ Project execution started: ${projectId}`);

      return project;
    } catch (error) {
      logger.error('Execution start error:', error);
      throw error;
    }
  }

  /**
   * Update project progress
   */
  static async updateProgress(projectId: string, progress: number) {
    try {
      if (progress < 0 || progress > 100) {
        throw new ValidationError('Progress must be between 0 and 100');
      }

      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project');
      }

      if (project.execution) {
        project.execution.progress = progress;
      }

      await project.save();

      logger.info(`✅ Project progress updated to: ${progress}%`);

      return project;
    } catch (error) {
      logger.error('Progress update error:', error);
      throw error;
    }
  }

  /**
   * Complete project
   */
  static async completeProject(projectId: string, clientFeedback?: string, rating?: number) {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project');
      }

      project.status = 'completed';
      project.review = {
        clientFeedback: clientFeedback || '',
        rating: rating || 0,
        completedAt: new Date(),
      };

      // Calculate revenue distribution
      if (project.creatorId) {
        const commission = Math.round(project.budget * 0.25 * 100) / 100; // 25% commission
        const creatorShare = project.budget - commission;

        project.revenue = {
          total: project.budget,
          agencyShare: commission,
          creatorShare,
          commission,
        };
      } else {
        project.revenue = {
          total: project.budget,
          agencyShare: project.budget,
          creatorShare: 0,
          commission: 0,
        };
      }

      await project.save();

      logger.info(`✅ Project completed: ${projectId}`);

      return project;
    } catch (error) {
      logger.error('Project completion error:', error);
      throw error;
    }
  }

  /**
   * Archive project
   */
  static async archiveProject(projectId: string) {
    try {
      const project = await Project.findById(projectId);

      if (!project) {
        throw new NotFoundError('Project');
      }

      project.status = 'archived';
      await project.save();

      logger.info(`✅ Project archived: ${projectId}`);

      return project;
    } catch (error) {
      logger.error('Project archive error:', error);
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  static async getProjectStats() {
    try {
      const stats = await Project.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
              },
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },
            totalRevenue: { $sum: '$budget' },
          },
        },
      ]);

      return stats[0] || {
        total: 0,
        active: 0,
        completed: 0,
        totalRevenue: 0,
      };
    } catch (error) {
      logger.error('Project stats error:', error);
      throw error;
    }
  }
}

export default ProjectService;
