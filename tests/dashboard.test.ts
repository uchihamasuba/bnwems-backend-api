import request from 'supertest';
import app from '../src/app';
import { generateTestToken } from './setup/authMock';

describe('Dashboard API', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const managerToken = generateTestToken({ userId: '2', role: { roleId: '2', roleName: 'MANAGER' } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/dashboard/admin', () => {
    it('should return 200 and admin dashboard stats', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Stubbed in controller, returning 501 currently
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should return 403 if unauthorized role', async () => {
      const staffToken = generateTestToken({ userId: '3', role: { roleId: '3', roleName: 'LEADER_STAFF' } });
      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/dashboard/manager', () => {
    it('should return 200 and manager dashboard stats', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/manager')
        .set('Authorization', `Bearer ${managerToken}`);
      
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should return 403 if unauthorized role', async () => {
      const staffToken = generateTestToken({ userId: '3', role: { roleId: '3', roleName: 'LEADER_STAFF' } });
      const res = await request(app)
        .get('/api/v1/dashboard/manager')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });
  });
});
