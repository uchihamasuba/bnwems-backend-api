import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Quotation API (Module 8)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/orders/:orderId/quotations', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get(`/api/v1/orders/${validUUID1}/quotations`);
      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid orderId format', async () => {
      const res = await request(app)
        .get('/api/v1/orders/invalid-id/quotations')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return list of quotations', async () => {
      prismaMock.quotation.findMany.mockResolvedValue([
        { id: validUUID1, subtotal: 100 } as any
      ]);
      prismaMock.quotation.count.mockResolvedValue(1);

      const res = await request(app)
        .get(`/api/v1/orders/${validUUID2}/quotations`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/quotations/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/quotations/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });

    it('should return 404 if not found', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/v1/quotations/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return quotation', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: validUUID1, subtotal: 100 } as any);
      const res = await request(app)
        .get(`/api/v1/quotations/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(validUUID1);
    });
  });

  describe('POST /api/v1/orders/:orderId/quotations', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validUUID2}/quotations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subtotal: -100, // Invalid
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create quotation successfully', async () => {
      prismaMock.quotation.findFirst.mockResolvedValue(null);
      prismaMock.quotation.create.mockResolvedValue({ id: validUUID1 } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validUUID2}/quotations`)
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
        .put(`/api/v1/quotations/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subtotal: 150 });
      expect(res.status).toBe(404);
    });

    it('should return 400 if quotation is ACCEPTED (MSG-UC10-04)', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: validUUID1, status: 'ACCEPTED' } as any);
      const res = await request(app)
        .put(`/api/v1/quotations/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subtotal: 150 });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC10-04');
    });

    it('should update quotation successfully', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: validUUID1, status: 'DRAFT' } as any);
      prismaMock.quotation.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/quotations/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subtotal: 150 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.quotation.update).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/quotations/:id/confirm', () => {
    it('should confirm quotation successfully', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: validUUID1, orderId: validUUID2 } as any);
      prismaMock.$transaction.mockResolvedValue([] as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/quotations/${validUUID1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/quotations/:id', () => {
    it('should return 400 if quotation is ACCEPTED (MSG-UC10-05)', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: validUUID1, status: 'ACCEPTED' } as any);
      const res = await request(app)
        .delete(`/api/v1/quotations/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC10-05');
    });

    it('should delete quotation successfully', async () => {
      prismaMock.quotation.findUnique.mockResolvedValue({ id: validUUID1, status: 'DRAFT' } as any);
      prismaMock.quotation.delete.mockResolvedValue({} as any);

      const res = await request(app)
        .delete(`/api/v1/quotations/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.quotation.delete).toHaveBeenCalled();
    });
  });
});
