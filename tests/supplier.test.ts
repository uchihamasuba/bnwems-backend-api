import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';
import { TransactionType, TransactionStatus, PaymentStatus, SupplierStatus } from '@prisma/client';

describe('Supplier API (Module 4 & 12)', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/suppliers', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/suppliers');
      expect(res.status).toBe(401);
    });

    it('should return list of suppliers', async () => {
      prismaMock.supplier.findMany.mockResolvedValue([
        { supplierId: 1n, supplierCode: 'SUP-001', supplierName: 'Visual Corp' } as any,
      ]);
      prismaMock.supplier.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/suppliers', () => {
    it('should create new supplier', async () => {
      prismaMock.supplier.findFirst.mockResolvedValue(null);
      prismaMock.supplier.create.mockResolvedValue({ supplierId: 1n } as any);

      const res = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierCode: 'SUP-002',
          supplierName: 'Audio Corp',
          serviceType: 'Audio Services',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierName: 'Visual Corp',
          // missing supplierCode, serviceType
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/suppliers/:id', () => {
    it('should update supplier', async () => {
      prismaMock.supplier.findUnique.mockResolvedValue({ supplierId: 1n } as any);
      prismaMock.supplier.update.mockResolvedValue({ supplierId: 1n } as any);

      const res = await request(app)
        .put(`/api/v1/suppliers/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierName: 'Visual Corp Updated',
          status: SupplierStatus.ACTIVE,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/supplier-transactions', () => {
    it('should create supplier transaction', async () => {
      prismaMock.supplier.findUnique.mockResolvedValue({ supplierId: 1n } as any);
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n } as any);
      prismaMock.supplierTransaction.create.mockResolvedValue({ stId: 1n } as any);

      const res = await request(app)
        .post('/api/v1/supplier-transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          supplierId: 1,
          orderId: 1,
          transactionType: TransactionType.PURCHASE,
          serviceTitle: 'Rental',
          depositAmount: 500,
          items: [
            {
              itemName: 'Speaker',
              quantity: 2,
              unitCost: 100,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/supplier-transactions', () => {
    it('should get transactions', async () => {
      prismaMock.supplierTransaction.findMany.mockResolvedValue([{ stId: 1n }] as any);
      prismaMock.supplierTransaction.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/supplier-transactions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/supplier-transactions/:id', () => {
    it('should get transaction by id', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ stId: 1n } as any);

      const res = await request(app)
        .get(`/api/v1/supplier-transactions/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/supplier-transactions/:id/status', () => {
    it('should update status', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ stId: 1n } as any);
      prismaMock.supplierTransaction.update.mockResolvedValue({ stId: 1n } as any);

      const res = await request(app)
        .patch(`/api/v1/supplier-transactions/${validId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: TransactionStatus.COMPLETED,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/supplier-transactions/:id/payment-status', () => {
    it('should update payment status', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ stId: 1n } as any);
      prismaMock.supplierTransaction.update.mockResolvedValue({ stId: 1n } as any);

      const res = await request(app)
        .patch(`/api/v1/supplier-transactions/${validId}/payment-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paymentStatus: PaymentStatus.PAID,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/supplier-transactions/:id/receive', () => {
    it('should receive transaction', async () => {
      prismaMock.supplierTransaction.findUnique.mockResolvedValue({ stId: 1n } as any);
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.supplierTransactionItem.findUnique.mockResolvedValue({
        stItemId: 1n,
        itemId: 1n,
        quantity: 5,
      } as any);
      prismaMock.supplierTransactionItem.update.mockResolvedValue({} as any);
      prismaMock.inventoryTransaction.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/supplier-transactions/${validId}/receive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            {
              stItemId: 1,
              receivedQuantity: 5,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
