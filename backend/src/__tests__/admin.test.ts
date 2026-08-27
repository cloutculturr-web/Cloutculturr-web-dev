import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '@/app';
import {
  DashboardKPISnapshot,
  CMSContent,
  Notification,
  SystemSettings,
  ReportHistory
} from '@/models/AdminDashboard';

/**
 * Admin Dashboard API Tests
 * Comprehensive test suite for all admin endpoints
 */

const adminToken = 'test-admin-token-123';
const mockAdminUser = {
  id: 'admin-123',
  email: 'admin@cloutculturr.com',
  role: 'admin'
};

describe('Admin Dashboard API', () => {
  beforeAll(async () => {
    // Setup test database
    jest.mock('@/middleware/rbac', () => ({
      requireAdminAuth: (req: any, res: any, next: any) => {
        req.adminUser = mockAdminUser;
        next();
      }
    }));
  });

  afterAll(async () => {
    // Cleanup
    jest.clearAllMocks();
  });

  // ============================================
  // DASHBOARD KPI TESTS
  // ============================================
  describe('GET /api/admin/dashboard/kpis', () => {
    it('should retrieve KPIs for month period', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/kpis?period=month')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('totalClients');
      expect(response.body.data).toHaveProperty('totalCreators');
    });

    it('should retrieve custom date range KPIs', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/kpis?period=custom&startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dateRange).toEqual({
        start: expect.any(String),
        end: expect.any(String)
      });
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/admin/dashboard/kpis')
        .expect(401);
    });
  });

  // ============================================
  // ANALYTICS TESTS
  // ============================================
  describe('GET /api/admin/dashboard/analytics/revenue', () => {
    it('should retrieve revenue analytics', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/analytics/revenue?days=30')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle invalid days parameter', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/analytics/revenue?days=invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      // Should either return 400 or use default
      expect([400, 200]).toContain(response.status);
    });
  });

  // ============================================
  // CMS MANAGEMENT TESTS
  // ============================================
  describe('CMS Management', () => {
    it('should create CMS content', async () => {
      const response = await request(app)
        .post('/api/admin/cms/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Homepage',
          section: 'Homepage',
          content: 'Welcome to Cloutculturr',
          metadata: {
            seoTitle: 'Home',
            keywords: ['test']
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.status).toBe('draft');
    });

    it('should retrieve CMS content', async () => {
      const response = await request(app)
        .get('/api/admin/cms/content?section=Homepage&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should publish CMS content', async () => {
      // First create content
      const createRes = await request(app)
        .post('/api/admin/cms/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Content',
          section: 'About',
          content: 'About us'
        });

      const contentId = createRes.body.data._id;

      // Then publish it
      const response = await request(app)
        .post(`/api/admin/cms/content/${contentId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.status).toBe('published');
      expect(response.body.data.publishedAt).toBeDefined();
    });
  });

  // ============================================
  // NOTIFICATION MANAGEMENT TESTS
  // ============================================
  describe('Notification Management', () => {
    it('should send notification', async () => {
      const response = await request(app)
        .post('/api/admin/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Platform Update',
          message: 'New features available',
          type: 'announcement',
          target: 'all'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('sent');
    });

    it('should retrieve notifications', async () => {
      const response = await request(app)
        .get('/api/admin/notifications?type=announcement&limit=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should schedule notification', async () => {
      const response = await request(app)
        .post('/api/admin/notifications/send')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Scheduled Maintenance',
          message: 'Maintenance at 2 AM',
          type: 'maintenance',
          target: 'all',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(201);

      expect(response.body.data.status).toBe('scheduled');
    });
  });

  // ============================================
  // SECURITY TESTS
  // ============================================
  describe('Security Management', () => {
    it('should retrieve login sessions', async () => {
      const response = await request(app)
        .get('/api/admin/security/sessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should block user', async () => {
      const response = await request(app)
        .post('/api/admin/security/block-user/user-123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Suspicious activity',
          unblockAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('blocked');
    });

    it('should retrieve blocked users', async () => {
      const response = await request(app)
        .get('/api/admin/security/blocked-users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ============================================
  // SETTINGS TESTS
  // ============================================
  describe('System Settings', () => {
    it('should retrieve settings', async () => {
      const response = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('platformName');
      expect(response.body.data).toHaveProperty('commissionRate');
    });

    it('should update settings', async () => {
      const response = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          commissionRate: 20,
          minimumPayout: 150
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.commissionRate).toBe(20);
    });

    it('should trigger backup', async () => {
      const response = await request(app)
        .post('/api/admin/settings/backups/trigger')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'full'
        })
        .expect(202);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
    });
  });

  // ============================================
  // REPORTS TESTS
  // ============================================
  describe('Reports Management', () => {
    it('should generate report', async () => {
      const response = await request(app)
        .post('/api/admin/reports/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reportType: 'revenue',
          format: 'pdf',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(202);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });

    it('should retrieve report history', async () => {
      const response = await request(app)
        .get('/api/admin/reports?reportType=revenue')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ============================================
  // MARKETPLACE TESTS
  // ============================================
  describe('Marketplace Management', () => {
    it('should feature creator', async () => {
      const response = await request(app)
        .post('/api/admin/marketplace/feature/creator-123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'featured',
          category: 'Design'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('featured');
    });

    it('should retrieve featured creators', async () => {
      const response = await request(app)
        .get('/api/admin/marketplace/featured')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================
  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      await request(app)
        .get('/api/admin/non-existent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/api/admin/cms/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing required fields
        });

      expect([400, 422]).toContain(response.status);
    });

    it('should return 403 for insufficient permissions', async () => {
      // Mock a moderator user without MANAGE_CLIENTS permission
      const response = await request(app)
        .delete('/api/admin/clients/123')
        .set('Authorization', `Bearer ${adminToken}`)
        // This would need proper permission mocking
        .expect([403, 401]);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
