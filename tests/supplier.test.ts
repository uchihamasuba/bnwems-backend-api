import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Supplier API (Module 4 & 12)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/suppliers', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/suppliers');
      expect(res.status).toBe(401);
    });

    it('should return list of suppliers', async () => {
      prismaMock.supplier.findMany.mockResolvedValue([
        { id: 'supp1', name: 'Audio Corp' } as any
      ]);
      prismaMock.supplier.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/suppliers', () => {
    it('should create new supplier', async () => {
      prismaMock.supplier.findUnique.mockResolvedValue(null);
      prismaMock.supplier.create.mockResolvedValue({ id: 'new-supp' } as any);

      const res = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Visual Corp',
          contactPerson: 'John Doe',
          phone: '123456789',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contactPerson: 'John Doe',
          phone: '123456789',
          // missing name
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });
});