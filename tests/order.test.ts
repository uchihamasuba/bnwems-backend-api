import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Order API (Module 8)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '123e4567-e89b-12d3-a456-426614174001';

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
        { id: validUUID1, orderNumber: 'ORD-123' } as any
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

  describe('GET /api/v1/orders/field-progress', () => {
    it('should return field progress of orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([
        { id: validUUID1, workTasks: [{ taskType: 'SETUP', status: 'IN_PROGRESS', updatedAt: new Date() }] } as any
      ]);

      const res = await request(app)
        .get('/api/v1/orders/field-progress')
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
        .get('/api/v1/orders/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if not found', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/v1/orders/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return order', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: validUUID1, customer: {} } as any);
      const res = await request(app)
        .get(`/api/v1/orders/${validUUID1}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(validUUID1);
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: 'invalid-id' // invalid UUID
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
          customerId: validUUID2,
          eventDate: pastDate.toISOString()
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC11-01');
    });

    it('should create new order successfully', async () => {
      prismaMock.order.create.mockResolvedValue({ id: validUUID1 } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: validUUID2,
          eventDate: futureDate.toISOString()
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.order.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/orders/:id/confirm', () => {
    it('should return 400 if order does not have accepted quotation (MSG-UC11-04)', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: validUUID1,
        quotations: [{ status: 'DRAFT' }]
      } as any);

      const res = await request(app)
        .put(`/api/v1/orders/${validUUID1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC11-04');
    });

    it('should confirm order successfully', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: validUUID1,
        quotations: [{ status: 'ACCEPTED' }]
      } as any);
      prismaMock.order.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/orders/${validUUID1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.order.update).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/orders/:id/change-date', () => {
    it('should return 400 if invalid date', async () => {
      const res = await request(app)
        .put(`/api/v1/orders/${validUUID1}/change-date`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newEventDate: 'invalid-date' });
      expect(res.status).toBe(400);
    });

    it('should update event date successfully', async () => {
      prismaMock.order.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/orders/${validUUID1}/change-date`)
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
        .put(`/api/v1/orders/${validUUID1}/close`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
