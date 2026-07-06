import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';
import { ScheduleStatus } from '@prisma/client';

describe('Schedule Plans API', () => {
  const token = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/schedule-plans', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/schedule-plans');
      expect(res.status).toBe(401);
    });

    it('should return list of schedule plans', async () => {
      prismaMock.schedulePlan.findMany.mockResolvedValue([
        { scheduleId: 1n, scheduleName: 'Setup Stage' } as any,
      ]);
      prismaMock.schedulePlan.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/schedule-plans')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/schedule-plans', () => {
    it('should create new schedule plan', async () => {
      prismaMock.schedulePlan.create.mockResolvedValue({ scheduleId: 1n } as any);

      const res = await request(app)
        .post('/api/v1/schedule-plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: 1,
          taskId: 1,
          assignedTo: 1,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          notes: 'Test',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/schedule-plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          scheduleName: 'Setup Stage', // missing required fields
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/v1/schedule-plans/:id', () => {
    it('should update schedule plan', async () => {
      prismaMock.schedulePlan.findUnique.mockResolvedValue({ scheduleId: 1n } as any);
      prismaMock.schedulePlan.update.mockResolvedValue({ scheduleId: 1n } as any);

      const res = await request(app)
        .put(`/api/v1/schedule-plans/${validId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          scheduleName: 'Setup Stage Updated',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/schedule-plans/:id/status', () => {
    it('should update schedule plan status', async () => {
      prismaMock.schedulePlan.findUnique.mockResolvedValue({ scheduleId: 1n } as any);
      prismaMock.schedulePlan.update.mockResolvedValue({ scheduleId: 1n } as any);

      const res = await request(app)
        .patch(`/api/v1/schedule-plans/${validId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: ScheduleStatus.IN_PROGRESS,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
