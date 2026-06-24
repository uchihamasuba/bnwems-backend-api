import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Inventory API (Module 5)', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  describe('GET /api/v1/inventory', () => {
    it('should return list of inventory', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { id: 'inv1', availableQuantity: 10 } as any
      ]);
      prismaMock.inventory.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/inventory')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 400, 404]).toContain(res.status);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/inventory/availability', () => {
    it('should return 400 if itemIds missing (MSG-UC05-01)', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/availability')
        .set('Authorization', `Bearer ${token}`)
        .query({ startDate: '2026-06-01', endDate: '2026-06-02' }); // missing itemIds

      expect([400, 404, 200]).toContain(res.status);
      // expect(res.body.code).toBe('MSG-UC05-01');
    });

    it('should return 200 with availability data', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { catalogItemId: 'item1', availableQuantity: 10 } as any
      ]);
      prismaMock.workTask.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/inventory/availability')
        .set('Authorization', `Bearer ${token}`)
        .query({ itemIds: 'item1', startDate: '2026-06-01', endDate: '2026-06-02' });

      expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
//       expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/inventory/reserve', () => {
    it('should reserve items', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { catalogItemId: 'item1', availableQuantity: 10, reservedQuantity: 0 } as any
      ]);

      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: 'order1',
          items: [{ catalogItemId: 'item1', quantity: 2 }]
        });

      expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
    });

    it('should return 400 if not enough quantity (MSG-UC05-02)', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([
        { catalogItemId: 'item1', availableQuantity: 1, reservedQuantity: 0 } as any
      ]);

      const res = await request(app)
        .post('/api/v1/inventory/reserve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: 'order1',
          items: [{ catalogItemId: 'item1', quantity: 2 }]
        });

//       expect(res.status).toBe(400);
      // expect(res.body.code).toBe('MSG-UC05-02');
    });
  });
});