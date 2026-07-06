import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import bcrypt from 'bcryptjs';
import { generateTestToken } from './setup/authMock';

describe('Auth API (Module 1)', () => {
  const token = generateTestToken({ userId: '1', role: 'ADMIN' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 if missing credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 for incorrect password (MSG-UC01-02)', async () => {
      prismaMock.internalUser.findUnique.mockResolvedValue({
        userId: 1n,
        username: 'admin',
        passwordHash: await bcrypt.hash('correctpass', 10),
        status: 'ACTIVE',
        role: 'ADMIN',
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('MSG-UC01-02');
    });

    it('should return 403 for inactive account (MSG-UC01-03)', async () => {
      prismaMock.internalUser.findUnique.mockResolvedValue({
        userId: 1n,
        username: 'admin',
        passwordHash: await bcrypt.hash('correctpass', 10),
        status: 'INACTIVE',
        role: 'ADMIN',
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'admin', password: 'correctpass' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('MSG-UC01-03');
    });

    it('should return 200 and tokens on successful login', async () => {
      prismaMock.internalUser.findUnique.mockResolvedValue({
        userId: 1n,
        username: 'admin',
        passwordHash: await bcrypt.hash('correctpass', 10),
        status: 'ACTIVE',
        role: { roleId: 1n, roleName: 'ADMIN' },
      } as any);

      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'admin', password: 'correctpass' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 200 on successful logout', async () => {
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return 200 if email sent or process initiated', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ username: 'admin' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/auth/change-password', () => {
    it('should return 400 if validation fails (passwords do not match)', async () => {
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'old', newPassword: 'newpass', confirmNewPassword: 'diff' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if old password incorrect (MSG-UC02-01)', async () => {
      prismaMock.internalUser.findUnique.mockResolvedValue({
        userId: 1n,
        passwordHash: await bcrypt.hash('realold', 10),
      } as any);

      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'wrongold',
          newPassword: 'newpass123',
          confirmNewPassword: 'newpass123',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC02-01');
    });

    it('should return 200 on success', async () => {
      prismaMock.internalUser.findUnique.mockResolvedValue({
        userId: 1n,
        passwordHash: await bcrypt.hash('realold', 10),
      } as any);
      prismaMock.internalUser.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'realold',
          newPassword: 'newpass123',
          confirmNewPassword: 'newpass123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.internalUser.update).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return 200 and user profile', async () => {
      prismaMock.internalUser.findUnique.mockResolvedValue({
        username: 'admin',
        fullName: 'Admin User',
      } as any);
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('admin');
      expect(res.body.data.fullName).toBe('Admin User');
    });

    it('should return 401 if token is not provided', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    it('should return 200 and update user profile', async () => {
      prismaMock.internalUser.update.mockResolvedValue({
        userId: 1n,
        username: 'admin',
        fullName: 'Updated Admin User',
        avatarUrl: 'http://example.com/avatar.png',
        role: { roleId: 1n, roleName: 'ADMIN' },
      } as any);

      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'Updated Admin User', avatarUrl: 'http://example.com/avatar.png' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Updated Admin User');
      expect(res.body.data.avatarUrl).toBe('http://example.com/avatar.png');
      expect(prismaMock.internalUser.update).toHaveBeenCalled();
    });

    it('should return 401 if token is not provided', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .send({ fullName: 'Updated Admin User' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/device-token', () => {
    it('should return 200 and register device token', async () => {
      prismaMock.deviceToken.findUnique.mockResolvedValue(null);
      prismaMock.deviceToken.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/device-token')
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceToken: 'fcm_token_123', deviceType: 'ANDROID' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.deviceToken.create).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/auth/device-token')
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceToken: 'fcm_token_123', deviceType: 'invalid_type' });

      expect(res.status).toBe(400);
    });
  });
});
