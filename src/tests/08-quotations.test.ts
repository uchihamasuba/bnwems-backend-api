import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const managerToken = jwt.sign({ userId: 2, role: 'Manager' }, process.env.JWT_SECRET || 'secret');

describe('Module 08: Quotations API', () => {
  describe('GET /api/v1/quotations/:id', () => {
    it('should return 200 and quotation details', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: 30n, orderId: 10n, createdBy: 1n, lines: [] } as any);
      const res = await request(app).get('/api/v1/quotations/30').set('Authorization', `Bearer ${managerToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/orders/:orderId/quotations', () => {
    it('should return 201 on success', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 10n } as any);
      prismaMock.catalogItem.findUnique.mockResolvedValue({ id: 10n, name: 'Item 1', status: 'active' } as any);
      prismaMock.quotation.findFirst.mockResolvedValue(null);
      prismaMock.quotation.create.mockResolvedValue({ id: 30n, orderId: 10n, version: 1, totalAmount: 2000000, discountAmount: 200000, finalAmount: 1800000, status: 'draft', lines: [] } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      
      const res = await request(app)
        .post('/api/v1/orders/10/quotations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ discount_amount: 200000, notes: 'Báo giá lần 1', lines: [{ catalog_item_id: 10, quantity: 4, unit_price: 500000 }] });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/v1/quotations/:id', () => {
    it('should return 200 on update success', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: 30n, orderId: 10n, version: 1, order: { status: 'draft' }, lines: [] } as any);
      prismaMock.catalogItem.findUnique.mockResolvedValue({ id: 10n, name: 'Item 1', status: 'active' } as any);
      prismaMock.quotation.update.mockResolvedValue({ id: 30n, status: 'superseded' } as any);
      prismaMock.quotation.create.mockResolvedValue({ id: 31n, orderId: 10n, version: 2, totalAmount: 2000000, discountAmount: 0, finalAmount: 2000000, status: 'draft', lines: [] } as any);
      
      const res = await request(app)
        .put('/api/v1/quotations/30')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ discount_amount: 0, notes: 'Khách bỏ bớt', lines: [{ catalog_item_id: 10, quantity: 4, unit_price: 500000 }] });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/quotations/:id/approve', () => {
    it('should return 200 on approval success', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: 31n, status: 'draft', order: { status: 'draft' } } as any);
      prismaMock.quotation.update.mockResolvedValue({ id: 31n, status: 'approved' } as any);
      const res = await request(app)
        .post('/api/v1/quotations/31/approve')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(res.status).toBe(200);
    });
  });
});
