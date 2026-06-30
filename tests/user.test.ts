import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('User API (Module 2)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const staffToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'STAFF' } });
  const validId = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/users', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });

    it('should return 403 if role is not ADMIN', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });

    it('should return list of users for ADMIN', async () => {
      prismaMock.internalUser.findMany.mockResolvedValue([
        { id: '1', username: 'user1', role: 'STAFF' } as any
      ]);
      prismaMock.internalUser.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should return 400 for validation errors (short username)', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'ab', // too short
          password: '123', // too short
          fullName: '', // empty
          role: 'INVALID', // invalid enum
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if username exists (MSG-UC04-05)', async () => {
      prismaMock.internalUser.findUnique.mockResolvedValue({ id: 'existing' } as any);

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'existinguser',
          password: 'Password123!',
          fullName: 'Existing User',
          roleId: '3',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC04-05');
    });

    it('should create user successfully', async () => {
      prismaMock.internalUser.findUnique.mockResolvedValue(null);
      prismaMock.internalUser.create.mockResolvedValue({ id: 'new-user', username: 'newuser', fullName: 'New User', role: { roleId: '3', roleName: 'STAFF' }, status: 'active' } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newuser',
          password: 'Password123!',
          fullName: 'New User',
          roleId: '3',
          email: 'newuser@example.com',
          phone: '0123456789',
          bio: 'Some bio',
          avatarUrl: 'http://example.com/avatar.png'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.internalUser.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should return 400 for invalid UUID format', async () => {
      const res = await request(app)
        .put('/api/v1/users/abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fullName: 'Updated Name', roleId: '2' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should update user successfully', async () => {
      prismaMock.internalUser.update.mockResolvedValue({ userId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/users/${validId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          fullName: 'Updated Name', 
          roleId: '2', 
          avatarUrl: 'http://example.com/new-avatar.png',
          bio: 'New bio'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.internalUser.update).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/v1/users/:id/status', () => {
    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${validId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DELETED' }); // invalid enum
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should update user status successfully', async () => {
      prismaMock.internalUser.update.mockResolvedValue({ userId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .patch(`/api/v1/users/${validId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' });
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/users/:id/reset-password', () => {
    it('should return 400 if new password too short', async () => {
      const res = await request(app)
        .post(`/api/v1/users/${validId}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newPassword: '123' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reset password successfully', async () => {
      prismaMock.internalUser.update.mockResolvedValue({ userId: 1n } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/users/${validId}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newPassword: 'NewPassword123' });
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
