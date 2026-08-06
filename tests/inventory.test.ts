import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';
import { MovementType, ReportStatus } from '@prisma/client';

describe('Inventory API (Module 5)', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId1 = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/inventory', () => {
    it('should return 400 for invalid itemId format', async () => {
      const res = await request(app)
        .get('/api/v1/inventory?itemId=abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return list of inventory', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { inventoryId: 1n, quantityTotal: 10, quantityAvailable: 10 } as any,
      ]);
      prismaMock.inventory.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/inventory/adjust', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ itemId: 1 }); // missing quantityChange
      expect(res.status).toBe(400);
    });

    it('should return 404 if item not found in inventory', async () => {
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.inventory.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemId: 1,
          quantityChange: 5,
        });

      expect(res.status).toBe(404);
    });

    it('should adjust inventory successfully', async () => {
      prismaMock.inventory.findUnique.mockResolvedValue({
        inventoryId: 1n,
        itemId: 1n,
        quantityTotal: 10,
        quantityAvailable: 10,
      } as any);

      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.inventory.update.mockResolvedValue({
        inventoryId: 1n,
        itemId: 1n,
        quantityTotal: 15,
        quantityAvailable: 15,
      } as any);
      prismaMock.inventoryMovement.create.mockResolvedValue({ movementId: 1n } as any);

      const res = await request(app)
        .post('/api/v1/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemId: 1,
          quantityChange: 5,
          notes: 'Added stock',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/inventory/movements', () => {
    it('should return inventory movements', async () => {
      prismaMock.inventoryMovement.findMany.mockResolvedValue([
        { movementId: 1n, type: MovementType.ADJUSTMENT } as any,
      ]);
      prismaMock.inventoryMovement.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/inventory/movements')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/inventory/return-reports', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/return-reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderId: 1 }); // missing reportType and items
      expect(res.status).toBe(400);
    });

    it('should create return report successfully', async () => {
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.collectedEquipmentReport.create.mockResolvedValue({
        reportId: 1n,
        orderId: 1n,
        status: ReportStatus.SUBMITTED,
      } as any);

      const res = await request(app)
        .post('/api/v1/inventory/return-reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: 1,
          reportType: 'RETURN',
          items: [{ itemId: 1, goodQuantity: 5, damagedQuantity: 0, lostQuantity: 0 }],
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/inventory/return-reports/:id/confirm', () => {
    it('should confirm return report successfully', async () => {
      prismaMock.collectedEquipmentReport.findUnique.mockResolvedValue({
        reportId: 1n,
        orderId: 1n,
        status: ReportStatus.SUBMITTED,
        items: [{ itemId: 1n, goodQuantity: 5, damagedQuantity: 0, lostQuantity: 0 }],
      } as any);

      prismaMock.inventory.findUnique.mockResolvedValue({
        inventoryId: 1n,
        itemId: 1n,
        quantityTotal: 10,
        quantityAvailable: 5,
        quantityReserved: 5,
        quantityDamaged: 0,
      } as any);

      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });

      const res = await request(app)
        .put('/api/v1/inventory/return-reports/1/confirm')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
