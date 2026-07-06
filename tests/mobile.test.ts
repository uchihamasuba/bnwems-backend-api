import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';
import { ScheduleStatus } from '@prisma/client';

describe('Mobile API', () => {
  const techToken = generateTestToken({ userId: '2', role: 'TECHNICAL' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/mobile/schedule-plans', () => {
    it('should return mobile schedule plans', async () => {
      prismaMock.schedulePlan.findMany.mockResolvedValue([{ planId: 1n, assigneeId: 2n }] as any);

      const res = await request(app)
        .get('/api/v1/mobile/schedule-plans')
        .set('Authorization', `Bearer ${techToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/mobile/schedule-plans/:id/status', () => {
    it('should update mobile schedule plan status', async () => {
      prismaMock.schedulePlan.findUnique.mockResolvedValue({ planId: 1n, assigneeId: 2n } as any);
      prismaMock.schedulePlan.update.mockResolvedValue({ planId: 1n, status: ScheduleStatus.IN_PROGRESS } as any);

      const res = await request(app)
        .put('/api/v1/mobile/schedule-plans/1/status')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ status: ScheduleStatus.IN_PROGRESS });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/mobile/orders/:id', () => {
    it('should return mobile order details', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n, customer: {}, orderItems: [] } as any);

      const res = await request(app)
        .get('/api/v1/mobile/orders/1')
        .set('Authorization', `Bearer ${techToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/mobile/schedule-plans/:id/handover', () => {
    it('should submit handover report', async () => {
      prismaMock.schedulePlan.findUnique.mockResolvedValue({ planId: 1n, assigneeId: 2n } as any);
      prismaMock.$transaction.mockResolvedValue(true as any);

      const res = await request(app)
        .post('/api/v1/mobile/schedule-plans/1/handover')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          notes: 'Handover complete',
          evidenceId: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/mobile/orders/:id/collected-reports', () => {
    it('should submit collected report', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n } as any);
      prismaMock.$transaction.mockResolvedValue(true as any);

      const res = await request(app)
        .post('/api/v1/mobile/orders/1/collected-reports')
        .set('Authorization', `Bearer ${techToken}`)
        .send({
          reportType: 'INTERNAL',
          notes: 'Collected',
          items: [
            { itemId: 1, goodQuantity: 2, damagedQuantity: 0, lostQuantity: 0 }
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
