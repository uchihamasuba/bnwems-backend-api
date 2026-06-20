import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const managerToken = jwt.sign({ userId: 2, role: 'Manager' }, process.env.JWT_SECRET || 'secret');

describe('Module 05: Warehouse & Inventory API', () => {
  describe('GET /api/v1/inventory/availability', () => {
    it('should return 200 and inventory status', async () => {
      prismaMock.inventory.findMany.mockResolvedValue([] as any);
      prismaMock.inventoryReservation.findMany.mockResolvedValue([] as any);
      const res = await request(app)
        .get('/api/v1/inventory/availability?event_date=2026-07-01&item_ids[]=10')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/orders/:id/pick-lists', () => {
    it('should return 201 on success', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 10n } as any);
      prismaMock.pickList.create.mockResolvedValue({ id: 33n } as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      
      const res = await request(app)
        .post('/api/v1/orders/10/pick-lists')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ assignment_id: 25, warehouse_id: 1, items: [{ catalog_item_id: 10, quantity_required: 4 }] });
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/v1/orders/:id/confirm-return', () => {
    it('should return 200 on successful return confirmation', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 10n } as any);
      prismaMock.order.update.mockResolvedValue({ id: 10n } as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      
      const res = await request(app)
        .post('/api/v1/orders/10/confirm-return')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(res.status).toBe(200);
    });
  });
});
