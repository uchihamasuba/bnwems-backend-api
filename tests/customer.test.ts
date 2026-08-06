import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Customer API (Module 7)', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/customers', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/customers');
      expect(res.status).toBe(401);
    });

    it('should return list of customers', async () => {
      prismaMock.customer.findMany.mockResolvedValue([
        { customerId: 1n, fullName: 'Test Customer', phone: '0987654321' } as any,
      ]);
      prismaMock.customer.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/customers?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/customers/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/customers/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });

    it('should return 404 if customer not found', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/v1/customers/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return 200 and the customer', async () => {
      prismaMock.customer.findUnique.mockResolvedValue({
        customerId: 1n,
        fullName: 'Test Customer',
      } as any);

      const res = await request(app)
        .get(`/api/v1/customers/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Test Customer');
    });
  });

  describe('POST /api/v1/customers', () => {
    it('should return 400 if validation fails (missing phone)', async () => {
      const res = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'Test Customer',
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if phone already exists (MSG-UC09-05)', async () => {
      prismaMock.customer.findFirst.mockResolvedValue({ id: 'existing' } as any);

      const res = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'Test Customer',
          phone: '0987654321',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC09-05');
    });

    it('should create new customer successfully', async () => {
      prismaMock.customer.findFirst.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({ customerId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'Test Customer',
          phone: '0123456789',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.customer.create).toHaveBeenCalled();
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/customers/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .put('/api/v1/customers/abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Updated',
        });
      expect(res.status).toBe(400);
    });

    it('should update customer successfully', async () => {
      prismaMock.customer.update.mockResolvedValue({ customerId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/customers/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'Updated Customer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.customer.update).toHaveBeenCalled();
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });
  });
});
