import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth API (Module 01)', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and token on successful login (Happy Path)', async () => {
      // Setup Mock Data
      const mockPasswordHash = await bcrypt.hash('P@ssword2026', 10);
      const mockUser = {
        id: 1n,
        username: 'manager_fpt',
        passwordHash: mockPasswordHash,
        fullName: 'Nguyễn Văn Quản Lý',
        email: 'quanly@fpt.edu.vn',
        phone: '0911111111',
        status: 'active',
        roleId: 2n,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: {
          id: 2n,
          name: 'Manager',
          description: '',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          rolePermissions: []
        }
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      // Execute Test
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'manager_fpt',
          password: 'P@ssword2026'
        });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.username).toBe('manager_fpt');
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when missing required fields (Bad Request)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'manager_fpt'
        }); // Missing password

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 on incorrect password (Edge Case)', async () => {
      const mockPasswordHash = await bcrypt.hash('CorrectP@ss', 10);
      const mockUser = {
        id: 1n,
        username: 'manager_fpt',
        passwordHash: mockPasswordHash,
        status: 'active',
        role: { name: 'Manager' }
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'manager_fpt',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/me/password', () => {
    it('should return 200 on successful password change (Happy Path)', async () => {
      const token = jwt.sign({ userId: 1, role: 'Manager' }, process.env.JWT_SECRET || 'secret');
      const oldPasswordHash = await bcrypt.hash('P@ssword2026', 10);
      
      const mockUser = {
        id: 1n,
        passwordHash: oldPasswordHash,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .put('/api/v1/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'P@ssword2026',
          new_password: 'NewP@ss2026!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if JWT token is missing (Edge Case)', async () => {
      const response = await request(app)
        .put('/api/v1/me/password')
        .send({
          current_password: 'P@ssword2026',
          new_password: 'NewP@ss2026!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
