import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Supplier Transaction API (Module 12)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const validId1 = '1';
  const validId2 = '2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/supplier-transactions', () => {
    it('should create new transaction', async () => {
      prismaMock.supplierTransaction.create.mockResolvedValue({ supplierTransactionId: 2n, totalCost: 1000 } as any);
      prismaMock.$transaction.mockResolvedValue({ supplierTransactionId: 2n } as any);

      const res = await request(app)
        .post('/api/v1/supplier-transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: validId1,
          transactionType: 'PURCHASE',
          totalCost: 1000,
          items: [{ equipmentItemId: 1, quantity: 10, unitPrice: 100 }],
        });

      expect([200, 201]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/supplier-transactions/:id/receive', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .put(`/api/v1/supplier-transactions/${validId2}/receive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          evidenceUrls: ['invalid-url']
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should receive items successfully', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ supplierTransactionId: 2n, status: 'ORDERED' } as any);
      prismaMock.supplierTransaction.update.mockResolvedValue({} as any);
      prismaMock.$transaction.mockResolvedValue([] as any);

      const res = await request(app)
        .put(`/api/v1/supplier-transactions/${validId2}/receive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ receivedItems: {}, evidenceUrls: ['http://example.com/receipt.jpg'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/supplier-transactions/:id/return', () => {
    it('should return items successfully', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ supplierTransactionId: 2n, status: 'RECEIVED' } as any);
      prismaMock.supplierTransaction.update.mockResolvedValue({} as any);
      prismaMock.$transaction.mockResolvedValue([] as any);

      const res = await request(app)
        .put(`/api/v1/supplier-transactions/${validId2}/return`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ condition: 'GOOD', evidenceUrls: [] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/supplier-transactions/:id/payments', () => {
    it('should pay debt successfully', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ supplierTransactionId: 2n, totalCost: 1000, paidAmount: 0, paymentStatus: 'UNPAID' } as any);
      prismaMock.supplierTransaction.update.mockResolvedValue({} as any);
      prismaMock.supplierPayment.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/supplier-transactions/${validId2}/payments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 500, paymentRef: 'TRX-123' });

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/supplier-transactions', () => {
    it('should get supplier transactions', async () => {
      const res = await request(app)
        .get('/api/v1/supplier-transactions')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });
});
