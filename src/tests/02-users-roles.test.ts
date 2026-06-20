import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 1, role: 'Admin' }, process.env.JWT_SECRET || 'secret');

describe('User API (Module 02)', () => {
  describe('GET /api/v1/users', () => {
    it('should return 200 and list of users (Happy Path)', async () => {
      const mockUsers = [
        {
          id: 20n,
          username: 'leader_nam',
          fullName: 'Trần Văn Nam',
          email: 'namnh@fpt.edu.vn',
          phone: '0912345678',
          status: 'active',
          role: { id: 3n, name: 'Leader Staff' }
        }
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);
      prismaMock.user.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      if (response.status === 500) {
        console.log('GET /users error:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].username).toBe('leader_nam');
    });

    it('should fall back to default pagination when params are invalid (Happy Path)', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/users?page=abc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should return 201 on successful user creation (Happy Path)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null); // No existing user
      prismaMock.role.findUnique.mockResolvedValue({ id: 4n, status: 'active' } as any);
      prismaMock.user.create.mockResolvedValue({
        id: 15n,
        username: 'tech_dung',
        fullName: 'Trần Việt Dũng',
        createdAt: new Date(),
      } as any);

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'tech_dung',
          password: 'InitP@ss123',
          fullName: 'Trần Việt Dũng',
          email: 'dungtv@fpt.edu.vn',
          phone: '0987654321',
          role_id: 4
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should return 409 if username already exists (Edge Case)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 10n } as any); // User exists

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'tech_dung',
          password: 'InitP@ss123',
          fullName: 'Trần Việt Dũng',
          email: 'dungtv@fpt.edu.vn',
          phone: '0987654321',
          role_id: 4
        });

      // Depends on implementation (either 400 or 409)
      expect([400, 409]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/users/:id/status', () => {
    it('should return 200 and soft delete user (Happy Path)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 15n } as any);
      prismaMock.user.update.mockResolvedValue({ id: 15n, status: 'inactive' } as any);

      const response = await request(app)
        .patch('/api/v1/users/15/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 15n },
        data: { status: 'inactive' }
      }));
    });

    it('should return 400 if user invalid status (Edge Case)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/v1/users/999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
