import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Wage API (Module 4)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/wages/summary', () => {
    it('should return list of wage summaries', async () => {
      prismaMock.wageSummary.findMany.mockResolvedValue([
        { id: validUUID1, userId: validUUID1, period: '2023-10' } as any
      ]);
      prismaMock.wageSummary.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/wages/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/wages/summary/:id/confirm', () => {
    it('should confirm wage successfully', async () => {
      prismaMock.wageSummary.findUnique.mockResolvedValue({ id: validUUID1 } as any);
      prismaMock.wageSummary.update.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/wages/summary/${validUUID1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/wages/summary/${validUUID1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: '' }); // invalid status

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if wage summary not found', async () => {
      prismaMock.wageSummary.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/v1/wages/summary/${validUUID1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(404);
    });
  });
});
