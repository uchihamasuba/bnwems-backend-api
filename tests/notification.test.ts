import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Notification API', () => {
  const token = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const validId1 = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/notifications', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(401);
    });

    it('should return list of notifications', async () => {
      prismaMock.notification.findMany.mockResolvedValue([
        { notificationId: 1n, message: 'Test message', isRead: false } as any
      ]);
      prismaMock.notification.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('PUT /api/v1/notifications/:id/read', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).put(`/api/v1/notifications/${validId1}/read`);
      expect(res.status).toBe(401);
    });

    it('should mark notification as read', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({ notificationId: 1n, userId: 1n } as any);
      prismaMock.notification.update.mockResolvedValue({ notificationId: 1n, isRead: true } as any);

      const res = await request(app)
        .put(`/api/v1/notifications/${validId1}/read`)
        .set('Authorization', `Bearer ${token}`);

      // Could return 200 depending on implementation
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/notifications/read-all', () => {
    it('should mark all unread notifications as read', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 2 } as any);

      const res = await request(app)
        .put('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.notification.updateMany).toHaveBeenCalled();
    });

    it('should return 401 if unauthorized', async () => {
      const res = await request(app).put('/api/v1/notifications/read-all');
      expect(res.status).toBe(401);
    });
  });
});
