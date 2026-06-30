import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Equipment API (Module 3)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const validId = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/equipment', () => {
    it('should return equipment items with pagination', async () => {
      prismaMock.equipment.findMany.mockResolvedValue([
        { equipmentItemId: 1n, name: 'Speaker', itemType: 'EQUIPMENT' } as any
      ]);
      prismaMock.equipment.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/equipment?page=1&limit=10&itemType=EQUIPMENT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 400 for invalid itemType', async () => {
      const res = await request(app)
        .get('/api/v1/equipment?itemType=INVALID')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/equipment/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/v1/equipment/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
    });

    it('should return 404 if item not found', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/v1/equipment/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return 200 and the item', async () => {
      prismaMock.equipment.findUnique.mockResolvedValue({ equipmentItemId: 1n, name: 'Test Item' } as any);
      const res = await request(app)
        .get(`/api/v1/equipment/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Item');
    });
  });

  describe('POST /api/v1/equipment', () => {
    it('should return 400 if validation fails (missing itemType)', async () => {
      const res = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Speaker Pro',
          basePrice: 500,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create new equipment item successfully', async () => {
      prismaMock.equipment.create.mockResolvedValue({ equipmentItemId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Speaker Pro',
          itemType: 'EQUIPMENT',
          basePrice: 500,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.equipment.create).toHaveBeenCalled();
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/equipment/:id', () => {
    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .put('/api/v1/equipment/abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Update', basePrice: 100 });
      expect(res.status).toBe(400);
    });

    it('should update item successfully', async () => {
      prismaMock.equipment.update.mockResolvedValue({ equipmentItemId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/equipment/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Speaker Updated', basePrice: 600 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/equipment/:id/status', () => {
    it('should update isActive status successfully', async () => {
      prismaMock.equipment.update.mockResolvedValue({ equipmentItemId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .patch(`/api/v1/equipment/${validId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.equipment.update).toHaveBeenCalled();
    });
  });
});
