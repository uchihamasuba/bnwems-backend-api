import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Work Tasks API', () => {
  const token = generateTestToken({ userId: '1', role: 'ADMIN' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/work-tasks', () => {
    it('should return list of work tasks', async () => {
      prismaMock.workTask.findMany.mockResolvedValue([
        { workTaskId: 1n, taskName: 'Setup' } as any,
      ]);
      prismaMock.workTask.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/work-tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/work-tasks');
      expect(res.status).toBe(401);
    });
  });
});
