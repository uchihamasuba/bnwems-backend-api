import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Settlement API (Module 11)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const staffToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'LEADER_STAFF' } });
  const validId1 = '1';
  const validId2 = '2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/orders/:orderId/settlement', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).post(`/api/v1/orders/${validId1}/settlement`);
      expect(res.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/settlement`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          originalValue: -100 // invalid
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if discrepancy is detected (MSG-UC30-01)', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/settlement`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          originalValue: 1000,
          additionalFee: 100,
          compensation: 50,
          totalPaid: 500,
          remainingAmount: 0 // Expected: 1000 + 100 - 50 - 500 = 550. Discrepancy > 0.1
        });
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC30-01');
    });

    it('should record settlement successfully', async () => {
      prismaMock.settlement.create.mockResolvedValue({ settlementId: 2n } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/settlement`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          originalValue: 1000,
          additionalFee: 100,
          compensation: 50,
          totalPaid: 500,
          remainingAmount: 550, // Correct
          evidences: []
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.settlement.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/settlements/:id/confirm', () => {
    it('should return 400 if status is not CONFIRMED', async () => {
      const res = await request(app)
        .put(`/api/v1/settlements/${validId2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' });
      
      expect(res.status).toBe(400);
    });

    it('should return 404 if settlement not found', async () => {
      prismaMock.settlement.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/v1/settlements/${validId2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });
      
      expect(res.status).toBe(404);
    });

    it('should confirm settlement successfully', async () => {
      prismaMock.settlement.findUnique.mockResolvedValue({ settlementId: 2n, orderId: validId1 } as any);
      prismaMock.$transaction.mockResolvedValue([] as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/settlements/${validId2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
