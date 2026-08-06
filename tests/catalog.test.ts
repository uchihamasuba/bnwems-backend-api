import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';
import { ItemStatus } from '@prisma/client';

describe('Catalog API', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/catalog/categories', () => {
    it('should return paginated categories', async () => {
      prismaMock.itemCategory.findMany.mockResolvedValue([
        {
          categoryId: 1n,
          categoryName: 'Audio',
          description: null,
        },
      ] as any);
      prismaMock.itemCategory.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/catalog/categories?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/catalog/categories', () => {
    it('should create a new category', async () => {
      prismaMock.itemCategory.create.mockResolvedValue({
        categoryId: 1n,
        categoryName: 'Audio',
        description: null,
      } as any);

      const res = await request(app)
        .post('/api/v1/catalog/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Audio' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/catalog/items', () => {
    it('should return paginated items', async () => {
      prismaMock.item.findMany.mockResolvedValue([
        {
          itemId: 1n,
          itemCode: 'SPK-01',
          itemName: 'Speaker',
          typeId: 1n,
          description: null,
          unit: 'Cái',
          rentalPrice: 100,
          priceValidFrom: null,
          imageUrl: null,
          status: ItemStatus.ACTIVE,
        },
      ] as any);
      prismaMock.item.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/catalog/items')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/catalog/items', () => {
    it('should create a new item', async () => {
      prismaMock.item.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockResolvedValue({
        itemId: 1n,
        itemCode: 'SPK-01',
        itemName: 'Speaker',
        typeId: 1n,
        description: null,
        unit: 'Cái',
        rentalPrice: 100,
        priceValidFrom: null,
        imageUrl: null,
        status: ItemStatus.ACTIVE,
      } as any);

      const res = await request(app)
        .post('/api/v1/catalog/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemCode: 'SPK-01',
          itemName: 'Speaker',
          typeId: 1,
          unit: 'Cái',
          rentalPrice: 100,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/catalog/items/:id', () => {
    it('should return item by id', async () => {
      prismaMock.item.findUnique.mockResolvedValue({ itemId: 1n, itemCode: 'SPK-01' } as any);
      const res = await request(app)
        .get('/api/v1/catalog/items/1')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/catalog/items/:id', () => {
    it('should update an item', async () => {
      prismaMock.item.findUnique.mockResolvedValue({ itemId: 1n } as any);
      prismaMock.item.update.mockResolvedValue({ itemId: 1n } as any);
      const res = await request(app)
        .put('/api/v1/catalog/items/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ itemName: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/catalog/items/:id/status', () => {
    it('should update item status', async () => {
      prismaMock.item.findUnique.mockResolvedValue({ itemId: 1n } as any);
      prismaMock.item.update.mockResolvedValue({ itemId: 1n, status: ItemStatus.INACTIVE } as any);
      const res = await request(app)
        .patch('/api/v1/catalog/items/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: ItemStatus.INACTIVE });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/catalog/types', () => {
    it('should return paginated item types', async () => {
      prismaMock.itemType.findMany.mockResolvedValue([{ typeId: 1n, typeName: 'Type1' }] as any);
      prismaMock.itemType.count.mockResolvedValue(1);
      const res = await request(app)
        .get('/api/v1/catalog/types')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/catalog/types', () => {
    it('should create item type', async () => {
      prismaMock.itemType.create.mockResolvedValue({ typeId: 1n } as any);
      const res = await request(app)
        .post('/api/v1/catalog/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryId: 1, typeName: 'Type1' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/catalog/types/:id', () => {
    it('should update item type', async () => {
      prismaMock.itemType.findUnique.mockResolvedValue({ typeId: 1n } as any);
      prismaMock.itemType.update.mockResolvedValue({ typeId: 1n } as any);
      const res = await request(app)
        .put('/api/v1/catalog/types/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ typeName: 'Updated Type' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/catalog/types/:id/specs', () => {
    it('should return item type specs', async () => {
      prismaMock.itemType.findUnique.mockResolvedValue({ typeId: 1n } as any);
      prismaMock.itemTypeSpec.findMany.mockResolvedValue([{ specId: 1n, componentItem: { itemName: 'Test' } }] as any);
      const res = await request(app)
        .get('/api/v1/catalog/types/1/specs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/catalog/types/:id/specs', () => {
    it('should create item type spec', async () => {
      prismaMock.itemType.findUnique.mockResolvedValue({ typeId: 1n } as any);
      prismaMock.$transaction.mockResolvedValue(true as any);
      const res = await request(app)
        .post('/api/v1/catalog/types/1/specs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ specs: [{ componentItemId: 1, quantity: 2 }] });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/catalog/categories/:id', () => {
    it('should update a category', async () => {
      prismaMock.itemCategory.findUnique.mockResolvedValue({ categoryId: 1n } as any);
      prismaMock.itemCategory.update.mockResolvedValue({ categoryId: 1n } as any);
      const res = await request(app)
        .put('/api/v1/catalog/categories/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
