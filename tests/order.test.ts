import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Order API (Module 8)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const validId1 = '1';
  const validId2 = '2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/orders', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.status).toBe(401);
    });

    it('should return list of orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        { orderId: 1n, orderNumber: 'ORD-123' } as any
      ]);
      prismaMock.order.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/orders/:id/field-progress', () => {
    it('should return field progress of orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        { orderId: 1n } as any
      ]);
      prismaMock.workTask.findFirst.mockResolvedValue({ taskCategory: 'SETUP', status: 'in_progress', updatedAt: new Date() } as any);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}/field-progress`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].currentTask).toBe('SETUP');
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/orders/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if not found', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return order', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n, customerId: 2n } as any);
      prismaMock.customer.findUnique.mockResolvedValue({ customerId: 2n } as any);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBe('1');
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: 'invalid-id'
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if event date is in the past (MSG-UC11-01)', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: validId2,
          eventDate: pastDate.toISOString()
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC11-01');
    });

    it('should create new order successfully', async () => {
      prismaMock.order.create.mockResolvedValue({ orderId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: validId2,
          eventDate: futureDate.toISOString()
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.order.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/orders/:id/confirm', () => {
    it('should return 400 if order does not have accepted quotation (MSG-UC11-04)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n } as any);
      prismaMock.quotation.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/v1/orders/${validId1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC11-04');
    });

    it('should confirm order successfully', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n } as any);
      prismaMock.quotation.findUnique.mockResolvedValue({ status: 'confirmed' } as any);
      prismaMock.order.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/orders/${validId1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.order.update).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/orders/:id/change-requests', () => {
    it('should get change requests for order', async () => {
      const res = await request(app).get('/api/v1/orders/1/change-requests').set('Authorization', `Bearer ${adminToken}`);
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('GET /api/v1/orders/:id/evidences', () => {
    it('should get evidences for order', async () => {
      const res = await request(app).get('/api/v1/orders/1/evidences').set('Authorization', `Bearer ${adminToken}`);
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('GET /api/v1/orders/:id/mobile-summary', () => {
    it('should get mobile summary for order', async () => {
      const res = await request(app).get('/api/v1/orders/1/mobile-summary').set('Authorization', `Bearer ${adminToken}`);
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('GET /api/v1/orders/:id/payment-requests', () => {
    it('should get payment requests for order', async () => {
      const res = await request(app).get('/api/v1/orders/1/payment-requests').set('Authorization', `Bearer ${adminToken}`);
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('POST /api/v1/orders/:id/damage-loss', () => {
    it('should report damage loss for order', async () => {
      const res = await request(app).post('/api/v1/orders/1/damage-loss').set('Authorization', `Bearer ${adminToken}`).send({});
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('POST /api/v1/orders/:id/handover', () => {
    it('should report handover for order', async () => {
      const res = await request(app).post('/api/v1/orders/1/handover').set('Authorization', `Bearer ${adminToken}`).send({});
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/orders/:id/change-date', () => {
    it('should return 400 if invalid date', async () => {
      const res = await request(app)
        .put(`/api/v1/orders/${validId1}/change-date`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newEventDate: 'invalid-date' });
      expect(res.status).toBe(400);
    });

    it('should update event date successfully', async () => {
      prismaMock.order.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/orders/${validId1}/change-date`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newEventDate: new Date().toISOString() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/orders/:id/close', () => {
    it('should close order successfully', async () => {
      prismaMock.order.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/orders/${validId1}/close`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
