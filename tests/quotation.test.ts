import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Quotation API (Module 8)', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId1 = '1';
  const validId2 = '2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/customers/:customerId/quotations', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get(`/api/v1/customers/${validId1}/quotations`);
      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid format', async () => {
      const res = await request(app)
        .get('/api/v1/customers/abc/quotations')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return list of quotations', async () => {
      prismaMock.quotation.findMany.mockResolvedValue([{ quotationId: 1n, subtotal: 100 } as any]);
      prismaMock.quotation.count.mockResolvedValue(1);

      const res = await request(app)
        .get(`/api/v1/customers/${validId2}/quotations`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/quotations/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/quotations/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });

    it('should return 404 if not found', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/v1/quotations/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return quotation', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ quotationId: 1n, subtotal: 100 } as any);
      const res = await request(app)
        .get(`/api/v1/quotations/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quotationId).toBe(validId1);
    });
  });

  describe('POST /api/v1/customers/:customerId/quotations', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/customers/${validId1}/quotations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          version: '1.0',
          items: [{ itemId: 1, quantity: 10, price: -100 }], // Invalid price
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create quotation successfully', async () => {
      prismaMock.customer.findUnique.mockResolvedValue({ customerId: 1n } as any);
      prismaMock.item.findMany.mockResolvedValue([{ itemId: 1n, itemName: 'Test Item' } as any]);
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.quotation.create.mockResolvedValue({ quotationId: 1n } as any);
      prismaMock.quotationItem.createMany.mockResolvedValue({ count: 1 } as any);

      const res = await request(app)
        .post(`/api/v1/customers/${validId2}/quotations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          version: '1.0',
          items: [{ itemId: 1, quantity: 10, price: 100 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.quotation.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/quotations/:id', () => {
    it('should return 404 if quotation not found', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .put(`/api/v1/quotations/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ items: [{ itemId: 1, quantity: 10, price: 150 }] });
      expect(res.status).toBe(404);
    });

    it('should return 400 if quotation is APPROVED (MSG-UC10-04)', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({
        quotationId: 1n,
        status: 'APPROVED',
      } as any);
      const res = await request(app)
        .put(`/api/v1/quotations/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ items: [{ itemId: 1, quantity: 10, price: 150 }] });
      expect(res.status).toBe(400);
    });

    it('should update quotation successfully', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({
        quotationId: 1n,
        status: 'DRAFT',
      } as any);
      prismaMock.item.findMany.mockResolvedValue([{ itemId: 1n, itemName: 'Test Item' } as any]);
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.quotation.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/quotations/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ items: [{ itemId: 1, quantity: 10, price: 150 }] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.quotation.update).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/v1/quotations/:id/status', () => {
    it('should update quotation status', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ quotationId: 1n } as any);
      prismaMock.quotation.update.mockResolvedValue({} as any);

      const res = await request(app)
        .patch('/api/v1/quotations/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/quotations/:id', () => {
    it('should delete quotation successfully', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({
        quotationId: 1n,
        status: 'DRAFT',
      } as any);
      prismaMock.quotation.delete.mockResolvedValue({} as any);

      const res = await request(app)
        .delete(`/api/v1/quotations/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
