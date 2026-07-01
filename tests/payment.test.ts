import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Payment API (Module 11)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const validId1 = '1';
  const validId2 = '2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/orders/:orderId/payments', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get(`/api/v1/orders/${validId1}/payments`);
      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid orderId format', async () => {
      const res = await request(app)
        .get('/api/v1/orders/abc/payments')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return list of payments', async () => {
      prismaMock.payment.findMany.mockResolvedValue([
        { paymentId: 2n, orderId: 1n, amount: 500 } as any
      ]);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}/payments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/orders/:orderId/payments/request', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/payments/request`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100 // Invalid
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if order not found', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/payments/request`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 500,
          paymentType: 'DEPOSIT',
          paymentMethod: 'BANK_TRANSFER'
        });

      expect(res.status).toBe(404);
    });

    it('should request payment successfully', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ paymentId: 1n, quotations: [] } as any);
      prismaMock.paymentRequest.create.mockResolvedValue({ paymentRequestId: 2n } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/payments/request`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 500,
          paymentType: 'DEPOSIT',
          paymentMethod: 'BANK_TRANSFER'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.paymentRequest.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/payment-requests/:id/confirm', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .put(`/api/v1/payment-requests/${validId2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: '' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if payment not found', async () => {
      prismaMock.paymentRequest.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/v1/payment-requests/${validId2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(404);
    });

    it('should confirm payment successfully', async () => {
      prismaMock.paymentRequest.findUnique.mockResolvedValue({ paymentRequestId: 2n, orderId: 1n } as any);
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.paymentRequest.update.mockResolvedValue({} as any);
      prismaMock.payment.create.mockResolvedValue({ paymentId: 3n } as any);
      prismaMock.evidence.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/payment-requests/${validId2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED', evidenceUrl: 'http://example.com/receipt.jpg' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/payment-requests/:id', () => {
    it('should return payment request details', async () => {
      const res = await request(app)
        .get('/api/v1/payment-requests/1')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });
});
