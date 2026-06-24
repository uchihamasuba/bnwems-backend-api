import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Inventory API (Module 5)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/inventory', () => {
    it('should return 400 for invalid warehouse ID format', async () => {
      const res = await request(app)
        .get('/api/v1/inventory?warehouseId=invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return list of inventory', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { id: 'inv1', availableQuantity: 10 } as any
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

  describe('GET /api/v1/inventory/availability', () => {
    it('should return 400 if validation fails (missing query params)', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/availability')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ eventDate: '2026-06-01' }); // missing itemId

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 200 with availability data (available)', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { catalogItemId: validUUID1, availableQuantity: 10, reservedQuantity: 2, checkedOutQuantity: 1, damagedQuantity: 0, lostQuantity: 0 } as any
      ]);

      const res = await request(app)
        .get('/api/v1/inventory/availability')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ itemId: validUUID1, eventDate: '2026-06-01' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isAvailable).toBe(true);
      expect(res.body.data.availableQuantityOnDate).toBe(7); // 10 - 2 - 1 = 7
    });

    it('should return 200 with availability data (unavailable)', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { catalogItemId: validUUID1, availableQuantity: 10, reservedQuantity: 10, checkedOutQuantity: 0, damagedQuantity: 0, lostQuantity: 0 } as any
      ]);

      const res = await request(app)
        .get('/api/v1/inventory/availability')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ itemId: validUUID1, eventDate: '2026-06-01' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isAvailable).toBe(false);
      expect(res.body.data.availableQuantityOnDate).toBe(0); // 10 - 10 = 0
    });
  });

  describe('POST /api/v1/inventory/reserve', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderId: validUUID2 }); // missing items
      expect(res.status).toBe(400);
    });

    it('should return 404 if item not found in inventory', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: validUUID2,
          items: [{ catalogItemId: validUUID1, quantity: 2 }]
        });

      expect(res.status).toBe(404);
    });

    it('should return 400 if insufficient quantity (MSG-UC13-04)', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue({
        id: 'inv1', catalogItemId: validUUID1, availableQuantity: 1, reservedQuantity: 0, checkedOutQuantity: 0, damagedQuantity: 0, lostQuantity: 0
      } as any);

      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: validUUID2,
          items: [{ catalogItemId: validUUID1, quantity: 2 }] // Requesting 2 but only 1 available
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC13-04');
    });

    it('should reserve items successfully', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue({
        id: 'inv1', catalogItemId: validUUID1, availableQuantity: 10, reservedQuantity: 0, checkedOutQuantity: 0, damagedQuantity: 0, lostQuantity: 0
      } as any);
      prismaMock.inventory.update.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: validUUID2,
          items: [{ catalogItemId: validUUID1, quantity: 2 }]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.inventory.update).toHaveBeenCalled();
    });
  });
});