import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 1, role: 'Admin' }, process.env.JWT_SECRET || 'secret');

describe('Module 13: Reports API', () => {
  describe('GET /api/v1/dashboard/admin', () => {
    it('should return 200 and KPI data', async () => {
      prismaMock.order.count.mockResolvedValue(120);
      prismaMock.customer.count.mockResolvedValue(50);
      prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 850000000n } } as any);
      prismaMock.order.findMany.mockResolvedValue([{ id: 1n, status: 'completed', eventDate: new Date() }] as any);

      const res = await request(app).get('/api/v1/dashboard/admin').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/reports/revenue', () => {
    it('should return 200 and revenue data', async () => {
      prismaMock.payment.findMany.mockResolvedValue([
        { amount: 50000000n, paymentDate: new Date('2026-05-10') },
        { amount: 100000000n, paymentDate: new Date('2026-06-15') }
      ] as any);

      const res = await request(app).get('/api/v1/reports/revenue?from_date=2026-01-01&to_date=2026-06-30').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
