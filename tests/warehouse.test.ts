import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Warehouse API (Module 5)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '123e4567-e89b-12d3-a456-426614174001';
  const validUUID3 = '123e4567-e89b-12d3-a456-426614174002';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/warehouse-histories', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/warehouse-histories');
      expect(res.status).toBe(401);
    });

    it('should return warehouse histories', async () => {
      prismaMock.warehouseHistory.findMany.mockResolvedValue([
        { id: 'hist1', transactionType: 'CHECKOUT' } as any
      ]);
      prismaMock.warehouseHistory.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/warehouse-histories?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/warehouse/checkout', () => {
    it('should return 400 if validation fails (missing items)', async () => {
      const res = await request(app)
        .post('/api/v1/warehouse/checkout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          warehouseId: validUUID1,
          orderId: validUUID2,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if item quantity is negative', async () => {
      const res = await request(app)
        .post('/api/v1/warehouse/checkout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          warehouseId: validUUID1,
          orderId: validUUID2,
          items: [{ catalogItemId: validUUID3, quantity: -1 }]
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should checkout items successfully', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue({
        id: 'inv1', catalogItemId: validUUID3, reservedQuantity: 5, checkedOutQuantity: 0
      } as any);
      prismaMock.inventory.update.mockResolvedValue({} as any);
      prismaMock.warehouseHistory.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/warehouse/checkout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          warehouseId: validUUID1,
          orderId: validUUID2,
          items: [{ catalogItemId: validUUID3, quantity: 2 }]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.inventory.update).toHaveBeenCalled();
      expect(prismaMock.warehouseHistory.create).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/warehouse/return', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/warehouse/return')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          warehouseId: validUUID1,
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return items successfully', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue({
        id: 'inv1', catalogItemId: validUUID3, checkedOutQuantity: 2, damagedQuantity: 0
      } as any);
      prismaMock.inventory.update.mockResolvedValue({} as any);
      prismaMock.warehouseHistory.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/warehouse/return')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          warehouseId: validUUID1,
          orderId: validUUID2,
          items: [{ catalogItemId: validUUID3, quantity: 1, condition: 'GOOD' }]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.inventory.update).toHaveBeenCalled();
    });

    it('should record damaged condition', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue({
        id: 'inv1', catalogItemId: validUUID3, checkedOutQuantity: 2, damagedQuantity: 0
      } as any);
      prismaMock.inventory.update.mockResolvedValue({} as any);
      prismaMock.warehouseHistory.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/warehouse/return')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          warehouseId: validUUID1,
          orderId: validUUID2,
          items: [{ catalogItemId: validUUID3, quantity: 1, condition: 'DAMAGED' }]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.inventory.update).toHaveBeenCalled();
    });
  });
});
