import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Notification API', () => {
  const userToken = generateTestToken({ userId: '1', role: 'ADMIN' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/notifications', () => {
    it('should return paginated notifications', async () => {
      prismaMock.notification.findMany.mockResolvedValue([{
        notificationId: 1n,
        userId: 1n,
        title: 'Test',
        content: 'Test content',
        isRead: false,
        createdAt: new Date(),
      }] as any);
      prismaMock.notification.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('PUT /api/v1/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 5 } as any);

      const res = await request(app)
        .put('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/notifications/:id/read', () => {
    it('should mark a specific notification as read', async () => {
      prismaMock.notification.update.mockResolvedValue({
        notificationId: 1n,
        isRead: true,
      } as any);

      const res = await request(app)
        .put('/api/v1/notifications/1/read')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
