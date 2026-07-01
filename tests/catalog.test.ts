import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Catalog API', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/catalog-categories', () => {
    it('should return paginated categories', async () => {
      prismaMock.catalogCategory.findMany.mockResolvedValue([{
        categoryId: 1n, name: 'Audio', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(), description: null, notes: null, _count: { items: 5 }
      }] as any);
      prismaMock.catalogCategory.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/catalog-categories?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/catalog-categories', () => {
    it('should create a new category', async () => {
      prismaMock.catalogCategory.create.mockResolvedValue({
        categoryId: 1n, name: 'Audio', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date(), description: null, notes: null
      } as any);

      const res = await request(app)
        .post('/api/v1/catalog-categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Audio' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/catalog-items', () => {
    it('should return paginated items', async () => {
      prismaMock.catalogItem.findMany.mockResolvedValue([{
        itemId: 1n, name: 'Speaker', itemType: 'EQUIPMENT', basePrice: 100 as any, isActive: true, categoryId: 1n, createdAt: new Date(), updatedAt: new Date(), description: null
      }] as any);
      prismaMock.catalogItem.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/catalog-items')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/catalog-items', () => {
    it('should create a new item', async () => {
      prismaMock.catalogItem.create.mockResolvedValue({
        itemId: 1n, name: 'Speaker', itemType: 'EQUIPMENT', basePrice: 100 as any, isActive: true, categoryId: 1n, createdAt: new Date(), updatedAt: new Date(), description: null
      } as any);

      const res = await request(app)
        .post('/api/v1/catalog-items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Speaker', itemType: 'EQUIPMENT', basePrice: 100 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
