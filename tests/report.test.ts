import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Report API (Module 13)', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });
  const managerToken = generateTestToken({ userId: '1', role: 'MANAGER' });
  const validId1 = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/reports/revenue', () => {
    it('should return revenue report', async () => {
      prismaMock.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } } as any);

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
      prismaMock.collectedEquipmentReportItem.aggregate.mockResolvedValue({
        _sum: { damagedQuantity: 1, lostQuantity: 1 },
      } as any);

      const res = await request(app)
        .get('/api/v1/reports/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/reports/verification', () => {
    it('should return verification report', async () => {
      prismaMock.schedulePlan.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/reports/verification')
        .query({ orderId: validId1 })
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Dashboard API', () => {
    it('GET /api/v1/dashboard/admin should return 200', async () => {
      prismaMock.order.count.mockResolvedValue(10);
      prismaMock.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } } as any);
      prismaMock.supplierTransaction.aggregate.mockResolvedValue({
        _sum: { estimatedCost: 500 },
      } as any);
      prismaMock.order.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/dashboard/manager should return 200', async () => {
      prismaMock.order.count.mockResolvedValue(5);
      prismaMock.orderWarning.count.mockResolvedValue(2);
      prismaMock.schedulePlan.count.mockResolvedValue(1);
      prismaMock.orderWarning.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/dashboard/manager')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
