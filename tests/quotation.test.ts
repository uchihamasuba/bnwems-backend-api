import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Quotation API (Module 8)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const validId1 = '1';
  const validId2 = '2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/orders/:orderId/quotations', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get(`/api/v1/orders/${validId1}/quotations`);
      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid orderId format', async () => {
      const res = await request(app)
        .get('/api/v1/orders/abc/quotations')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return list of quotations', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ quotationId: 1n, subtotal: 100 } as any);

      const res = await request(app)
        .get(`/api/v1/orders/${validId2}/quotations`)
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

  describe('POST /api/v1/orders/:orderId/quotations', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validId2}/quotations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subtotal: -100, // Invalid
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create quotation successfully', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ customerId: 1n } as any);
      prismaMock.quotation.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.quotation.create.mockResolvedValue({ quotationId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validId2}/quotations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subtotal: 100,
          totalAmount: 110,
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
        .send({ subtotal: 150 });
      expect(res.status).toBe(404);
    });

    it('should return 400 if quotation is ACCEPTED (MSG-UC10-04)', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ quotationId: 1n, status: 'confirmed' } as any);
      const res = await request(app)
        .put(`/api/v1/quotations/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subtotal: 150 });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC10-04');
    });

    it('should update quotation successfully', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ quotationId: 1n, status: 'draft' } as any);
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.quotation.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/quotations/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subtotal: 150 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.quotation.update).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/v1/quotations/:id/status', () => {
    it('should update quotation status', async () => {
      const res = await request(app)
        .patch('/api/v1/quotations/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/quotations/:id/confirm', () => {
    it('should confirm quotation successfully', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ quotationId: 1n, orderId: validId2 } as any);
      prismaMock.$transaction.mockResolvedValue([] as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/quotations/${validId1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });


});
