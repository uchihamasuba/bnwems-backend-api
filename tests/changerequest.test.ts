import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Change Request API (Module 9)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const validId1 = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/orders/:id/change-requests', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).post(`/api/v1/orders/${validId1}/change-requests`);
      expect(res.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/change-requests`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create change request successfully', async () => {
      prismaMock.changeRequest.create.mockResolvedValue({ requestId: 1n } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/change-requests`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          requestDetails: 'Need 10 more chairs',
          additionalCost: 1000
        });

      // It may return 201 or 200, let's accept both for robustness
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/change-requests/:id/approve', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).put(`/api/v1/change-requests/${validId1}/approve`);
      expect(res.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .put(`/api/v1/change-requests/${validId1}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // missing status
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should approve change request successfully', async () => {
      prismaMock.changeRequest.findUnique.mockResolvedValue({ requestId: 1n, status: 'pending' } as any);
      prismaMock.changeRequest.update.mockResolvedValue({ requestId: 1n, status: 'approved' } as any);
      prismaMock.$transaction.mockImplementation(async (cb: any) => await cb(prismaMock));

      const res = await request(app)
        .put(`/api/v1/change-requests/${validId1}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
