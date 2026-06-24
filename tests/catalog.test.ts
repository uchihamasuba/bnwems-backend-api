import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Catalog API (Module 3)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/catalog-items', () => {
    it('should return catalog items with pagination', async () => {
      prismaMock.catalogItem.findMany.mockResolvedValue([
        { id: validUUID, name: 'Speaker', itemType: 'EQUIPMENT' } as any
      ]);
      prismaMock.catalogItem.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/catalog-items?page=1&limit=10&itemType=EQUIPMENT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 400 for invalid itemType', async () => {
      const res = await request(app)
        .get('/api/v1/catalog-items?itemType=INVALID')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/catalog-items/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/catalog-items/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });

    it('should return 404 if item not found', async () => {
      prismaMock.catalogItem.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/v1/catalog-items/${validUUID}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return 200 and the item', async () => {
      prismaMock.catalogItem.findUnique.mockResolvedValue({ id: validUUID, name: 'Test Item' } as any);
      const res = await request(app)
        .get(`/api/v1/catalog-items/${validUUID}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Item');
    });
  });

  describe('POST /api/v1/catalog-items', () => {
    it('should return 400 if validation fails (missing itemType)', async () => {
      const res = await request(app)
        .post('/api/v1/catalog-items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Speaker Pro',
          basePrice: 500,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create new catalog item successfully', async () => {
      prismaMock.catalogItem.create.mockResolvedValue({ id: validUUID } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/catalog-items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Speaker Pro',
          itemType: 'EQUIPMENT',
          basePrice: 500,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.catalogItem.create).toHaveBeenCalled();
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/catalog-items/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .put('/api/v1/catalog-items/abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Update', basePrice: 100 });
      expect(res.status).toBe(400);
    });

    it('should update item successfully', async () => {
      prismaMock.catalogItem.update.mockResolvedValue({ id: validUUID } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/catalog-items/${validUUID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Speaker Updated', basePrice: 600 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/catalog-items/:id/deactivate', () => {
    it('should update isActive status successfully', async () => {
      prismaMock.catalogItem.update.mockResolvedValue({ id: validUUID } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/catalog-items/${validUUID}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.catalogItem.update).toHaveBeenCalled();
    });
  });
});
