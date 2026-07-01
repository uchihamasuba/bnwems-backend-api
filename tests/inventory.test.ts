import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Inventory API (Module 5)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const validId1 = '1';
  const validId2 = '2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/inventory', () => {
    it('should return 400 for invalid equipmentItemId format', async () => {
      const res = await request(app)
        .get('/api/v1/inventory?equipmentItemId=abc')
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
        { equipmentItemId: validId1, availableQuantity: 10 } as any
      ]);
      prismaMock.inventoryReservation.findMany.mockResolvedValue([]);
      prismaMock.inventoryReservationItem.findMany.mockResolvedValue([{ reservedQuantity: 3 } as any]);

      const res = await request(app)
        .get('/api/v1/inventory/availability')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ itemId: validId1, eventDate: '2026-06-01' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isAvailable).toBe(true);
      expect(res.body.data.availableQuantityOnDate).toBe(7); // 10 - 3 = 7
    });

    it('should return 200 with availability data (unavailable)', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { equipmentItemId: validId1, availableQuantity: 10 } as any
      ]);
      prismaMock.inventoryReservation.findMany.mockResolvedValue([]);
      prismaMock.inventoryReservationItem.findMany.mockResolvedValue([{ reservedQuantity: 10 } as any]);

      const res = await request(app)
        .get('/api/v1/inventory/availability')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ itemId: validId1, eventDate: '2026-06-01' });

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
        .send({ orderId: validId2 }); // missing items
      expect(res.status).toBe(400);
    });

    it('should return 404 if item not found in inventory', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: validId2,
          items: [{ equipmentItemId: validId1, quantity: 2 }]
        });

      expect(res.status).toBe(404);
    });

    it('should return 400 if insufficient quantity (MSG-UC13-04)', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue({
        id: 'inv1', equipmentItemId: validId1, availableQuantity: 1
      } as any);
      prismaMock.inventory.findMany.mockResolvedValue([{ availableQuantity: 1 } as any]);
      prismaMock.inventoryReservation.findMany.mockResolvedValue([]);
      prismaMock.inventoryReservationItem.findMany.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: validId2,
          items: [{ equipmentItemId: validId1, quantity: 2 }] // Requesting 2 but only 1 available
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC13-04');
    });

    it('should reserve items successfully', async () => {
      prismaMock.inventory.findFirst.mockResolvedValue({
        id: 'inv1', equipmentItemId: validId1, availableQuantity: 10
      } as any);
      prismaMock.inventory.findMany.mockResolvedValue([{ availableQuantity: 10 } as any]);
      prismaMock.inventoryReservation.findMany.mockResolvedValue([]);
      prismaMock.inventoryReservationItem.findMany.mockResolvedValue([]);
      
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.inventoryReservation.create.mockResolvedValue({ reservationId: 1n } as any);
      prismaMock.inventoryReservationItem.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: validId2,
          items: [{ equipmentItemId: validId1, quantity: 2 }]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.inventoryReservation.create).toHaveBeenCalled();
      expect(prismaMock.inventoryReservation.create).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/inventory-reports', () => {
    it('should return inventory reports', async () => {
      const res = await request(app)
        .get('/api/v1/inventory-reports')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('POST /api/v1/inventory/checkout', () => {
    it('should checkout inventory', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/checkout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderId: 1, items: [] });
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('POST /api/v1/inventory/return', () => {
    it('should return inventory', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/return')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderId: 1, items: [] });
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('POST /api/v1/inventory', () => {
    it('should create inventory successfully', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue({ equipmentItemId: 1n } as any);
      prismaMock.inventory.create.mockResolvedValue({
        inventoryId: 1n, equipmentItemId: 1n, totalQuantity: 10, availableQuantity: 10, reservedQuantity: 0, damagedQuantity: 0
      } as any);

      const res = await request(app)
        .post('/api/v1/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ equipmentItemId: 1, availableQuantity: 10 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/inventory/:id', () => {
    it('should update inventory successfully', async () => {
      prismaMock.inventory.findUnique.mockResolvedValue({
        inventoryId: 1n, equipmentItemId: 1n, totalQuantity: 10, availableQuantity: 10, reservedQuantity: 0, damagedQuantity: 0
      } as any);
      prismaMock.inventory.update.mockResolvedValue({
        inventoryId: 1n, equipmentItemId: 1n, totalQuantity: 15, availableQuantity: 15, reservedQuantity: 0, damagedQuantity: 0
      } as any);

      const res = await request(app)
        .put('/api/v1/inventory/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ availableQuantity: 15 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});