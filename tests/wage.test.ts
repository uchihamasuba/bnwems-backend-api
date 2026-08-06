import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Wage API (Module 4)', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId1 = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/wages', () => {
    it('should return list of wage summaries', async () => {
      prismaMock.wageRecord.findMany.mockResolvedValue([
        { wageId: 1n, userId: validId1, period: '2023-10' } as any,
      ]);
      prismaMock.wageRecord.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/wages')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/wages/:id/confirm', () => {
    it('should confirm wage successfully', async () => {
      prismaMock.wageRecord.findUnique.mockResolvedValue({ wageId: 1n } as any);
      prismaMock.wageRecord.update.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/wages/${validId1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/wages/${validId1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: '' }); // invalid status

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if wage summary not found', async () => {
      prismaMock.wageRecord.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/v1/wages/${validId1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(404);
    });
  });
});
