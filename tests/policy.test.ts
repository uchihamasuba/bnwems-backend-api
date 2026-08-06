import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Policy API (Module 6)', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId1 = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/policies', () => {
    it('should return list of policies', async () => {
      prismaMock.businessPolicy.findMany.mockResolvedValue([
        { policyId: 1n, policyType: 'DEPOSIT' } as any,
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
      prismaMock.businessPolicy.create.mockResolvedValue({ policyId: 1n } as any);

      const res = await request(app)
        .post('/api/v1/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          policyCode: 'DEP01',
          policyName: 'Standard Deposit Policy',
          policyType: 'DEPOSIT',
          policyValue: 50,
          unit: '%',
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
      prismaMock.businessPolicy.findUnique.mockResolvedValue({ policyId: 1n } as any);
      prismaMock.businessPolicy.update.mockResolvedValue({ policyId: 1n } as any);

      const res = await request(app)
        .put(`/api/v1/policies/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ policyValue: 60, unit: '%' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if policy not found', async () => {
      prismaMock.businessPolicy.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/v1/policies/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ policyValue: 60, unit: '%' });

      expect(res.status).toBe(404);
    });
  });
});
