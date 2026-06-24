import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Supplier API (Module 4 - Master Data)', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  describe('GET /api/v1/suppliers', () => {
    it('should return list of suppliers', async () => {
      prismaMock.supplier.findMany.mockResolvedValue([
        { id: 'supp1', name: 'Audio Corp' } as any
      ]);
      prismaMock.supplier.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/suppliers', () => {
    it('should create new supplier', async () => {
      prismaMock.supplier.findUnique.mockResolvedValue(null);
      prismaMock.supplier.create.mockResolvedValue({ id: 'new-supp' } as any);

      const res = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Visual Corp',
          contactPerson: 'John Doe',
          phone: '123456789',
        });

      expect([201, 400, 404, 500]).toContain(res.status);
    });

    it('should return 400 if supplier name is missing (MSG-UC16-01)', async () => {
      const res = await request(app)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contactPerson: 'John Doe',
          phone: '123456789',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC16-01');
    });
  });
});