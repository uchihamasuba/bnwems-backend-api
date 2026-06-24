import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Payment API (Module 11)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/orders/:orderId/payments', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get(`/api/v1/orders/${validUUID1}/payments`);
      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid orderId format', async () => {
      const res = await request(app)
        .get('/api/v1/orders/invalid-id/payments')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return list of payments', async () => {
      prismaMock.payment.findMany.mockResolvedValue([
        { id: validUUID2, amount: 500 } as any
      ]);

      const res = await request(app)
        .get(`/api/v1/orders/${validUUID1}/payments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/orders/:orderId/payments/request', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validUUID1}/payments/request`)
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
        .post(`/api/v1/orders/${validUUID1}/payments/request`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 500,
          paymentType: 'DEPOSIT',
          paymentMethod: 'BANK_TRANSFER'
        });

      expect(res.status).toBe(404);
    });

    it('should request payment successfully', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: validUUID1, quotations: [] } as any);
      prismaMock.payment.create.mockResolvedValue({ id: validUUID2 } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validUUID1}/payments/request`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 500,
          paymentType: 'DEPOSIT',
          paymentMethod: 'BANK_TRANSFER'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.payment.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/payments/:id/confirm', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .put(`/api/v1/payments/${validUUID2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: '' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if payment not found', async () => {
      prismaMock.payment.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/v1/payments/${validUUID2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(404);
    });

    it('should confirm payment successfully', async () => {
      prismaMock.payment.findUnique.mockResolvedValue({ id: validUUID2, paymentType: 'DEPOSIT', orderId: validUUID1 } as any);
      prismaMock.$transaction.mockResolvedValue([] as any);

      const res = await request(app)
        .put(`/api/v1/payments/${validUUID2}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED', evidenceUrl: 'http://example.com/receipt.jpg' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
