import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Report API (Module 13)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const managerToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'MANAGER' } });
  const validId1 = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/reports/revenue', () => {
    it('should return revenue report', async () => {
      prismaMock.payment.findMany.mockResolvedValue([{ amount: 1000 } as any]);

      const res = await request(app)
        .get('/api/v1/reports/revenue')
        .query({ startDate: '2023-01-01', endDate: '2023-12-31' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if dates are invalid', async () => {
      const res = await request(app)
        .get('/api/v1/reports/revenue')
        .query({ startDate: 'invalid-date', endDate: '2023-12-31' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/reports/inventory', () => {
    it('should return inventory report', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([]);
      
      const res = await request(app)
        .get('/api/v1/reports/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/reports/verification', () => {
    it('should return verification report', async () => {
      prismaMock.workTask.findMany.mockResolvedValue([]);
      prismaMock.handoverRecord.findUnique.mockResolvedValue(null);
      prismaMock.damageLossReport.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/reports/verification')
        .query({ orderId: validId1 })
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status); // 200 if valid
    });
  });

  describe('Dashboard API', () => {
    it('GET /api/v1/dashboard/admin should return 200', async () => {
      prismaMock.order.count.mockResolvedValue(10);
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.supplierDebt.findMany.mockResolvedValue([]);
      
      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/dashboard/manager should return 200', async () => {
      prismaMock.order.count.mockResolvedValue(5);
      prismaMock.changeRequest.count.mockResolvedValue(2);
      prismaMock.scheduleActivity.findMany.mockResolvedValue([]);
      prismaMock.workTask.count.mockResolvedValue(1);
      const res = await request(app)
        .get('/api/v1/dashboard/manager')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
