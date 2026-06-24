import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Policy API (Module 6)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/policies', () => {
    it('should return list of policies', async () => {
      prismaMock.businessPolicy.findMany.mockResolvedValue([
        { id: validUUID1, policyType: 'DEPOSIT' } as any
      ]);

      const res = await request(app)
        .get('/api/v1/policies')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/policies', () => {
    it('should create new policy', async () => {
      prismaMock.businessPolicy.create.mockResolvedValue({ id: validUUID1 } as any);

      const res = await request(app)
        .post('/api/v1/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          policyType: 'DEPOSIT',
          name: 'Standard Deposit Policy',
          rules: { percentage: 50 }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          policyType: 'DEPOSIT',
          // missing name
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/policies/:id', () => {
    it('should update policy successfully', async () => {
      prismaMock.businessPolicy.findUnique.mockResolvedValue({ id: validUUID1 } as any);
      prismaMock.businessPolicy.update.mockResolvedValue({ id: validUUID1 } as any);

      const res = await request(app)
        .put(`/api/v1/policies/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rules: { percentage: 60 } });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if policy not found', async () => {
      prismaMock.businessPolicy.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/v1/policies/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rules: { percentage: 60 } });

      expect(res.status).toBe(404);
    });
  });
});
