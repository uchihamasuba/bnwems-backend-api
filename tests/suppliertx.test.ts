import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Supplier Transaction API (Module 12)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
  });



  describe('GET /api/v1/supplier-debts', () => {
    it('should return list of supplier debts', async () => {
      prismaMock.supplierDebt.findMany.mockResolvedValue([]);
      prismaMock.supplierDebt.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/supplier-debts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/v1/supplier-transactions', () => {
    it('should create new transaction', async () => {
      prismaMock.supplierTransaction.create.mockResolvedValue({ id: validUUID2, totalCost: 1000 } as any);
      prismaMock.supplierDebt.create.mockResolvedValue({} as any);
      prismaMock.$transaction.mockResolvedValue({ id: validUUID2 } as any);

      const res = await request(app)
        .post('/api/v1/supplier-transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: validUUID1,
          transactionType: 'PURCHASE',
          totalCost: 1000,
          details: {}
        });

      // It may return 201
      expect([200, 201]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/supplier-transactions/:id/receive', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .put(`/api/v1/supplier-transactions/${validUUID2}/receive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          evidenceUrls: ['invalid-url']
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should receive items successfully', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ id: validUUID2, status: 'ORDERED' } as any);
      prismaMock.supplierTransaction.update.mockResolvedValue({} as any);
      prismaMock.$transaction.mockResolvedValue([] as any);

      const res = await request(app)
        .put(`/api/v1/supplier-transactions/${validUUID2}/receive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ receivedItems: {}, evidenceUrls: ['http://example.com/receipt.jpg'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/supplier-transactions/:id/return', () => {
    it('should return items successfully', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ id: validUUID2, status: 'RECEIVED' } as any);
      prismaMock.supplierTransaction.update.mockResolvedValue({} as any);
      prismaMock.$transaction.mockResolvedValue([] as any);

      const res = await request(app)
        .put(`/api/v1/supplier-transactions/${validUUID2}/return`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ condition: 'GOOD', evidenceUrls: [] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/supplier-debts/:id/pay', () => {
    it('should pay debt successfully', async () => {
      prismaMock.supplierDebt.findUnique.mockResolvedValue({ id: validUUID2, remainingAmount: 1000, status: 'UNPAID' } as any);
      prismaMock.supplierDebt.update.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/supplier-debts/${validUUID2}/pay`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 500, paymentRef: 'TRX-123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
