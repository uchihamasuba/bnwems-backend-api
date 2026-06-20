import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const managerToken = jwt.sign({ userId: 2, role: 'Manager' }, process.env.JWT_SECRET || 'secret');

describe('Order Lifecycle API (Module 06)', () => {
  describe('GET /api/v1/orders', () => {
    it('should return 200 and list of orders (Happy Path)', async () => {
      const mockOrders = [
        {
          id: 88n,
          code: 'ORD-2026-0088',
          status: 'waiting_for_deposit',
          eventDate: new Date('2026-08-20T08:00:00Z'),
          customer: { fullName: 'Công ty TNHH Sự Kiện Hòa Bình', phone: '0243123456' }
        }
      ];

      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);
      prismaMock.order.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/orders?status=waiting_for_deposit&page=1')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].code).toBe('ORD-2026-0088');
    });

    it('should return empty array if no orders match status (Edge Case)', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.order.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/orders?status=returned')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return deep nested order details (Happy Path)', async () => {
      const mockOrder = {
        id: 88n,
        code: 'ORD-2026-0088',
        status: 'waiting_for_deposit',
        customer: { id: 50n, fullName: 'Công ty TNHH Sự Kiện Hòa Bình' },
        quotations: [
          {
            id: 12n,
            totalAmount: 150000000,
            lines: [
              { id: 1n, catalogItemId: 101n, quantity: 10, unitPrice: 450000 }
            ]
          }
        ]
      };

      prismaMock.order.findUnique.mockResolvedValue(mockOrder as any);

      const response = await request(app)
        .get('/api/v1/orders/88')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('ORD-2026-0088');
      expect(response.body.data.customer).toBeDefined();
    });

    it('should return 400 if ID is invalid (Bad Request)', async () => {
      const response = await request(app)
        .get('/api/v1/orders/invalid-id')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/orders/:id/quotations', () => {
    it('should return 201 on successful quotation creation (Happy Path)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 88n, status: 'surveyed' } as any);
      prismaMock.catalogItem.findUnique.mockResolvedValue({ id: 101n, name: 'Item 1', status: 'active' } as any);
      prismaMock.quotation.findFirst.mockResolvedValue(null);
      prismaMock.quotation.create.mockResolvedValue({ id: 12n, orderId: 88n, version: 1, totalAmount: 4500000, discountAmount: 0, finalAmount: 4500000, status: 'draft', lines: [] } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/v1/orders/88/quotations')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          lines: [{ catalog_item_id: 101, quantity: 10, unit_price: 450000 }],
          discount_amount: 0,
          notes: 'Báo giá chưa bao gồm VAT'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(prismaMock.quotation.create).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/v1/orders/:id/confirm', () => {
    it('should return 200 on successful confirmation (Happy Path)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ 
        id: 88n, 
        status: 'waiting_for_deposit',
        quotations: [{ status: 'approved' }],
        payments: [{ paymentType: 'deposit', status: 'confirmed' }]
      } as any);
      prismaMock.order.update.mockResolvedValue({ id: 88n, status: 'confirmed' } as any);
      prismaMock.orderStatusHistory.create.mockResolvedValue({} as any);

      const response = await request(app)
        .patch('/api/v1/orders/88/confirm')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 409 if quotation is not approved (Edge Case)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ 
        id: 88n, 
        status: 'surveyed',
        quotations: [{ status: 'draft' }],
        payments: []
      } as any);

      const response = await request(app)
        .patch('/api/v1/orders/88/confirm')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });
});
